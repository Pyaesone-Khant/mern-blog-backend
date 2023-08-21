const express = require("express");
const {
    getAllBlogs,
    createNewBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    setBlogLikes,
} = require("../controllers/BlogsController");

const router = express.Router();

router
    .route("/")
    .get(getAllBlogs)
    .post(createNewBlog)
    .put(updateBlog)
    .delete(deleteBlog);
router.route("/:id").get(getBlogById);
router.post("/reactions", setBlogLikes);

module.exports = router;
