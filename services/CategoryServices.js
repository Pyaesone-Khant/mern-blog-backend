const Category = require("../models/Category");

class CategoryServices {
    async getAllCategory() {
        try {
            const categories = await Category.find().lean();
            return categories;
        } catch (error) {
            throw new Error(error)
        }
    }

    async createCategory(catData) {
        try {
            const category = await Category.create(catData);
            return category;
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateCategory(catId, catData) {
        try {
            const filter = { _id: catId };
            const updatedData = { $set: catData }
            const result = await Category.updateOne(filter, updatedData);
            return result?.matchedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteCategory(catId) {
        try {
            const result = await Category.deleteOne({ _id: catId })
            return result?.deletedCount > 0;
        } catch (error) {
            throw new Error(error)
        }
    }

    async findCategoryByColumn(column) {
        try {
            const categories = await Category.findOne(column).lean().exec();
            return categories;
        } catch (error) {
            throw new Error(error);
        }
    }

    async searchCategories(keyword) {
        try {
            const categories = await Category.find().lean().exec();
            const searchedCategories = categories.filter((category) => {
                return category.title.toLowerCase().includes(keyword.toLowerCase());
            });
            return searchedCategories;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new CategoryServices();