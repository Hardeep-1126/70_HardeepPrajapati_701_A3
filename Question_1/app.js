const express = require("express");
const ejs = require("ejs");
const multer = require("multer");

const {
    body,
    validationResult
} = require("express-validator");

const app = express();


// EJS
app.set("view engine", "ejs");


// Read form data
app.use(express.urlencoded({ extended: true }));


// Show uploaded images
app.use("/uploads", express.static("uploads"));


// -------------------------
// Multer
// -------------------------

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});


// -------------------------
// GET FORM
// -------------------------

app.get("/", function (req, res) {

    res.render("form", {
        errors: [],
        oldData: {}
    });

});


// -------------------------
// POST FORM
// -------------------------

app.post(
    "/register",

    upload.fields([
        {
            name: "profilePic",
            maxCount: 1
        },
        {
            name: "otherPics",
            maxCount: 5
        }
    ]),

    [
        body("username")
            .notEmpty()
            .withMessage("Username is required"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),

        body("email")
            .isEmail()
            .withMessage("Enter valid email"),

        body("gender")
            .notEmpty()
            .withMessage("Select gender"),

        body("hobbies")
            .notEmpty()
            .withMessage("Select at least one hobby")
    ],

    function (req, res) {

        const errors = validationResult(req);

        // Password check
        if (req.body.password !== req.body.confirmPassword) {

            errors.errors.push({
                msg: "Passwords do not match"
            });

        }


        // Profile picture check
        if (
            !req.files ||
            !req.files.profilePic
        ) {

            errors.errors.push({
                msg: "Profile picture is required"
            });

        }


        // If errors
        if (!errors.isEmpty()) {

            return res.render("form", {

                errors: errors.array(),

                oldData: req.body

            });

        }


        // Profile picture
        const profilePic = req.files.profilePic[0];


        // Other pictures
        const otherPics = req.files.otherPics || [];


        // Show result
        res.render("result", {

            data: req.body,

            profilePic: profilePic,

            otherPics: otherPics

        });

    }
);


// -------------------------
// DOWNLOAD
// -------------------------

app.get("/download/:filename", function (req, res) {

    const file = "uploads/" + req.params.filename;

    res.download(file);

});


// -------------------------
// SERVER
// -------------------------

app.listen(3000, function () {

    console.log("Server started");
    console.log("Server running on http://localhost:3000");

});