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
const { Server } = require("socket.io");
const { addUser, socketUsers, getSocketUser } = require("./socket/socket");

const httpServer = require("http").createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_API,
    }
})

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    socket.on("join", (userId) => {
        if (!userId || userId === "" || userId === "{}") return;
        addUser(userId, socket.id);
        io.emit("getUsers", socketUsers)
    });

    socket.on("sendMessage", async (data) => {
        const { senderId, receiverId } = data;
        const [sender, receiver] = await Promise.all([
            getSocketUser(senderId),
            getSocketUser(receiverId)
        ]);
        if (receiver) {
            io.to(receiver.socketId).emit("getMessage", {
                ...data,
                sender,
                createdAt: new Date().toISOString(),
            });
        }
    })

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    })
})

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
app.use("/api/conversations", require("./routes/converstaionRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// static routes
app.use(
    "/uploads/blogImages",
    express.static(path.join(__dirname, "./uploads/blogImages"))
);
app.use(
    "/uploads/profileImages",
    express.static(path.join(__dirname, "./uploads/profileImages"))
);

app.use("*", (req, res) => {
    res.status(404).send("Error, Page Not Found!");
});

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB!");

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}!`);
    });
});

mongoose.connection.on("error", (err) => {
    console.log(err);
});
