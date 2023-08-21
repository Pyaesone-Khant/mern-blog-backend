const express = require("express");
const { userLogin, userLogout } = require("../controllers/authController");
const { createNewUser } = require("../controllers/UsersController");
const router = express.Router();

router
    .post("/register", createNewUser)
    .post("/login", userLogin)
    .post("/logout", userLogout);

module.exports = router;
