const crypto = require("crypto");
const { api } = require("../Api");
const { GetMerchantDetails } = require("../config");

const ReturnType = {
  Unknown: 0,
  IV: 1,
  IVPlusTokenId: 2,
  IdentityTokenLimited: 3, //limited(current), general (8 hours), special(1 time use, leave expire null)
  IdentityTokenGeneral: 4,
  IdentityTokenSpecial: 5,
};

// exports.PlainText = () => {
// try{
//   const plainText = {
//     MemberNumber: "CZR001",
//     ReturnURL: "https://sightlinepayments.com",
//     ProgramCode: "CSG01",
//     MerchantTransactionId: "083121032522281",
//     MerchantName: "TabName",
//     AssetId: "",
//     OperatorId: "",
//     OperatorName: "",
//   };
// return plainText;
// } catch (err) {
//    throw err;
// }
// };

exports.GetPatronData = () => {
  try {
    const PatronData = {
      FirstName: "FName1",
      LastName: "LName1",
      PhoneNumber: "1112223310",
      Email: "s@s.com",
      Address: "70705 Richman Avenue",
      City: "Dulles",
      State: "GA",
      PostalCode: "30318",
      Country: "US",
      MerchantTransactionId: "083021042905039",
      ReturnURL: "http://localhost:3000/?cashcard=true",
      MerchantName: "TabName",
      IdType: "",
      IdValue: "",
      TransactionAmount: "",
      TransactionType: "",
      DOB: "",
    };
    return PatronData;
  } catch (err) {
    throw err;
  }
};

exports.GenerateDictionary = (data) => {
  try {
    const MerchantCode = "CaesarsSGMerch";

    const MerchantDetails = GetMerchantDetails(MerchantCode);

    const dictionary = {
      details: {
        ...data,
        MerchantCode: MerchantCode,
        AccountIdentifier: MerchantDetails.AccountIdentifier,
        ProgramCode: MerchantDetails.ProgramCode,
      },
      credentials: { ...MerchantDetails.credentials },
    };
    return dictionary;
  } catch (err) {
    throw err;
  }
};

exports.CallChannelCheck = async (dictionary, merchantCredentials) => {
  try {
    const channelRequest = {
      AccountIdentifier: dictionary.AccountIdentifier,
      Credentials: {
        ClientId: merchantCredentials.ClientId,
        EntryCode: merchantCredentials.EntryCode,
      },
      ReturnType: ReturnType.IVPlusTokenId,
    };
    return await api(
      "post",
      "https://ceapspan.slpuat.com/Public/Authentication/v1/ChannelCheck",
      channelRequest
    );
  } catch (err) {
    throw err;
  }
};

exports.cipherEncryptData = (
  dictionary,
  merchantCredentials,
  channelCheckReply
) => {
  try {
    const data = Buffer.from(JSON.stringify(dictionary), "utf8");
    const key = Buffer.from(merchantCredentials.MerchantKey, "base64");
    const iv = Buffer.from(channelCheckReply.iv, "base64");

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv, (err) => {
      if (err) throw err;
    });

    const cipherData =
      cipher.update(data, "utf8", "base64") + cipher.final("base64");
    const link = `https://ceapspanex.slpuat.com/hostedfunding/?iv=${channelCheckReply.iv}&value=${cipherData}&tid=${channelCheckReply.tokenId}`;
    return link;
  } catch (err) {
    throw err;
  }
};
