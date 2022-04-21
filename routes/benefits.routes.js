const { GetBenefits } = require("../service/benefits.service");

module.exports = (app) => {
  app.get("/v1/benefits", (req, res) => {
    try {
      return res.status(200).json({ success: true, message: GetBenefits() });
    } catch (err) {
      throw err;
    }
  });
};
