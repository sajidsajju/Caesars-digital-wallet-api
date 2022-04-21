const { GetRedeems } = require("../service/redeem.service");

module.exports = (app) => {
    app.get("/v1/redeem", (req, res) => {
        try {
            return res.status(200).json({ success: true, message: GetRedeems() });
        } catch (err) {
            throw err;
        }
    });
};
