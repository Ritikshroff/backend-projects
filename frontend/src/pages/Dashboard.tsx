import { useEffect, useState } from "react";
import { FaUserFriends, FaVideo, FaEdit } from "react-icons/fa";
import apiClient from "../api/axios";
import Button from "../components/Button";

interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  coverImage: string;
  subscribersCount?: number;
  subscribedToCount?: number;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. Get current user info
        const userRes = await apiClient.get("/users/current-user");
        const userData = userRes.data.data;

        // 2. Get channel stats (subscribers, etc.)
        // Note: The backend route is /users/c/:username
        const channelRes = await apiClient.get(`/users/c/${userData.username}`);

        setProfile({
          ...userData,
          ...channelRes.data.data, // Merge channel stats
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-slate-800">
        {profile?.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center text-slate-500">
            No Cover Image
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex flex-col md:flex-row gap-6 px-4 -mt-12 relative z-10">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-dark bg-slate-700 overflow-hidden">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                {profile?.fullName?.[0]}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 pt-14 md:pt-0 md:mt-14 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {profile?.fullName}
              </h1>
              <p className="text-slate-400">@{profile?.username}</p>
              <p className="text-slate-500 text-sm mt-1">{profile?.email}</p>
            </div>
            <Button variant="outline" className="gap-2">
              <FaEdit /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-dark-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <FaUserFriends size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Subscribers</p>
              <p className="text-2xl font-bold text-white">
                {profile?.subscribersCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <FaUserFriends size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Subscribed To</p>
              <p className="text-2xl font-bold text-white">
                {profile?.subscribedToCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
              <FaVideo size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Videos</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area Placeholder */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Videos</h2>
        <div className="bg-dark-card rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
          <FaVideo size={48} className="mx-auto mb-4 opacity-20" />
          <p>No videos uploaded yet</p>
          <Button className="mt-4">Upload Video</Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
