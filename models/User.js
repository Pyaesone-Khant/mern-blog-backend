const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    savedBlogs: {
        type: Array,
        default: [],
    },
    otp : {
        type: String,
        default: null,
    },
    otpExpirationTime: {
        type : Date,
        default: Date.now() + 180000,
    },
    isVerified: {
        type : Boolean,
        default: false,
    },
    profileImage: {
        type: String,
        default: "",
    }
});

module.exports = mongoose.model("User", userSchema);
