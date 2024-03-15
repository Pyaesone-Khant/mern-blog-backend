const { compareSync, hashSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserServices = require("../services/UserServices");
const sendEmail = require("../helpers/mailSender");
const generateOTP = require("../helpers/otpGenerator");
const Blog = require("../models/Blog");
const { ResponseObj } = require("../helpers/utils");
const BlogServices = require("../services/BlogServices");
const CategoryServices = require("../services/CategoryServices");

//creating new user
//POST method
const registerNewUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const duplicate = await UserServices.findUserByColumn({ email });
        if (duplicate && duplicate.isVerified)
            return res.json({
                success: false,
                message: `Duplicated email address!`,
            });

        const otp = generateOTP();
        const hashedPassword = hashSync(password, 10);
        const otpExpirationTime = Date.now() + 180000;

        // if email already exist but not verified then update user
        if (duplicate) {
            const userData = {
                name,
                password: hashedPassword,
                otp,
                otpExpirationTime,
            };
            const user = await UserServices.updateUser(duplicate._id, userData);
            if (!user)
                return res.json({
                    success: false,
                    message: "Error updating user!",
                });

            // sending OTP to user email
            const emailText = `<p><strong>Dear ${name}, </strong> <br/><br/><br/> Thank you for registering on our blog app! <br/> To complete the registration process and verify your email, please use this One-Time Password (OTP). <br/><br/> Your OTP : <strong> ${otp} </strong> <br/><br/> Thank you for using our blog app! <br/><br/><br/> Best regards, <br/> PK-Blog Team. </p>`;

            const result = await sendEmail(
                email,
                "Verify your email address!",
                emailText
            );

            if (!result)
                return res.json({
                    success: false,
                    message: "Error sending email!",
                });

            return res.json({
                success: true,
                message: "Please verified your email address!",
            });
        } else {
            //if email does not exist then create new user
            const userObj = {
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpirationTime,
            };
            const user = await UserServices.createUser(userObj);

            if (!user)
                return res.json({
                    success: false,
                    message: "Error creating new user!",
                });

            // sending OTP to user email
            const emailText = `<p><strong>Dear ${name}, </strong> <br/><br/><br/> Thank you for registering on our blog app! <br/> To complete the registration process and verify your email, please use this One-Time Password (OTP). <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/> Thank you for using our blog app! <br/><br/><br/> Best regards, <br/> PK-Blog Team. </p>`;

            const result = await sendEmail(
                email,
                "Verify your email address!",
                emailText
            );

            if (!result)
                return res.json({
                    success: false,
                    message: "Error sending email!",
                });

            return res.json({
                success: true,
                message: "Please verified your email address!",
            });
        }
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//authenticating user login
//POST method
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errMessage = "Email or password is wrong!";

        const user = await UserServices.findUserByColumn(
            { email },
            "+password"
        );

        if (!user) return res.json({ success: false, message: errMessage });

        if (!user?.isVerified)
            return res.json({
                success: false,
                message:
                    "Please re-register your account & verify your email address!",
            });

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return res.json({ success: false, message: errMessage });

        const expiredAt = Date.now() + 60 * 60 * 24 * 1000;

        const token = jwt.sign(
            { email: user?.email, expTime: expiredAt },
            process.env.ACCESS_SECRET_TOKEN,
            {
                expiresIn: Math.floor(expiredAt / 1000),
            }
        );

        res.cookie("accessToken", token, { httpOnly: false });

        return res.json({
            success: true,
            expiredAt,
            token: token,
            message: "Login successful!",
        });
    } catch (error) {
        return res.json({ success: false, error: error.message });
    }
};

//authenticating user logout
//POST method
const userLogout = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.json({ success: false, message: "Failed to logout!" });

        return res.json({ success: true, message: "Logout successful!" });
    } catch (error) {
        return res.json({ success: false, error });
    }
};

// forgot password
// POST method
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserServices.findUserByColumn({ email });
        if (!user)
            return res.json({
                success: false,
                message: "Email does not exist!",
            });

        const otp = generateOTP();
        const otpExpirationTime = Date.now() + 180000;

        const userData = { otp, otpExpirationTime };

        const result = await UserServices.updateUser(user._id, userData);

        if (!result)
            return res.json({
                success: false,
                message: "Error resending OTP!",
            });

        // sending OTP to user email
        const emailText = `<p> <strong>Dear ${user.name}, </strong> <br/><br/><br/> Thank you for using our blog app! <br/>To reset your password, please use this One-Time Password (OTP). <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/><br/> Best regards, <br/> PK-Blog Team. </p>`;

        const emailResult = await sendEmail(
            email,
            "Verify your email address!",
            emailText
        );

        if (!emailResult)
            return res.json({
                success: false,
                message: "Error sending email!",
            });

        return res.json({
            success: true,
            message: "The new OTP code has been sent to your email!",
        });
    } catch (error) {
        throw new Error(error);
    }
};

// reset password
// POST method
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserServices.findUserByColumn({ email });
        if (!user)
            return res.json({
                success: false,
                message: "Email does not exist!",
            });

        const hashedPassword = hashSync(password, 10);
        const userData = { password: hashedPassword };

        const result = await UserServices.updateUser(user._id, userData);
        if (!result)
            return res.json({
                success: false,
                message: "Error resetting password!",
            });

        return res.json({
            success: true,
            message: "Password has been reset successfully!",
        });
    } catch (error) {
        throw new Error(error);
    }
};

// otp verification
// POST method
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const newEmail = req.body?.newEmail || null;
        const currentTime = Date.now();

        const user = await UserServices.findUserByColumn({ email });
        if (!user)
            return res.json({
                success: false,
                message: "Email does not exist!",
            });

        if (user.otpExpirationTime < currentTime)
            return res.json({ success: false, message: "OTP has expired!" });

        if (user.otp !== otp)
            return res.json({
                success: false,
                message: "Invalid OTP!",
            });

        // for changing email
        if (newEmail) {
            const userData = {
                email: newEmail,
                otp: null,
                otpExpirationTime: null,
            };
            const result = await UserServices.updateUser(user._id, userData);
            if (!result)
                return res.json({
                    success: false,
                    message: "Error verifying OTP!",
                });
            return res.json({
                success: true,
                message: "Your email has been updated successfully!",
            });
        } else {
            // for verifying email when new user is registered
            const userData = {
                isVerified: true,
                otp: null,
                otpExpirationTime: null,
            };
            const result = await UserServices.updateUser(user._id, userData);
            if (!result)
                return res.json({
                    success: false,
                    message: "Error verifying OTP!",
                });
            return res.json({
                success: true,
                message: "Your account has been registered successfully!",
            });
        }
    } catch (error) {
        throw new Error(error);
    }
};

// resend OTP
// POST method
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserServices.findUserByColumn({ email });
        if (!user)
            return res.json({
                success: false,
                message: "Email does not exist!",
            });

        const otp = generateOTP();
        const otpExpirationTime = Date.now() + 180000;

        const userData = { otp, otpExpirationTime };

        const result = await UserServices.updateUser(user._id, userData);

        if (!result)
            return res.json({
                success: false,
                message: "Error resending OTP!",
            });

        // sending OTP to user email
        const emailText = `<p><strong>Dear ${user.name}, </strong><br/><br/><br/> Thank you for using our blog app! <br/>Here is the new OTP code you have requested, please use this One-Time Password (OTP). <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/><br/> Best regards, <br/> PK-Blog Team. </p>`;

        const emailResult = await sendEmail(
            email,
            "Verify your email address!",
            emailText
        );

        if (!emailResult)
            return res.json({
                success: false,
                message: "Error sending email!",
            });

        return res.json({
            success: true,
            message: "OTP has been resent!",
        });
    } catch (error) {
        throw new Error(error);
    }
};

// search data
// GET method
const getSearchedData = async (req, res) => {
    try {
        const keyword = req.query?.q;

        if (!keyword) return ResponseObj(res, 400, { message: "Search query is required!" });

        const users = await UserServices.searchUsers(keyword);
        const blogs = await BlogServices.searchBlogs(keyword);
        const categories = await CategoryServices.searchCategories(keyword);

        return ResponseObj(res, 200, { users, blogs, categories })

    } catch (error) {
        return ResponseObj(res, 500, { message: error.message })
    }
}

// refresh token
// GET method
const getRefreshToken = async (req, res) => {
    try {
        const tokenExpireTime = req.expTime;
        const email = req.email;
        if (new Date(tokenExpireTime) > new Date())
            return ResponseObj(res, 400, { message: "Token hasn't expired yet!" })

        const expiredAt = Date.now() + 60 * 60 * 24 * 1000;
        const newToken = jwt.sign(
            { email: email, expTime: expiredAt },
            process.env.ACCESS_SECRET_TOKEN,
            {
                expiresIn: Math.floor(expiredAt / 1000),
            }
        );

        return ResponseObj(res, 200, { success: true, expiredAt, token: newToken, message: "Token refreshed successfully!" })
    } catch (error) {
        return ResponseObj(res, 500, { message: "Internal server error!" })
    }
};



module.exports = {
    registerNewUser,
    userLogin,
    userLogout,
    forgotPassword,
    resetPassword,
    verifyOTP,
    resendOTP,
    getSearchedData,
    getRefreshToken,
};
