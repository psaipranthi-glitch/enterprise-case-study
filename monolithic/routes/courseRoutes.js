const express = require("express");
const Course = require("../models/Course");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const course = new Course(req.body);
        const savedCourse = await course.save();

        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();

        res.json(courses);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);

        res.json({
            message: "Course deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;