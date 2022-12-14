var mongoose = require('mongoose');


var schema = new mongoose.Schema({

    ClaimId : String,
    PolicyDriverId: String,
    NameAvailableInd: String,
    LicenceNumberStatus: String,
    CompanyCode: String,
    PolicyNumber: String,
    UtilizationCode: String,
    LicenceProvinceCode: String,
    LicenceNumber: String,
    YearsLicenced: String,
    YearsLicencedExp: Number,
    DriverTrainingInd: String,
    FirstName: String,
    MiddleName: String,
    LastName: String,
    UnstructuredName: String,
    StructuredNameInd: String,
    CompanyInd: String,
    BirthYear: Number,
    BirthMonth: Number,
    BirthDay: Number,
    Gender: String,
    PolicyDriverClaimsCode: String,
    CompanyName: String,
    Abbreviation: String,
    LastUpdateDate: String

});

module.exports = schema;