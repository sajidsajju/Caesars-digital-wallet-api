const { CardBalance } = require("../service/cardbalance.service");

module.exports = (app) => {
  app.post("/v1/cardbalance", async (req, res) => {
    const response = await CardBalance();

    res.status(200).json({
      success: true,
      message: response.message,
      enrolled: response.enrolled,
    });
    try {
    } catch (err) {
      throw err;
    }
  });
};
