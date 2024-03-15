const { transformImageUrl } = require("../helpers/utils");
const User = require("../models/User");

class UserServices {
    async getAllUser() {
        try {
            const users = await User.find().select("-password").lean();
            return users;
        } catch (error) {
            throw new Error(error)
        }
    }

    async createUser(userData) {
        try {
            const user = await User.create(userData);
            return user;
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateUser(userId, userData) {
        try {
            const filter = { _id: userId };
            const updatedData = { $set: userData }
            const result = await User.updateOne(filter, updatedData);
            return result?.matchedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteUser(userId) {
        try {
            const result = await User.deleteOne({ _id: userId })
            return result?.deletedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async findUserByColumn(column, select = "-password") {
        try {
            const user = await User.findOne(column).select(select).lean().exec();
            return user;
        } catch (error) {
            throw new Error(error);
        }
    }

    async searchUsers(keyword) {
        try {
            const users = await User.find().select("-password -otp -otpExpirationTime -isVerified -email").sort({ createdAt: -1 }).lean().exec();
            const searchedUsers = users?.filter((user) => {
                return user.name.toLowerCase().includes(keyword.toLowerCase());
            }).map(user => ({
                ...user, profileImage: user?.profileImage ? transformImageUrl(user?.profileImage) : null
            }))
            return searchedUsers;
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = new UserServices();
