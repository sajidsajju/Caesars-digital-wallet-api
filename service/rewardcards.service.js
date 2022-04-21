exports.GetCards = () => {
  try {
    const cardDetails = [
      {
        name: "GOLD",
        lock: "Unlocked",
        value: 0,
        link: "../../assests/gold.png",
        points: [
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
        ],
      },
      {
        name: "PLATINUM",
        lock: "Unlock at 5,000 credits",
        value: 5000,
        link: "../../assests/platinum.png",
        points: [
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
        ],
      },
      {
        name: "DIAMOND",
        lock: "Unlock at 15,000 credits",
        value: 15000,
        link: "../../assests/diamond.png",
        points: [
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
        ],
      },
      {
        name: "SEVEN STARS",
        lock: "Unlock at 150,000 credits",
        value: 150000,
        link: "../../assests/seven_stars.png",
        points: [
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Special offers for gaming when you play at Caesars Rewards Casinos",
        ],
      },
    ];

    return cardDetails;
  } catch (err) {
    throw err;
  }
};
