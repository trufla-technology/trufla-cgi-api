module.exports = {

  /**
   * Find MVR Document.
   * 1. find MVR Document in redis cache.
   * 2. if found get the Document from MongoDB and skip to step 6.
   * 3. otherwise, get MVR Document from CGI webservice.
   * 4. save to DB.
   * 5. add reference to Redis.
   * 6. return to MVR Document.
   */
  findOneByLicence: function (req, res) {

    // get all params.
    var params = req.allParams();
    if (params.Callback)
      params.Callback = req.query.Callback;

    var overrideCache = (params.overrideCache === 'true');
    // filter params.
    var licenceNumber = params.LicenceNumber;
    var provinceCode = params.ProvinceCode;
    var clientInfo = {
      Callback: req.query.Callback,
      IsDelivered: false,
      RetriesNumber: 0
    };

    // find MVR Document in redis cache.
    MVRService.findOneFromCache(licenceNumber, provinceCode)
      .then(mvrRef => {
        // handle returned MVR Document Reference if found in the cache memory.
        if (mvrRef && !overrideCache) {
          return MVRService.findOneFromDB({ _id: mvrRef.MVR_ID })
            .then(mvrDoc => {
              if (!mvrDoc) throw (ResHandlerService.errorObject('DOC_DB_ERROR', true));

              if (!mvrDoc.IsReady && clientInfo.Callback) {
                return MVRService.addClientCallback(mvrDoc, clientInfo)
                  .then(() => {
                    return {
                      document: mvrDoc,
                      status: mvrDoc.IsReady,
                      isReady: mvrDoc.IsReady
                    }
                  })
                  .catch(err => {
                    sails.log.error(err);
                    throw (ResHandlerService.errorObject('DOC_DB_ERROR', true));
                  });
              }
              else {
                return {
                  document: mvrDoc,
                  status: mvrDoc.IsReady,
                  isReady: mvrDoc.IsReady
                }
              }
            })
            .catch(err => {
              sails.log.error(err);
              throw (ResHandlerService.errorObject('DOC_DB_ERROR', true));
            });

        }
        else {
          return MVRService.findOneFromCGI(params, req.apiKey)
            .then((mvrDoc) => ResHandlerService.MVR(mvrDoc)) // validate incoming MVR Document.
            .then(mvrObj => {
              
              var mvrDoc = mvrObj.doc;
              var message = mvrObj.message;
              var isReady = false;

              if (message.INTERNAL_CODE === 'PREDICTOR_NO_MVR')
                return { status: false, predictor: false };

              if (message.INTERNAL_CODE === 'ABSTRACT_FOUND') isReady = true;

              var requestResult = _.get(mvrDoc, 'SubmitRequestResult.MVRRequestResponseDS');
              clientInfo.IsDelivered = isReady;

              var dbDoc = {
                DriverLicenceNumber: licenceNumber,
                ProvinceCode: provinceCode,
                MVRRequestResponseDS: requestResult,
                IsReady: isReady,
                ReadyDate: isReady ? Date.now() : null,
                raw: isReady ? mvrDoc.raw : null
              };

              if (overrideCache && mvrRef) {

                if (!clientInfo.Callback || isReady)
                  clientInfo = null;

                // in case of override cache, well just update the current document.
                return MVRService.findOneAndUpdateDB({ _id: mvrRef.MVR_ID }, dbDoc, clientInfo)
                  .then(docFromDB => {
                    return {
                      document: docFromDB,
                      status: docFromDB.IsReady,
                      isReady: docFromDB.IsReady
                    }
                  })
                  .catch(err => {
                    sails.log.error(err);
                    throw (ResHandlerService.errorObject('DOC_DB_ERROR', true));
                  });

              }
              else {

                if (clientInfo.Callback && !isReady) {
                  dbDoc.Clients = [clientInfo];
                }

                // create the document in DB
                return MVRService.createInDBAndCache(dbDoc)
                  .then(docFromDB => {
                    return {
                      document: docFromDB,
                      status: docFromDB.IsReady,
                      isReady: docFromDB.IsReady
                    }
                  })
                  .catch(err => {
                    sails.log.error(err);
                    throw (ResHandlerService.errorObject('DOC_DB_ERROR', true));
                  });

              }

            })
            .catch(err => {
              throw err;
            });

        }

      })
      .then(result => res.ok(result))
      .catch(err => {

        sails.log.error(err);

        if (err.HTTP_STATUS) {
          switch (err.HTTP_STATUS) {
            case 404:
              res.notFound(ResHandlerService.errorObject(err.INTERNAL_CODE, true));
              break;
            case 400:
              res.badRequest(ResHandlerService.errorObject(err.INTERNAL_CODE, true));
              break;
            case 403:
              res.forbidden(ResHandlerService.errorObject(err.INTERNAL_CODE, true));
              break;
            default:
              res.serverError(ResHandlerService.errorObject(err.INTERNAL_CODE, true));
          }
        }
        else {
          res.serverError(ResHandlerService.errorObject('UNHANDLED_ERROR', true));
        }

      });

  },

  findOneById: function (req, res) {
    // get all params.
    var params = req.allParams();

    MVRService.findOneFromDB({ _id: params.id })
      .then((mvrDoc) => {
        if (!mvrDoc) return res.serverError(ResHandlerService.errorObject('UNHANDLED_ERROR', true));

        res.ok(mvrDoc);

      })
      .catch((err) => {
        sails.log.error(err);
        res.serverError(ResHandlerService.errorObject('UNHANDLED_ERROR', true));
      });

  }

};