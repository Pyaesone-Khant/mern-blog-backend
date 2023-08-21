const Comment = require("../models/Comment");

//getting all comments
//GET method
const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().lean();

        if (!comments?.length)
            return res.json({
                success: false,
                message: "There is no comments for now!",
            });
        return res.json({ success: true, data: comments });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//creating new category
//POST method
const createNewComment = async (req, res) => {
    try {
        const { comment, userId, blogId } = req.body;

        if (!comment || !userId || !blogId)
            return res.json({
                success: false,
                message: "All fields are required!",
            });

        if (comment.trim().length < 1)
            return res.json({
                success: false,
                message: "Blog comment must have minimum of one character!",
            });

        const commentObj = { comment, userId, blogId };

        const newComment = await Comment.create(commentObj);

        if (!newComment)
            return res.json({
                success: false,
                message: "Error creating new comment!",
            });
        return res.json({
            success: true,
            message: "New comment has been created.",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//updating comment
//PUT method
const updateComment = async (req, res) => {
    try {
        const { id, comment } = req.body;

        if (!id)
            return res.json({
                success: false,
                message: "Comment ID is required to update comment!",
            });

        if (comment.trim().length < 1)
            return res.json({
                success: false,
                message: "Comment should have minimum of one character!",
            });

        //find comment by id in database
        const updatedComment = await Comment.findById(id).exec();

        if (!updatedComment)
            return res.json({ success: false, message: "comment not found!" });

        updatedComment.comment = comment;
        const result = await updatedComment.save();
        return res.json({
            success: true,
            data: result,
            message: "comment has been updated successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//deleting Comment
//DELETE method
const deleteComment = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id)
            return res.json({
                success: false,
                message: "Comment id is required to delete comment!",
            });

        //find comment in database
        const comment = await Comment.findById(id).exec();

        if (!comment)
            return res.json({ success: false, message: "Comment not found!" });

        await comment.deleteOne();
        return res.json({
            success: true,
            message: "Comment has been deleted successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//getting one Comment
//GET method
const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.json({
                success: false,
                message: "Comment id is required!",
            });

        //find comment by id in database
        const comment = await Comment.findById(id).exec();
        if (!comment)
            return res.json({ success: false, message: "Comment not found!" });
        return res.json({ success: true, data: comment });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

module.exports = {
    getAllComments,
    createNewComment,
    updateComment,
    deleteComment,
    getCommentById,
};
