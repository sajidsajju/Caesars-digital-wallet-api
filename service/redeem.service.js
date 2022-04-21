exports.GetRedeems = () => {
    try {
        const redeems = [
            {
                name: "Free Play",
                description:
                    "Visit a Casesars rewards center to redeem your rewards credit for free paly at any ceasars rewards casino- any day, every day.",
                link: "REDEEM",
            },
            {
                name: "Hotel",
                description:
                    "Escape for an evening (or two) by redeeming your Reward Credits at nearly 40 hotels and resorts.",
                link: "BOOK NOW",
            },
            {
                name: "World Series of Poker",
                description:
                    "Use your Reward Credits to buy into official WSOP® events.",
                link: "LEARN MORE",
            },
            {
                name: "Shopping",
                description:
                    "Escape to a shopping spree on Caesars Rewards by redeeming your Reward Credits at participating retail outlets throughout our resorts and casinos.",
                link: "LEARN MORE",
            },
            {
                name: "Dining",
                description:
                    "Indulgence yourself by redeeming your Reward Credits for a gourmet meal at any of our almost 250 restaurants.",
                link: "LEARN MORE",
            },
            {
                name: "Show Tickets",
                description:
                    "Enjoy an evening with the stars by redeeming your Reward Credits for tickets to some of the biggest shows and performances.",
                link: "PURCHASE TICKETS",
            },
            {
                name: "Spa",
                description:
                    "Relax, renew and rejuvenate when you redeem your Reward Credits for spa services and treatments.",
                link: "LEARN MORE",
            },
            {
                name: "E-Catalog",
                description:
                    "Use Rewards Credits to shop online right now. (FPO)",
                link: "BUY NOW",
            },
        ];
        return redeems;
    } catch (err) {
        throw err;
    }
};
