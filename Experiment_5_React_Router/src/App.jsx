import { Link, Routes, Route, Navigate } from "react-router-dom";

function Home() {
    return <section><h2>Home</h2><p>Welcome to the React Router multi-page website.</p></section>;
}

function About() {
    return <section><h2>About</h2><p>This page demonstrates client-side routing using React Router.</p></section>;
}

function Contact() {
    return <section><h2>Contact</h2><p>Email: p.sai.pranthi@gmail.com</p><p>Roll No: 160124748016</p></section>;
}

function App() {
    return (
        <div className="app">
            <nav>
                <h1>React Site</h1>
                <div>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                </div>
            </nav>
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
