const express = require("express");
const session = require("express-session");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// --------------------
// Basic Configuration
// --------------------
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// --------------------
// Redis Connection
// --------------------
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
    console.log("Redis Error:", err);
});

async function startServer() {

    await redisClient.connect();

    console.log("Redis connected successfully");

    // --------------------
    // Session Configuration
    // --------------------
    app.use(
        session({
            store: new RedisStore({
                client: redisClient,
                prefix: "myapp:"
            }),

            secret: process.env.SESSION_SECRET,

            resave: false,

            saveUninitialized: false,

            cookie: {
                maxAge: 1000 * 60 * 30
            }
        })
    );

    // --------------------
    // Home Route
    // --------------------
    app.get("/", (req, res) => {

        if (req.session.user) {
            return res.redirect("/dashboard");
        }

        res.redirect("/login");
    });

    // --------------------
    // Login Page
    // --------------------
    app.get("/login", (req, res) => {

        res.render("login", {
            error: null
        });
    });

    // --------------------
    // Login Process
    // --------------------
    app.post("/login", (req, res) => {

        const { username, password } = req.body;

        const validUsername = process.env.ADMIN_USERNAME;
        const validPassword = process.env.ADMIN_PASSWORD;

        if (
            username === validUsername &&
            password === validPassword
        ) {

            // Create session
            req.session.user = {
                username: username
            };

            return res.redirect("/dashboard");
        }

        res.render("login", {
            error: "Invalid username or password"
        });
    });

    // --------------------
    // Authentication Middleware
    // --------------------
    function isAuthenticated(req, res, next) {

        if (req.session.user) {
            next();
        } else {
            res.redirect("/login");
        }
    }

    // --------------------
    // Protected Route 1
    // --------------------
    app.get("/dashboard", isAuthenticated, (req, res) => {

        res.render("dashboard", {
            username: req.session.user.username
        });
    });

    // --------------------
    // Protected Route 2
    // --------------------
    app.get("/profile", isAuthenticated, (req, res) => {

        res.render("profile", {
            username: req.session.user.username
        });
    });

    // --------------------
    // Logout
    // --------------------
    app.get("/logout", (req, res) => {

        req.session.destroy((err) => {

            if (err) {
                return res.send("Unable to logout");
            }

            res.redirect("/login");
        });
    });

    // --------------------
    // Start Server
    // --------------------
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer();