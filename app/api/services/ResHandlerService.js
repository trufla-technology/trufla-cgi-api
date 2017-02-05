module.exports = {

    getMessage: function (msgCode, internalCode) {
        if (internalCode) {
            return _.find(sails.config.cgi.MESSAGES, (msg) => msg.INTERNAL_CODE == msgCode);
        }
        else {
            return _.find(sails.config.cgi.MESSAGES, (msg) => msg.CODE == msgCode);
        }
    },

    bindMessage: function (Response, msgCode, internalCode) {
        var msg = this.getMessage(msgCode, internalCode);
        return {
            doc: Response,
            message: msg
        };
    },

    errorObject: function (msgCode, internalCode) {
        var msg = this.getMessage(msgCode, internalCode);
        return { error_code: msg.INTERNAL_CODE, message: msg.TEXT };
    },  

    /**
     * this function will take a mvr response,
     * and check cgi&providers messages to return
     * MESSAGE object and original document. 
     */
    MVR: function (mvrResponse) {
        //sails.log.debug(_.get(mvrResponse, 'SubmitRequestResult.MVRRequestResponseDS.MessageDT'));
        return new Promise ((resolve, reject) => {

            if (!mvrResponse) return reject(this.getMessage('NO_RESPONSE', true));
            if (!mvrResponse.SubmitRequestResult || !mvrResponse.SubmitRequestResult.MVRRequestResponseDS) return reject(this.getMessage('NO_RESULTS', true));
            var requestResult = mvrResponse.SubmitRequestResult.MVRRequestResponseDS;
            
            // check CGI Messages
            if (!requestResult.MessageDT) return reject(this.getMessage('NO_MESSAGE', true)); 
            
            // get cgi message.
            var cgiMessage = {};
            if (Array.isArray(requestResult.MessageDT))
                this.getMessage(requestResult.MessageDT[0].Code);
            else
                this.getMessage(requestResult.MessageDT.Code);

            // if message not found, return Unhandled Exception Error.
            if (!cgiMessage) return reject(this.getMessage('UNHANDLED_ERROR', true)); 
            // check if cgi returned error message.
            if (cgiMessage.IS_ERROR) return reject(cgiMessage); 

            // check if abstract returned.
            var mvrAbstract = _.get(requestResult, 'DataFormatAbstractDT.Abstract.MVRAbstract');
            
            if (!mvrAbstract) return resolve(this.bindMessage(mvrResponse, 'ABSTRACT_NOT_READY', true));

            // at this point we have a cgi message which is not error and we have abstract object.
            // so we need to check CGI's Provdier Messages for any errors before we assume that we have a Client abstract.
            if (mvrAbstract.ProviderError) return reject(this.getMessage(mvrAbstract.ProviderError.Code) || this.getMessage('UNHANDLED_ERROR', true));

            // otherwise by now we should have the abstract.            
            return resolve(this.bindMessage(mvrResponse, 'ABSTRACT_FOUND', true));

        });
    },

    AutoPlus: function (autoPlusResponse) {
        return new Promise ((resolve, reject) => {

            if (!autoPlusResponse) return reject(this.getMessage('NO_RESPONSE', true));
            if (!autoPlusResponse.GetDCHUsingLicenceResult || !autoPlusResponse.GetDCHUsingLicenceResult.DriverClaimHistoryGoldDS) return reject(this.getMessage('NO_RESULTS', true));
            var requestResult = autoPlusResponse.GetDCHUsingLicenceResult.DriverClaimHistoryGoldDS;
            // check CGI Messages
            if (!requestResult.MessageDT) return reject(this.getMessage('NO_MESSAGE', true)); 

            if (Array.isArray(requestResult.MessageDT)) {
                var message = requestResult.MessageDT[0];
            } else {
                var message = requestResult.MessageDT;
            }

            // get cgi message.
            var cgiMessage = this.getMessage(message.Code); 
            // if message not found, return Unhandled Exception Error.
            if (!cgiMessage) return reject(this.getMessage('UNHANDLED_ERROR', true)); 
            // check if cgi returned error message.
            if (cgiMessage.IS_ERROR) return reject(cgiMessage); 

            // otherwise by now we should have the abstract.            
            return resolve(this.bindMessage(autoPlusResponse, 'AUTOPLUS_SUCCESS', true));

        });
    }

};