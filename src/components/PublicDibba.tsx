import React, { useState, useEffect } from "react";
import { User, DibbaPost } from "../types";
import { MessageSquare, Send, Globe, Heart, ShieldCheck, Sparkles, UserCheck, Flame, ExternalLink } from "lucide-react";

interface PublicDibbaProps {
  user: User;
  onOpenPrivacySettings: () => void;
}

export const PublicDibba: React.FC<PublicDibbaProps> = ({ user, onOpenPrivacySettings }) => {
  const [posts, setPosts] = useState<DibbaPost[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "EARNINGS" | "WITHDRAWALS">("ALL");
  const [sending, setSending] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/dibba/posts");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error("Error fetching dibba posts", e);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 8000); // Live sync every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/dibba/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          message: newMessage.trim(),
          tag: "SHOUTOUT",
          amountEarned: user.totalEarned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("/api/dibba/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: data.likes } : p))
        );
      }
    } catch (e) {}
  };

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "EARNINGS") return p.tag === "EARNING_PROOF";
    if (activeTab === "WITHDRAWALS") return p.tag === "WITHDRAWAL";
    return true;
  });

  return (
    <div className="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border border-emerald-700/60 rounded-3xl p-4 shadow-2xl mb-4 text-white">
      {/* Dibba Header */}
      <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md border border-amber-200">
            📦
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-black text-lg text-amber-300 tracking-tight">Public Dibba Wall</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>LIVE FEED</span>
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">Sabka Naam & Public Dibba Activity Feed</p>
          </div>
        </div>

        <button
          id="dibba-privacy-settings-shortcut"
          onClick={onOpenPrivacySettings}
          className="text-xs bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 px-3 py-1.5 rounded-xl border border-emerald-600/50 flex items-center space-x-1 transition cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Public Privacy</span>
        </button>
      </div>

      {/* User Public Status Banner */}
      <div className="bg-emerald-900/40 rounded-2xl p-2.5 mb-3 border border-emerald-700/40 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-base">{user.avatar || "👤"}</span>
          <div>
            <span className="font-bold text-white">
              {user.isNamePublic ? user.name : "Anonymous User"}
            </span>
            <div className="text-[10px] text-emerald-300 flex items-center space-x-2">
              <span>Naam: {user.isNamePublic ? "✅ Public" : "🔒 Private"}</span>
              <span>•</span>
              <span>Dibba: {user.isDibbaPublic ? "✅ Public" : "🔒 Private"}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onOpenPrivacySettings}
          className="text-[11px] text-amber-300 underline font-medium hover:text-amber-200 cursor-pointer"
        >
          Change
        </button>
      </div>

      {/* Dibba Post Input Form */}
      <form onSubmit={handlePostSubmit} className="mb-4">
        <div className="relative">
          <input
            id="dibba-post-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Public Dibba me message ya payout proof post karein..."
            className="w-full bg-slate-900 border border-emerald-600/60 rounded-2xl py-3 pl-3.5 pr-12 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
          />
          <button
            id="dibba-post-send-btn"
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-emerald-950 flex items-center justify-center font-bold disabled:opacity-50 hover:brightness-110 transition cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-3 text-xs">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === "ALL"
              ? "bg-amber-400 text-emerald-950"
              : "bg-slate-900 text-emerald-200 hover:bg-emerald-900/60"
          }`}
        >
          Sabhi Post ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("EARNINGS")}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === "EARNINGS"
              ? "bg-amber-400 text-emerald-950"
              : "bg-slate-900 text-emerald-200 hover:bg-emerald-900/60"
          }`}
        >
          💰 Proofs
        </button>
        <button
          onClick={() => setActiveTab("WITHDRAWALS")}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === "WITHDRAWALS"
              ? "bg-amber-400 text-emerald-950"
              : "bg-slate-900 text-emerald-200 hover:bg-emerald-900/60"
          }`}
        >
          🚀 Withdrawals
        </button>
      </div>

      {/* Posts List Container */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className={`p-3 rounded-2xl border transition ${
              post.isSystem
                ? "bg-amber-500/10 border-amber-400/40"
                : post.tag === "WITHDRAWAL"
                ? "bg-emerald-950/90 border-emerald-500/50"
                : "bg-slate-900/80 border-emerald-800/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{post.userAvatar || "👤"}</span>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-white">
                      {post.userName}
                    </span>
                    {post.tag === "WITHDRAWAL" && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                        UPI VERIFIED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{post.timestamp}</span>
                </div>
              </div>

              {post.amountEarned && (
                <div className="text-right">
                  <span className="text-xs font-black text-amber-300 block">
                    +₹{post.amountEarned}
                  </span>
                  <span className="text-[9px] text-emerald-300">Public Dibba Earn</span>
                </div>
              )}
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed my-1">
              {post.message}
            </p>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 mt-1 border-t border-white/5">
              <span className="text-[10px] text-emerald-300/70">
                Dibba Box • Public
              </span>
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-1 text-rose-300 hover:text-rose-200 transition cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500/40 stroke-rose-400" />
                <span>{post.likes} Likes</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
