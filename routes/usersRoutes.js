const express = require("express");
const {
    getAllUsers,
    changeName,
    deleteUser,
    getUserById,
    createNewUser,
    setSavedBlog,
    getUserSavedBlogs, changePassword, getCurrentUser, changeEmail, changeProfilePicture,
} = require("../controllers/UsersController");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const upload = require("../config/aws");

router
    .route("/")
    .get(authToken, getCurrentUser)
    .post(createNewUser)
    .put(authToken, changeName)
    .delete(authToken, deleteUser);
router.route("/:id").get(getUserById);
router.route("/save_blogs/:userId").post(authToken, setSavedBlog).get(authToken, getUserSavedBlogs);
router.put("/change-password", authToken,  changePassword).put("/change-email", authToken, changeEmail);
router.put("/change-avatar", authToken, upload.single("profileImage"), changeProfilePicture);

module.exports = router;
