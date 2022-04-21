exports.GetTierCredit = () => {
  try {
    const tiercredit = {
      id: 1,
      name: "Julius Caesar",
      rewardplanname: "Gold",
      rewards_credits: 2345,
      reward_id: 170068925,
    };
    return tiercredit;
  } catch (err) {
    throw err;
  }
};
