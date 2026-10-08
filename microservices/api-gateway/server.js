const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const createServiceProxy = (name, target) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,

        proxyTimeout: 30000,
        timeout: 30000,

        on: {
            proxyReq: (proxyReq, req) => {
                console.log(
                    `${name} REQUEST → ${req.method} ${req.originalUrl}`
                );
            },

            proxyRes: (proxyRes, req) => {
                console.log(
                    `${name} RESPONSE ← ${proxyRes.statusCode} ${req.originalUrl}`
                );
            },

            error: (err, req, res) => {
                console.error(
                    `${name} PROXY ERROR:`,
                    err.message
                );

                if (!res.headersSent) {
                    res.status(502).json({
                        message: `${name} unavailable`,
                        error: err.message
                    });
                }
            }
        }
    });
};

/* ==========================================
   AUTH SERVICE
   ========================================== */

app.post("/api/auth/login", async (req, res) => {
    try {
        console.log("AUTH LOGIN →", req.body.email);

        const response = await fetch(
            "http://127.0.0.1:5005/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();

        console.log(
            `AUTH LOGIN RESPONSE ← ${response.status}`
        );

        res.status(response.status).json(data);
    } catch (error) {
        console.error(
            "AUTH LOGIN ERROR:",
            error.message
        );

        res.status(502).json({
            message: "Auth Service unavailable",
            error: error.message
        });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        console.log("AUTH REGISTER →", req.body.email);

        const response = await fetch(
            "http://127.0.0.1:5005/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();

        console.log(
            `AUTH REGISTER RESPONSE ← ${response.status}`
        );

        res.status(response.status).json(data);
    } catch (error) {
        console.error(
            "AUTH REGISTER ERROR:",
            error.message
        );

        res.status(502).json({
            message: "Auth Service unavailable",
            error: error.message
        });
    }
});

/* ==========================================
   STUDENT SERVICE
   ========================================== */

app.use(
    "/api/students",
    createServiceProxy(
        "STUDENT",
        "http://127.0.0.1:5001"
    )
);

/* ==========================================
   COURSE SERVICE
   ========================================== */

app.use(
    "/api/courses",
    createServiceProxy(
        "COURSE",
        "http://127.0.0.1:5002"
    )
);

/* ==========================================
   ENROLLMENT SERVICE
   ========================================== */

app.use(
    "/api/enrollments",
    createServiceProxy(
        "ENROLLMENT",
        "http://127.0.0.1:5003"
    )
);

/* ==========================================
   GRADE SERVICE
   ========================================== */

app.use(
    "/api/grades",
    createServiceProxy(
        "GRADE",
        "http://127.0.0.1:5004"
    )
);

/* ==========================================
   GATEWAY HOME
   ========================================== */

app.get("/", (req, res) => {
    res.json({
        message: "API Gateway is running",

        services: {
            student: {
                service: "Student Service",
                port: 5001,
                route: "/api/students"
            },

            course: {
                service: "Course Service",
                port: 5002,
                route: "/api/courses"
            },

            enrollment: {
                service: "Enrollment Service",
                port: 5003,
                route: "/api/enrollments"
            },

            grade: {
                service: "Grade Service",
                port: 5004,
                route: "/api/grades"
            },

            auth: {
                service: "Auth Service",
                port: 5005,
                route: "/api/auth"
            }
        }
    });
});

/* ==========================================
   404
   ========================================== */

app.use((req, res) => {
    res.status(404).json({
        message: "Gateway route not found",
        method: req.method,
        path: req.originalUrl
    });
});

/* ==========================================
   START SERVER
   ========================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("==============================================");
    console.log("          API GATEWAY RUNNING");
    console.log("==============================================");
    console.log(`Gateway → http://localhost:${PORT}`);
    console.log("----------------------------------------------");
    console.log("Student Service    → http://localhost:5001");
    console.log("Course Service     → http://localhost:5002");
    console.log("Enrollment Service → http://localhost:5003");
    console.log("Grade Service      → http://localhost:5004");
    console.log("Auth Service       → http://localhost:5005");
    console.log("----------------------------------------------");
    console.log("Gateway Routes:");
    console.log("GET/POST  /api/students");
    console.log("GET/POST  /api/courses");
    console.log("GET/POST  /api/enrollments");
    console.log("GET/POST  /api/grades");
    console.log("POST      /api/auth/login");
    console.log("POST      /api/auth/register");
    console.log("==============================================");
    console.log("");
});