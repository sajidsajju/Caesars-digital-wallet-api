exports.GetRewardentry = (id) => {
  try {
    const logs = [
      {
        id: 1,
        credits: 100,
        address: "Casino,Las Vegas,NV",
        date: "3/25/21",
        time: "3:05 PM",
        status: "Approved",
        card: "12345676789",
        name: "Caesars Cash",
      },
      {
        id: 2,
        credits: 50,
        address: "Casino,New York,NV",
        date: "4/15/21",
        time: "2:05 PM",
        status: "Approved",
        card: "12345676789",
        name: "Caesars Cash",
      },
      {
        id: 3,
        credits: 100,
        address: "Casino,Las Vegas,NV",
        date: "3/25/20",
        time: "4:05 PM",
        status: "Approved",
        card: "12345676789",
        name: "Caesars Cash",
      },
      {
        id: 4,
        credits: 3,
        address: "Casino,New York,NV",
        date: "10/25/21",
        time: "5:05 PM",
        status: "Approved",
        card: "12345676789",
        name: "Caesars Cash",
      },

      {
        id: 5,
        credits: 100,
        address: "Casino,Las Vegas,NV",
        date: "15/25/21",
        time: "9:05 PM",
        status: "Approved",
        card: "12345676789",
        name: "Caesars Cash",
      },
    ];
    const data = logs.filter((log) => log.id === Number(id));

    return data[0];
  } catch (err) {
    throw err;
  }
};
