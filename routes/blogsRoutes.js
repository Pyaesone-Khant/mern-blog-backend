const express = require("express");
const {
    getAllBlogs,
    createNewBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    setBlogLikes,
    getBlogsByUserId,
} = require("../controllers/BlogsController");

const router = express.Router();

router
    .route("/")
    .get(getAllBlogs)
    .post(createNewBlog)
    .put(updateBlog)
    .delete(deleteBlog);
router.route("/:id").get(getBlogById);
router
    .post("/reactions", setBlogLikes)
    .get("/getUserBlogs/:userId", getBlogsByUserId);

module.exports = router;
