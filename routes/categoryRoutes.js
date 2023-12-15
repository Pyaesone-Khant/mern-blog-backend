const {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
} = require("../controllers/CategoryController");

const router = require("express").Router();
const authToken = require("../middlewares/authToken");

router
    .route("/")
    .get(getAllCategories)
    .post( authToken, createNewCategory)
    .put( authToken, updateCategory)
    .delete( authToken, deleteCategory);

router.route("/:id").get(getCategoryById);

module.exports = router;
