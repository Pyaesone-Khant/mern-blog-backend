const { ResponseObj, transformImageUrl } = require("../helpers/utils");
const MessageServices = require("../services/MessageServices");

const getMessagesByConversationId = async (req, res) => {
    const { conversationId } = req.params;
    try {
        let messages = (await MessageServices.getMessagesByConversationId(conversationId))

        messages = messages.map((msg) => (
            {
                ...msg,
                sender: {
                    ...msg.sender,
                    profileImage: transformImageUrl(msg.sender?.profileImage),
                }
            }
        ))

        return ResponseObj(res, 200, messages);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
}

const createMessage = async (req, res) => {

    const sender = req.userId;
    const { conversationId, text } = req.body;

    if (!conversationId || !text) return ResponseObj(res, 400, { message: "Bad request!" });

    try {
        const newMessage = await MessageServices.createMessage({
            conversationId,
            sender,
            text,
        });
        return ResponseObj(res, 201, {
            message: "New message has been created.",
            data: newMessage,
        });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
}

module.exports = {
    getMessagesByConversationId,
    createMessage
}