const express = require("express")
const app = express();
const dotenv = require("dotenv").config();
const connectDB = require("./db/db");

//import routes
const authRouter = require("./routes/auth.routes");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//MongoDB connection
connectDB();

//Routes
app.use("/api/auth", authRouter);

module.exports = app;