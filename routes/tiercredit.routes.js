const { GetPatronData } = require("../service/enrollment.service");
const { GetTierCredit } = require("../service/tiercredit.service");

module.exports = (app) => {
  app.get("/v1/tiercredit", async (req, res) => {
    try {
      const tiercredit = GetTierCredit();
      const PatronData = GetPatronData();
      const ProfileData = { ...tiercredit, userData: { ...PatronData } };
      return res.status(200).json({ success: true, message: ProfileData });
    } catch (err) {
      throw err;
    }
  });
};
