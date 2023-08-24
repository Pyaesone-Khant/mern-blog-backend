const searchUserById = async (User, id) => {
    const user = await User.findById(id).exec();
    return user;
};

const searchUserByEmail = async (User, email) => {
    const user = await User.findOne({ email }).lean().exec();
    return user;
};
module.exports = { searchUserByEmail, searchUserById };
