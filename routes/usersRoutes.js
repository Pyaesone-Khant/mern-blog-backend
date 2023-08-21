const express = require("express");
const {
    getAllUsers,
    updateUser,
    deleteUser,
    getUserById,
    createNewUser,
} = require("../controllers/UsersController");

const router = express.Router();

router
    .route("/")
    .get(getAllUsers)
    .post(createNewUser)
    .put(updateUser)
    .delete(deleteUser);

router.route("/:id").get(getUserById);

module.exports = router;
