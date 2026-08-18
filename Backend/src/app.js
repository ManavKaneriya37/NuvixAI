const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

//import routes
const authRouter = require("./routes/auth.routes");
const chatRouter = require("./routes/chat.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.static(path.join(__dirname, "../public")));

//MongoDB connection
connectDB();

//Routes
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
