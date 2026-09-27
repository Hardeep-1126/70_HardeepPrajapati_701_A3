const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const Admin = require("../models/Admin");


// Login page
router.get("/", (req, res) => {
    res.render("login");
});


// Login
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const admin = await Admin.findOne({
            email: email
        });

        if (!admin) {
            return res.send("Invalid email or password");
        }


        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );


        if (!passwordMatch) {
            return res.send("Invalid email or password");
        }


        req.session.adminId = admin._id;


        res.redirect("/employees/dashboard");

    } catch (error) {

        console.log(error);

        res.send("Login error");

    }
});


// Logout
router.get("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.send("Logout error");
        }

        res.redirect("/");

    });

});


module.exports = router;