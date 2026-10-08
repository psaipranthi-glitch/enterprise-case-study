import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {

    // =====================================================
    // AUTH
    // =====================================================

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

    // =====================================================
    // NAVIGATION
    // =====================================================

    const [activePage, setActivePage] = useState("dashboard");
    const [activeModule, setActiveModule] = useState("core");

    // =====================================================
    // DATA
    // =====================================================

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [grades, setGrades] = useState([]);

    const [loading, setLoading] = useState(false);

    // =====================================================
    // FORMS
    // =====================================================

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

    // =====================================================
    // LOAD DATA
    // =====================================================

    const loadData = async () => {
        setLoading(true);

        const results = await Promise.allSettled([
            axios.get(`${API}/students`),
            axios.get(`${API}/courses`),
            axios.get(`${API}/enrollments`),
            axios.get(`${API}/grades`)
        ]);

        if (results[0].status === "fulfilled") {
            setStudents(
                Array.isArray(results[0].value.data)
                    ? results[0].value.data
                    : []
            );
        }

        if (results[1].status === "fulfilled") {
            setCourses(
                Array.isArray(results[1].value.data)
                    ? results[1].value.data
                    : []
            );
        }

        if (results[2].status === "fulfilled") {
            setEnrollments(
                Array.isArray(results[2].value.data)
                    ? results[2].value.data
                    : []
            );
        }

        if (results[3].status === "fulfilled") {
            setGrades(
                Array.isArray(results[3].value.data)
                    ? results[3].value.data
                    : []
            );
        }

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Module ${index + 1} error:`,
                    result.reason
                );
            }
        });

        setLoading(false);
    };

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    // =====================================================
    // LOGIN
    // =====================================================

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

            const receivedToken = response.data.token;
            const receivedUser = response.data.user;

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

    // =====================================================
    // LOGOUT
    // =====================================================

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
        setActiveModule("core");
    };

    // =====================================================
    // NAVIGATION
    // =====================================================

    const navigate = (page) => {
        setActivePage(page);

        if (page.includes("student")) {
            setActiveModule("students");
        } else if (page.includes("course")) {
            setActiveModule("courses");
        } else if (page.includes("enrollment")) {
            setActiveModule("enrollments");
        } else if (page.includes("grade")) {
            setActiveModule("grades");
        } else {
            setActiveModule("core");
        }
    };

    // =====================================================
    // CREATE STUDENT
    // =====================================================

    const createStudent = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `${API}/students`,
                {
                    ...studentForm,
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

            alert("Student created successfully.");

            navigate("students");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to create student"
            );
        }
    };

    // =====================================================
    // CREATE COURSE
    // =====================================================

    const createCourse = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `${API}/courses`,
                {
                    ...courseForm,
                    credits: Number(courseForm.credits)
                }
            );

            setCourseForm({
                name: "",
                code: "",
                credits: ""
            });

            await loadData();

            alert("Course created successfully.");

            navigate("courses");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to create course"
            );
        }
    };

    // =====================================================
    // CREATE ENROLLMENT
    // =====================================================

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

            alert("Student enrolled successfully.");

            navigate("enrollments");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to enroll student"
            );
        }
    };

    // =====================================================
    // CREATE GRADE
    // =====================================================

    const createGrade = async (e) => {
        e.preventDefault();

        if (
            !gradeForm.student ||
            !gradeForm.course ||
            !gradeForm.grade ||
            gradeForm.marks === ""
        ) {
            alert("Please complete all grade fields.");
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

            alert("Grade added successfully.");

            navigate("grades");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to add grade"
            );
        }
    };

    // =====================================================
    // HELPERS
    // =====================================================

    const getStudent = (id) => {
        if (!id) return null;

        if (typeof id === "object") {
            return id;
        }

        return students.find(
            (student) =>
                String(student._id) === String(id)
        );
    };

    const getCourse = (id) => {
        if (!id) return null;

        if (typeof id === "object") {
            return id;
        }

        return courses.find(
            (course) =>
                String(course._id) === String(id)
        );
    };

    const getGradeClass = (grade) => {
        if (grade === "A+" || grade === "A") {
            return "grade-a";
        }

        if (grade === "B+" || grade === "B") {
            return "grade-b";
        }

        if (grade === "C+" || grade === "C") {
            return "grade-c";
        }

        return "grade-d";
    };

    // =====================================================
    // LOGIN PAGE
    // =====================================================

    if (!token) {
        return (
            <div className="mono-login">

                <div className="login-grid" />

                <div className="login-glow login-glow-one" />
                <div className="login-glow login-glow-two" />

                <div className="login-panel">

                    <div className="login-top">

                        <div className="mono-logo">
                            A
                        </div>

                        <div className="login-brand">
                            <strong>
                                ACADEMIA
                            </strong>

                            <span>
                                MONOLITHIC CORE
                            </span>
                        </div>

                    </div>

                    <div className="system-badge">
                        <span />
                        SYSTEM READY
                    </div>

                    <div className="login-title">

                        <small>
                            FACULTY ACCESS
                        </small>

                        <h1>
                            Academic
                            <br />
                            Control Center
                        </h1>

                        <p>
                            Centralized academic
                            management through a
                            unified application core.
                        </p>

                    </div>

                    <form
                        className="mono-login-form"
                        onSubmit={handleLogin}
                    >

                        <div className="mono-field">

                            <label>
                                FACULTY EMAIL
                            </label>

                            <input
                                type="email"
                                placeholder="teacher@academia.edu"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="mono-field">

                            <label>
                                PASSWORD
                            </label>

                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        {loginError && (
                            <div className="mono-error">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="login-submit"
                        >
                            {loginLoading
                                ? "AUTHENTICATING..."
                                : "ACCESS SYSTEM →"}
                        </button>

                    </form>

                    <div className="architecture-label">
                        <span />
                        MONOLITHIC ARCHITECTURE
                        <span />
                    </div>

                </div>

            </div>
        );
    }

    // =====================================================
    // SIDEBAR
    // =====================================================

    const Sidebar = () => (
        <aside className="mono-sidebar">

            <div className="mono-brand">

                <div className="mono-brand-icon">
                    A
                </div>

                <div>
                    <strong>
                        ACADEMIA
                    </strong>

                    <span>
                        MONOLITHIC CORE
                    </span>
                </div>

            </div>

            <div className="core-status">
                <span />
                CORE ONLINE
            </div>

            <div className="nav-caption">
                APPLICATION MODULES
            </div>

            <nav className="mono-nav-list">

                <button
                    className={
                        activePage === "dashboard"
                            ? "mono-nav active"
                            : "mono-nav"
                    }
                    onClick={() =>
                        navigate("dashboard")
                    }
                >
                    <b>01</b>
                    <span>Dashboard</span>
                    <i>⌂</i>
                </button>

                <button
                    className={
                        activeModule === "students"
                            ? "mono-nav active"
                            : "mono-nav"
                    }
                    onClick={() =>
                        navigate("students")
                    }
                >
                    <b>02</b>
                    <span>Students</span>
                    <i>{students.length}</i>
                </button>

                <button
                    className={
                        activeModule === "courses"
                            ? "mono-nav active"
                            : "mono-nav"
                    }
                    onClick={() =>
                        navigate("courses")
                    }
                >
                    <b>03</b>
                    <span>Courses</span>
                    <i>{courses.length}</i>
                </button>

                <button
                    className={
                        activeModule === "enrollments"
                            ? "mono-nav active"
                            : "mono-nav"
                    }
                    onClick={() =>
                        navigate("enrollments")
                    }
                >
                    <b>04</b>
                    <span>Enrollments</span>
                    <i>{enrollments.length}</i>
                </button>

                <button
                    className={
                        activeModule === "grades"
                            ? "mono-nav active"
                            : "mono-nav"
                    }
                    onClick={() =>
                        navigate("grades")
                    }
                >
                    <b>05</b>
                    <span>Grades</span>
                    <i>{grades.length}</i>
                </button>

            </nav>

            <div className="sidebar-bottom">

                <div className="architecture-box">

                    <span>
                        ARCHITECTURE
                    </span>

                    <strong>
                        MONOLITHIC
                    </strong>

                    <small>
                        One application
                        <br />
                        One deployment
                        <br />
                        One core
                    </small>

                </div>

                <div className="mono-user">

                    <div className="user-avatar">
                        {(user?.name || "T")
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <strong>
                            {user?.name || "Teacher"}
                        </strong>

                        <span>
                            Faculty Administrator
                        </span>
                    </div>

                </div>

                <button
                    className="mono-logout"
                    onClick={handleLogout}
                >
                    LOGOUT
                </button>

            </div>

        </aside>
    );

    // =====================================================
    // TOP BAR
    // =====================================================

    const TopBar = () => {

        const titles = {
            dashboard: "Academic Overview",
            students: "Student Directory",
            "create-student": "Create Student",
            courses: "Course Catalog",
            "create-course": "Create Course",
            enrollments: "Enrollment Records",
            "create-enrollment": "Enroll Student",
            grades: "Grade Records",
            "create-grade": "Add Grade"
        };

        return (
            <header className="mono-topbar">

                <div>

                    <span>
                        ACADEMIA / APPLICATION CORE
                    </span>

                    <h1>
                        {titles[activePage]}
                    </h1>

                </div>

                <div className="topbar-right">

                    <div className="live-indicator">
                        <span />
                        LIVE
                    </div>

                    <button
                        onClick={loadData}
                        className="refresh-mono"
                    >
                        {loading
                            ? "SYNCING..."
                            : "↻ SYNC DATA"}
                    </button>

                </div>

            </header>
        );
    };

    // =====================================================
    // METRIC CARD
    // =====================================================

    const Metric = ({
        number,
        label,
        value,
        text,
        onClick
    }) => (
        <div
            className="metric-card"
            onClick={onClick}
        >

            <div className="metric-number">
                {number}
            </div>

            <div className="metric-main">

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

                <small>
                    {text}
                </small>

            </div>

            <div className="metric-arrow">
                →
            </div>

        </div>
    );

    // =====================================================
    // DASHBOARD
    // =====================================================

    const Dashboard = () => (
        <>

            <section className="mono-hero">

                <div className="hero-copy">

                    <span>
                        MONOLITHIC APPLICATION CORE
                    </span>

                    <h2>
                        Everything academic.
                        <br />
                        <em>One unified system.</em>
                    </h2>

                    <p>
                        Manage the complete academic
                        lifecycle from a single
                        centralized application.
                    </p>

                </div>

                <div className="core-visual">

                    <div className="core-ring">

                        <div>
                            A
                        </div>

                    </div>

                    <span>
                        SINGLE
                        <br />
                        APPLICATION
                    </span>

                </div>

            </section>

            <section className="metric-grid">

                <Metric
                    number="01"
                    label="STUDENTS"
                    value={students.length}
                    text="Registered learners"
                    onClick={() =>
                        navigate("students")
                    }
                />

                <Metric
                    number="02"
                    label="COURSES"
                    value={courses.length}
                    text="Academic subjects"
                    onClick={() =>
                        navigate("courses")
                    }
                />

                <Metric
                    number="03"
                    label="ENROLLMENTS"
                    value={enrollments.length}
                    text="Active registrations"
                    onClick={() =>
                        navigate("enrollments")
                    }
                />

                <Metric
                    number="04"
                    label="GRADES"
                    value={grades.length}
                    text="Academic records"
                    onClick={() =>
                        navigate("grades")
                    }
                />

            </section>

            <section className="dashboard-lower">

                <div className="module-panel">

                    <div className="panel-heading">

                        <span>
                            SYSTEM ARCHITECTURE
                        </span>

                        <h2>
                            Unified Application Core
                        </h2>

                    </div>

                    <div className="architecture-flow">

                        <div className="flow-node primary">
                            REACT
                            <small>
                                FRONTEND
                            </small>
                        </div>

                        <div className="flow-line" />

                        <div className="flow-node main">
                            EXPRESS
                            <small>
                                APPLICATION
                            </small>
                        </div>

                        <div className="flow-line" />

                        <div className="flow-node">
                            MONGODB
                            <small>
                                DATABASE
                            </small>
                        </div>

                    </div>

                </div>

                <div className="principles-panel">

                    <span>
                        CORE PRINCIPLES
                    </span>

                    <div className="principle-row">
                        <b>01</b>
                        <span>Centralized</span>
                    </div>

                    <div className="principle-row">
                        <b>02</b>
                        <span>Consistent</span>
                    </div>

                    <div className="principle-row">
                        <b>03</b>
                        <span>Integrated</span>
                    </div>

                    <div className="principle-row">
                        <b>04</b>
                        <span>Maintainable</span>
                    </div>

                </div>

            </section>

            <section className="quick-section">

                <div className="section-title">

                    <span>
                        FACULTY OPERATIONS
                    </span>

                    <h2>
                        Quick Actions
                    </h2>

                </div>

                <div className="quick-grid">

                    <button
                        onClick={() =>
                            navigate("create-student")
                        }
                    >
                        <b>+</b>
                        <span>
                            <strong>
                                Create Student
                            </strong>
                            Register learner
                        </span>
                        →
                    </button>

                    <button
                        onClick={() =>
                            navigate("create-course")
                        }
                    >
                        <b>+</b>
                        <span>
                            <strong>
                                Create Course
                            </strong>
                            Add subject
                        </span>
                        →
                    </button>

                    <button
                        onClick={() =>
                            navigate("create-enrollment")
                        }
                    >
                        <b>+</b>
                        <span>
                            <strong>
                                Enroll Student
                            </strong>
                            Register course
                        </span>
                        →
                    </button>

                    <button
                        onClick={() =>
                            navigate("create-grade")
                        }
                    >
                        <b>+</b>
                        <span>
                            <strong>
                                Add Grade
                            </strong>
                            Record assessment
                        </span>
                        →
                    </button>

                </div>

            </section>

        </>
    );

    // =====================================================
    // STUDENTS PAGE
    // =====================================================

    const StudentsPage = () => (
        <section className="content-panel">

            <div className="content-heading">

                <div>

                    <span>
                        STUDENT MODULE
                    </span>

                    <h2>
                        Student Directory
                    </h2>

                    <p>
                        Manage registered students
                        and academic profiles.
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={() =>
                        navigate("create-student")
                    }
                >
                    + CREATE STUDENT
                </button>

            </div>

            <div className="record-counter">

                <strong>
                    {students.length}
                </strong>

                <span>
                    REGISTERED STUDENTS
                </span>

            </div>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>NAME</th>
                            <th>ROLL NUMBER</th>
                            <th>DEPARTMENT</th>
                            <th>YEAR</th>
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

                            students.map((student) => (

                                <tr key={student._id}>

                                    <td>
                                        <strong>
                                            {student.name}
                                        </strong>
                                    </td>

                                    <td>
                                        {student.rollNumber}
                                    </td>

                                    <td>
                                        {student.department}
                                    </td>

                                    <td>
                                        Year {student.year}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    // =====================================================
    // CREATE STUDENT
    // =====================================================

    const CreateStudentPage = () => (
        <section className="form-panel">

            <div className="form-header">

                <span>
                    STUDENT MODULE / NEW RECORD
                </span>

                <h2>
                    Create Student
                </h2>

                <p>
                    Register a new learner into
                    the centralized academic system.
                </p>

            </div>

            <form
                className="mono-form"
                onSubmit={createStudent}
            >

                <div className="form-row">

                    <div className="form-control">

                        <label>
                            STUDENT NAME
                        </label>

                        <input
                            value={studentForm.name}
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    name: e.target.value
                                })
                            }
                            placeholder="Enter full name"
                            required
                        />

                    </div>

                    <div className="form-control">

                        <label>
                            ROLL NUMBER
                        </label>

                        <input
                            value={
                                studentForm.rollNumber
                            }
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    rollNumber:
                                        e.target.value
                                })
                            }
                            placeholder="CSE001"
                            required
                        />

                    </div>

                </div>

                <div className="form-row">

                    <div className="form-control">

                        <label>
                            DEPARTMENT
                        </label>

                        <input
                            value={
                                studentForm.department
                            }
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    department:
                                        e.target.value
                                })
                            }
                            placeholder="CSE-AIML"
                            required
                        />

                    </div>

                    <div className="form-control">

                        <label>
                            YEAR
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="4"
                            value={studentForm.year}
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    year: e.target.value
                                })
                            }
                            placeholder="3"
                            required
                        />

                    </div>

                </div>

                <button
                    className="submit-btn"
                    type="submit"
                >
                    CREATE STUDENT →
                </button>

            </form>

        </section>
    );

    // =====================================================
    // COURSES PAGE
    // =====================================================

    const CoursesPage = () => (
        <section className="content-panel">

            <div className="content-heading">

                <div>

                    <span>
                        COURSE MODULE
                    </span>

                    <h2>
                        Course Catalog
                    </h2>

                    <p>
                        Manage academic subjects
                        and curriculum structure.
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={() =>
                        navigate("create-course")
                    }
                >
                    + CREATE COURSE
                </button>

            </div>

            <div className="record-counter">

                <strong>
                    {courses.length}
                </strong>

                <span>
                    AVAILABLE COURSES
                </span>

            </div>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>COURSE</th>
                            <th>CODE</th>
                            <th>CREDITS</th>
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

                            courses.map((course) => (

                                <tr key={course._id}>

                                    <td>
                                        <strong>
                                            {course.name}
                                        </strong>
                                    </td>

                                    <td>
                                        {course.code}
                                    </td>

                                    <td>
                                        {course.credits}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    // =====================================================
    // CREATE COURSE
    // =====================================================

    const CreateCoursePage = () => (
        <section className="form-panel">

            <div className="form-header">

                <span>
                    COURSE MODULE / NEW RECORD
                </span>

                <h2>
                    Create Course
                </h2>

                <p>
                    Add a new academic subject
                    to the curriculum.
                </p>

            </div>

            <form
                className="mono-form"
                onSubmit={createCourse}
            >

                <div className="form-control">

                    <label>
                        COURSE NAME
                    </label>

                    <input
                        value={courseForm.name}
                        onChange={(e) =>
                            setCourseForm({
                                ...courseForm,
                                name: e.target.value
                            })
                        }
                        placeholder="Enterprise Application Development"
                        required
                    />

                </div>

                <div className="form-row">

                    <div className="form-control">

                        <label>
                            COURSE CODE
                        </label>

                        <input
                            value={courseForm.code}
                            onChange={(e) =>
                                setCourseForm({
                                    ...courseForm,
                                    code: e.target.value
                                })
                            }
                            placeholder="EAD301"
                            required
                        />

                    </div>

                    <div className="form-control">

                        <label>
                            CREDITS
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={courseForm.credits}
                            onChange={(e) =>
                                setCourseForm({
                                    ...courseForm,
                                    credits: e.target.value
                                })
                            }
                            placeholder="3"
                            required
                        />

                    </div>

                </div>

                <button
                    className="submit-btn"
                    type="submit"
                >
                    CREATE COURSE →
                </button>

            </form>

        </section>
    );

    // =====================================================
    // ENROLLMENTS
    // =====================================================

    const EnrollmentsPage = () => (
        <section className="content-panel">

            <div className="content-heading">

                <div>

                    <span>
                        ENROLLMENT MODULE
                    </span>

                    <h2>
                        Enrollment Records
                    </h2>

                    <p>
                        Manage active student
                        course registrations.
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={() =>
                        navigate("create-enrollment")
                    }
                >
                    + ENROLL STUDENT
                </button>

            </div>

            <div className="record-counter">

                <strong>
                    {enrollments.length}
                </strong>

                <span>
                    ACTIVE ENROLLMENTS
                </span>

            </div>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>STUDENT</th>
                            <th>ROLL NUMBER</th>
                            <th>COURSE</th>
                            <th>CODE</th>
                            <th>CREDITS</th>
                            <th>DATE</th>
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

                            enrollments.map((enrollment) => {

                                const student =
                                    getStudent(
                                        enrollment.student
                                    );

                                const course =
                                    getCourse(
                                        enrollment.course
                                    );

                                return (

                                    <tr
                                        key={
                                            enrollment._id
                                        }
                                    >

                                        <td>
                                            <strong>
                                                {student?.name ||
                                                    "Unknown"}
                                            </strong>
                                        </td>

                                        <td>
                                            {student?.rollNumber ||
                                                "-"}
                                        </td>

                                        <td>
                                            {course?.name ||
                                                "Unknown"}
                                        </td>

                                        <td>
                                            {course?.code ||
                                                "-"}
                                        </td>

                                        <td>
                                            {course?.credits ||
                                                "-"}
                                        </td>

                                        <td>
                                            {enrollment.enrolledAt
                                                ? new Date(
                                                      enrollment.enrolledAt
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                    </tr>

                                );
                            })

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    // =====================================================
    // CREATE ENROLLMENT
    // =====================================================

    const CreateEnrollmentPage = () => (
        <section className="form-panel">

            <div className="form-header">

                <span>
                    ENROLLMENT MODULE / NEW RECORD
                </span>

                <h2>
                    Enroll Student
                </h2>

                <p>
                    Register a student for
                    an academic course.
                </p>

            </div>

            <form
                className="mono-form"
                onSubmit={createEnrollment}
            >

                <div className="form-control">

                    <label>
                        SELECT STUDENT
                    </label>

                    <select
                        value={
                            enrollmentForm.student
                        }
                        onChange={(e) =>
                            setEnrollmentForm({
                                ...enrollmentForm,
                                student:
                                    e.target.value
                            })
                        }
                        required
                    >

                        <option value="">
                            Select Student
                        </option>

                        {students.map((student) => (

                            <option
                                key={student._id}
                                value={student._id}
                            >
                                {student.name}
                                {" — "}
                                {student.rollNumber}
                            </option>

                        ))}

                    </select>

                </div>

                <div className="form-control">

                    <label>
                        SELECT COURSE
                    </label>

                    <select
                        value={
                            enrollmentForm.course
                        }
                        onChange={(e) =>
                            setEnrollmentForm({
                                ...enrollmentForm,
                                course:
                                    e.target.value
                            })
                        }
                        required
                    >

                        <option value="">
                            Select Course
                        </option>

                        {courses.map((course) => (

                            <option
                                key={course._id}
                                value={course._id}
                            >
                                {course.name}
                                {" — "}
                                {course.code}
                            </option>

                        ))}

                    </select>

                </div>

                <button
                    className="submit-btn"
                    type="submit"
                >
                    ENROLL STUDENT →
                </button>

            </form>

        </section>
    );

    // =====================================================
    // GRADES
    // =====================================================

    const GradesPage = () => (
        <section className="content-panel">

            <div className="content-heading">

                <div>

                    <span>
                        GRADE MODULE
                    </span>

                    <h2>
                        Grade Records
                    </h2>

                    <p>
                        Monitor academic performance
                        across registered students.
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={() =>
                        navigate("create-grade")
                    }
                >
                    + ADD GRADE
                </button>

            </div>

            <div className="record-counter">

                <strong>
                    {grades.length}
                </strong>

                <span>
                    GRADE RECORDS
                </span>

            </div>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>STUDENT</th>
                            <th>ROLL NUMBER</th>
                            <th>COURSE</th>
                            <th>CODE</th>
                            <th>GRADE</th>
                            <th>MARKS</th>
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

                            grades.map((record) => {

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
                                        key={record._id}
                                    >

                                        <td>
                                            <strong>
                                                {student?.name ||
                                                    "Unknown"}
                                            </strong>
                                        </td>

                                        <td>
                                            {student?.rollNumber ||
                                                "-"}
                                        </td>

                                        <td>
                                            {course?.name ||
                                                "Unknown"}
                                        </td>

                                        <td>
                                            {course?.code ||
                                                "-"}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    `grade-pill ${getGradeClass(
                                                        record.grade
                                                    )}`
                                                }
                                            >
                                                {record.grade}
                                            </span>
                                        </td>

                                        <td>
                                            {record.marks}
                                        </td>

                                    </tr>

                                );
                            })

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

    // =====================================================
    // CREATE GRADE
    // =====================================================

    const CreateGradePage = () => (
        <section className="form-panel">

            <div className="form-header">

                <span>
                    GRADE MODULE / NEW RECORD
                </span>

                <h2>
                    Add Grade
                </h2>

                <p>
                    Record an academic assessment
                    for an enrolled student.
                </p>

            </div>

            <form
                className="mono-form"
                onSubmit={createGrade}
            >

                <div className="form-control">

                    <label>
                        STUDENT
                    </label>

                    <select
                        value={gradeForm.student}
                        onChange={(e) =>
                            setGradeForm({
                                ...gradeForm,
                                student:
                                    e.target.value
                            })
                        }
                        required
                    >

                        <option value="">
                            Select Student
                        </option>

                        {students.map((student) => (

                            <option
                                key={student._id}
                                value={student._id}
                            >
                                {student.name}
                                {" — "}
                                {student.rollNumber}
                            </option>

                        ))}

                    </select>

                </div>

                <div className="form-control">

                    <label>
                        COURSE
                    </label>

                    <select
                        value={gradeForm.course}
                        onChange={(e) =>
                            setGradeForm({
                                ...gradeForm,
                                course:
                                    e.target.value
                            })
                        }
                        required
                    >

                        <option value="">
                            Select Course
                        </option>

                        {courses.map((course) => (

                            <option
                                key={course._id}
                                value={course._id}
                            >
                                {course.name}
                                {" — "}
                                {course.code}
                            </option>

                        ))}

                    </select>

                </div>

                <div className="form-row">

                    <div className="form-control">

                        <label>
                            MARKS
                        </label>

                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={gradeForm.marks}
                            onChange={(e) =>
                                setGradeForm({
                                    ...gradeForm,
                                    marks:
                                        e.target.value
                                })
                            }
                            placeholder="0 - 100"
                            required
                        />

                    </div>

                    <div className="form-control">

                        <label>
                            GRADE
                        </label>

                        <select
                            value={gradeForm.grade}
                            onChange={(e) =>
                                setGradeForm({
                                    ...gradeForm,
                                    grade:
                                        e.target.value
                                })
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

                </div>

                <button
                    className="submit-btn"
                    type="submit"
                >
                    ADD GRADE →
                </button>

            </form>

        </section>
    );

    // =====================================================
    // ROUTER
    // =====================================================

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
                return <Dashboard />;

        }
    };

    // =====================================================
    // MAIN
    // =====================================================

    return (

        <div className="mono-app">

            <Sidebar />

            <main className="mono-main">

                <TopBar />

                <div
                    className="mono-page"
                    key={activePage}
                >
                    {renderPage()}
                </div>

                <footer className="mono-footer">

                    <div>
                        <strong>
                            ACADEMIA
                        </strong>

                        <span>
                            FACULTY ACADEMIC MANAGEMENT SYSTEM
                        </span>
                    </div>

                    <small>
                        MONOLITHIC · EXPRESS · MONGODB
                    </small>

                </footer>

            </main>

        </div>
    );
}

export default App;