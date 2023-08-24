const User = require("../models/User");
const { compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");

//authenticating user login
//POST method
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.json({
                success: false,
                message: "Email & password are required to login account!",
            });

        const errMessage = "Email or password is wrong!";

        const user = await User.findOne({ email })
            .select("+password")
            .lean()
            .exec();

        if (!user) return res.json({ success: false, message: errMessage });

        const isCorrect = compareSync(password, user.password);

        if (!isCorrect)
            return res.json({ success: false, message: errMessage });

        const token = jwt.sign({ email }, process.env.ACCESS_SECRET_TOKEN, {
            expiresIn: 60 * 60 * 24,
        });

        res.cookie("accessToken", token, { httpOnly: false });

        return res.json({
            success: true,
            user: user,
            token: token,
            message: "Login successful!",
        });
    } catch (error) {
        return res.json({ success: false, error });
    }
};

//authenticating user logout
//POST method
const userLogout = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.json({ success: false, message: "Failed to logout!" });

        return res.json({ success: true, message: "Logout successful!" });
    } catch (error) {
        return res.json({ success: false, error });
    }
};



module.exports = { userLogin, userLogout };
