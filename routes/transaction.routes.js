const { history } = require("../service/transaction.service");

module.exports = (app) => {
  app.get("/v1/transactions", async (req, res) => {
    try {
      const transactions = history();
      return res.status(200).json({ success: true, message: transactions });
    } catch (err) {
      throw err;
    }
  });
};
