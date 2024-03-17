const Comment = require("../models/Comment");
const {CommentServices} = require('../services')
const {ResponseObj} = require("../helpers/utils")

//getting all comments
//GET method
const getAllComments = async (req, res) => {
    try {
        const blogId = req.query.blogId

        if (blogId) {
            const comments = await Comment.find({blogId: blogId}).lean().exec()
            return ResponseObj(res, 200, comments)
        }
        const comments = await CommentServices.getAllComments();
        return ResponseObj(res, 200, comments);
    } catch (error) {
        return ResponseObj(res, 500, {message: error?.data?.message || "Internal Server Error!"});
    }
};

//creating new category
//POST method
const createNewComment = async (req, res) => {
    try {
        const {comment, userId, blogId} = req.body;

        if (!comment || !userId || !blogId)
            return ResponseObj(res, 400, {message: "All field is required!"})

        if (comment.trim().length < 1)
            return ResponseObj(res, 400, {
                message: "Blog comment must have minimum of one character!",
            });

        const commentObj = {comment, userId, blogId};
        const newComment = await CommentServices.createComment(commentObj)
        if (!newComment)
            return ResponseObj(res, 500, {
                message: "Error creating new comment!",
            });
        return ResponseObj(res, 200, {
            message: "New comment has been created.",
        });
    } catch (error) {
        return ResponseObj(res, 500, {message: error?.data?.message || "Internal Server Error!"})
    }
};

//updating comment
//PUT method
const updateComment = async (req, res) => {
    try {
        const {id, comment} = req.body;

        if (!id)
            return ResponseObj(res, 400, {message: "Comment Id is required!"})

        if (comment?.trim().length < 1)
            return ResponseObj(res, 400, {
                message: "Comment should have minimum of one character!",
            });

        //find comment by id in database
        const existingComment = await CommentServices.findCommentById(id)

        if (!existingComment)
            return ResponseObj(res, 404, {message: "comment not found!"});

        const result = await CommentServices.updateComment(id, {comment})


        if (!result) return ResponseObj(res, 500, {message: "Error updating comment!"})

        return ResponseObj(res, 200, {
            message: "Comment has been updated successfully!",
        });
    } catch (error) {
        return ResponseObj(res, 500, {message: error?.data?.message || "Internal Server Error!"});
    }
};

//deleting Comment
//DELETE method
const deleteComment = async (req, res) => {
    try {
        const {id} = req.body;

        if (!id)
            return ResponseObj(res, 400, {message: "Comment Id is required!"})

        //find comment in database
        const comment = await CommentServices.findCommentById(id)

        if (!comment)
            return ResponseObj(res, 404, {
                message: "Comment not found!"
            })

        const result = await CommentServices.deleteComment(id)

        if (!result) return ResponseObj(res, 500, {message: "Error deleting comment!"})

        return ResponseObj(res, 200, {message: "Comment deleted successfully!"})
    } catch (error) {
        return ResponseObj(res, 500, {message: error?.data?.message || "Internal Server Error!"})
    }
};

//getting one Comment
//GET method
const getCommentById = async (req, res) => {
    try {
        const {id} = req.params;
        if (!id)
            return ResponseObj(res, 400, {
                message: "Comment id is required!",
            });

        //find comment by id in database
        const comment = await CommentServices.findCommentById(id)
        if (!comment)
            return ResponseObj(res, 404, {message: "Comment not found!"});
        return ResponseObj(res, 200, {comment});
    } catch (error) {
        return ResponseObj(res, 404, {message: error?.data?.message || "Internal Server Error!"});
    }
};

module.exports = {
    getAllComments,
    createNewComment,
    updateComment,
    deleteComment,
    getCommentById,
};
