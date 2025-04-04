const { ResponseObj, transformImageUrl } = require("../helpers/utils");
const { ConversationServices, UserServices } = require("../services");

const createNewConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const { receiver } = req.body;

        if (!receiver) return ResponseObj(res, 400, { message: "Receiver ID is required!" });

        const payload = [
            userId,
            receiver,
        ]

        const newConversation = await ConversationServices.createConversation(payload);
        return ResponseObj(res, 200, {
            message: "New conversation has been created.",
            data: newConversation,
        });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
}

const getUserConversations = async (req, res) => {
    try {
        const userId = req.userId;
        let conversations = (await ConversationServices.getConversationsByUserId(userId)).map((it) => it.toObject());
        conversations = await Promise.all(
            conversations?.map(async (conversation) => {
                const receiverId = conversation?.members?.find((member) => member !== userId);
                const sender = await UserServices.findUserByColumn({ _id: userId });
                const receiver = await UserServices.findUserByColumn({ _id: receiverId });
                return {
                    ...conversation,
                    sender: {
                        _id: sender?._id,
                        name: sender?.name,
                        profileImage: transformImageUrl(sender?.profileImage),
                    },
                    receiver: {
                        _id: receiver?._id,
                        name: receiver?.name,
                        profileImage: transformImageUrl(receiver?.profileImage),
                    },
                };
            })
        )

        return ResponseObj(res, 200, conversations);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
}

module.exports = {
    createNewConversation,
    getUserConversations
}