const express = require("express");
const {
    getAllBlogs,
    createNewBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    setBlogLikes,
    getBlogsByUserId, getRecommendedBlogs, getRandomBlogs, getSearchBlogs,
} = require("../controllers/BlogsController");
const authToken = require("../middlewares/authToken");
const router = express.Router();
const upload = require("../config/aws");

router.get("/random", getRandomBlogs).get("/search", getSearchBlogs);
router
    .route("/")
    .get(getAllBlogs)
    .post(authToken, upload.single("blogImage"), createNewBlog)
    .put(authToken, upload.single("blogImage"), updateBlog)
    .delete(authToken, deleteBlog);
router.route("/:id").get(getBlogById);
router
    .post("/reactions", authToken, setBlogLikes)
    .get("/user-blogs/:userId", getBlogsByUserId)
    .get("/recommendedBlogs/:categoryId", getRecommendedBlogs)

module.exports = router;
