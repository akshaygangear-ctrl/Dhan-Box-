import React, { useState, useEffect } from "react";
import { User } from "./types";
import { Header } from "./components/Header";
import { BonusModal } from "./components/BonusModal";
import { DailyCheckin } from "./components/DailyCheckin";
import { SpinWheel } from "./components/SpinWheel";
import { ScratchCard } from "./components/ScratchCard";
import { PublicDibba } from "./components/PublicDibba";
import { AiQuiz } from "./components/AiQuiz";
import { WithdrawModal } from "./components/WithdrawModal";
import { Leaderboard } from "./components/Leaderboard";
import { PrivacySettingsModal } from "./components/PrivacySettingsModal";
import { TasksHub } from "./components/TasksHub";
import { Home, Package, Brain, Zap, Trophy, Wallet, Sparkles, Gift, ArrowUpRight, History } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"HOME" | "DIBBA" | "QUIZ" | "TASKS" | "LEADERBOARD">("HOME");
  
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Initialize or login user on app launch
  useEffect(() => {
    initUser();
  }, []);

  const initUser = async () => {
    let savedUserId = localStorage.getItem("dhanbox_userId");
    let savedName = localStorage.getItem("dhanbox_userName") || "Rahul Kumar";

    try {
      const res = await fetch("/api/user/login-or-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUserId || undefined,
          name: savedName,
          avatar: "🧑‍💼",
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("dhanbox_userId", data.user.id);
        
        // If brand new login, show Bonus Modal!
        if (!savedUserId) {
          setShowBonusModal(true);
        }
      }
    } catch (e) {
      console.error("User initialization failed", e);
    }
  };

  const handleUpdatePrivacy = async (updatedProps: { name: string; isNamePublic: boolean; isDibbaPublic: boolean }) => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/update-privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...updatedProps,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("dhanbox_userName", updatedProps.name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBonusClaimClose = (props: { name: string; isNamePublic: boolean; isDibbaPublic: boolean }) => {
    setShowBonusModal(false);
    handleUpdatePrivacy(props);
  };

  const handleRewardUpdate = (rewardAmount: number, newBalance: number) => {
    if (!user) return;
    setUser({
      ...user,
      balance: newBalance,
      totalEarned: user.totalEarned + rewardAmount,
    });
  };

  const handleCheckinSuccess = (rewardAmount: number, newStreak: number, newBalance: number) => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    setUser({
      ...user,
      balance: newBalance,
      dailyStreak: newStreak,
      lastCheckinDate: today,
      totalEarned: user.totalEarned + rewardAmount,
    });
  };

  const handleWithdrawSuccess = (withdrawAmount: number, upiId: string, updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-2xl animate-bounce mb-3 border-2 border-amber-200">
          ₹
        </div>
        <h1 className="text-2xl font-black text-amber-300">DhanBox Loading...</h1>
        <p className="text-xs text-emerald-200 mt-1">₹200 Welcome Bonus Load Ho Raha Hai...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex justify-center selection:bg-amber-400 selection:text-emerald-950">
      {/* Phone App Container Wrapper */}
      <div className="w-full max-w-md bg-slate-950 min-h-screen flex flex-col relative shadow-2xl border-x border-slate-800 pb-20">
        
        {/* Top Header Bar */}
        <Header
          user={user}
          onOpenSettings={() => setShowPrivacyModal(true)}
          onOpenWithdraw={() => setShowWithdrawModal(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-3.5 space-y-3 overflow-y-auto">
          
          {/* Top Quick Status Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 border border-emerald-600/50 rounded-3xl p-4 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-200 font-bold bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-700/50 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>₹200 Signup Gift Credited</span>
              </span>
              <button
                id="open-withdraw-banner-btn"
                onClick={() => setShowWithdrawModal(true)}
                className="text-xs font-black text-amber-300 underline flex items-center space-x-0.5 hover:text-amber-200 cursor-pointer"
              >
                <span>Withdraw</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-emerald-200/90">Total Wallet Balance</p>
                <div className="text-3xl font-black text-amber-300 tracking-tight flex items-center space-x-1">
                  <span>₹{user.balance}.00</span>
                </div>
              </div>

              <button
                id="quick-withdraw-btn"
                onClick={() => setShowWithdrawModal(true)}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-emerald-950 font-black py-2 px-3.5 rounded-xl shadow-lg text-xs flex items-center space-x-1 cursor-pointer transition active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5 fill-emerald-950" />
                <span>UPI Withdraw</span>
              </button>
            </div>
          </div>

          {/* Active Tab View */}
          {activeTab === "HOME" && (
            <div className="space-y-3 animate-fadeIn">
              {/* Daily Check-In Attendance */}
              <DailyCheckin user={user} onCheckinSuccess={handleCheckinSuccess} />

              {/* Lucky Spin Wheel */}
              <SpinWheel user={user} onSpinSuccess={handleRewardUpdate} />

              {/* Magic Scratch Card */}
              <ScratchCard user={user} onScratchSuccess={handleRewardUpdate} />

              {/* Transaction Ledger */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-800/50 rounded-3xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-extrabold text-sm">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>Recent Earning Ledger</span>
                  </div>
                  <span className="text-[10px] text-emerald-300">Live History</span>
                </div>

                <div className="space-y-2">
                  {user.transactions.slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/80 border border-emerald-900/60"
                    >
                      <div>
                        <span className="font-bold text-white block">{tx.title}</span>
                        <span className="text-[10px] text-gray-400">{tx.timestamp}</span>
                      </div>
                      <span className={`font-black ${tx.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {tx.amount > 0 ? `+₹${tx.amount}` : `₹${tx.amount}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Public Dibba Wall Tab */}
          {activeTab === "DIBBA" && (
            <div className="animate-fadeIn">
              <PublicDibba user={user} onOpenPrivacySettings={() => setShowPrivacyModal(true)} />
            </div>
          )}

          {/* AI Knowledge Quiz Tab */}
          {activeTab === "QUIZ" && (
            <div className="animate-fadeIn">
              <AiQuiz user={user} onQuizSuccess={handleRewardUpdate} />
            </div>
          )}

          {/* Micro Tasks & Referral Hub Tab */}
          {activeTab === "TASKS" && (
            <div className="animate-fadeIn">
              <TasksHub user={user} onTaskReward={handleRewardUpdate} />
            </div>
          )}

          {/* Public Earner Leaderboard Tab */}
          {activeTab === "LEADERBOARD" && (
            <div className="animate-fadeIn">
              <Leaderboard user={user} />
            </div>
          )}

        </main>

        {/* Bottom App Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-emerald-950/95 border-t border-emerald-700/60 backdrop-blur-md z-40 px-2 py-1.5">
          <div className="flex items-center justify-around text-[10px] font-bold">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab("HOME")}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
                activeTab === "HOME"
                  ? "text-amber-300 bg-emerald-900/80 border border-emerald-600/50"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Ghar (Home)</span>
            </button>

            <button
              id="nav-tab-dibba"
              onClick={() => setActiveTab("DIBBA")}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition cursor-pointer relative ${
                activeTab === "DIBBA"
                  ? "text-amber-300 bg-emerald-900/80 border border-emerald-600/50"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              <Package className="w-5 h-5 mb-0.5" />
              <span>Public Dibba</span>
              <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </button>

            <button
              id="nav-tab-quiz"
              onClick={() => setActiveTab("QUIZ")}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
                activeTab === "QUIZ"
                  ? "text-amber-300 bg-emerald-900/80 border border-emerald-600/50"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              <Brain className="w-5 h-5 mb-0.5" />
              <span>AI Quiz</span>
            </button>

            <button
              id="nav-tab-tasks"
              onClick={() => setActiveTab("TASKS")}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
                activeTab === "TASKS"
                  ? "text-amber-300 bg-emerald-900/80 border border-emerald-600/50"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              <Zap className="w-5 h-5 mb-0.5" />
              <span>Tasks & Gift</span>
            </button>

            <button
              id="nav-tab-leaderboard"
              onClick={() => setActiveTab("LEADERBOARD")}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition cursor-pointer ${
                activeTab === "LEADERBOARD"
                  ? "text-amber-300 bg-emerald-900/80 border border-emerald-600/50"
                  : "text-emerald-200/70 hover:text-white"
              }`}
            >
              <Trophy className="w-5 h-5 mb-0.5" />
              <span>Top Earner</span>
            </button>
          </div>
        </nav>

        {/* Modals */}
        {showBonusModal && (
          <BonusModal user={user} onClose={handleBonusClaimClose} />
        )}

        {showWithdrawModal && (
          <WithdrawModal
            user={user}
            onClose={() => setShowWithdrawModal(false)}
            onWithdrawSuccess={handleWithdrawSuccess}
          />
        )}

        {showPrivacyModal && (
          <PrivacySettingsModal
            user={user}
            onClose={() => setShowPrivacyModal(false)}
            onSave={handleUpdatePrivacy}
          />
        )}

      </div>
    </div>
  );
}
