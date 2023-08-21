const User = require("../models/User");
const { hashSync, compareSync } = require("bcrypt");
const {
    searchUserById,
    searchUserByEmail,
} = require("../services/UserServices");

//getting all users
//GET method
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").lean();

        if (!users?.length)
            return res.json({
                success: false,
                message: "There is no users for now!",
            });
        return res.json({ success: true, data: users });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//creating new user
//POST method
const createNewUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.json({
                success: false,
                message: "All fields are required!",
            });

        if (name.trim().length < 5)
            return res.json({
                success: false,
                message: "Name is too short!",
            });

        if (password.trim().length < 8)
            return res.json({
                success: false,
                message: "Password is too short!",
            });

        const duplicate = await searchUserByEmail(User, email);

        if (duplicate)
            return res.json({
                success: false,
                message: `Duplicated email address!`,
            });

        const hashedPassword = hashSync(password, 10);

        const userObj = { name, email, password: hashedPassword };

        const user = await User.create(userObj);

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
        return res.json({ success: false, error: error });
    }
};

//updating user
//PUT method
const updateUser = async (req, res) => {
    try {
        const { id, name, password, newPassword } = req.body;

        if (!id || !password || !name)
            return res.json({
                success: false,
                message:
                    "ID, name & current password are required to update user data!",
            });

        if (name.trim().length < 5)
            return res.json({
                success: false,
                message: "Name is too short!",
            });

        if (newPassword?.trim().length < 8)
            return res.json({
                success: false,
                message: "New password must have at least 8 characters!",
            });

        if (newPassword === password)
            return res.json({
                success: false,
                message:
                    "New password can't be the same with current password!",
            });

        //find user by id in database
        const user = await User.findById(id).select("+password").exec();

        if (!user)
            return res.json({ success: false, message: "User not found!" });

        //return res.json(user);

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return res.json({
                success: false,
                message: "Password is incorrect!",
            });

        user.name = name;
        user.password =
            newPassword?.trim().length >= 8
                ? hashSync(newPassword, 10)
                : user.password;
        const result = await user.save();
        return res.json({
            success: true,
            data: result,
            message: "Your account has been updated successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//deleting user
//DELETE method
const deleteUser = async (req, res) => {
    try {
        const { id, password } = req.body;

        if (!id)
            return res.json({
                success: false,
                message: "ID & password are required to deactivate account !",
            });

        //find User in database
        const user = await User.findById(id).select("+password").exec();

        if (!user)
            return res.json({ success: false, message: "User not found!" });

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return res.json({
                success: false,
                message: "Password is incorrect!",
            });

        const result = await user.deleteOne();
        return res.json({
            success: true,
            message: "Account deleted successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//getting one user
//GET method
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.json({ success: false, message: "ID is required!" });

        //find user by id in database
        const user = await searchUserById(User, id);

        if (!user)
            return res.json({ success: false, message: "User not found!" });

        return res.json({ success: true, data: user });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
    getUserById,
};
