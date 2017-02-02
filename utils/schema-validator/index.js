/**
 * this module will send MVR/A+ requests
 * to all given licences, the result will
 * be a list of paths to all the Arrays,
 * collected from all the responses. 
 * in other words, you'll know which fields
 * should be Array.
 * set isMVR flag to true if you wanna get MVR responses,
 * otherwise it'll get A+ responses.
 * Add as many test cases as you want,
 * the results will be on list that covers all returned responses.
 */

var request = require('request');
var _ = require('lodash');
var iterator = require('object-recursive-iterator');
var fs = require('fs');
var autoPlusMachine = require('./machinepack-autoplus');
var mvrMachine = require('./machinepack-mvr');

var isMVR = true; // true => you'll request MVR, false => you'll request A+

var results = [];
var counter = 1;
var rescounter = 1;
var lics = [
    { licence: 'B50094077600101', province: 'ON' },
    { licence: 'B50095278625202', province: 'ON' },
    { licence: 'R21225218710303', province: 'ON' },
    { licence: 'R21223950725404', province: 'ON' },
    { licence: 'W35127230540505', province: 'ON' },
    { licence: 'W35125910545606', province: 'ON' },
    { licence: 'W35124290765707', province: 'ON' },
    { licence: 'B76101920200808', province: 'ON' },
    { licence: 'B76104270255909', province: 'ON' },
    { licence: 'Y24063240601010', province: 'ON' },
    { licence: 'Y24061150616111', province: 'ON' },
    { licence: 'Y24065910846212', province: 'ON' },
    { licence: 'B56425270106313', province: 'ON' },
    { licence: 'B56427850320214', province: 'ON' },
    { licence: 'B56427800355315', province: 'ON' },
    { licence: 'B56426940600416', province: 'ON' },
    { licence: 'B56421920800517', province: 'ON' },
    { licence: 'B56427400840618', province: 'ON' },
    { licence: 'B93600470785719', province: 'ON' },
    { licence: 'B93602780770820', province: 'ON' },
    { licence: 'B93606170760921', province: 'ON' },
    { licence: 'P45004200866022', province: 'ON' },
    { licence: 'G73055440591123', province: 'ON' },
    { licence: 'G73055180586224', province: 'ON' },
    { licence: 'N09266380810125', province: 'ON' },
    { licence: 'G62224100460428', province: 'ON' },
    { licence: 'G62223920466529', province: 'ON' },
    { licence: 'G62221560760630', province: 'ON' },
    { licence: 'G62226030870731', province: 'ON' },
    { licence: 'S44064340560801', province: 'ON' },
    { licence: 'S44067790800902', province: 'ON' },
    { licence: 'S44061240821003', province: 'ON' },
    { licence: 'P94013830691104', province: 'ON' },
    { licence: 'P94010360696205', province: 'ON' },
    { licence: 'G73715440621306', province: 'ON' },
    { licence: 'G73717670615207', province: 'ON' },
    { licence: 'G73717190865308', province: 'ON' },
    { licence: 'O71881530830409', province: 'ON' },
    { licence: '146252-598', province: 'AB' },
    { licence: '147515-084', province: 'AB' },
    { licence: 'B08706556691216', province: 'ON' },
    { licence: 'P46236828600214', province: 'ON' },
    { licence: 'A80030620680521', province: 'ON' },
    { licence: 'G92093026681205', province: 'ON' },
    { licence: '180778', province: 'PE' },
    { licence: '130456', province: 'PE' },
    { licence: '129789', province: 'PE' },
    { licence: '146252-598', province: 'AB' },
    { licence: '139093-512', province: 'AB' },
    { licence: '215478', province: 'AB' },
    { licence: '043335-199 ', province: 'AB' },
    { licence: 'A12341234805101', province: 'ON' },
    { licence: 'B1684-14108-20715', province: 'ON' },
    { licence: 'J25651560670817', province: 'ON' },
    { licence: 'G66136580461101', province: 'ON' },
    { licence: '9521714', province: 'NB' },
    { licence: '1258478', province: 'NB' },
    { licence: '8995', province: 'NB' },
    { licence: '23456', province: 'NB' },
    { licence: 'O71881640830409', province: 'ON' },
    { licence: 'O71881720830409', province: 'ON' },
    { licence: 'O71881740835409', province: 'ON' },
    { licence: 'O71880430830409', province: 'ON' },
    { licence: 'B43505260830409', province: 'ON' },
    { licence: 'B23905260830409', province: 'ON' },
    { licence: 'O71885270835409', province: 'ON' },
    { licence: 'O71881560830409', province: 'ON' },
    { licence: 'B56420930600213', province: 'ON' },
    { licence: 'B56421040600213', province: 'ON' },
    { licence: 'W35125910545606', province: 'ON' },
    { licence: 'CRUSE230666004', province: 'NS' },
    { licence: 'S09441564711213', province: 'ON' },
    { licence: 'P07753907560622', province: 'ON' },
    { licence: 'M00701155695904', province: 'ON' },
    { licence: 'G05542670616004', province: 'ON' },
    { licence: 'J63944243515620', province: 'ON' },
    { licence: 'K31750024750323', province: 'ON' },
    { licence: 'G64881747810731', province: 'ON' },
    { licence: 'H94727224841029', province: 'ON' },
    { licence: 'H25752795360106', province: 'ON' },
    { licence: 'S26462780500222', province: 'ON' },
    { licence: '142905-264', province: 'AB' },
    { licence: 'F45402900510828', province: 'ON' },
    { licence: 'S57784430475227', province: 'ON' },
    { licence: 'G94833885801116', province: 'ON' },
    { licence: 'C07855445870209', province: 'ON' },
    { licence: 'B75171576755730', province: 'ON' },
    { licence: 'K44863034466009', province: 'ON' },
    { licence: 'W43952930455122', province: 'ON' },
    { licence: 'T28251142975907', province: 'ON' },
    { licence: 'T28251142965907', province: 'ON' },
    { licence: '057673-071', province: 'AB' },
    { licence: '116020-538', province: 'AB' },
    { licence: '141929-059', province: 'AB' },
    { licence: '148310-691', province: 'AB' },
    { licence: '149201-402', province: 'AB' },
    { licence: '151028-909', province: 'AB' },
    { licence: '150047-991', province: 'AB' },
    { licence: '152739-629', province: 'AB' },
    { licence: '155502-271', province: 'AB' },
    { licence: '163436-561', province: 'AB' },
    { licence: '138290-531', province: 'AB' },
    { licence: '130113-970', province: 'AB' },
    { licence: 'B06854766705523', province: 'ON' },
    { licence: 'B06854766705523', province: 'ON' },
    { licence: 'B06854766705523', province: 'ON' },
    { licence: 'B06854766705523', province: 'ON' },
    { licence: 'B06854766705523', province: 'ON' },
    { licence: 'S23955851571101', province: 'ON' },
    { licence: 'S23951140575501', province: 'ON' },
    { licence: 'S23955851971101', province: 'ON' },
    { licence: 'S23957276956101', province: 'ON' },
    { licence: 'ARNOL170656009', province: 'NS' },
    { licence: 'ARNOL220657007', province: 'NS' },
    { licence: 'CAPSO100462004', province: 'NS' },
    { licence: 'CAPSO260659001', province: 'NS' },
    { licence: 'OCTEA270459002', province: 'NS' },
    { licence: 'PARKE211140001', province: 'NS' },
    { licence: 'PARKE240750002', province: 'NS' },
    { licence: 'WARNE060452001', province: 'NS' },
    { licence: 'KING 220369002', province: 'NS' },
    { licence: 'MEISN130258002', province: 'NS' },
    { licence: '212938', province: 'NT' },
    { licence: '1234567', province: 'YT' },
    { licence: '123456', province: 'NU' },
    { licence: '105438', province: 'PE' },
    { licence: 'P660908034', province: 'NL' },
    { licence: 'R650503006', province: 'NL' },
    { licence: '1002668', province: 'NB' },
    { licence: 'A22685620545612', province: 'ON' }

];


function getArrays (docJs) {

    var strInfo = '';
    var objInfoArray = [];

    iterator.forAll(docJs, function (path, key, object) {
        
        var pathStr = '';
        _.each(path, (pa) => (isNaN(pa) ? pathStr += pa + '.' : ''));
        pathStr = pathStr.slice(0, pathStr.length - 1);

        var arr = (Array.isArray(_.get(docJs, path)) ? true : false); 

        // get the parent, cuz if it's an array the iterator will go through its childeren only
        var parent = path.slice(0, path.length - 1)
        // check if the parent is array
        var parentArr = (Array.isArray(_.get(docJs, parent)) ? true : false);
        
        if (arr || parentArr) objInfoArray.push(pathStr);

    });

    objInfoArray = _.uniq(objInfoArray);

    _.each(objInfoArray, (obj) => results.push(obj));
    console.log('Responses: ', rescounter);
    if (rescounter == lics.length) {
        printToFile(_.uniq(results));
    }
    rescounter++;

}

function makeRequest (licence, province) {


    if (!isMVR) {
        autoPlusMachine.GetDCHUsingLicence({
            Url: 'https://ibs.ct.rapidwebservices.cgi.com/rapidwebservices/WebServices/DriverClaimHistoryGoldWS.asmx?WSDL',
            UserName: 'ws.test@sharpinsurance.ca',
            Password: 'SharpTest1',
            LicenceProvinceCode: province,
            LicenceNumber: licence
        })
        .exec({
            success: function (body) {
                //console.log(body);
                var doc = body;
                getArrays(doc);
            },

            error: function (err) {
                rescounter++;
                console.log('Error');
            }
        });
    }
    else {
        mvrMachine.RequestMVR({
            Url: 'https://ibs.ct.rapidwebservices.cgi.com/rapidwebservices/WebServices/MVRWS.asmx?wsdl',
            UserName: 'ws.test@sharpinsurance.ca',
            Password: 'SharpTest1',
            DriverLicenceProvinceCode: province,
            DriverLicenceNumber: licence
        })
        .exec({
            success: function (body) {
                //console.log(body);
                var doc = body;
                getArrays(doc);
            },

            error: function (err) {
                rescounter++;
                console.log('Error');
            }
        });
    }


}

function start (licenceArray) {
    _.each(licenceArray, (lic) => {
        makeRequest(lic.licence, lic.province);
    });
}

function printToFile (res) {

    var str = '';
    _.each(res, (item) => str += item + '\n');

    fs.writeFile('results.txt', str, (err) => console.log('Saved!'));

}

start(lics);