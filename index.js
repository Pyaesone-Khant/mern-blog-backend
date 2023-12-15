require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3500;
const app = express();
const path = require("path");
const multerS3 = require("multer-s3")
const AWS = require("aws-sdk")


//connecting MongoDB
connectDB();


//middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/blogs", require("./routes/blogsRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));


// static routes
app.use("/uploads/blogImages", express.static(path.join(__dirname, "./uploads/blogImages")));
app.use("/uploads/profileImages", express.static(path.join(__dirname, "./uploads/profileImages")));


app.use("*", (req, res) => {
    res.status(404).send("Error, Page Not Found!");
});

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB!");

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}!`);
    });
});

mongoose.connection.on("error", (err) => {
    console.log(err);
});
