const moment = require("moment");

exports.GetMerchantDetails = (MerchantCode) => {
  try {
    switch (MerchantCode) {
      case "CaesarsSGMerch":
        const CaesarMerchData = {
          AccountIdentifier: "CZR002",
          ProgramCode: "CSG01",
          credentials: {
            MerchantKey: "VFFNWnpjIXFBclFEaUxZTk5ocVJYNTNiZ0UjakFmZVg=",
            ClientId: "Q0FFU0FSU1NHTUVSQ0g=",
            EntryCode:
              "WAAAADUAAAAzAAAAYgAAAGcAAABFAAAAIwAAAGoAAABBAAAAZgAAAA==",
          },
        };
        return CaesarMerchData;
        break;
      case "xyz":
        const data = {
          AccountIdentifier: "xyz",
          ProgramCode: "xyz01",
          credentials: {
            MerchantKey: "xyz",
            ClientId: "xyz",
            EntryCode: "xyz",
          },
        };
        return data;
        break;

      default:
        return "Merchant Not Found";
        break;
    }
  } catch (err) {
    throw err;
  }
};
exports.PatronData = {
  Credentials: {
    DeviceId: "CaesSG01",
    MerchantId: "CaesarsSGMerch",
    Password: "X53bgE#jAf",
    UserName: "CaesarsSGUser01",
  },
  IdentityToken: null,
  AccountExpirationDate: null,
  AccountIdentifier: "CZR002",
  AccountIdentifierType: 3,
  AccountPin: null,
  CardVerificationValue: null,
  ClientMachineAssetId: null,
  EntryMethod: 1,
  MerchantApplication: "DW",
  MerchantTransactionId: moment.utc().format(),
  PatronAddress: null,
  PatronFirstName: "Mahesh",
  PatronLastName: "Jadhav",
  PatronSecondaryId: null,
  PatronSecondaryIdType: 0,
  TransactionFee: 0,
  TypeOfTransaction: 1,
};
