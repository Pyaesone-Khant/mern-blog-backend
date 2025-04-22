
const {
    getMessagesByConversationId,
    createMessage
} = require("../controllers/MessageController");
const authToken = require("../middlewares/authToken");
const router = require("express").Router();

router
    .post("/", authToken, createMessage)
    .get("/:conversationId", authToken, getMessagesByConversationId)

module.exports = router;