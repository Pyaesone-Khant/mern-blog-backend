const Category = require("../models/Category");

//getting all categories
//GET method
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();

        if (!categories?.length)
            return res.json({
                success: false,
                message: "There is no categories for now!",
            });
        return res.json({ success: true, data: categories });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//creating new category
//POST method
const createNewCategory = async (req, res) => {
    try {
        const { title } = req.body;

        if (title.trim().length < 4)
            return res.json({
                success: false,
                message: "category title is too short!",
            });

        const duplicate = await Category.findOne({ title }).lean().exec();

        if (duplicate)
            return res.json({
                success: false,
                message: `Duplicated category!`,
            });

        const categoryObj = { title };

        const category = await Category.create(categoryObj);

        if (!category)
            return res.json({
                success: false,
                message: "Error creating new category!",
            });
        return res.json({
            success: true,
            message: "New category has been created.",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//updating category
//PUT method
const updateCategory = async (req, res) => {
    try {
        const { id, title } = req.body;

        if (!id)
            return res.json({
                success: false,
                message: "Category id is required to update category!",
            });

        if (title.trim().length < 5)
            return res.json({
                success: false,
                message: "Category title is too short!",
            });

        //find category by id in database
        const category = await Category.findById(id).exec();

        if (!category)
            return res.json({ success: false, message: "Category not found!" });

        //return res.json(category);

        category.title = title;
        const result = await category.save();
        return res.json({
            success: true,
            data: result,
            message: "Category has been updated successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//deleting category
//DELETE method
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id)
            return res.json({
                success: false,
                message: "Category id is required to delete category!",
            });

        //find category in database
        const category = await Category.findById(id).exec();

        if (!category)
            return res.json({ success: false, message: "Category not found!" });

        const result = await category.deleteOne();
        return res.json({
            success: true,
            message: "Category has been deleted successfully!",
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

//getting one category
//GET method
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.json({
                success: false,
                message: "Category id is required!",
            });

        //find category by id in database
        const category = await Category.findById(id).exec();
        if (!category)
            return res.json({ success: false, message: "Category not found!" });
        return res.json({ success: true, data: category });
    } catch (error) {
        return res.json({ success: false, error: error });
    }
};

module.exports = {
    getAllCategories,
    createNewCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
};
