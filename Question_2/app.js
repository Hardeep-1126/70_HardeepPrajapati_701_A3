const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fs = require("fs");

const app = express();


// EJS
app.set("view engine", "ejs");


// Read form data
app.use(express.urlencoded({ extended: true }));


// Session
app.use(
    session({
        store: new FileStore({
            path: "./sessions"
        }),

        secret: "mySecretKey",

        resave: false,

        saveUninitialized: false
    })
);


// Read users from JSON file
function getUsers() {

    const data = fs.readFileSync("users.json");

    return JSON.parse(data);

}


// Login page
app.get("/", function (req, res) {

    res.render("login", {
        error: ""
    });

});


// Login
app.post("/login", function (req, res) {

    const username = req.body.username;
    const password = req.body.password;


    const users = getUsers();


    const user = users.find(function (user) {

        return (
            user.username === username &&
            user.password === password
        );

    });


    if (user) {

        req.session.username = user.username;

        res.redirect("/home");

    }
    else {

        res.render("login", {
            error: "Invalid username or password"
        });

    }

});


// Middleware for protected routes
function checkLogin(req, res, next) {

    if (req.session.username) {

        next();

    }
    else {

        res.redirect("/");

    }

}


// Protected Route 1
app.get("/home", checkLogin, function (req, res) {

    res.render("home", {
        username: req.session.username
    });

});


// Protected Route 2
app.get("/profile", checkLogin, function (req, res) {

    res.render("profile", {
        username: req.session.username
    });

});


// Logout
app.get("/logout", function (req, res) {

    req.session.destroy(function (err) {

        if (err) {
            return res.send("Logout failed");
        }

        res.redirect("/");

    });

});


// Start server
app.listen(3000, function () {

    console.log("Server running at http://localhost:3000");

});