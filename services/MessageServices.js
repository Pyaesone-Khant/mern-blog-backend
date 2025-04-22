const Message = require('../models/Message');

class MessageServices {
    async getMessagesByConversationId(conversationId) {
        try {
            const messages = await Message
                .find({
                    conversationId
                })
                .populate("sender", "-password -otp -otpExpirationTime -isVerified -email -savedBlogs")
                .sort({ createdAt: 1 })
                .lean();
            return messages;
        } catch (error) {
            throw new Error(error);
        }
    }

    async createMessage(messageData) {
        try {
            const newMessage = await Message.create(messageData);
            return newMessage;
        } catch (error) {
            throw new Error(error);
        }
    }

}

module.exports = new MessageServices(); 