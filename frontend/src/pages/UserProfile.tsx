import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import apiClient from "../api/axios";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await apiClient.get("/users/current-user");
        setCurrentUserId(res.data.data._id);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;

      setLoading(true);
      try {
        // Fetch user info and stats
        const userRes = await apiClient.get(`/users/c/${username}`);
        setUser(userRes.data.data);
        setStats(userRes.data.data);

        // Fetch user's posts
        const postsRes = await apiClient.get(
          `/posts/user/${userRes.data.data._id}`
        );
        setPosts(postsRes.data.data.docs || []);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const refreshPosts = async () => {
    if (!user) return;
    try {
      const postsRes = await apiClient.get(`/posts/user/${user._id}`);
      setPosts(postsRes.data.data.docs || []);
    } catch (error) {
      console.error("Failed to refresh posts", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-card rounded-2xl border border-slate-800 p-12 text-center">
          <p className="text-slate-400 text-lg">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-dark-card rounded-2xl border border-slate-800 overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-primary to-purple-500 relative">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6 -mt-16 relative">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-dark-card bg-slate-700 overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                  {user.fullName[0]}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-white">{user.fullName}</h1>
              <p className="text-slate-400">@{user.username}</p>
              {user.email && (
                <p className="text-sm text-slate-500 mt-1">{user.email}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {stats?.subscribersCount || 0}
              </p>
              <p className="text-sm text-slate-400">Followers</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-500">
                {stats?.channelsSubscribedToCount || 0}
              </p>
              <p className="text-sm text-slate-400">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <div className="bg-dark-card rounded-2xl border border-slate-800 p-12 text-center">
            <p className="text-slate-400">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={refreshPosts}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
