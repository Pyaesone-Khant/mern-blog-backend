const {
    getAllComments,
    createNewComment,
    updateComment,
    deleteComment,
    getCommentById,
} = require("../controllers/commentController");

const authToken = require("../middlewares/authToken");
const router = require("express").Router();

router
    .route("/")
    .get(getAllComments)
    .post( authToken, createNewComment)
    .put( authToken, updateComment)
    .delete( authToken, deleteComment);

router.route("/:id").get( authToken, getCommentById);

module.exports = router;
