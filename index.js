require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const cookieParser = require("cookie-parser");
const allowedOrigins = require("./config/allowedOrigins");
const PORT = process.env.PORT || 3500;
const app = express();

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
app.use("/users", require("./routes/usersRoutes"));
app.use("/blogs", require("./routes/blogsRoutes"));
app.use("/categories", require("./routes/categoryRoutes"));
app.use("/comments", require("./routes/commentRoutes"));
app.use(require("./routes/authRoutes"));

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
