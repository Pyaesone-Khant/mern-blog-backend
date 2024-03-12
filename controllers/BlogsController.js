const {default: mongoose} = require("mongoose");
const Blog = require("../models/Blog");
const deleteImage = require("../middlewares/deleteImage");
const UserServices = require("../services/UserServices");
const BlogServices = require("../services/BlogServices");
const {formatData, ResponseObj} = require("../helpers/utils");


//getting all Blogs
//GET method
const getAllBlogs = async (req, res) => {
    try {
        const {page} = req.query || 1;
        const {size} = req.query || 3;
        const pageToSkip = parseInt(page) - 1;

        const blogs = await Blog.find()
            .sort({createdAt: -1})
            .skip(pageToSkip * parseInt(size))
            .limit(parseInt(size)).lean()

        const totalBlogs = await Blog.find().countDocuments();

        if (!blogs?.length) return ResponseObj(res, 200, []);
        const modBlogs = formatData(blogs)

        return ResponseObj(res, 200, {data: modBlogs, totalBlogs});

    } catch (error) {
        return res.json({success: false, error: error});
    }
};

//creating new Blog
//POST method
const createNewBlog = async (req, res) => {
    try {
        const {body, file} = req;
        const {title, description, userId, categoryId} = JSON.parse(body?.blogData);
        const blogImage = file?.originalname || null;

        if (!title || !description || !userId || !categoryId)
            return ResponseObj(res, 400, {message: "Title, Description, User ID & Category ID are required!"});

        const duplicate = await Blog.findOne({title}).lean().exec();

        if (duplicate)
            return ResponseObj(res, 400, {message: "Blog with this title already exists!"});

        const blogObj = {title, description, userId, categoryId, blogImage};

        const blog = await Blog.create(blogObj);

        if (!blog) return ResponseObj(res, 500, {message: "Error creating blog!"});
        return ResponseObj(res, 201, {success: true, message: "Blog has been created successfully!"});
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

//updating Blog
//PUT method
const updateBlog = async (req, res) => {
    try {
        const {body, file} = req;
        const {title, description, id} = JSON.parse(body?.blogData);
        const blogImage = file?.originalname || null;

        if (!id)
            return ResponseObj(res, 400, {message: "Blog ID is required!"});

        const blog = await Blog.findById(id).exec();

        if (!blog)
            return ResponseObj(res, 404, {message: "Blog not found!"});

        if (blogImage && blog?.blogImage) {
            const result = await deleteImage(blog?.blogImage);
            if (!result) return ResponseObj(res, 500, {message: "Error deleting image!"});
        }

        blog.title = title;
        blog.description = description;
        blog.blogImage = blogImage ? blogImage : blog?.blogImage;
        const result = await blog.save();

        if (!result) return ResponseObj(res, 500, {message: "Error updating blog!"});

        return ResponseObj(res, 200, {success: true, message: "Blog has been updated successfully!"});
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

//deleting Blog
//DELETE method
const deleteBlog = async (req, res) => {
    try {
        const {id} = req.body;

        if (!id)
            return ResponseObj(res, 400, {message: "Blog ID is required!"});

        //find Blog in database
        const blog = await Blog.findById(id).exec();

        if (!blog)
            return ResponseObj(res, 404, {message: "Blog not found!"});
        if (blog?.blogImage) {
            const result = await deleteImage("blogImages", blog?.blogImage);
            if (!result) return ResponseObj(res, 500, {message: "Error deleting image!"});
        }

        const result = await blog.deleteOne();

        if (!result) return ResponseObj(res, 500, {message: "Error deleting blog!"});

        return ResponseObj(res, 200, {success: true, message: "Blog has been deleted successfully!"});
    } catch (error) {
        return res.json({success: false, error: error});
    }
};

//getting one Blog
//GET method
const getBlogById = async (req, res) => {
    try {
        const {id} = req.params;
        if (!id)
            return ResponseObj(res, 400, {message: "Blog ID is required!"});

        //find Blog by id in database
        const blog = await Blog.findById(id).lean().exec();
        if (!blog)
            return ResponseObj(res, 404, {message: "Blog not found!"});
        const modBlog = {
            ...blog,
            blogImage: blog?.blogImage ? process.env.AWS_OBJECT_URL + blog?.blogImage : null,
        }
        return ResponseObj(res, 200, modBlog);
    } catch (error) {
        return ResponseObj(res, 500, error);
    }
};

//set blog reactions
//POST method
const setBlogLikes = async (req, res) => {
    const {blogId, userId} = req.body;

    if (!blogId)
        return ResponseObj(res, 400, {message: "Blog ID is required!"});

    const blog = await Blog.findById(blogId).lean().exec();

    if (!blog)
        return ResponseObj(res, 404, {message: "Blog not found!"});

    //blog.reactions.push(userId);
    const userAlreadyReacted = blog.reactions?.find((uId) => uId === userId);

    if (userAlreadyReacted) {
        const result = await Blog.updateOne(
            {_id: blogId},
            {$pull: {reactions: userId}}
        );

        if (result) return ResponseObj(res, 200, {
            message: `User with ID ${userId} un-liked the blog!`,
        })

    }

    const result = await Blog.updateOne(
        {_id: blogId},
        {$push: {reactions: userId}}
    );
    if (result) return ResponseObj(res, 200, {
        message: `User with ID ${userId} liked the blog!`,
    });
};

//getting user's blogs
//GET method

const getBlogsByUserId = async (req, res) => {
    try {
        const {userId} = req.params;
        if (!userId) return ResponseObj(res, 400, {message: "User ID is required!"});

        const user = await UserServices.findUserByColumn({_id: userId});

        if (!user) return ResponseObj(res, 404, {message: "User not found!"});

        const blogs = await BlogServices.findBlogByColumn({userId});
        if (!blogs?.length) return ResponseObj(res, 200, []);

        const modBlogs = formatData(blogs)

        return ResponseObj(res, 200, modBlogs);
    } catch (error) {
        throw new Error(error);
    }
};

// search blogs by title
// GET method
const getSearchBlogs = async (req, res) => {
    try {
        const q = req.query.q || null;

        if (!q) return ResponseObj(res, 400, {message: "Search query is required!"});

        const blogs = await BlogServices.searchBlogs(q);

        if (!blogs?.length) return ResponseObj(res, 200, [])

        const modBlogs = formatData(blogs);

        return ResponseObj(res, 200, modBlogs);
    } catch (error) {
        return ResponseObj(res, 500, error);
    }
}


// get auth recommended blogs
// GET method
const getRecommendedBlogs = async (req, res) => {
    try {
        const {categoryId} = req.params || null;
        if (!categoryId)
            return ResponseObj(res, 400, {message: "Category ID is required!"});

        const blogs = await Blog.find({categoryId}).sort(
            {createdAt: -1}
        ).lean();

        if (!blogs?.length) return ResponseObj(res, 200, [])

        const modBlogs = formatData(blogs)
        return ResponseObj(res, 200, modBlogs);

    } catch (error) {
        throw ResponseObj(res, 500, error);
    }
}

// get random recommended blogs
// GET method
const getRandomBlogs = async (req, res) => {
    try {
        const blogs = await Blog.aggregate([{$sample: {size: 4}}]);
        return ResponseObj(res, 200, blogs);
    } catch (error) {
        return ResponseObj(res, 500, error);
    }
}

module.exports = {
    getAllBlogs,
    createNewBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    setBlogLikes,
    getBlogsByUserId,
    getRecommendedBlogs,
    getRandomBlogs,
    getSearchBlogs
};
