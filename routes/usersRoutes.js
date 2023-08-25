const express = require("express");
const {
    getAllUsers,
    updateUser,
    deleteUser,
    getUserById,
    createNewUser,
    setSavedBlog,
    getUserSavedBlogs,
} = require("../controllers/UsersController");

const router = express.Router();

router
    .route("/")
    .get(getAllUsers)
    .post(createNewUser)
    .put(updateUser)
    .delete(deleteUser);
router.route("/:id").get(getUserById);
router.route("/save_blogs/:userId").post(setSavedBlog).get(getUserSavedBlogs);

module.exports = router;
