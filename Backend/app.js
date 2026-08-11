const express = require("express")
const app = express();
const dotenv = require("dotenv").config();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");

//import routes
const authRouter = require("./routes/auth.routes");
const chatRouter = require("./routes/chat.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//MongoDB connection
connectDB();

//Routes
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

module.exports = app;