import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Trophy, Crown, Globe, Users, Share2, Sparkles, Award } from "lucide-react";

interface LeaderboardProps {
  user: User;
}

interface Leader {
  name: string;
  avatar: string;
  totalEarned: number;
  referralCount?: number;
  isDibbaPublic: boolean;
  rankTitle: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"EARNERS" | "REFERRERS">("EARNERS");
  const [topEarners, setTopEarners] = useState<Leader[]>([]);
  const [topReferrers, setTopReferrers] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.success) {
        setTopEarners(data.topEarners || data.leaders || []);
        setTopReferrers(data.topReferrers || []);
      }
    } catch (e) {
      console.error("Leaderboard fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const currentLeaders = activeTab === "EARNERS" ? topEarners : topReferrers;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl mb-4 text-zinc-100">
      {/* Header Title */}
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-50">
            Public Leaderboards
          </h3>
        </div>
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center space-x-1">
          <Globe className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>LIVE RANKINGS</span>
        </span>
      </div>

      {/* Leaderboard Category Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => setActiveTab("EARNERS")}
          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center space-x-2 ${
            activeTab === "EARNERS"
              ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black"
              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeTab === "EARNERS" ? "bg-zinc-950/20" : "bg-zinc-800"}`}>
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider leading-none font-black">
              Top Earners
            </div>
            <div className={`text-[9px] mt-0.5 ${activeTab === "EARNERS" ? "text-zinc-900 font-bold" : "text-zinc-500"}`}>
              Dhan Raja Champions
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("REFERRERS")}
          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center space-x-2 ${
            activeTab === "REFERRERS"
              ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black"
              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeTab === "REFERRERS" ? "bg-zinc-950/20" : "bg-zinc-800"}`}>
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider leading-none font-black">
              Top Referrers
            </div>
            <div className={`text-[9px] mt-0.5 ${activeTab === "REFERRERS" ? "text-zinc-900 font-bold" : "text-zinc-500"}`}>
              Invite Champions
            </div>
          </div>
        </button>
      </div>

      {/* User's Own Ranking Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-base">{user.avatar || "👤"}</span>
          <div>
            <span className="font-extrabold text-zinc-100 block text-[11px]">
              Aapki Profile ({user.name})
            </span>
            <span className="text-[10px] text-zinc-400">
              {activeTab === "EARNERS" ? `Total Earned: ₹${user.totalEarned}` : `Successful Invites: ${user.referralCount || 0} Friends`}
            </span>
          </div>
        </div>
        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
          {activeTab === "EARNERS" ? (user.totalEarned > 1000 ? "👑 Dhan Raja" : "⚡ Active Earner") : (`${user.referralCount || 0} Invites`)}
        </span>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-6 text-xs text-zinc-500 animate-pulse">
            Loading public live leaderboard...
          </div>
        ) : (
          currentLeaders.map((leader, index) => {
            const rank = index + 1;
            let rankBadge = `${rank}`;
            let rankBg = "bg-zinc-900 text-zinc-400 border-zinc-800";

            if (rank === 1) {
              rankBadge = "🥇";
              rankBg = "bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md";
            } else if (rank === 2) {
              rankBadge = "🥈";
              rankBg = "bg-zinc-300 text-zinc-950 font-black border-zinc-200";
            } else if (rank === 3) {
              rankBadge = "🥉";
              rankBg = "bg-amber-700 text-white font-black border-amber-600";
            }

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  rank === 1
                    ? "bg-amber-500/10 border-amber-500/40"
                    : "bg-zinc-900/60 border-zinc-800"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${rankBg}`}>
                    {rankBadge}
                  </div>
                  <span className="text-base shrink-0">{leader.avatar || "👤"}</span>
                  <div>
                    <div className="font-extrabold text-xs text-zinc-100 flex items-center space-x-1">
                      <span>{leader.name}</span>
                      {rank === 1 && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    </div>
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider">
                      {leader.rankTitle}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {activeTab === "EARNERS" ? (
                    <>
                      <span className="font-black text-xs text-amber-500 block">
                        ₹{leader.totalEarned}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase">
                        {leader.referralCount ? `${leader.referralCount} Invites` : "Cash Earned"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-black text-xs text-amber-500 block">
                        {leader.referralCount || 0} Invites
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase">
                        +₹{(leader.referralCount || 0) * 50} Referral Cash
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
