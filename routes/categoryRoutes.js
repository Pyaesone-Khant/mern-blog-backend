const {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory,
    getCategoryById, getBlogsByCategory,
} = require("../controllers/CategoryController");

const router = require("express").Router();
const authToken = require("../middlewares/authToken");

router
    .route("/")
    .get(getAllCategories)
    .post(authToken, createNewCategory)
    .put(authToken, updateCategory)
    .delete(authToken, deleteCategory);

router.route("/:id").get(getCategoryById);
router.get("/:id/blogs", getBlogsByCategory);

module.exports = router;
