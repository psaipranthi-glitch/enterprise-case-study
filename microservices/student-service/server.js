const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./Student");

const app = express();


// ================================
// Middleware
// ================================

app.use(cors());
app.use(express.json());


// ================================
// MongoDB Connection
// ================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Student Service: MongoDB connected");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });


// ================================
// Health Check
// ================================

app.get("/", (req, res) => {
    res.json({
        message: "Student Service is running"
    });
});


// ================================
// CREATE STUDENT
// ================================

app.post("/students", async (req, res) => {
    try {

        const { name, rollNumber, department, year } = req.body;

        // Basic validation
        if (!name || !rollNumber || !department || year === undefined || year === "") {
            return res.status(400).json({
                message: "Please provide name, roll number, department and year"
            });
        }

        const student = await Student.create({
            name: name.trim(),
            rollNumber: rollNumber.trim(),
            department: department.trim(),
            year: Number(year)
        });

        res.status(201).json(student);

    } catch (error) {

        console.error("Student creation error:", error.message);

        res.status(400).json({
            message: "Failed to create student",
            error: error.message
        });
    }
});


// ================================
// GET ALL STUDENTS
// ================================

app.get("/students", async (req, res) => {
    try {

        const students = await Student.find();

        res.status(200).json(students);

    } catch (error) {

        console.error("Student fetch error:", error.message);

        res.status(500).json({
            message: "Failed to fetch students",
            error: error.message
        });
    }
});


// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Student Service running on http://localhost:${PORT}`
    );
});