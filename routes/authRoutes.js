const express = require("express");
const { userLogin, userLogout, forgotPassword, registerNewUser, resetPassword, verifyOTP, resendOTP} = require("../controllers/authController");
// const { createNewUser } = require("../controllers/UsersController");
const router = express.Router();

router
    .post("/register", registerNewUser)
    .post("/login", userLogin)
    .post("/logout", userLogout)
    .post("/forgot-password", forgotPassword)
    .post("/reset-password", resetPassword)
    .post("/verify-otp", verifyOTP)
    .post("/resend-otp", resendOTP);

module.exports = router;
