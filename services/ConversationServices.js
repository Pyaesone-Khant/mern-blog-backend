
const Conversation = require("../models/Conversation");

class ConversationServices {

    async getConversations() {
        const conversations = await Conversation.find();
        return conversations;
    }

    async createConversation(conversationData) {
        try {
            const newConversation = await Conversation.create({ members: conversationData });
            return newConversation;
        } catch (error) {
            throw new Error(error);
        }
    }

    async getConversationsByUserId(userId) {
        try {

            const conversations = await Conversation.find({
                members: {
                    $in: [userId],
                }
            });

            // const conversations = await Conversation
            //     .find({
            //         $or: [
            //             { sender: userId },
            //             { receiver: userId },
            //         ],
            //     })
            //     .populate("sender", "-password -otp -otpExpirationTime -isVerified -email -savedBlogs")
            //     .populate("receiver", "-password -otp -otpExpirationTime -isVerified -email -savedBlogs")
            //     .sort({
            //         updatedAt: -1
            //     });
            return conversations;
        } catch (error) {
            throw new Error(error);
        }
    }

}

module.exports = new ConversationServices();