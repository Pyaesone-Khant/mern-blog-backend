const jwt = require("jsonwebtoken");
const authToken = (req, res, next) => {
    const accessToken = req.header("Authorization");

    if (!accessToken)
        return res.status(401).json({
            success: false,
            message: "Access denied! Token not found!",
        });

    try {
        const token = accessToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN)
        req.email = decoded?.email;
        req.expTime = decoded?.expTime;
        next();
    } catch (error) {
        return res.json({
            success: false,
            message: "Invalid token!",
        });
    }
}

module.exports = authToken;