const Router = require("express");
const customer = require("./individual.routes");
const enroll = require("./enrollment.routes");
const transaction = require("./transaction.routes");
const benefits = require("./benefits.routes");
const rewardCards = require("./rewardcards.routes");
const tiercredit = require("./tiercredit.routes");
const redeem = require("./redeem.routes");
const cardbalance = require("./cardbalance.routes");
const rewardsentry = require("./rewardsentry.routes");

module.exports = () => {
  const app = Router();
  customer(app);
  enroll(app);
  transaction(app);
  benefits(app);
  rewardCards(app);
  tiercredit(app);
  redeem(app);
  cardbalance(app);
  rewardsentry(app);
  return app;
};
