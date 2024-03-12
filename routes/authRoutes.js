const express = require("express");
const {
    userLogin,
    userLogout,
    forgotPassword,
    registerNewUser,
    resetPassword,
    verifyOTP,
    resendOTP,
    getRefreshToken,
} = require("../controllers/authController");
const router = express.Router();
const authToken = require("../middlewares/authToken");

router
    .post("/register", registerNewUser)
    .post("/login", userLogin)
    .post("/logout", userLogout)
    .post("/forgot-password", forgotPassword)
    .post("/reset-password", resetPassword)
    .post("/verify-otp", verifyOTP)
    .post("/resend-otp", resendOTP)
    .get("/refresh-token", authToken, getRefreshToken)

module.exports = router;
