const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Course = require("./Course");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("==============================================");
        console.log("       COURSE SERVICE - DATABASE CONNECTED");
        console.log("==============================================");
        console.log("Database:", mongoose.connection.name);
    })
    .catch((error) => {
        console.error(
            "Course Service MongoDB connection failed:",
            error.message
        );
    });


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message: "Course Service is running",
        service: "Course Service",
        port: 5002
    });

});


// =====================================================
// GET ALL COURSES
// =====================================================

app.get("/courses", async (req, res) => {

    try {

        const courses = await Course.find({})
            .sort({ createdAt: -1 })
            .lean();

        console.log(
            `COURSE GET → ${courses.length} courses`
        );

        res.status(200).json(courses);

    } catch (error) {

        console.error(
            "COURSE FETCH ERROR:",
            error.message
        );

        res.status(500).json({

            message: "Failed to fetch courses",

            error: error.message

        });

    }

});


// =====================================================
// GET SINGLE COURSE
// =====================================================

app.get("/courses/:id", async (req, res) => {

    try {

        const course = await Course.findById(
            req.params.id
        ).lean();

        if (!course) {

            return res.status(404).json({

                message: "Course not found"

            });

        }

        res.status(200).json(course);

    } catch (error) {

        res.status(400).json({

            message: "Invalid course ID",

            error: error.message

        });

    }

});


// =====================================================
// CREATE COURSE
// =====================================================

app.post("/courses", async (req, res) => {

    try {

        console.log(
            "COURSE CREATE REQUEST:",
            req.body
        );

        const course = await Course.create({

            name: req.body.name,

            code: req.body.code,

            credits: Number(req.body.credits)

        });

        console.log(
            "COURSE CREATED:",
            course._id
        );

        res.status(201).json(course);

    } catch (error) {

        console.error(
            "COURSE CREATE ERROR:",
            error.message
        );

        res.status(400).json({

            message: "Failed to create course",

            error: error.message

        });

    }

});


// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5002;

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("==============================================");
    console.log("          COURSE SERVICE RUNNING");
    console.log("==============================================");
    console.log(
        `Course Service → http://localhost:${PORT}`
    );
    console.log("");
    console.log("Routes:");
    console.log("GET  /courses");
    console.log("GET  /courses/:id");
    console.log("POST /courses");
    console.log("==============================================");
    console.log("");

});