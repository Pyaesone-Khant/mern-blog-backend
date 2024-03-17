const express = require("express");
const {
    changeName,
    deleteUser,
    getUserById,
    setSavedBlog,
    changePassword,
    getCurrentUser,
    changeEmail,
    changeProfilePicture,
    getSavedBlogs,
} = require("../controllers/UsersController");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const upload = require("../config/aws");

router
    .route("/")
    .get(authToken, getCurrentUser)
    .put(authToken, changeName)
    .delete(authToken, deleteUser);
router.post("/save-blogs", authToken, setSavedBlog)
    .put("/change-password", authToken, changePassword)
    .put("/change-email", authToken, changeEmail)
    .put("/change-avatar", authToken, upload.single("profileImage"), changeProfilePicture).get("/saved-blogs/:userId", authToken, getSavedBlogs);
router.route("/:id").get(getUserById);

module.exports = router;
