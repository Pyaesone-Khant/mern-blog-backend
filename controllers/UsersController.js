const User = require("../models/User");
const { hashSync, compareSync } = require("bcrypt");
const Blog = require("../models/Blog");
const sendEmail = require("../helpers/mailSender");
const generateOTP = require("../helpers/otpGenerator");
const deleteImage = require("../middlewares/deleteImage");
const { formatData, ResponseObj, transformImageUrl } = require("../helpers/utils");
const { BlogServices, UserServices } = require("../services");

//getting all users
//GET method
const getAllUsers = async (req, res) => {
    try {
        const users = await UserServices.getAllUser();
        if (!users?.length)
            return ResponseObj(res, 200, []);
        return ResponseObj(res, 200, users);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.data.message || "Internal Server Error!" });
    }
};

// get current user
// GET method
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await UserServices.findUserByColumn(
            { _id: userId },
            "-password -otp -otpExpirationTime -isVerified -__v"
        );
        if (!user)
            return ResponseObj(res, 400, { message: "User not found!" });

        const currentUser = {
            ...user,
            profileImage: transformImageUrl(user?.profileImage),
        };
        return ResponseObj(res, 200, currentUser);
    } catch (error) {
        return ResponseObj(res, 500, { message: error.message });
    }
};

//change password
//PUT method
const changePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const userId = req.userId;
        //find user by id in database
        const user = await UserServices.findUserByColumn(
            { _id: userId },
            "+password"
        );

        if (!user)
            return ResponseObj(res, 400, { message: "User not found!" });

        const isSamePassword = compareSync(newPassword, user.password);
        if (isSamePassword)
            return ResponseObj(res, 400, { message: "New password can not be same with the old one!" });

        const isCorrect = compareSync(password, user.password);
        if (!isCorrect)
            return ResponseObj(res, 400, { message: "Password is incorrect!" });

        const hashedPassword = hashSync(newPassword, 10);
        const result = await UserServices.updateUser(user._id, {
            password: hashedPassword,
        });

        return ResponseObj(res, 200, { message: "Password changed successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error.data.message || "Internal Server Error!" });
    }
};

// change name
// PUT method
const changeName = async (req, res) => {
    try {
        const userId = req.userId;
        const { name } = req.body;

        //find user by id in database
        const user = await UserServices.findUserByColumn({ _id: userId });
        if (!user)
            return ResponseObj(res, 400, { message: "User not found!" });

        const result = await UserServices.updateUser(user?._id, { name });

        if (!result)
            return ResponseObj(res, 400, { message: "Error changing name!" });

        return ResponseObj(res, 200, { message: "Name changed successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
};

// change email
// PUT method
const changeEmail = async (req, res) => {
    try {
        const { newEmail, password } = req.body;
        const userId = req.userId;

        const user = await UserServices.findUserByColumn(
            { _id: userId },
            "+password"
        );
        if (!user)
            return ResponseObj(res, 400, { message: "User not found!" });

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return ResponseObj(res, 400, { message: "Password is incorrect!" });

        const duplicateEmail = await UserServices.findUserByColumn({
            email: newEmail,
        });

        if (duplicateEmail)
            return ResponseObj(res, 400, { message: "Email already exists!" });


        const otp = generateOTP();
        const otpExpirationTime = Date.now() + 180000; // 3 minutes

        // sending OTP to user email
        const emailText = `<p><strong>Dear ${user.name}, </strong><br/><br/><br/> Thank you for using our blog app! <br/>Here is the OTP code, please use this One-Time Password (OTP) to verify your email address. <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/><br/> Best regards, <br/> PK-Blog Team. </p>`;
        const emailResult = await sendEmail(
            newEmail,
            "Verify your email address!",
            emailText
        );
        if (!emailResult)
            return ResponseObj(res, 400, { message: "Error sending email!" });

        const result = await UserServices.updateUser(user._id, {
            otp,
            otpExpirationTime,
        });

        if (!result)
            return ResponseObj(res, 500, { message: "Something went wrong. Please try again!" });

        return ResponseObj(res, 200, { message: "OTP has been sent to your new email address!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
};

//deleting user
//DELETE method
const deleteUser = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.userId;

        //find User in database
        const user = await UserServices.findUserByColumn(
            { _id: userId },
            "+password"
        );

        if (!user)
            return ResponseObj(res, 400, { message: "User not found!" });

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return ResponseObj(res, 400, { message: "Password is incorrect!" });

        //deleting blogs before the account is deleted!
        const deleteBlogs = await Blog.deleteMany({ userId: user?._id });
        const result = await user.deleteOne();
        return ResponseObj(res, 200, { message: "Account deleted successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
};

//getting one user
//GET method
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return ResponseObj(res, 400, { message: "User ID is required!" });

        //find user by id in database
        const user = await UserServices.findUserByColumn({ _id: id });

        if (!user) return ResponseObj(res, 400, { message: "User not found!" });

        const userData = {
            name: user.name,
            _id: user._id,
            profileImage: transformImageUrl(user?.profileImage),
        };

        return ResponseObj(res, 200, userData);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.data?.message || "Internal Server Error!" });
    }
};

//handle bookmarking blogs
//POST method
const setSavedBlog = async (req, res) => {
    try {
        const userId = req.userId;
        const { blogId } = req.body;
        if (!blogId)
            return ResponseObj(res, 400, { message: "Blog ID is required!" });

        const blog = await BlogServices.findBlogById(blogId);

        if (!blog) return ResponseObj(res, 404, { message: "Blog not found!" });

        const user = await UserServices.findUserByColumn({ _id: userId });

        if (!user) return ResponseObj(res, 404, { message: "User not found!" });

        //blog.reactions.push(userId);
        const blogAlreadySaved = user.savedBlogs?.find((bId) => bId === blogId);

        if (blogAlreadySaved) {
            const result = await User.updateOne(
                { _id: userId },
                { $pull: { savedBlogs: blogId } }
            );
            return ResponseObj(res, 200, {
                message: "Blog removed from saved lists successfully!",
            });
        }

        const result = await User.updateOne(
            { _id: userId },
            { $push: { savedBlogs: blogId } }
        );
        return ResponseObj(res, 200, { message: "Blog saved successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
};

//get savedBlogs
//GET method
const getSavedBlogs = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await UserServices.findUserByColumn({ _id: userId });

        if (!user) return ResponseObj(res, 400, { message: "User not found!" });

        // finding all blogs user had saved
        const savedBlogsList = await Blog.find({
            _id: { $in: user.savedBlogs },
        })
            .sort({ createdAt: -1 })
            .lean();
        if (!savedBlogsList?.length) return ResponseObj(res, 200, []);
        const modBlogs = formatData(savedBlogsList);
        return ResponseObj(res, 200, modBlogs);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
};

//update profile
//PUT method
const changeProfilePicture = async (req, res) => {
    try {
        const { file } = req;
        const userId = req.userId;
        const profileImage = file?.originalname || null;

        //find user by id in database
        const user = await UserServices.findUserByColumn({ _id: userId });
        if (!user)
            return ResponseObj(res, 400, { message: "User not found!" });

        if (user?.profileImage) {
            const deleteResult = await deleteImage(user?.profileImage);
            if (!deleteResult)
                return ResponseObj(res, 400, { message: "Error deleting image!" });
        }

        const result = await UserServices.updateUser(user?._id, { profileImage });

        if (!result)
            return ResponseObj(res, 400, { message: "Error updating profile picture!" });

        return ResponseObj(res, 200, { message: "Profile picture updated successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal Server Error!" });
    }
};

module.exports = {
    getCurrentUser,
    getAllUsers,
    changeName,
    changePassword,
    changeEmail,
    deleteUser,
    getUserById,
    setSavedBlog,
    getSavedBlogs,
    changeProfilePicture,
};
