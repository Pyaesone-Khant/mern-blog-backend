const Category = require("../models/Category");
const Blog = require("../models/Blog");
const { ResponseObj, formatData } = require("../helpers/utils");
const { UserServices } = require("../services");

//getting all categories
//GET method
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();
        if (!categories?.length) return ResponseObj(res, 200, []);
        return ResponseObj(res, 200, categories);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal server error!" });
    }
};

//creating new category
//POST method
const createNewCategory = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await UserServices.findUserByColumn({ _id: userId });

        if (user?.email !== process.env.ADMIN_EMAIL) return ResponseObj(res, 403, { message: "Unauthorized!" });

        const { title } = req.body;

        if (title.trim().length < 4)
            return ResponseObj(res, 400, { message: "Category title is too short!" });

        const duplicate = await Category.findOne({ title }).lean().exec();

        if (duplicate)
            return ResponseObj(res, 400, { message: "Category with this title already exists!" });

        const categoryObj = { title };

        const category = await Category.create(categoryObj);

        if (!category)
            return ResponseObj(res, 500, { message: "Error creating category!" });

        return ResponseObj(res, 201, { success: true, message: "Category has been created successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal server error!" });
    }
};

//updating category
//PUT method
const updateCategory = async (req, res) => {
    try {

        const userId = req.userId;
        const user = await UserServices.findUserByColumn({ _id: userId });

        if (user?.email !== process.env.ADMIN_EMAIL) return ResponseObj(res, 403, { message: "Unauthorized!" });

        const { id, title } = req.body;
        if (!id)
            return ResponseObj(res, 400, { message: "Category ID is required!" });

        if (title.trim().length < 5)
            return ResponseObj(res, 400, { message: "Category title is too short!" });

        //find category by id in database
        const category = await Category.findById(id).exec();

        if (!category)
            return ResponseObj(res, 404, { message: "Category not found!" });

        category.title = title;
        const result = await category.save();
        return ResponseObj(res, 200, { success: true, message: "Category has been updated successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal server error!" });
    }
};

//deleting category
//DELETE method
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id)
            return ResponseObj(res, 400, { message: "Category ID is required!" });

        //find category in database
        const category = await Category.findById(id).exec();

        if (!category) return ResponseObj(res, 404, { message: "Category not found!" });

        const result = await category.deleteOne();
        return ResponseObj(res, 200, { success: true, message: "Category has been deleted successfully!" });
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal server error!" })
    }
};

//getting one category
//GET method
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return ResponseObj(res, 400, { message: "Category ID is required!" });
        //find category by id in database
        const category = await Category.findById(id).exec();
        if (!category)
            return ResponseObj(res, 404, { message: "Category not found!" });
        return ResponseObj(res, 200, category);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal server error!" });
    }
};

// get blogs by category
const getBlogsByCategory = async (req, res) => {
    try {
        const { id: categoryId } = req.params;
        if (!categoryId)
            return ResponseObj(res, 400, { message: "Category ID is required!" });

        const blogs = await Blog.find({ categoryId }).sort({ createdAt: -1 }).lean().exec();

        if (!blogs?.length)
            return ResponseObj(res, 200, []);

        const modBlogs = formatData(blogs)

        return ResponseObj(res, 200, modBlogs);
    } catch (error) {
        return ResponseObj(res, 500, { message: error?.message || "Internal server error!" });
    }

}

module.exports = {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getBlogsByCategory
};
