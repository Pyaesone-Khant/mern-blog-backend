const { default: mongoose } = require("mongoose");
const Blog = require("../models/Blog");
const User = require("../models/User");

//getting all Blogs
//GET method
const getAllBlogs = async (req, res) => {
    try {
        const ObjectId = mongoose.Types.ObjectId;
        const { page } = req.query || 1;
        const { size } = req.query || 3;
        const { cId } = req.query;
        const pageToSkip = parseInt(page) - 1;
        let blogs,
            totalBlogs = 0;

        if (ObjectId.isValid(cId)) {
            blogs = await Blog.find({
                categoryId: cId,
            })
                .sort({ createdAt: -1 })
                .skip(pageToSkip * parseInt(size))
                .limit(parseInt(size));
            const allBlogs = await Blog.find({ categoryId: cId }).lean();

            totalBlogs = allBlogs?.length;
        } else {
            blogs = await Blog.find()
                .sort({ createdAt: -1 })
                .skip(pageToSkip * parseInt(size))
                .limit(parseInt(size));
            const allBlogs = await Blog.find().lean();
            totalBlogs = allBlogs?.length;
        }

        if (!blogs?.length)
            return res.json({
                success: false,
                message: "There is no Blogs for now!",
            });

        return res.json({
            page,
            success: true,
            data: blogs,
            totalBlogs: totalBlogs,
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//creating new Blog
//POST method
const createNewBlog = async (req, res) => {
    try {
        const { title, description, userId, categoryId } = req.body;

        if (!title || !description || !userId || !categoryId)
            return res.json({
                success: false,
                message: "All fields are required!",
            });

        if (title.trim().length < 5)
            return res.json({
                success: false,
                message: "Blog title is too short!",
            });

        if (description.trim().length < 20)
            return res.json({
                success: false,
                message: "Blog article is too short!",
            });

        const duplicate = await Blog.findOne({ title }).lean().exec();

        if (duplicate)
            return res.json({ success: false, message: `Duplicated title!` });

        const blogObj = { title, description, userId, categoryId };

        const blog = await Blog.create(blogObj);

        if (!blog)
            return res.json({
                success: false,
                message: "Error creating new Blog!",
            });
        return res.json({
            success: true,
            message: "Blog has been created.",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//updating Blog
//PUT method
const updateBlog = async (req, res) => {
    try {
        const { id, title, description } = req.body;

        if (!id)
            return res.json({
                success: false,
                message: "ID is required to update Blog data!",
            });

        if (title.trim().length < 5)
            return res.json({
                success: false,
                message: "Blog title is too short!",
            });

        if (description.trim().length < 20)
            return res.json({
                success: false,
                message: "Blog article is too short!",
            });

        //find Blog by id in database
        const blog = await Blog.findById(id).exec();

        if (!blog)
            return res.json({ success: false, message: "Blog not found!" });

        //return res.json(Blog);

        blog.title = title;
        blog.description = description;
        const result = await blog.save();
        return res.json({
            success: true,
            data: result,
            message: "Blog has been updated successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//deleting Blog
//DELETE method
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id)
            return res.json({
                success: false,
                message: "ID is required to delete blog!",
            });

        //find Blog in database
        const blog = await Blog.findById(id).exec();

        if (!blog)
            return res.json({ success: false, message: "Blog not found!" });

        const result = await blog.deleteOne();
        return res.json({
            success: true,
            message: "Blog deleted successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//getting one Blog
//GET method
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.json({ success: false, message: "ID is required!" });

        //find Blog by id in database
        const blog = await Blog.findById(id).exec();
        if (!blog)
            return res.json({ success: false, message: "Blog not found!" });

        return res.json({ success: true, data: blog });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//set blog reactions
//POST method
const setBlogLikes = async (req, res) => {
    const { userId, blogId } = req.body;

    if (!userId || !blogId)
        return res.json({
            success: false,
            message: "User ID & Blog ID are required!",
        });

    const blog = await Blog.findById(blogId).lean().exec();

    if (!blog)
        return res.json({
            success: false,
            message: `Blog ID ${blogId} not found!`,
        });

    //blog.reactions.push(userId);
    const userAlreadyReacted = blog.reactions?.find((uId) => uId === userId);

    if (userAlreadyReacted) {
        const result = await Blog.updateOne(
            { _id: blogId },
            { $pull: { reactions: userId } }
        );
        return res.json({
            success: true,
            message: `User with ID ${userId} un-liked the post!`,
            data: result,
        });
    }

    const result = await Blog.updateOne(
        { _id: blogId },
        { $push: { reactions: userId } }
    );
    return res.json({
        success: true,
        message: `User with ID ${userId} liked the blog with ID ${blogId}!`,
        data: result,
    });
};

//getting user's blogs
//GET method

const getBlogsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId)
            return res.json({
                success: false,
                message: "User ID is required to get the blogs!",
            });

        const user = await User.findById(userId).lean().exec();

        if (!user)
            return res.status(404).json({
                success: false,
                message: "User not found!",
            });

        const blogs = await Blog.find().lean();
        const userBlogs = blogs?.filter((blog) => blog.userId == userId);

        if (!userBlogs?.length)
            return res.json({
                success: true,
                message: `User ${user.name} has no blogs!`,
            });

        return res.json({ success: true, data: userBlogs });
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    getAllBlogs,
    createNewBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    setBlogLikes,
    getBlogsByUserId,
};
