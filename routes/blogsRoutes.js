const express = require("express");
const {
    getAllBlogs,
    createNewBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    setBlogLikes,
    getBlogsByUserId, searchBlogsByTitle, getRecommendedBlogs,
} = require("../controllers/BlogsController");
const authToken = require("../middlewares/authToken");
const router = express.Router();
const upload = require("../config/aws");

router
    .route("/")
    .get(getAllBlogs)
    .post(authToken, upload.single("blogImage"), createNewBlog)
    .put(authToken, upload.single("blogImage"), updateBlog)
    .delete(authToken, deleteBlog);
router.route("/:id").get(getBlogById);
router
    .post("/reactions", authToken, setBlogLikes)
    .get("/getUserBlogs/:userId", getBlogsByUserId)
    .post("/search", searchBlogsByTitle)
    .get("/recommendedBlogs/:categoryId", getRecommendedBlogs)

module.exports = router;
