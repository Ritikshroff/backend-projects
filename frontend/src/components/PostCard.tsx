import { useState, useRef, useEffect } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaEllipsisH,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import apiClient from "../api/axios";
import Lightbox from "./Lightbox";

interface Post {
  _id: string;
  content: string;
  images?: string[];
  owner: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
  currentUserId?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onUpdate,
  currentUserId,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId === post.owner._id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = async () => {
    try {
      const res = await apiClient.post(`/posts/${post._id}/like`);
      const isLiked = res.data.data.liked;
      setLiked(isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to like post", error);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    setLoadingComments(true);
    try {
      const res = await apiClient.get(`/posts/${post._id}/comments`);
      setComments(res.data.data.docs || []);
      setShowComments(true);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await apiClient.post(`/posts/${post._id}/comments`, {
        content: commentText,
      });
      setComments([res.data.data, ...comments]);
      setCommentText("");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleEdit = async () => {
    try {
      await apiClient.patch(`/posts/${post._id}`, { content: editContent });
      setShowEditModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to edit post", error);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/posts/${post._id}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="bg-dark-card rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.owner.username}`}>
            <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              {post.owner.avatar ? (
                <img
                  src={post.owner.avatar}
                  alt={post.owner.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                  {post.owner.fullName[0]}
                </div>
              )}
            </div>
          </Link>
          <div>
            <Link
              to={`/profile/${post.owner.username}`}
              className="hover:underline"
            >
              <h3 className="font-semibold text-white">
                {post.owner.fullName}
              </h3>
            </Link>
            <Link
              to={`/profile/${post.owner.username}`}
              className="hover:underline"
            >
              <p className="text-sm text-slate-400">
                @{post.owner.username} · {formatTime(post.createdAt)}
              </p>
            </Link>
          </div>
        </div>
        {isOwner && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FaEllipsisH className="text-slate-400" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-slate-700 rounded-xl shadow-xl z-10">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <FaEdit /> Edit Post
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <FaTrash /> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-slate-200 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div
          className={`grid gap-2 mb-4 ${
            post.images.length === 1
              ? "grid-cols-1"
              : post.images.length === 2
                ? "grid-cols-2"
                : post.images.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
          }`}
        >
          {post.images.map((img, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden bg-slate-800 aspect-video cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={img}
                alt={`Post image ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-800">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors group"
        >
          {liked ? (
            <FaHeart className="text-red-500 animate-pulse" size={20} />
          ) : (
            <FaRegHeart
              className="group-hover:scale-110 transition-transform"
              size={20}
            />
          )}
          <span className="font-medium">{likeCount}</span>
        </button>
        <button
          onClick={loadComments}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group"
        >
          <FaComment
            className="group-hover:scale-110 transition-transform"
            size={20}
          />
          <span className="font-medium">{post.comments}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-dark border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors"
            >
              Post
            </button>
          </form>

          {loadingComments ? (
            <div className="text-center py-4 text-slate-400">
              Loading comments...
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {comment.owner?.avatar ? (
                      <img
                        src={comment.owner.avatar}
                        alt={comment.owner.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                        {comment.owner?.fullName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded-xl p-3">
                    <p className="text-sm font-medium text-white">
                      {comment.owner?.fullName}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-dark-card rounded-2xl p-6 max-w-lg w-full mx-4 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Edit Post</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-dark border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-dark-card rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2">Delete Post?</h3>
            <p className="text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && post.images && (
        <Lightbox
          images={post.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((lightboxIndex + 1) % post.images!.length)
          }
          onPrev={() =>
            setLightboxIndex(
              (lightboxIndex - 1 + post.images!.length) % post.images!.length
            )
          }
        />
      )}
    </div>
  );
};

export default PostCard;
