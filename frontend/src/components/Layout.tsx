import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaBars, FaTimes } from "react-icons/fa";
import Header from "./Header";
import apiClient from "../api/axios";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await apiClient.get("/users/current-user");
        setCurrentUser(res.data.data);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const menuItems = [
    { icon: FaHome, label: "Feed", path: "/feed" },
    { icon: FaUser, label: "My Profile", path: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-dark text-white">
      <Header />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-dark-card rounded-xl border border-slate-700"
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-dark-card border-r border-slate-800 transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full p-4">
            {/* User Info */}
            {currentUser && (
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-4 mb-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 overflow-hidden flex-shrink-0">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                      {currentUser.fullName?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {currentUser.fullName}
                  </p>
                  <p className="text-sm text-slate-400 truncate">
                    @{currentUser.username}
                  </p>
                </div>
              </Link>
            )}

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                Blog Hub © 2024
              </p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
