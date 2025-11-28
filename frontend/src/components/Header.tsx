import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import apiClient from "../api/axios";

const Header = () => {
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    try {
      await apiClient.post("/users/logout");
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-dark-card border-b border-slate-800 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <Link
          to="/feed"
          className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
        >
          Blog Hub
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <FaSignOutAlt size={20} />
        </button>

        {/* User Avatar - Clickable */}
        {currentUser && (
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer"
            title={`Go to ${currentUser.fullName}'s profile`}
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                {currentUser.fullName?.[0]}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
