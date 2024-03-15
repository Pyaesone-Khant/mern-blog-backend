const Blog = require("../models/Blog");

class BlogServices {
    async

    async getAllBlog() {
        try {
            const blogs = await Blog.find().sort({ createdAt: -1 }).lean().exec();
            return blogs;
        } catch (error) {
            throw new Error(error)
        }
    }

    async createBlog(blogData) {
        try {
            const blog = await Blog.create(blogData);
            return blog;
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateBlog(blogId, blogData) {
        try {
            const filter = { _id: blogId };
            const updatedData = { $set: blogData }
            const result = await Blog.updateOne(filter, updatedData);
            return result?.matchedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteBlog(blogId) {
        try {
            const result = await Blog.deleteOne({ _id: blogId })
            return result?.deletedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async findBlogByColumn(column) {
        try {
            const blogs = await Blog.find(column).sort({ createdAt: -1 }).lean().exec();
            return blogs;
        } catch (error) {
            throw new Error(error);
        }
    }

    async searchBlogs(keyword) {
        try {
            const blogs = await Blog.find().sort({ createdAt: -1 }).lean().exec();
            const searchedBlogs = blogs?.filter((blog) => {
                return blog.title.toLowerCase().includes(keyword.toLowerCase());
            });
            return searchedBlogs;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new BlogServices();