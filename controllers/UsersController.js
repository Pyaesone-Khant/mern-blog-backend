const User = require("../models/User");
const {hashSync, compareSync} = require("bcrypt");
const Blog = require("../models/Blog");
const UserServices = require("../services/UserServices");
const sendEmail = require("../helpers/mailSender");
const generateOTP = require("../helpers/otpGenerator");
const deleteImage = require("../middlewares/deleteImage");
const {formatData, ResponseObj} = require("../helpers/utils");

//getting all users
//GET method
const getAllUsers = async (req, res) => {
    try {
        const users = await UserServices.getAllUser();
        if (!users?.length)
            return res.json({
                success: false,
                message: "There is no users for now!",
            });
        return res.json({success: true, data: users});
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

// get current user
// GET method
const getCurrentUser = async (req, res) => {
    try {
        const email = req.email;
        const user = await UserServices.findUserByColumn({email}, "-password -otp -otpExpirationTime -isVerified -__v");
        if (!user) return res.json({success: false, message: "User not found!"});

        const currentUser = {
            email: user.email,
            name: user.name,
            _id: user._id,
            savedBlogs: user.savedBlogs,
            profileImage: user?.profileImage ? process.env.AWS_OBJECT_URL + user.profileImage : null
        }
        return ResponseObj(res, 200, currentUser);
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message});
    }
}


//creating new user
//POST method
const createNewUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const duplicate = await UserServices.findUserByColumn({email});

        if (duplicate)
            return res.json({
                success: false,
                message: `Duplicated email address!`,
            });

        const hashedPassword = hashSync(password, 10);

        const userObj = {name, email, password: hashedPassword};

        const user = await UserServices.createUser(userObj);

        if (!user)
            return res.json({
                success: false,
                message: "Error creating new user!",
            });
        return res.json({
            success: true,
            message: "Account has been created.",
        });
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

//change password
//PUT method
const changePassword = async (req, res) => {
    try {
        const {password, newPassword} = req.body;
        const email = req.email
        //find user by id in database
        const user = await UserServices.findUserByColumn({email}, "+password");

        if (!user)
            return res.json({success: false, message: "User not found!"});

        const isSamePassword = compareSync(newPassword, user.password);
        if (isSamePassword)
            return res.json({
                success: false,
                message:
                    "Your new password can't be the same with your current password!",
            });

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return res.json({
                success: false,
                message: "Password is incorrect!",
            });

        const hashedPassword = hashSync(newPassword, 10);
        const result = await UserServices.updateUser(user._id, {password: hashedPassword})

        return res.json({
            success: true,
            message: "Password changed successfully!",
        });
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

// change name
// PUT method
const changeName = async (req, res) => {
    try {
        const {id, name} = req.body;

        //find user by id in database
        const user = await UserServices.findUserByColumn({_id: id});
        if (!user)
            return res.json({success: false, message: "User not found!"});

        const result = await UserServices.updateUser(id, {name})

        if (!result) return res.json({success: false, message: "Error changing username!"});

        return res.json({
            success: true,
            message: "Your name has been changed successfully!",
        });
    } catch (error) {
        return res.json({success: false, error: error});
    }
}

// change email
// PUT method
const changeEmail = async (req, res) => {
    try {
        const {newEmail, password} = req.body;
        const email = req.email;

        // console.log(newEmail, password, email); return;

        //find user by id in database
        const user = await UserServices.findUserByColumn({email: email}, "+password");
        if (!user)
            return res.json({success: false, message: "User not found!"});

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect) return res.json({success: false, message: "Password is incorrect!"});

        const duplicateEmail = await UserServices.findUserByColumn({email: newEmail});

        if (duplicateEmail) return res.json({success: false, message: "Email already exists!"});

        const otp = generateOTP();
        const otpExpirationTime = Date.now() + 180000; // 3 minutes

        // sending OTP to user email
        const emailText = `<p><strong>Dear ${user.name}, </strong><br/><br/><br/> Thank you for using our blog app! <br/>Here is the OTP code, please use this One-Time Password (OTP) to verify your email address. <br/><br/> Your OTP is: <strong> ${otp} </strong> <br/><br/><br/> Best regards, <br/> PK-Blog Team. </p>`;
        const emailResult = await sendEmail(newEmail, "Verify your email address!", emailText)
        if (!emailResult) return res.json({success: false, message: "Error sending email!"});

        const result = await UserServices.updateUser(user._id, {otp, otpExpirationTime});

        if (!result) return res.json({success: false, message: "Error changing email!"});

        return res.json({
            success: true,
            message: "The OTP code has been sent to your new email address!",
        });
    } catch (error) {
        return res.json({success: false, error: error});
    }
}

//deleting user
//DELETE method
const deleteUser = async (req, res) => {
    try {
        const {password} = req.body;
        const email = req.email

        //find User in database
        const user = await UserServices.findUserByColumn({email}, "+password");

        if (!user)
            return res.json({success: false, message: "User not found!"});

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return res.json({
                success: false,
                message: "Password is incorrect!",
            });
        //deleting blogs before the account is deleted!
        const deleteBlogs = await Blog.deleteMany({userId: user?._id});
        const result = await user.deleteOne();
        return res.json({
            success: true,
            message: "Account deleted successfully!",
        });
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

//getting one user
//GET method
const getUserById = async (req, res) => {
    try {
        const {id} = req.params;
        if (!id)
            return ResponseObj(res, 400, {message: "User ID is required!"});

        //find user by id in database
        const user = await UserServices.findUserByColumn({_id: id});

        if (!user)
            return ResponseObj(res, 400, {message: "User not found!"});

        const userData = {
            name: user.name,
            _id: user._id,
            profileImage: user?.profileImage ? process.env.AWS_OBJECT_URL + user.profileImage : null
        }

        return ResponseObj(res, 200, userData);
    } catch (error) {
        return ResponseObj(res, 500, {message: error.message});
    }
};

//handle bookmarking blogs
//POST method
const setSavedBlog = async (req, res) => {
    try {
        const {blogId} = req.body;
        const email = req.email;

        if (!blogId)
            return ResponseObj(res, 400, {message: "Blog ID is required!"});

        const blog = await Blog.findById(blogId).lean().exec();

        if (!blog)
            return ResponseObj(res, 404, {message: "Blog not found!"});

        const user = await UserServices.findUserByColumn({email: email});

        if (!user)
            return ResponseObj(res, 404, {message: "User not found!"});

        const userId = user?._id
        //blog.reactions.push(userId);
        const blogAlreadySaved = user.savedBlogs?.find((bId) => bId === blogId);

        if (blogAlreadySaved) {
            const result = await User.updateOne(
                {_id: userId},
                {$pull: {savedBlogs: blogId}}
            );
            return ResponseObj(res, 200, {message: "Blog removed from bookmarks successfully!"})
        }

        const result = await User.updateOne(
            {_id: userId},
            {$push: {savedBlogs: blogId}}
        );
        return ResponseObj(res, 200, {message: "Blog saved successfully!"})
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

//get savedBlogs
//GET method
const getSavedBlogs = async (req, res) => {
    try {
        const email = req.email;
        const user = await UserServices.findUserByColumn({email});

        if (!user) return ResponseObj(res, 400, {message: "User not found!"});

        // finding all blogs user had saved
        const savedBlogsList = await Blog.find({
            _id: {$in: user.savedBlogs},
        }).sort({createdAt: -1}).lean();
        if (!savedBlogsList?.length) return ResponseObj(res, 200, []);
        const modBlogs = formatData(savedBlogsList);
        return ResponseObj(res, 200, modBlogs);
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}


//update profile
//PUT method
const changeProfilePicture = async (req, res) => {
    try {
        const {body, file} = req;
        const id = body?.id;
        const profileImage = file?.originalname || null;

        if (!id) return res.json({success: false, message: "User ID is required!"});

        //find user by id in database
        const user = await UserServices.findUserByColumn({_id: id});
        if (!user)
            return res.json({success: false, message: "User not found!"});

        if (user?.profileImage) {
            const deleteResult = await deleteImage(user?.profileImage);
            if (!deleteResult) return res.json({success: false, message: "Error deleting profile!"});
        }

        const result = await UserServices.updateUser(id, {profileImage});

        if (!result) return res.json({success: false, message: "Error updating profile!"});

        return res.json({
            success: true,
            message: "Your profile picture has been updated successfully!",
        });
    } catch (error) {
        return res.json({success: false, error: error});
    }
}

module.exports = {
    getCurrentUser,
    getAllUsers,
    createNewUser,
    changeName,
    changePassword,
    changeEmail,
    deleteUser,
    getUserById,
    setSavedBlog,
    getSavedBlogs,
    changeProfilePicture,
};
