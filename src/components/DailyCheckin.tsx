import React, { useState } from "react";
import { User } from "../types";
import { Calendar, CheckCircle, Sparkles, Flame } from "lucide-react";
import confetti from "canvas-confetti";

interface DailyCheckinProps {
  user: User;
  onCheckinSuccess: (reward: number, newStreak: number, newBalance: number) => void;
}

export const DailyCheckin: React.FC<DailyCheckinProps> = ({ user, onCheckinSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const days = [
    { day: 1, reward: 20 },
    { day: 2, reward: 30 },
    { day: 3, reward: 40 },
    { day: 4, reward: 50 },
    { day: 5, reward: 75 },
    { day: 6, reward: 100 },
    { day: 7, reward: 150 },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const isAlreadyCheckedIn = user.lastCheckinDate === todayStr;

  const handleCheckin = async () => {
    if (isAlreadyCheckedIn) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/earn/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();

      if (data.success) {
        try {
          confetti({
            particleCount: 60,
            spread: 50,
            origin: { y: 0.7 },
          });
        } catch (e) {}

        onCheckinSuccess(data.rewardAmount, data.newStreak, data.newBalance);
      } else {
        setErrorMsg(data.message || "Attendance check-in failed");
      }
    } catch (e) {
      setErrorMsg("Network error during check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900 border border-emerald-700/60 rounded-3xl p-4 shadow-xl mb-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Rozana Attendance Bonus</h3>
            <p className="text-xs text-emerald-200/80">Har din app kholein aur cash reward paayein</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-400/30">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span>{user.dailyStreak} Din Streak</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs p-2 rounded-xl mb-3 text-center">
          {errorMsg}
        </div>
      )}

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {days.map((item) => {
          const isCompleted = user.dailyStreak > item.day || (user.dailyStreak === item.day && isAlreadyCheckedIn);
          const isCurrentActive = user.dailyStreak === item.day && !isAlreadyCheckedIn;

          return (
            <div
              key={item.day}
              className={`rounded-2xl p-2 text-center flex flex-col items-center justify-between transition border ${
                isCompleted
                  ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 opacity-85"
                  : isCurrentActive
                  ? "bg-gradient-to-b from-amber-400 to-yellow-500 text-emerald-950 border-2 border-white shadow-lg animate-pulse"
                  : "bg-slate-900/80 border-emerald-800/40 text-gray-300"
              }`}
            >
              <span className={`text-[10px] font-bold ${isCurrentActive ? "text-emerald-950" : "text-emerald-200"}`}>
                Day {item.day}
              </span>
              <span className="font-extrabold text-xs my-0.5">
                ₹{item.reward}
              </span>
              {isCompleted ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
              ) : (
                <span className={`text-[9px] font-bold ${isCurrentActive ? "text-emerald-950" : "text-amber-400"}`}>
                  +{item.reward}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Check-In Button */}
      <button
        id="daily-checkin-claim-btn"
        onClick={handleCheckin}
        disabled={isAlreadyCheckedIn || loading}
        className={`w-full py-2.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition shadow-lg cursor-pointer ${
          isAlreadyCheckedIn
            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-700/40 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-emerald-950 active:scale-98"
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>
          {loading
            ? "Processing..."
            : isAlreadyCheckedIn
            ? "Aaj Ka Bonus Pehle Hi Claim Ho Gaya (Kal Aayein)"
            : `Day ${user.dailyStreak} Attendance Claim Karein (Instant ₹${days[Math.min(user.dailyStreak - 1, 6)].reward})`}
        </span>
      </button>
    </div>
  );
};
