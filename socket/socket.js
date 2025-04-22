const { transformImageUrl } = require("../helpers/utils");
const { UserServices } = require("../services");

const socketUsers = [];
const addUser = (userId, socketId) => {
    const user = socketUsers.find((user) => user.userId === userId);
    if (!user) {
        socketUsers.push({ userId, socketId });
    } else {
        user.socketId = socketId;
    }
}

const getSocketUser = async (userId) => {
    const user = socketUsers.find((user) => user.userId === userId);
    const userData = await UserServices.findUserByColumn({ _id: userId }, "-password -email -otp -otpExpirationTime -isVerified -__v -savedBlogs");
    return {
        ...user,
        ...userData,
        profileImage: transformImageUrl(userData.profileImage),
    }
}

module.exports = {
    socketUsers,
    addUser,
    getSocketUser
}