const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    code: {
        type: String,
        required: true,
        unique: true
    },

    credits: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Course", courseSchema);