const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const studentRoutes =
    require("./routes/studentRoutes");

const courseRoutes =
    require("./routes/courseRoutes");

const enrollmentRoutes =
    require("./routes/enrollmentRoutes");

const gradeRoutes =
    require("./routes/gradeRoutes");

const authRoutes =
    require("./routes/authRoutes");

require("dotenv").config();

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// API ROUTES
// =====================================================

// Student Module
app.use(
    "/api/students",
    studentRoutes
);

// Course Module
app.use(
    "/api/courses",
    courseRoutes
);

// Enrollment Module
app.use(
    "/api/enrollments",
    enrollmentRoutes
);

// Grade Module
app.use(
    "/api/grades",
    gradeRoutes
);

// Authentication Module
app.use(
    "/api/auth",
    authRoutes
);


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            "       ACADEMIA MONOLITHIC DATABASE"
        );

        console.log(
            "=============================================="
        );

        console.log(
            "MongoDB connected successfully"
        );

        console.log(
            "Database:",
            mongoose.connection.name
        );

        console.log("");

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {

    res.json({

        message:
            "Academia Monolithic Server is running",

        architecture:
            "Monolithic Architecture",

        database:
            mongoose.connection.readyState === 1
                ? "Connected"
                : "Disconnected",

        modules: {

            students:
                "/api/students",

            courses:
                "/api/courses",

            enrollments:
                "/api/enrollments",

            grades:
                "/api/grades",

            authentication:
                "/api/auth"

        }

    });

});


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "=============================================="
        );

        console.log(
            "       ACADEMIA MONOLITHIC SERVER"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `Server → http://localhost:${PORT}`
        );

        console.log("----------------------------------------------");

        console.log(
            "Student Module    → /api/students"
        );

        console.log(
            "Course Module     → /api/courses"
        );

        console.log(
            "Enrollment Module → /api/enrollments"
        );

        console.log(
            "Grade Module      → /api/grades"
        );

        console.log(
            "Auth Module       → /api/auth"
        );

        console.log("----------------------------------------------");

        console.log(
            "Architecture → MONOLITHIC"
        );

        console.log(
            "All modules run inside ONE server"
        );

        console.log(
            "=============================================="
        );

    });