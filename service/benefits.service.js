exports.GetBenefits = () => {
  try {
    const cardDetails = [
      {
        name: "GOLD",
        lock: "Unlocked",
        value: 0,
        link: "../../assests/gold.png",
        points: [
          "Special offers for gaming when you play at Caesars Rewards Casinos",
          "Free or discounted hotel stays",
          "Get exclusive pre-sale access for select shows",
          "Enjoy special member pricing at participating restaurants",
        ],
      },
      {
        name: "PLATINUM",
        lock: "Unlock at 5,000 credits",
        value: 5000,
        link: "../../assests/platinum.png",
        points: [
          "Gift up to 5,000 rewards credits to a friend",
          "Complimentary valet & self-parking at many destinations",
          "Complimentary stay at Atlantis Paradise Island in the Bahamas",

        ],
      },
      {
        name: "DIAMOND",
        lock: "Unlock at 15,000 credits",
        value: 15000,
        link: "../../assests/diamond.png",
        points: [
          "15% off best available advertised rate on rooms and suites",
          "No resort fees on any hotel stay",
          "2 Free nights at Caesars Bluewaters Dubai",

        ],
      },
      {
        name: "SEVEN STARS",
        lock: "Unlock at 150,000 credits",
        value: 150000,
        link: "../../assests/seven_stars.png",
        points: [
          "Upgrade to best available room at check-in",
          "Invitations to signature events",
          "Congradulatory voyage with Norwegian Cruise Line",

        ],
      },
    ];

    return cardDetails;
  } catch (err) {
    throw err;
  }
};
