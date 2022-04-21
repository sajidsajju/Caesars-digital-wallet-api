const { GetCards } = require("../service/rewardcards.service");

module.exports = (app) => {
  app.get("/v1/rewardcards", (req, res) => {
    try {
      return res.status(200).json({ success: true, message: GetCards() });
    } catch (err) {
      throw err;
    }
  });
};
