const Comment = require("../models/Comment");

class CommentServices {
    async getAllComments() {
        try {
            const comments = await Comment.find().lean().exec();
            return comments;
        } catch (error) {
            throw new Error(error)
        }
    }

    async createComment(commentData) {
        try {
            const comment = await Comment.create(commentData);
            return comment;
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateComment(commentId, commentData) {
        try {
            const filter = {_id: commentId};
            const updatedData = {$set: commentData}
            const result = await Comment.updateOne(filter, updatedData);
            return result?.matchedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteComment(commentId) {
        try {
            const result = await Comment.deleteOne({_id: commentId})
            return result?.deletedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async findCommentById(id) {
        try {
            const comment = await Comment.findById(id).lean().exec();
            return comment;
        } catch (error) {
            throw new Error(error)
        }
    }

    async findCommentsByColumn(column) {
        try {
            const comments = await Comment.findOne(column).lean().exec();
            return comments;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new CommentServices();