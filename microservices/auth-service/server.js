const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const User = require("./User");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// MONGODB
// =====================================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("======================================");
        console.log("      AUTH SERVICE - MONGODB OK");
        console.log("======================================");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "Auth Service is running",
        service: "Authentication Service",
        port: 5005
    });
});


// =====================================================
// REGISTER TEACHER
// Supports:
// POST /register
// POST /auth/register
// =====================================================

const registerTeacher = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });

        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {

            return res.status(400).json({
                message: "Teacher already exists"
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({

            name,

            email: email.toLowerCase(),

            password: hashedPassword,

            role: "teacher"

        });

        res.status(201).json({

            message:
                "Teacher registered successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({

            message: "Registration failed",

            error: error.message

        });

    }

};


// Both routes work
app.post("/register", registerTeacher);

app.post("/auth/register", registerTeacher);


// =====================================================
// LOGIN TEACHER
// Supports:
// POST /login
// POST /auth/login
// =====================================================

const loginTeacher = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }

        const user = await User.findOne({

            email: email.toLowerCase()

        });

        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }

        if (user.role !== "teacher") {

            return res.status(403).json({

                message:
                    "Only teachers can access the Faculty Portal"

            });

        }

        const token = jwt.sign(

            {
                id: user._id,

                role: user.role,

                email: user.email

            },

            process.env.JWT_SECRET,

            {
                expiresIn: "2h"
            }

        );

        res.json({

            message: "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            message: "Login failed",

            error: error.message

        });

    }

};


// Both routes work
app.post("/login", loginTeacher);

app.post("/auth/login", loginTeacher);


// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5005;

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("======================================");
    console.log("        AUTH SERVICE RUNNING");
    console.log("======================================");
    console.log(`Auth Service → http://localhost:${PORT}`);
    console.log("--------------------------------------");
    console.log("POST /login");
    console.log("POST /auth/login");
    console.log("POST /register");
    console.log("POST /auth/register");
    console.log("======================================");
    console.log("");

});