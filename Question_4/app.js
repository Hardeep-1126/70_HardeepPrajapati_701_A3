const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Static files
app.use(express.static("public"));


// EJS
app.set("view engine", "ejs");


// Session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);


// MongoDB connection
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });


// Routes
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");

app.use("/", authRoutes);
app.use("/employees", employeeRoutes);


// Start server
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});