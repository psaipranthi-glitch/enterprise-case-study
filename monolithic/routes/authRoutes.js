const express = require("express");
const User = require("../models/User");

const router = express.Router();


// =====================================================
// REGISTER FACULTY
// =====================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({

                message:
                    "User already exists"

            });

        }

        const user = new User({
            name,
            email,
            password
        });

        const savedUser =
            await user.save();

        res.status(201).json({

            message:
                "Faculty registered successfully",

            user: {

                _id:
                    savedUser._id,

                name:
                    savedUser.name,

                email:
                    savedUser.email

            }

        });

    } catch (error) {

        res.status(400).json({

            message:
                "Registration failed",

            error:
                error.message

        });

    }

});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user =
            await User.findOne({ email });

        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }

        if (user.password !== password) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }

        res.json({

            token:
                "monolithic-faculty-token",

            user: {

                _id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email

            }

        });

    } catch (error) {

        res.status(500).json({

            message:
                "Login failed",

            error:
                error.message

        });

    }

});


module.exports = router;