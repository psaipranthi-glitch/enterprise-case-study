const express = require("express");
const Grade = require("../models/Grade");

const router = express.Router();


// =====================================================
// CREATE GRADE
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            student,
            course,
            grade,
            marks
        } = req.body;

        const gradeRecord = new Grade({
            student,
            course,
            grade,
            marks
        });

        const savedGrade =
            await gradeRecord.save();

        res.status(201).json(savedGrade);

    } catch (error) {

        res.status(400).json({

            message:
                "Failed to create grade",

            error:
                error.message

        });

    }

});


// =====================================================
// GET ALL GRADES
// =====================================================

router.get("/", async (req, res) => {

    try {

        const grades =
            await Grade.find()
                .populate("student")
                .populate("course");

        res.json(grades);

    } catch (error) {

        res.status(500).json({

            message:
                "Failed to fetch grades",

            error:
                error.message

        });

    }

});


// =====================================================
// DELETE GRADE
// =====================================================

router.delete("/:id", async (req, res) => {

    try {

        await Grade.findByIdAndDelete(
            req.params.id
        );

        res.json({

            message:
                "Grade deleted successfully"

        });

    } catch (error) {

        res.status(500).json({

            message:
                error.message

        });

    }

});


module.exports = router;