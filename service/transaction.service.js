exports.history = () => {
  try {
    const transactionLogs = [
      {
        id: "1",
        LogName: "Gaming Reward",
        day: "July 14, 2021",
        currency: "100",
        operation: "Transfer",
      },
      {
        id: "2",
        LogName: "Transfer Caesar's Reward Long a way credit history",
        day: "July 14, 2021",
        currency: "50",
        operation: "Reward Credit",
      },
      {
        id: "3",
        LogName: "Hotel Reservation Reward",
        day: "July 14, 2021",
        currency: "100",
        operation: "Transfer",
      },
      {
        id: "4",
        LogName: "Restaurnt Reward",
        day: "July 14, 2021",
        currency: "3",
        operation: "Reward Credit",
      },

      {
        id: "5",
        LogName: "Gaming Reward",
        day: "July 14, 2021",
        currency: "100",
        operation: "Transfer",
      },
    ];

    return transactionLogs;
  } catch (err) {
    throw err;
  }
};
