import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import UserProfile from "./pages/UserProfile";
import Layout from "./components/Layout";

function Home() {
  const features = [
    {
      icon: "✍️",
      title: "Share Your Stories",
      description:
        "Express yourself with rich text posts and stunning images. Your voice matters.",
    },
    {
      icon: "❤️",
      title: "Engage & Connect",
      description:
        "Like, comment, and build meaningful connections with creators worldwide.",
    },
    {
      icon: "📱",
      title: "Seamless Experience",
      description:
        "Modern, responsive design that works beautifully on all your devices.",
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description:
        "Your data is protected with industry-standard security and encryption.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Posts Shared" },
    { value: "100K+", label: "Connections Made" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/50 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Blog Hub
            </span>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <button className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Join thousands of creators already sharing their stories
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Share Your Voice
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Connect with the World
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              A modern blogging platform where your ideas come to life. Create,
              share, and engage with a vibrant community of writers and readers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/register">
                <button className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all transform hover:scale-105 shadow-xl shadow-purple-500/30 text-lg">
                  Start Writing Free
                </button>
              </Link>
              <Link to="/login">
                <button className="px-8 py-4 rounded-xl font-semibold border-2 border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white transition-all text-lg group">
                  Explore Posts
                  <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="pt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Powerful features to help you create and connect
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition-all group hover:transform hover:scale-105"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Loved by Creators Worldwide
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote:
                    "Best platform for sharing my creative writing. The community is amazing!",
                  author: "Sarah K.",
                  role: "Content Creator",
                },
                {
                  quote:
                    "Finally, a blogging platform that's both beautiful and easy to use.",
                  author: "Michael R.",
                  role: "Tech Blogger",
                },
                {
                  quote:
                    "The engagement I get here is unmatched. My audience keeps growing!",
                  author: "Priya M.",
                  role: "Travel Writer",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-slate-800/30 border border-slate-700"
                >
                  <p className="text-slate-300 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-slate-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-12 text-center">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Join our community and share your story with the world today.
              </p>
              <Link to="/register">
                <button className="px-10 py-4 rounded-xl font-bold bg-white text-purple-600 hover:bg-slate-100 transition-all transform hover:scale-105 shadow-2xl text-lg">
                  Create Your Account - It's Free
                </button>
              </Link>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded"></div>
              <span className="font-semibold text-slate-400">Blog Hub</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2024 Blog Hub. Built with ❤️ using React & Node.js
            </div>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
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
