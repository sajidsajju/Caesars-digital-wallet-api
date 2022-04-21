const { GetRewardentry } = require("../service/rewardsentry.service");

module.exports = (app) => {
    app.get("/v1/rewardsentry/:id", (req, res) => {

        try {
            return res.status(200).json({ success: true, message: GetRewardentry(req.params.id) });
        } catch (err) {
            throw err;
        }
    });
};