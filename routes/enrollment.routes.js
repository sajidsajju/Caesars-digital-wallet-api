const { ApplicationException } = require("dcp-errors");
const constants = require("commonconstants");
const {
  GenerateDictionary,
  CallChannelCheck,
  cipherEncryptData,
} = require("../service/enrollment.service");

module.exports = (app) => {
  function validateContentType(req, res, next) {
    if (!req.is("application/json")) {
      throw new ApplicationException(
        constants.ERROR_CONTENT_TYPE_HEADER_VALUE_INVALID
      );
    }
    next();
  }

  app.post("/v1/enroll", async (req, res, next) => {
    try {
      const dictionary = GenerateDictionary(req.body);
      const channelCheckReply = await CallChannelCheck(
        dictionary.details,
        dictionary.credentials
      );

      const EnrollLink = cipherEncryptData(
        dictionary.details,
        dictionary.credentials,
        channelCheckReply
      );

      return res.status(200).json({ success: true, message: EnrollLink });
    } catch (err) {
      throw err;
    }
  });
};
