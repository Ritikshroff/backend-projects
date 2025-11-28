import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import UserProfile from "./pages/UserProfile";
import Layout from "./components/Layout";

function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // Simple health check or just welcome
    setMessage("Welcome to the Full Stack Blog Platform!");
  }, []);

  return (
    <div className="container mx-auto px-4 pt-16 text-center">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        Blog Hub
      </h1>
      <p className="text-xl text-slate-400 mb-8">{message}</p>
      <div className="flex gap-4 justify-center">
        <Link to="/login">
          <button className="px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all transform hover:-translate-y-0.5">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="px-6 py-3 rounded-xl font-semibold border border-slate-700 hover:border-primary transition-colors">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/feed"
            element={
              <Layout>
                <Feed />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <Layout>
                <UserProfile />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
