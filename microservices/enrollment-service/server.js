const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Enrollment = require("./Enrollment");

const app = express();

app.use(cors());
app.use(express.json());


// ================================
// MongoDB Connection
// ================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Enrollment Service: MongoDB connected");
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
        message: "Enrollment Service is running"
    });
});


// ================================
// CREATE ENROLLMENT
// ================================

app.post("/enrollments", async (req, res) => {

    try {

        const enrollment = await Enrollment.create(req.body);

        res.status(201).json(enrollment);

    } catch (error) {

        console.error("Enrollment creation error:", error);

        res.status(400).json({
            message: "Failed to enroll student",
            error: error.message
        });

    }

});


// ================================
// GET ALL ENROLLMENTS
// ================================

app.get("/enrollments", async (req, res) => {

    try {

        const enrollments = await Enrollment
            .find()
            .populate("student")
            .populate("course");

        res.json(enrollments);

    } catch (error) {

        console.error("Enrollment fetch error:", error);

        res.status(500).json({
            message: "Failed to fetch enrollments",
            error: error.message
        });

    }

});


// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5003;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Enrollment Service running on http://localhost:${PORT}`
    );

});