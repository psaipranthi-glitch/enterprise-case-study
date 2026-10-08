import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

/* =========================================================
   PAGE TITLES
========================================================= */

const pageTitles = {
    dashboard: "Academic Command Center",
    students: "Student Directory",
    "create-student": "Create Student",
    courses: "Course Catalog",
    "create-course": "Create Course",
    enrollments: "Enrollment Records",
    "create-enrollment": "Enroll Student",
    grades: "Grade Records",
    "create-grade": "Add Grade"
};

/* =========================================================
   APP
========================================================= */

function App() {

    /* =====================================================
       AUTH
    ===================================================== */

    const [token, setToken] = useState(
        localStorage.getItem("facultyToken")
    );

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("facultyUser");
        return saved ? JSON.parse(saved) : null;
    });

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const [activePage, setActivePage] = useState("dashboard");
    const [openMenu, setOpenMenu] = useState(null);

    /* =====================================================
       DATA
    ===================================================== */

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [grades, setGrades] = useState([]);

    const [loading, setLoading] = useState(false);

    /* =====================================================
       FORM STATE
    ===================================================== */

    const [studentForm, setStudentForm] = useState({
        name: "",
        rollNumber: "",
        department: "",
        year: ""
    });

    const [courseForm, setCourseForm] = useState({
        name: "",
        code: "",
        credits: ""
    });

    const [enrollmentForm, setEnrollmentForm] = useState({
        student: "",
        course: ""
    });

    const [gradeForm, setGradeForm] = useState({
        student: "",
        course: "",
        grade: "",
        marks: ""
    });

    /* =====================================================
       LOAD DATA
    ===================================================== */

    const loadData = async () => {

        setLoading(true);

        try {

            const results = await Promise.allSettled([
                axios.get(`${API}/students`),
                axios.get(`${API}/courses`),
                axios.get(`${API}/enrollments`),
                axios.get(`${API}/grades`)
            ]);

            const [
                studentsRes,
                coursesRes,
                enrollmentsRes,
                gradesRes
            ] = results;

            if (studentsRes.status === "fulfilled") {
                setStudents(
                    Array.isArray(studentsRes.value.data)
                        ? studentsRes.value.data
                        : []
                );
            }

            if (coursesRes.status === "fulfilled") {
                setCourses(
                    Array.isArray(coursesRes.value.data)
                        ? coursesRes.value.data
                        : []
                );
            }

            if (enrollmentsRes.status === "fulfilled") {
                setEnrollments(
                    Array.isArray(enrollmentsRes.value.data)
                        ? enrollmentsRes.value.data
                        : []
                );
            }

            if (gradesRes.status === "fulfilled") {
                setGrades(
                    Array.isArray(gradesRes.value.data)
                        ? gradesRes.value.data
                        : []
                );
            }

            results.forEach((result, index) => {

                if (result.status === "rejected") {

                    const names = [
                        "Student",
                        "Course",
                        "Enrollment",
                        "Grade"
                    ];

                    console.error(
                        `${names[index]} service:`,
                        result.reason
                    );
                }
            });

        } catch (error) {

            console.error(
                "Dashboard data error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        if (token) {
            loadData();
        }

    }, [token]);

    /* =====================================================
       LOGIN
    ===================================================== */

    const handleLogin = async (e) => {

        e.preventDefault();

        setLoginError("");
        setLoginLoading(true);

        try {

            const response = await axios.post(
                `${API}/auth/login`,
                {
                    email,
                    password
                }
            );

            const receivedToken =
                response.data.token;

            const receivedUser =
                response.data.user;

            localStorage.setItem(
                "facultyToken",
                receivedToken
            );

            localStorage.setItem(
                "facultyUser",
                JSON.stringify(receivedUser)
            );

            setToken(receivedToken);
            setUser(receivedUser);

            setEmail("");
            setPassword("");

        } catch (error) {

            setLoginError(
                error.response?.data?.message ||
                "Invalid email or password"
            );

        } finally {

            setLoginLoading(false);

        }
    };

    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem("facultyToken");
        localStorage.removeItem("facultyUser");

        setToken(null);
        setUser(null);

        setStudents([]);
        setCourses([]);
        setEnrollments([]);
        setGrades([]);

        setActivePage("dashboard");
        setOpenMenu(null);
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const navigate = (page) => {

        setActivePage(page);
        setOpenMenu(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const toggleMenu = (menu) => {

        setOpenMenu(
            openMenu === menu
                ? null
                : menu
        );
    };

    /* =====================================================
       CREATE STUDENT
    ===================================================== */

    const createStudent = async (e) => {

        e.preventDefault();

        try {

            await axios.post(
                `${API}/students`,
                {
                    name: studentForm.name.trim(),
                    rollNumber:
                        studentForm.rollNumber.trim(),
                    department:
                        studentForm.department.trim(),
                    year: Number(studentForm.year)
                }
            );

            setStudentForm({
                name: "",
                rollNumber: "",
                department: "",
                year: ""
            });

            await loadData();

            navigate("students");

            alert(
                "Student created successfully."
            );

        } catch (error) {

            alert(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to create student"
            );
        }
    };

    /* =====================================================
       CREATE COURSE
    ===================================================== */

    const createCourse = async (e) => {

        e.preventDefault();

        try {

            await axios.post(
                `${API}/courses`,
                {
                    name: courseForm.name.trim(),
                    code: courseForm.code.trim(),
                    credits: Number(courseForm.credits)
                }
            );

            setCourseForm({
                name: "",
                code: "",
                credits: ""
            });

            await loadData();

            navigate("courses");

            alert(
                "Course created successfully."
            );

        } catch (error) {

            alert(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to create course"
            );
        }
    };

    /* =====================================================
       CREATE ENROLLMENT
    ===================================================== */

    const createEnrollment = async (e) => {

        e.preventDefault();

        try {

            await axios.post(
                `${API}/enrollments`,
                enrollmentForm
            );

            setEnrollmentForm({
                student: "",
                course: ""
            });

            await loadData();

            navigate("enrollments");

            alert(
                "Student enrolled successfully."
            );

        } catch (error) {

            alert(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to enroll student"
            );
        }
    };

    /* =====================================================
       CREATE GRADE
    ===================================================== */

    const createGrade = async (e) => {

        e.preventDefault();

        if (
            !gradeForm.student ||
            !gradeForm.course ||
            !gradeForm.grade ||
            gradeForm.marks === ""
        ) {

            alert(
                "Please complete all grade fields."
            );

            return;
        }

        try {

            await axios.post(
                `${API}/grades`,
                {
                    student: gradeForm.student,
                    course: gradeForm.course,
                    grade: gradeForm.grade,
                    marks: Number(gradeForm.marks)
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setGradeForm({
                student: "",
                course: "",
                grade: "",
                marks: ""
            });

            await loadData();

            navigate("grades");

            alert(
                "Grade added successfully."
            );

        } catch (error) {

            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to add grade"
            );
        }
    };

    /* =====================================================
       HELPERS
    ===================================================== */

    const getStudent = (id) => {

        return students.find(
            (student) =>
                String(student._id) ===
                String(id)
        );
    };

    const getCourse = (id) => {

        return courses.find(
            (course) =>
                String(course._id) ===
                String(id)
        );
    };

    const getGradeClass = (grade) => {

        if (
            grade === "A+" ||
            grade === "A"
        ) {
            return "grade-excellent";
        }

        if (
            grade === "B+" ||
            grade === "B"
        ) {
            return "grade-good";
        }

        if (
            grade === "C+" ||
            grade === "C"
        ) {
            return "grade-average";
        }

        return "grade-low";
    };

    /* =====================================================
       LOGIN PAGE
    ===================================================== */

    if (!token) {

        return (
            <div className="login-page">

                <div className="login-orb orb-one" />
                <div className="login-orb orb-two" />
                <div className="login-orb orb-three" />

                <div className="login-grid" />

                <div className="login-card">

                    <div className="login-brand">

                        <div className="login-logo">
                            A
                        </div>

                        <div>
                            <h1>
                                ACADEMIA
                            </h1>

                            <span>
                                FACULTY ACADEMIC SYSTEM
                            </span>
                        </div>

                    </div>

                    <div className="login-divider" />

                    <div className="login-heading">

                        <span>
                            FACULTY PORTAL
                        </span>

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to access the
                            academic command center.
                        </p>

                    </div>

                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >

                        <div className="field">

                            <label>
                                FACULTY EMAIL
                            </label>

                            <input
                                type="email"
                                placeholder="teacher@academia.edu"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        <div className="field">

                            <label>
                                PASSWORD
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        {loginError && (
                            <div className="login-error">
                                {loginError}
                            </div>
                        )}

                        <button
                            className="login-button"
                            type="submit"
                            disabled={loginLoading}
                        >
                            {loginLoading
                                ? "AUTHENTICATING..."
                                : "ENTER FACULTY PORTAL →"}
                        </button>

                    </form>

                    <div className="login-security">

                        <span className="online-dot" />

                        SECURE FACULTY ACCESS

                    </div>

                    <div className="login-footer">
                        ACADEMIA · MICROSERVICES ARCHITECTURE
                    </div>

                </div>

            </div>
        );
    }

    /* =====================================================
       SIDEBAR
    ===================================================== */

    const Sidebar = () => (

        <aside className="sidebar">

            <div className="brand">

                <div className="brand-mark">
                    A
                </div>

                <div className="brand-text">

                    <strong>
                        ACADEMIA
                    </strong>

                    <span>
                        FACULTY ACADEMIC SYSTEM
                    </span>

                </div>

            </div>

            <div className="sidebar-line" />

            <div className="sidebar-label">
                COMMAND CENTER
            </div>

            <nav className="sidebar-nav">

                <button
                    className={
                        activePage === "dashboard"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() =>
                        navigate("dashboard")
                    }
                >

                    <span className="nav-icon">
                        ◈
                    </span>

                    <span>
                        Dashboard
                    </span>

                </button>

                {/* STUDENTS */}

                <div
                    className={
                        openMenu === "students"
                            ? "nav-group open"
                            : "nav-group"
                    }
                    onMouseEnter={() =>
                        setOpenMenu("students")
                    }
                    onMouseLeave={() =>
                        setOpenMenu(null)
                    }
                >

                    <button
                        className={
                            activePage.includes(
                                "student"
                            )
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            toggleMenu("students")
                        }
                    >

                        <span className="nav-icon">
                            ST
                        </span>

                        <span>
                            Students
                        </span>

                        <span className="nav-arrow">
                            →
                        </span>

                    </button>

                    <div className="submenu">

                        <button
                            onClick={() =>
                                navigate(
                                    "students"
                                )
                            }
                        >
                            Student Directory
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "create-student"
                                )
                            }
                        >
                            + Create Student
                        </button>

                    </div>

                </div>

                {/* COURSES */}

                <div
                    className={
                        openMenu === "courses"
                            ? "nav-group open"
                            : "nav-group"
                    }
                    onMouseEnter={() =>
                        setOpenMenu("courses")
                    }
                    onMouseLeave={() =>
                        setOpenMenu(null)
                    }
                >

                    <button
                        className={
                            activePage.includes(
                                "course"
                            )
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            toggleMenu("courses")
                        }
                    >

                        <span className="nav-icon">
                            CR
                        </span>

                        <span>
                            Courses
                        </span>

                        <span className="nav-arrow">
                            →
                        </span>

                    </button>

                    <div className="submenu">

                        <button
                            onClick={() =>
                                navigate(
                                    "courses"
                                )
                            }
                        >
                            Course Catalog
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "create-course"
                                )
                            }
                        >
                            + Create Course
                        </button>

                    </div>

                </div>

                {/* ENROLLMENTS */}

                <div
                    className={
                        openMenu === "enrollments"
                            ? "nav-group open"
                            : "nav-group"
                    }
                    onMouseEnter={() =>
                        setOpenMenu("enrollments")
                    }
                    onMouseLeave={() =>
                        setOpenMenu(null)
                    }
                >

                    <button
                        className={
                            activePage.includes(
                                "enrollment"
                            )
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            toggleMenu(
                                "enrollments"
                            )
                        }
                    >

                        <span className="nav-icon">
                            EN
                        </span>

                        <span>
                            Enrollments
                        </span>

                        <span className="nav-arrow">
                            →
                        </span>

                    </button>

                    <div className="submenu">

                        <button
                            onClick={() =>
                                navigate(
                                    "enrollments"
                                )
                            }
                        >
                            Enrollment Records
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "create-enrollment"
                                )
                            }
                        >
                            + Enroll Student
                        </button>

                    </div>

                </div>

                {/* GRADES */}

                <div
                    className={
                        openMenu === "grades"
                            ? "nav-group open"
                            : "nav-group"
                    }
                    onMouseEnter={() =>
                        setOpenMenu("grades")
                    }
                    onMouseLeave={() =>
                        setOpenMenu(null)
                    }
                >

                    <button
                        className={
                            activePage.includes(
                                "grade"
                            )
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            toggleMenu("grades")
                        }
                    >

                        <span className="nav-icon">
                            GR
                        </span>

                        <span>
                            Grades
                        </span>

                        <span className="nav-arrow">
                            →
                        </span>

                    </button>

                    <div className="submenu">

                        <button
                            onClick={() =>
                                navigate(
                                    "grades"
                                )
                            }
                        >
                            Grade Records
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "create-grade"
                                )
                            }
                        >
                            + Add Grade
                        </button>

                    </div>

                </div>

            </nav>

            <div className="sidebar-bottom">

                <div className="faculty-card">

                    <div className="faculty-avatar">

                        {(
                            user?.name ||
                            "T"
                        ).charAt(0)}

                    </div>

                    <div>

                        <strong>
                            {user?.name ||
                                "Teacher"}
                        </strong>

                        <span>
                            Faculty Administrator
                        </span>

                    </div>

                </div>

                <div className="system-status">

                    <span className="online-dot" />

                    SYSTEM ONLINE

                </div>

            </div>

        </aside>
    );

    /* =====================================================
       TOP BAR
    ===================================================== */

    const TopBar = () => (

        <header className="topbar">

            <div>

                <span className="eyebrow">
                    FACULTY ACADEMIC SYSTEM
                </span>

                <h1>
                    {pageTitles[activePage]}
                </h1>

            </div>

            <div className="top-actions">

                <button
                    className="refresh-button"
                    onClick={loadData}
                    disabled={loading}
                >

                    <span
                        className={
                            loading
                                ? "refresh-spin"
                                : ""
                        }
                    >
                        ↻
                    </span>

                    <span>
                        {loading
                            ? "Refreshing..."
                            : "Refresh Data"}
                    </span>

                </button>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </header>
    );

    /* =====================================================
       DASHBOARD STATS
    ===================================================== */

    const Stats = () => (

        <section className="stats-grid">

            <div
                className="stat-card"
                onClick={() =>
                    navigate("students")
                }
            >

                <div className="stat-number">
                    01
                </div>

                <div className="stat-content">

                    <span>
                        STUDENT DIRECTORY
                    </span>

                    <strong>
                        {students.length}
                    </strong>

                    <small>
                        Registered students
                    </small>

                </div>

                <div className="stat-arrow">
                    →
                </div>

            </div>

            <div
                className="stat-card"
                onClick={() =>
                    navigate("courses")
                }
            >

                <div className="stat-number">
                    02
                </div>

                <div className="stat-content">

                    <span>
                        ACADEMIC CATALOG
                    </span>

                    <strong>
                        {courses.length}
                    </strong>

                    <small>
                        Available courses
                    </small>

                </div>

                <div className="stat-arrow">
                    →
                </div>

            </div>

            <div
                className="stat-card"
                onClick={() =>
                    navigate("enrollments")
                }
            >

                <div className="stat-number">
                    03
                </div>

                <div className="stat-content">

                    <span>
                        COURSE REGISTRATION
                    </span>

                    <strong>
                        {enrollments.length}
                    </strong>

                    <small>
                        Active enrollments
                    </small>

                </div>

                <div className="stat-arrow">
                    →
                </div>

            </div>

            <div
                className="stat-card"
                onClick={() =>
                    navigate("grades")
                }
            >

                <div className="stat-number">
                    04
                </div>

                <div className="stat-content">

                    <span>
                        ACADEMIC PERFORMANCE
                    </span>

                    <strong>
                        {grades.length}
                    </strong>

                    <small>
                        Grade records
                    </small>

                </div>

                <div className="stat-arrow">
                    →
                </div>

            </div>

        </section>
    );

    /* =====================================================
       PRINCIPLES
    ===================================================== */

    const Principles = () => (

        <section className="principles-section">

            <div className="section-heading">

                <span>
                    ACADEMIA PRINCIPLES
                </span>

                <h2>
                    The standards behind
                    academic excellence.
                </h2>

            </div>

            <div className="principles-grid">

                <div className="principle-card">
                    <span>01</span>
                    <h3>Excellence</h3>
                    <p>
                        Empowering every learner
                        through continuous
                        academic excellence.
                    </p>
                </div>

                <div className="principle-card">
                    <span>02</span>
                    <h3>Integrity</h3>
                    <p>
                        Maintaining transparency
                        and integrity in academic
                        assessment.
                    </p>
                </div>

                <div className="principle-card">
                    <span>03</span>
                    <h3>Innovation</h3>
                    <p>
                        Building modern education
                        through technology and
                        innovation.
                    </p>
                </div>

                <div className="principle-card">
                    <span>04</span>
                    <h3>Leadership</h3>
                    <p>
                        Developing responsible
                        leaders for the next
                        generation.
                    </p>
                </div>

            </div>

        </section>
    );

    /* =====================================================
       QUICK ACTIONS
    ===================================================== */

    const QuickActions = () => (

        <section className="quick-section">

            <div className="section-heading">

                <span>
                    FACULTY OPERATIONS
                </span>

                <h2>
                    Quick Actions
                </h2>

            </div>

            <div className="quick-grid">

                <div
                    className="quick-card"
                    onClick={() =>
                        navigate(
                            "create-student"
                        )
                    }
                >

                    <div className="quick-icon">
                        +
                    </div>

                    <div>
                        <h3>
                            Create Student
                        </h3>

                        <p>
                            Register a new student
                        </p>
                    </div>

                    <span>
                        →
                    </span>

                </div>

                <div
                    className="quick-card"
                    onClick={() =>
                        navigate(
                            "create-course"
                        )
                    }
                >

                    <div className="quick-icon">
                        +
                    </div>

                    <div>
                        <h3>
                            Create Course
                        </h3>

                        <p>
                            Add an academic course
                        </p>
                    </div>

                    <span>
                        →
                    </span>

                </div>

                <div
                    className="quick-card"
                    onClick={() =>
                        navigate(
                            "create-enrollment"
                        )
                    }
                >

                    <div className="quick-icon">
                        +
                    </div>

                    <div>
                        <h3>
                            Enroll Student
                        </h3>

                        <p>
                            Register student for course
                        </p>
                    </div>

                    <span>
                        →
                    </span>

                </div>

                <div
                    className="quick-card"
                    onClick={() =>
                        navigate(
                            "create-grade"
                        )
                    }
                >

                    <div className="quick-icon">
                        +
                    </div>

                    <div>
                        <h3>
                            Add Grade
                        </h3>

                        <p>
                            Record academic assessment
                        </p>
                    </div>

                    <span>
                        →
                    </span>

                </div>

            </div>

        </section>
    );

    /* =====================================================
       DASHBOARD
    ===================================================== */

    const DashboardPage = () => (

        <>

            <div className="welcome">

                <span>
                    WELCOME, FACULTY
                </span>

                <h2>
                    Welcome,{" "}
                    {user?.name || "Teacher"}
                </h2>

                <p>
                    Manage students, courses,
                    enrollments and academic
                    performance from one
                    centralized faculty workspace.
                </p>

            </div>

            <Stats />

            <Principles />

            <QuickActions />

        </>
    );

    /* =====================================================
       STUDENTS
    ===================================================== */

    const StudentsPage = () => (

        <section className="content-card">

            <div className="content-header">

                <div>

                    <span>
                        STUDENT MANAGEMENT
                    </span>

                    <h2>
                        Student Directory
                    </h2>

                    <p>
                        Registered students and
                        academic profiles.
                    </p>

                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate(
                            "create-student"
                        )
                    }
                >
                    + Create Student
                </button>

            </div>

            <div className="mini-stat">

                {students.length}

                <span>
                    TOTAL STUDENTS
                </span>

            </div>

            <div className="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Name</th>
                            <th>Roll Number</th>
                            <th>Department</th>
                            <th>Year</th>
                        </tr>

                    </thead>

                    <tbody>

                        {students.length === 0 ? (

                            <tr>
                                <td colSpan="4">
                                    No students found.
                                </td>
                            </tr>

                        ) : (

                            students.map(
                                (student) => (

                                    <tr
                                        key={
                                            student._id
                                        }
                                    >

                                        <td>
                                            {
                                                student.name
                                            }
                                        </td>

                                        <td>
                                            {
                                                student.rollNumber
                                            }
                                        </td>

                                        <td>
                                            {
                                                student.department
                                            }
                                        </td>

                                        <td>
                                            Year{" "}
                                            {
                                                student.year
                                            }
                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    /* =====================================================
       CREATE STUDENT
    ===================================================== */

    const CreateStudentPage = () => (

        <section className="form-page">

            <div className="form-intro">

                <span>
                    STUDENT MANAGEMENT
                </span>

                <h2>
                    Create Student
                </h2>

                <p>
                    Register a new student
                    into the academic system.
                </p>

            </div>

            <form
                className="premium-form"
                onSubmit={createStudent}
            >

                <div className="form-field">

                    <label>
                        STUDENT NAME
                    </label>

                    <input
                        value={studentForm.name}
                        onChange={(e) =>
                            setStudentForm(prev => ({
                                ...prev,
                                name: e.target.value
                            }))
                        }
                        placeholder="Enter full name"
                        autoComplete="off"
                        required
                    />

                </div>

                <div className="form-field">

                    <label>
                        ROLL NUMBER
                    </label>

                    <input
                        value={
                            studentForm.rollNumber
                        }
                        onChange={(e) =>
                            setStudentForm(prev => ({
                                ...prev,
                                rollNumber:
                                    e.target.value
                            }))
                        }
                        placeholder="CSE001"
                        autoComplete="off"
                        required
                    />

                </div>

                <div className="form-field">

                    <label>
                        DEPARTMENT
                    </label>

                    <input
                        value={
                            studentForm.department
                        }
                        onChange={(e) =>
                            setStudentForm(prev => ({
                                ...prev,
                                department:
                                    e.target.value
                            }))
                        }
                        placeholder="CSE-AIML"
                        autoComplete="off"
                        required
                    />

                </div>

                <div className="form-field">

                    <label>
                        YEAR
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="4"
                        value={studentForm.year}
                        onChange={(e) =>
                            setStudentForm(prev => ({
                                ...prev,
                                year: e.target.value
                            }))
                        }
                        placeholder="3"
                        required
                    />

                </div>

                <button
                    className="primary-button full"
                    type="submit"
                >
                    + Create Student
                </button>

            </form>

        </section>
    );

    /* =====================================================
       COURSES
    ===================================================== */

    const CoursesPage = () => (

        <section className="content-card">

            <div className="content-header">

                <div>

                    <span>
                        COURSE MANAGEMENT
                    </span>

                    <h2>
                        Academic Courses
                    </h2>

                    <p>
                        Manage the institution's
                        academic curriculum.
                    </p>

                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate(
                            "create-course"
                        )
                    }
                >
                    + Create Course
                </button>

            </div>

            <div className="mini-stat">

                {courses.length}

                <span>
                    COURSES
                </span>

            </div>

            <div className="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Course</th>
                            <th>Code</th>
                            <th>Credits</th>
                        </tr>

                    </thead>

                    <tbody>

                        {courses.length === 0 ? (

                            <tr>
                                <td colSpan="3">
                                    No courses found.
                                </td>
                            </tr>

                        ) : (

                            courses.map(
                                (course) => (

                                    <tr
                                        key={
                                            course._id
                                        }
                                    >

                                        <td>
                                            {
                                                course.name
                                            }
                                        </td>

                                        <td>
                                            {
                                                course.code
                                            }
                                        </td>

                                        <td>
                                            {
                                                course.credits
                                            }
                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    /* =====================================================
       CREATE COURSE
    ===================================================== */

    const CreateCoursePage = () => (

        <section className="form-page">

            <div className="form-intro">

                <span>
                    COURSE MANAGEMENT
                </span>

                <h2>
                    Create Course
                </h2>

                <p>
                    Add a new academic course
                    to the curriculum.
                </p>

            </div>

            <form
                className="premium-form"
                onSubmit={createCourse}
            >

                <div className="form-field">

                    <label>
                        COURSE NAME
                    </label>

                    <input
                        value={courseForm.name}
                        onChange={(e) =>
                            setCourseForm(prev => ({
                                ...prev,
                                name: e.target.value
                            }))
                        }
                        placeholder="Enterprise Application Development"
                        autoComplete="off"
                        required
                    />

                </div>

                <div className="form-field">

                    <label>
                        COURSE CODE
                    </label>

                    <input
                        value={courseForm.code}
                        onChange={(e) =>
                            setCourseForm(prev => ({
                                ...prev,
                                code: e.target.value
                            }))
                        }
                        placeholder="EAD301"
                        autoComplete="off"
                        required
                    />

                </div>

                <div className="form-field">

                    <label>
                        CREDITS
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={courseForm.credits}
                        onChange={(e) =>
                            setCourseForm(prev => ({
                                ...prev,
                                credits:
                                    e.target.value
                            }))
                        }
                        placeholder="3"
                        required
                    />

                </div>

                <button
                    className="primary-button full"
                    type="submit"
                >
                    + Create Course
                </button>

            </form>

        </section>
    );

    /* =====================================================
       ENROLLMENTS
    ===================================================== */

    const EnrollmentsPage = () => (

        <section className="content-card">

            <div className="content-header">

                <div>

                    <span>
                        COURSE REGISTRATION
                    </span>

                    <h2>
                        Enrolled Students
                    </h2>

                    <p>
                        Students registered for
                        academic courses.
                    </p>

                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate(
                            "create-enrollment"
                        )
                    }
                >
                    + Enroll Student
                </button>

            </div>

            <div className="mini-stat">

                {enrollments.length}

                <span>
                    ACTIVE ENROLLMENTS
                </span>

            </div>

            <div className="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Student</th>
                            <th>Roll Number</th>
                            <th>Course</th>
                            <th>Code</th>
                            <th>Credits</th>
                            <th>Enrolled</th>
                        </tr>

                    </thead>

                    <tbody>

                        {enrollments.length === 0 ? (

                            <tr>
                                <td colSpan="6">
                                    No enrollments found.
                                </td>
                            </tr>

                        ) : (

                            enrollments.map(
                                (enrollment) => {

                                    const student =
                                        typeof enrollment.student ===
                                        "object"
                                            ? enrollment.student
                                            : getStudent(
                                                enrollment.student
                                            );

                                    const course =
                                        typeof enrollment.course ===
                                        "object"
                                            ? enrollment.course
                                            : getCourse(
                                                enrollment.course
                                            );

                                    return (

                                        <tr
                                            key={
                                                enrollment._id
                                            }
                                        >

                                            <td>
                                                {
                                                    student?.name ||
                                                    "Unknown"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    student?.rollNumber ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    course?.name ||
                                                    "Unknown"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    course?.code ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    course?.credits ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    enrollment.enrolledAt
                                                        ? new Date(
                                                            enrollment.enrolledAt
                                                        ).toLocaleDateString()
                                                        : "-"
                                                }
                                            </td>

                                        </tr>

                                    );
                                }
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    /* =====================================================
       CREATE ENROLLMENT
    ===================================================== */

    const CreateEnrollmentPage = () => (

        <section className="form-page">

            <div className="form-intro">

                <span>
                    COURSE REGISTRATION
                </span>

                <h2>
                    Enroll Student
                </h2>

                <p>
                    Register a student for an
                    academic course.
                </p>

            </div>

            <form
                className="premium-form"
                onSubmit={createEnrollment}
            >

                <div className="form-field">

                    <label>
                        SELECT STUDENT
                    </label>

                    <select
                        value={
                            enrollmentForm.student
                        }
                        onChange={(e) =>
                            setEnrollmentForm(prev => ({
                                ...prev,
                                student:
                                    e.target.value
                            }))
                        }
                        required
                    >

                        <option value="">
                            Select Student
                        </option>

                        {students.map(
                            (student) => (

                                <option
                                    key={
                                        student._id
                                    }
                                    value={
                                        student._id
                                    }
                                >
                                    {student.name}
                                    {" — "}
                                    {student.rollNumber}
                                </option>

                            )
                        )}

                    </select>

                </div>

                <div className="form-field">

                    <label>
                        SELECT COURSE
                    </label>

                    <select
                        value={
                            enrollmentForm.course
                        }
                        onChange={(e) =>
                            setEnrollmentForm(prev => ({
                                ...prev,
                                course:
                                    e.target.value
                            }))
                        }
                        required
                    >

                        <option value="">
                            Select Course
                        </option>

                        {courses.map(
                            (course) => (

                                <option
                                    key={
                                        course._id
                                    }
                                    value={
                                        course._id
                                    }
                                >
                                    {course.name}
                                    {" — "}
                                    {course.code}
                                </option>

                            )
                        )}

                    </select>

                </div>

                <button
                    className="primary-button full"
                    type="submit"
                >
                    + Enroll Student
                </button>

            </form>

        </section>
    );

    /* =====================================================
       GRADES
    ===================================================== */

    const GradesPage = () => (

        <section className="content-card">

            <div className="content-header">

                <div>

                    <span>
                        ACADEMIC PERFORMANCE
                    </span>

                    <h2>
                        Grade Records
                    </h2>

                    <p>
                        Monitor student academic
                        performance.
                    </p>

                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate(
                            "create-grade"
                        )
                    }
                >
                    + Add Grade
                </button>

            </div>

            <div className="mini-stat">

                {grades.length}

                <span>
                    GRADE RECORDS
                </span>

            </div>

            <div className="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Student</th>
                            <th>Roll Number</th>
                            <th>Course</th>
                            <th>Code</th>
                            <th>Grade</th>
                            <th>Score</th>
                        </tr>

                    </thead>

                    <tbody>

                        {grades.length === 0 ? (

                            <tr>
                                <td colSpan="6">
                                    No grade records available.
                                </td>
                            </tr>

                        ) : (

                            grades.map(
                                (record) => {

                                    const student =
                                        getStudent(
                                            record.student
                                        );

                                    const course =
                                        getCourse(
                                            record.course
                                        );

                                    return (

                                        <tr
                                            key={
                                                record._id
                                            }
                                        >

                                            <td>
                                                {
                                                    student?.name ||
                                                    "Unknown"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    student?.rollNumber ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    course?.name ||
                                                    "Unknown"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    course?.code ||
                                                    "-"
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        `grade-pill ${getGradeClass(
                                                            record.grade
                                                        )}`
                                                    }
                                                >
                                                    {
                                                        record.grade
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {
                                                    record.marks
                                                }
                                            </td>

                                        </tr>

                                    );
                                }
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    /* =====================================================
       CREATE GRADE
    ===================================================== */

    const CreateGradePage = () => (

        <section className="form-page">

            <div className="form-intro">

                <span>
                    ACADEMIC PERFORMANCE
                </span>

                <h2>
                    Add Grade
                </h2>

                <p>
                    Record an academic
                    assessment for an enrolled
                    student.
                </p>

            </div>

            <form
                className="premium-form"
                onSubmit={createGrade}
            >

                <div className="form-field">

                    <label>
                        STUDENT
                    </label>

                    <select
                        value={
                            gradeForm.student
                        }
                        onChange={(e) =>
                            setGradeForm(prev => ({
                                ...prev,
                                student:
                                    e.target.value
                            }))
                        }
                        required
                    >

                        <option value="">
                            Select Student
                        </option>

                        {students.map(
                            (student) => (

                                <option
                                    key={
                                        student._id
                                    }
                                    value={
                                        student._id
                                    }
                                >
                                    {student.name}
                                    {" — "}
                                    {student.rollNumber}
                                </option>

                            )
                        )}

                    </select>

                </div>

                <div className="form-field">

                    <label>
                        COURSE
                    </label>

                    <select
                        value={
                            gradeForm.course
                        }
                        onChange={(e) =>
                            setGradeForm(prev => ({
                                ...prev,
                                course:
                                    e.target.value
                            }))
                        }
                        required
                    >

                        <option value="">
                            Select Course
                        </option>

                        {courses.map(
                            (course) => (

                                <option
                                    key={
                                        course._id
                                    }
                                    value={
                                        course._id
                                    }
                                >
                                    {course.name}
                                    {" — "}
                                    {course.code}
                                </option>

                            )
                        )}

                    </select>

                </div>

                <div className="form-field">

                    <label>
                        MARKS
                    </label>

                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                            gradeForm.marks
                        }
                        onChange={(e) =>
                            setGradeForm(prev => ({
                                ...prev,
                                marks:
                                    e.target.value
                            }))
                        }
                        placeholder="Marks out of 100"
                        required
                    />

                </div>

                <div className="form-field">

                    <label>
                        GRADE
                    </label>

                    <select
                        value={
                            gradeForm.grade
                        }
                        onChange={(e) =>
                            setGradeForm(prev => ({
                                ...prev,
                                grade:
                                    e.target.value
                            }))
                        }
                        required
                    >

                        <option value="">
                            Select Grade
                        </option>

                        <option value="A+">
                            A+
                        </option>

                        <option value="A">
                            A
                        </option>

                        <option value="B+">
                            B+
                        </option>

                        <option value="B">
                            B
                        </option>

                        <option value="C+">
                            C+
                        </option>

                        <option value="C">
                            C
                        </option>

                        <option value="D">
                            D
                        </option>

                        <option value="F">
                            F
                        </option>

                    </select>

                </div>

                <button
                    className="primary-button full"
                    type="submit"
                >
                    + Add Grade
                </button>

            </form>

        </section>
    );

    /* =====================================================
       PAGE ROUTER
    ===================================================== */

    const renderPage = () => {

        switch (activePage) {

            case "students":
                return <StudentsPage />;

            case "create-student":
                return <CreateStudentPage />;

            case "courses":
                return <CoursesPage />;

            case "create-course":
                return <CreateCoursePage />;

            case "enrollments":
                return <EnrollmentsPage />;

            case "create-enrollment":
                return <CreateEnrollmentPage />;

            case "grades":
                return <GradesPage />;

            case "create-grade":
                return <CreateGradePage />;

            default:
                return <DashboardPage />;
        }
    };

    /* =====================================================
       MAIN
    ===================================================== */

    return (

        <div className="app-shell">

            <div className="background-orb orb-a" />
            <div className="background-orb orb-b" />

            <Sidebar />

            <main className="main-content">

                <TopBar />

                <div
                    className="page-content"
                    key={activePage}
                >
                    {renderPage()}
                </div>

                <footer className="footer">

                    <strong>
                        ACADEMIA
                    </strong>

                    <span>
                        FACULTY ACADEMIC MANAGEMENT SYSTEM
                    </span>

                    <small>
                        MICROSERVICES · STUDENT · COURSE ·
                        ENROLLMENT · GRADE
                    </small>

                </footer>

            </main>

        </div>
    );
}

export default App;