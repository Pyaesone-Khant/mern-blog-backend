const {
    getAllComments,
    createNewComment,
    updateComment,
    deleteComment,
    getCommentById,
} = require("../controllers/commentController");

const router = require("express").Router();

router
    .route("/")
    .get(getAllComments)
    .post(createNewComment)
    .put(updateComment)
    .delete(deleteComment);

router.route("/:id").get(getCommentById);

module.exports = router;
