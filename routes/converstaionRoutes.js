const {
    createNewConversation,
    getUserConversations
} = require("../controllers/ConversationController")

const authToken = require("../middlewares/authToken");
const router = require("express").Router();

router
    .route("/")
    .get(authToken, getUserConversations)
    .post(authToken, createNewConversation)

module.exports = router;