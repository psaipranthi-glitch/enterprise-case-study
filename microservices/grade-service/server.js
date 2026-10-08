const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Grade = require("./Grade");

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// MongoDB
// ========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Grade Service: MongoDB connected");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });


// ========================================
// Health Check
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Grade Service is running"
    });
});


// ========================================
// CREATE GRADE
// ========================================

app.post("/grades", async (req, res) => {

    try {

        const { student, course, grade, marks } = req.body;

        if (
            !student ||
            !course ||
            !grade ||
            marks === undefined
        ) {
            return res.status(400).json({
                message: "Student, course, grade and marks are required"
            });
        }

        const existingGrade = await Grade.findOne({
            student,
            course
        });

        if (existingGrade) {

            return res.status(400).json({
                message: "Grade already exists for this student and course"
            });

        }

        const newGrade = await Grade.create({
            student,
            course,
            grade,
            marks
        });

        res.status(201).json(newGrade);

    } catch (error) {

        console.error("Grade creation error:", error);

        res.status(400).json({
            message: "Failed to create grade",
            error: error.message
        });

    }

});


// ========================================
// GET ALL GRADES
// ========================================

app.get("/grades", async (req, res) => {

    try {

        const grades = await Grade.find();

        res.json(grades);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch grades",
            error: error.message
        });

    }

});


// ========================================
// GET GRADES BY STUDENT
// ========================================

app.get("/grades/student/:studentId", async (req, res) => {

    try {

        const grades = await Grade.find({
            student: req.params.studentId
        });

        res.json(grades);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch student grades",
            error: error.message
        });

    }

});


// ========================================
// UPDATE GRADE
// ========================================

app.put("/grades/:id", async (req, res) => {

    try {

        const grade = await Grade.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!grade) {

            return res.status(404).json({
                message: "Grade not found"
            });

        }

        res.json(grade);

    } catch (error) {

        res.status(400).json({
            message: "Failed to update grade",
            error: error.message
        });

    }

});


const PORT = process.env.PORT || 5004;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Grade Service running on http://localhost:${PORT}`
    );

});