const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Category",
        },
        reactions: {
            type: Array,
            default: [],
        },
        blogImage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Blog", blogSchema);
