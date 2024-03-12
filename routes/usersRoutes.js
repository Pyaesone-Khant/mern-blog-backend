const express = require("express");
const {
    getAllUsers,
    changeName,
    deleteUser,
    getUserById,
    createNewUser,
    setSavedBlog, changePassword, getCurrentUser, changeEmail, changeProfilePicture, getSavedBlogs,
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
router.route("/save-blogs").post(authToken, setSavedBlog);
router.get("/saved-blogs/:userId", authToken, getSavedBlogs);
router.put("/change-password", authToken, changePassword).put("/change-email", authToken, changeEmail);
router.put("/change-avatar", authToken, upload.single("profileImage"), changeProfilePicture);

module.exports = router;
