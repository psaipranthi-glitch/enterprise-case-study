const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        grade: {
            type: String,
            required: true,
            enum: ["A+", "A", "B+", "B", "C", "D", "F"]
        },

        marks: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Grade", gradeSchema);