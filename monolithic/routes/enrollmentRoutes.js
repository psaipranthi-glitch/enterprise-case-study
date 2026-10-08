const express = require("express");
const Enrollment = require("../models/Enrollment");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { student, course } = req.body;

    const enrollment = new Enrollment({
      student,
      course
    });

    await enrollment.save();

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to enroll student",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student")
      .populate("course");

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch enrollments",
      error: error.message
    });
  }
});

module.exports = router;