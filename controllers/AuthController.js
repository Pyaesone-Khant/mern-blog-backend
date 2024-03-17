const {compareSync, hashSync} = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../helpers/mailSender");
const generateOTP = require("../helpers/otpGenerator");
const {UserServices, BlogServices, CategoryServices} = require("../services")
const {ResponseObj} = require("../helpers/utils");

//creating new user
//POST method
const registerNewUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const duplicate = await UserServices.findUserByColumn({email});
        if (duplicate && duplicate.isVerified)
            return ResponseObj(res, 400, {message: "Email already exist!"})

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
                return ResponseObj(res, 400, {message: "Error verifying email address!"})

            // sending OTP to user email
            const emailText = `<p><strong>Dear ${name}, </strong> <br/><br/><br/> Thank you for registering on our blog app! <br/> To complete the registration process and verify your email, please use this One-Time Password (OTP). <br/><br/> Your OTP : <strong> ${otp} </strong> <br/><br/> Thank you for using our blog app! <br/><br/><br/> Best regards, <br/> Writee. </p>`;

            const result = await sendEmail(
                email,
                "Verify your email address!",
                emailText
            );

            if (!result)
                return ResponseObj(res, 400, {message: "Error sending email!"})

            return ResponseObj(res, 200, {message: "Please verified your email address!"})
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
                return ResponseObj(res, 400, {message: "Error registering user account!"})

            // sending OTP to user email
            const emailText = `<p><strong>Dear ${name}, </strong> <br/><br/><br/> Thank you for registering on our blog app! <br/> To complete the registration process and verify your email, please use this One-Time Password (OTP). <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/> Thank you for using our blog app! <br/><br/><br/> Best regards, <br/> Writee. </p>`;

            const result = await sendEmail(
                email,
                "Verify your email address!",
                emailText
            );

            if (!result)
                return ResponseObj(res, 500, {message: "Error sending email!"})

            return ResponseObj(res, 200, {message: "Please verified your email address!"})
        }
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message || "Internal server error!"})
    }
};

//authenticating user login
//POST method
const userLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        const errMessage = "Email or password is wrong!";

        const user = await UserServices.findUserByColumn(
            {email},
            "+password"
        );

        if (!user) return res.json({success: false, message: errMessage});

        if (!user?.isVerified)
            return ResponseObj(res, 400, {
                message: "Please re-register your account & verify your email address!"
            })

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return ResponseObj(res, 400, {message: errMessage})

        const expiredAt = Date.now() + 60 * 60 * 24 * 1000;

        const token = jwt.sign(
            {email: user?.email, expTime: expiredAt},
            process.env.ACCESS_SECRET_TOKEN,
            {
                expiresIn: Math.floor(expiredAt / 1000),
            }
        );

        res.cookie("accessToken", token, {httpOnly: false});

        return ResponseObj(res, 200, {
            expiredAt,
            token: token,
            message: "Login successful!",
        })
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message || "Internal server error!"})
    }
};

//authenticating user logout
//POST method
const userLogout = async (req, res) => {
    try {
        const {token} = req.body;
        if (!token)
            return res.json({success: false, message: "Failed to logout!"});

        return res.json({success: true, message: "Logout successful!"});
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message || "Internal server error!"})
    }
};

// forgot password
// POST method
const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await UserServices.findUserByColumn({email});
        if (!user)
            return ResponseObj(res, 400, {message: "Email does not exist!"})

        const otp = generateOTP();
        const otpExpirationTime = Date.now() + 180000;

        const userData = {otp, otpExpirationTime};

        const result = await UserServices.updateUser(user._id, userData);

        if (!result)
            return ResponseObj(res, 400, {message: "Error sending OTP!"})

        // sending OTP to user email
        const emailText = `<p> <strong>Dear ${user.name}, </strong> <br/><br/><br/> Thank you for using our blog app! <br/>To reset your password, please use this One-Time Password (OTP). <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/><br/> Best regards, <br/> Writee. </p>`;

        const emailResult = await sendEmail(
            email,
            "Verify your email address!",
            emailText
        );

        if (!emailResult)
            return ResponseObj(res, 400, {message: "Error sending email!"})

        return ResponseObj(res, 200, {message: "OTP has been sent to your email!"})
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message || "Internal server error!"})
    }
};

// reset password
// POST method
const resetPassword = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await UserServices.findUserByColumn({email});
        if (!user)
            return ResponseObj(res, 400, {message: "Email does not exist!"})

        const hashedPassword = hashSync(password, 10);
        const userData = {password: hashedPassword};

        const result = await UserServices.updateUser(user._id, userData);
        if (!result)
            return ResponseObj(res, 400, {message: "Error resetting password!"})

        return ResponseObj(res, 200, {message: "Password has been reset successfully!"})
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message || "Internal server error!"})
    }
};

// otp verification
// POST method
const verifyOTP = async (req, res) => {
    try {
        const {email, otp} = req.body;
        const newEmail = req.body?.newEmail || null;
        const currentTime = Date.now();

        const user = await UserServices.findUserByColumn({email});
        if (!user)
            return ResponseObj(res, 400, {message: "Email does not exist!"})

        if (user.otpExpirationTime < currentTime)
            return ResponseObj(res, 400, {message: "OTP has expired!"})

        if (user.otp !== otp)
            return ResponseObj(res, 400, {message: "Invalid OTP!"})

        // for changing email
        if (newEmail) {
            const userData = {
                email: newEmail,
                otp: null,
                otpExpirationTime: null,
            };
            const result = await UserServices.updateUser(user._id, userData);
            if (!result)
                return ResponseObj(res, 400, {message: "Error updating email!"})
            return ResponseObj(res, 200, {message: "Email has been updated successfully!"})
        } else {
            // for verifying email when new user is registered
            const userData = {
                isVerified: true,
                otp: null,
                otpExpirationTime: null,
            };
            const result = await UserServices.updateUser(user._id, userData);
            if (!result)
                return ResponseObj(res, 400, {message: "Error verifying email!"})
            return ResponseObj(res, 200, {message: "Email has been verified successfully!"})
        }
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message || "Internal server error!"})
    }
};

// resend OTP
// POST method
const resendOTP = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await UserServices.findUserByColumn({email});
        if (!user)
            return ResponseObj(res, 400, {message: "Email does not exist!"})

        const otp = generateOTP();
        const otpExpirationTime = Date.now() + 180000;

        const userData = {otp, otpExpirationTime};

        const result = await UserServices.updateUser(user._id, userData);

        if (!result)
            return ResponseObj(res, 400, {message: "Error sending OTP!"})

        // sending OTP to user email
        const emailText = `<p><strong>Dear ${user.name}, </strong><br/><br/><br/> Thank you for using our blog app! <br/>Here is the new OTP code you have requested, please use this One-Time Password (OTP). <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/><br/> Best regards, <br/> Writee. </p>`;

        const emailResult = await sendEmail(
            email,
            "Verify your email address!",
            emailText
        );

        if (!emailResult)
            return ResponseObj(res, 400, {message: "Error sending email!"})

        return ResponseObj(res, 200, {message: "The new OTP has been sent to your email!"})
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message || "Internal server error!"})
    }
};

// search data
// GET method
const getSearchedData = async (req, res) => {
    try {
        const keyword = req.query?.q;

        if (!keyword) return ResponseObj(res, 400, {message: "Search query is required!"});

        const users = await UserServices.searchUsers(keyword);
        const blogs = await BlogServices.searchBlogs(keyword);
        const categories = await CategoryServices.searchCategories(keyword);

        return ResponseObj(res, 200, {users, blogs, categories})

    } catch (error) {
        return ResponseObj(res, 500, {message: error.message})
    }
}

// refresh token
// GET method
const getRefreshToken = async (req, res) => {
    try {
        const tokenExpireTime = req.expTime;
        const email = req.email;
        if (new Date(tokenExpireTime) > new Date())
            return ResponseObj(res, 400, {message: "Token hasn't expired yet!"})

        const expiredAt = Date.now() + 60 * 60 * 24 * 1000;
        const newToken = jwt.sign(
            {email: email, expTime: expiredAt},
            process.env.ACCESS_SECRET_TOKEN,
            {
                expiresIn: Math.floor(expiredAt / 1000),
            }
        );

        return ResponseObj(res, 200, {
            success: true,
            expiredAt,
            token: newToken,
            message: "Token refreshed successfully!"
        })
    } catch (error) {
        return ResponseObj(res, 500, {message: "Internal server error!"})
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
