const jwt = require("jsonwebtoken");
const { ResponseObj } = require("../helpers/utils");

const authToken = (req, res, next) => {
    const accessToken = req.header("Authorization");

    if (!accessToken)
        return ResponseObj(res, 401, { success: false, message: "Access denied! Token not found." })

    try {
        const token = accessToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN)
        req.email = decoded?.email;
        req.expTime = decoded?.expTime;
        next();
    } catch (error) {
        return ResponseObj(res, 401, {
            success: false,
            message: "Invalid token!",
        });
    }
}

module.exports = authToken;