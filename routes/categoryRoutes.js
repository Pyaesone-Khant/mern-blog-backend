const {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
} = require("../controllers/CategoryController");

const router = require("express").Router();

router
    .route("/")
    .get(getAllCategories)
    .post(createNewCategory)
    .put(updateCategory)
    .delete(deleteCategory);

router.route("/:id").get(getCategoryById);

module.exports = router;
