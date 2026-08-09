import React, { useState, useEffect } from "react";
import { User, EarnTask } from "../types";
import {
  CheckCircle2,
  Gift,
  Zap,
  Lock,
  Trophy,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  ArrowRight,
  X,
  Info,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TasksHubProps {
  user: User;
  onTaskReward: (rewardAmount: number, newBalance: number) => void;
}

interface LevelMilestone {
  level: number;
  name: "Bronze Starter" | "Silver Earner" | "Gold VIP" | "Diamond Legend";
  icon: string;
  minActions: number;
  maxTaskReward: number;
  badgeBg: string;
  borderColor: string;
  textColor: string;
}

const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    level: 1,
    name: "Bronze Starter",
    icon: "🥉",
    minActions: 0,
    maxTaskReward: 60,
    badgeBg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-500",
  },
  {
    level: 2,
    name: "Silver Earner",
    icon: "🥈",
    minActions: 2,
    maxTaskReward: 120,
    badgeBg: "bg-zinc-400/10",
    borderColor: "border-zinc-400/30",
    textColor: "text-zinc-300",
  },
  {
    level: 3,
    name: "Gold VIP",
    icon: "🥇",
    minActions: 5,
    maxTaskReward: 250,
    badgeBg: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
  },
  {
    level: 4,
    name: "Diamond Legend",
    icon: "💎",
    minActions: 8,
    maxTaskReward: 500,
    badgeBg: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-400",
  },
];

const INITIAL_TASKS: EarnTask[] = [
  // LEVEL 1: Bronze Starter (0 actions needed)
  {
    id: "task-1",
    title: "DhanBox Telegram Channel Join",
    description: "Official channel par daily promo codes aur updates paayein",
    reward: 30,
    icon: "📢",
    completed: false,
    type: "TELEGRAM",
    levelRequired: 1,
    minActionsRequired: 0,
    tierName: "Bronze Starter",
  },
  {
    id: "task-2",
    title: "Sponsor Video Ad Dekhein (30 sec)",
    description: "30-second sponsor reel dekh kar instant ₹40 kamayein",
    reward: 40,
    icon: "🎥",
    completed: false,
    type: "VIDEO",
    levelRequired: 1,
    minActionsRequired: 0,
    tierName: "Bronze Starter",
  },
  {
    id: "task-3",
    title: "Instant Opinion Survey",
    description: "Quick 2-minute survey answer karke bonus unlocked karein",
    reward: 60,
    icon: "📝",
    completed: false,
    type: "SURVEY",
    levelRequired: 1,
    minActionsRequired: 0,
    tierName: "Bronze Starter",
  },

  // LEVEL 2: Silver Earner (2 actions needed)
  {
    id: "task-4",
    title: "Download Sponsor Partner App",
    description: "Partner app install karein aur 1 minute explore karein",
    reward: 120,
    icon: "📱",
    completed: false,
    type: "APP_DOWNLOAD",
    levelRequired: 2,
    minActionsRequired: 2,
    tierName: "Silver Earner",
  },
  {
    id: "task-5",
    title: "Follow DhanBox on Twitter / X",
    description: "Follow karein aur pinned tweet ko retweet karein",
    reward: 80,
    icon: "🐦",
    completed: false,
    type: "SOCIAL",
    levelRequired: 2,
    minActionsRequired: 2,
    tierName: "Silver Earner",
  },
  {
    id: "task-6",
    title: "WhatsApp Earning Proof Share",
    description: "DhanBox earning screenshot apne dosto ke sath share karein",
    reward: 100,
    icon: "💬",
    completed: false,
    type: "SOCIAL",
    levelRequired: 2,
    minActionsRequired: 2,
    tierName: "Silver Earner",
  },

  // LEVEL 3: Gold VIP (5 actions needed)
  {
    id: "task-7",
    title: "Financial Literacy Quiz & Feedback",
    description: "Basic savings & investment quiz solve karke ₹180 kamayein",
    reward: 180,
    icon: "📊",
    completed: false,
    type: "FINANCIAL",
    levelRequired: 3,
    minActionsRequired: 5,
    tierName: "Gold VIP",
  },
  {
    id: "task-8",
    title: "Try Pro Trader Demo Platform",
    description: "Free paper trading demo account sign up & test karein",
    reward: 250,
    icon: "📈",
    completed: false,
    type: "FINANCIAL",
    levelRequired: 3,
    minActionsRequired: 5,
    tierName: "Gold VIP",
  },
  {
    id: "task-9",
    title: "Public Dibba Verified Review",
    description: "DhanBox ke bare me Public Dibba par high quality review post karein",
    reward: 200,
    icon: "⭐",
    completed: false,
    type: "SURVEY",
    levelRequired: 3,
    minActionsRequired: 5,
    tierName: "Gold VIP",
  },

  // LEVEL 4: Diamond Legend (8 actions needed)
  {
    id: "task-10",
    title: "High Yield Sponsor Bounty Task",
    description: "Premium partner survey complete karke maximum cash earn karein",
    reward: 350,
    icon: "👑",
    completed: false,
    type: "SPONSOR",
    levelRequired: 4,
    minActionsRequired: 8,
    tierName: "Diamond Legend",
  },
  {
    id: "task-11",
    title: "DhanBox Official Ambassador Challenge",
    description: "Official brand ambassador form fill karke VIP bounty claim karein",
    reward: 500,
    icon: "💎",
    completed: false,
    type: "FINANCIAL",
    levelRequired: 4,
    minActionsRequired: 8,
    tierName: "Diamond Legend",
  },
];

export const TasksHub: React.FC<TasksHubProps> = ({ user, onTaskReward }) => {
  const [refInput, setRefInput] = useState("");
  const [refMsg, setRefMsg] = useState("");
  const [loadingRef, setLoadingRef] = useState(false);

  // Active level tab filter: 0 = ALL, 1 = Bronze, 2 = Silver, 3 = Gold, 4 = Diamond
  const [selectedLevelTab, setSelectedLevelTab] = useState<number>(0);

  // Level Up Modal state
  const [unlockedMilestone, setUnlockedMilestone] = useState<LevelMilestone | null>(null);
  const [showLevelRules, setShowLevelRules] = useState(false);

  // Load completed tasks state from localStorage
  const [tasks, setTasks] = useState<EarnTask[]>(() => {
    try {
      const saved = localStorage.getItem("dhanbox_completed_tasks_v2");
      if (saved) {
        const completedIds: string[] = JSON.parse(saved);
        return INITIAL_TASKS.map((t) => ({
          ...t,
          completed: completedIds.includes(t.id),
        }));
      }
    } catch (e) {}
    return INITIAL_TASKS;
  });

  // Calculate completed actions
  const completedActionsCount = tasks.filter((t) => t.completed).length;

  // Determine current user level milestone
  const currentLevelMilestone =
    LEVEL_MILESTONES.slice().reverse().find((m) => completedActionsCount >= m.minActions) ||
    LEVEL_MILESTONES[0];

  // Save tasks to localStorage when state changes
  useEffect(() => {
    try {
      const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
      localStorage.setItem("dhanbox_completed_tasks_v2", JSON.stringify(completedIds));
    } catch (e) {}
  }, [tasks]);

  // Apply Referral Code Handler
  const handleApplyReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim() || loadingRef) return;
    setLoadingRef(true);
    setRefMsg("");

    try {
      const res = await fetch("/api/earn/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, refCode: refInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setRefMsg(`🎉 Success! Referral code apply ho gaya! ₹${data.bonus} Wallet me credited!`);
        try {
          confetti({ particleCount: 50 });
        } catch (e) {}
        onTaskReward(data.bonus, data.newBalance);
        setRefInput("");
      } else {
        setRefMsg(data.message || "Invalid referral code");
      }
    } catch (e) {
      setRefMsg("Request failed");
    } finally {
      setLoadingRef(false);
    }
  };

  // Complete task handler
  const handleCompleteTask = async (task: EarnTask) => {
    if (task.completed) return;

    // Check if task is locked
    if (completedActionsCount < task.minActionsRequired) {
      alert(`Pehle ${task.minActionsRequired - completedActionsCount} aur basic tasks complete karein!`);
      return;
    }

    const previousActions = completedActionsCount;
    const newActions = previousActions + 1;

    // Update state
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
    );

    // Check if new actions count unlocks a higher milestone level
    const newUnlockedLevel = LEVEL_MILESTONES.find((m) => m.minActions === newActions && m.level > 1);
    if (newUnlockedLevel) {
      setUnlockedMilestone(newUnlockedLevel);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } else {
      try {
        confetti({ particleCount: 40 });
      } catch (e) {}
    }

    // Call backend endpoint to award cash balance
    try {
      const res = await fetch("/api/earn/quiz-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, reward: task.reward, questionId: task.id }),
      });
      const data = await res.json();
      if (data.success) {
        onTaskReward(task.reward, data.newBalance);
      }
    } catch (e) {
      console.error("Task reward API error:", e);
    }
  };

  // Filter tasks based on selected tab
  const filteredTasks = selectedLevelTab === 0
    ? tasks
    : tasks.filter((t) => t.levelRequired === selectedLevelTab);

  // Next level milestone target
  const nextMilestone = LEVEL_MILESTONES.find((m) => m.minActions > completedActionsCount);
  const actionsNeededForNext = nextMilestone ? nextMilestone.minActions - completedActionsCount : 0;
  
  // Calculate progress percentage to next milestone
  const currentLevelMin = currentLevelMilestone.minActions;
  const nextLevelMin = nextMilestone ? nextMilestone.minActions : completedActionsCount;
  const progressPercent = nextMilestone
    ? Math.min(100, Math.round(((completedActionsCount - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100))
    : 100;

  return (
    <div className="space-y-3 text-zinc-100">
      {/* GAMIFIED LEVEL & MILESTONE PROGRESSION BANNER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        {/* Background Subtle Amber Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{currentLevelMilestone.icon}</span>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider block">
                  LEVEL {currentLevelMilestone.level} MILESTONE
                </span>
                <h2 className="text-base font-black uppercase text-zinc-50 tracking-tight flex items-center space-x-1.5">
                  <span>{currentLevelMilestone.name}</span>
                  <span className="text-xs font-bold text-zinc-400">
                    ({completedActionsCount} Actions)
                  </span>
                </h2>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLevelRules(true)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition border border-zinc-800 text-xs font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] uppercase">Level Rules</span>
          </button>
        </div>

        {/* Milestone Tracker Nodes */}
        <div className="grid grid-cols-4 gap-1.5 mb-3.5">
          {LEVEL_MILESTONES.map((m) => {
            const isUnlocked = completedActionsCount >= m.minActions;
            const isCurrent = currentLevelMilestone.level === m.level;

            return (
              <div
                key={m.level}
                onClick={() => setSelectedLevelTab(m.level)}
                className={`p-2 rounded-xl border text-center transition cursor-pointer relative ${
                  isCurrent
                    ? "bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : isUnlocked
                    ? "bg-zinc-900/80 border-zinc-700"
                    : "bg-zinc-900/40 border-zinc-800/80 opacity-60"
                }`}
              >
                <div className="text-base mb-0.5">{m.icon}</div>
                <div className="text-[10px] font-black uppercase tracking-tight text-zinc-200 truncate">
                  L{m.level} {m.name.split(" ")[0]}
                </div>
                <div className="text-[9px] font-bold text-zinc-400">
                  {isUnlocked ? (
                    <span className="text-green-400 flex items-center justify-center space-x-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>OPEN</span>
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center justify-center space-x-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{m.minActions} Act</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Progress Bar towards Next Milestone */}
        {nextMilestone ? (
          <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400 font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Next Milestone: {nextMilestone.name}</span>
              </span>
              <span className="font-black text-amber-500 text-xs">
                {completedActionsCount} / {nextMilestone.minActions} Actions ({progressPercent}%)
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800 p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-zinc-400 font-medium mt-1.5 flex items-center justify-between">
              <span>
                🔒 Complete <strong className="text-amber-500 font-black">{actionsNeededForNext}</strong> more task{actionsNeededForNext > 1 ? "s" : ""} to unlock higher-paying tasks up to <strong className="text-zinc-100 font-bold">₹{nextMilestone.maxTaskReward}</strong>!
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/10 rounded-xl p-2.5 border border-amber-500/30 text-center">
            <div className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center justify-center space-x-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>MAX LEVEL REACHED! DIAMOND LEGEND UNLOCKED</span>
            </div>
            <p className="text-[10px] text-zinc-300 font-medium mt-0.5">
              Aap sabhi highest-paying ₹500 bounty tasks claim karne ke liye eligible hain!
            </p>
          </div>
        )}
      </div>

      {/* REFERRAL GIFT CODE SECTION */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center space-x-2 mb-1">
          <Gift className="w-4 h-4 text-amber-500" />
          <h3 className="font-black text-xs uppercase tracking-wider text-zinc-100">
            FRIENDS REFERRAL GIFT CODE (+₹50 CASH)
          </h3>
        </div>
        <p className="text-[11px] text-zinc-400 font-medium mb-2.5">
          Friend ka referral code enter karein aur instant <strong className="text-amber-500 font-bold">₹50 Cash</strong> wallet me add karein!
        </p>

        {refMsg && (
          <div className="text-xs p-2.5 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-400 mb-2 font-bold">
            {refMsg}
          </div>
        )}

        <form onSubmit={handleApplyReferral} className="flex space-x-2">
          <input
            id="referral-code-input"
            type="text"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value.toUpperCase())}
            placeholder="Enter Code (e.g. DHAN2026)"
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 uppercase font-black tracking-wider"
          />
          <button
            id="apply-referral-btn"
            type="submit"
            disabled={!refInput.trim() || loadingRef}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
          >
            Apply Code
          </button>
        </form>

        <div className="mt-2 text-[10px] text-zinc-400 font-medium flex items-center justify-between">
          <span>Aapka Code: <strong className="text-amber-500 font-bold tracking-widest">{user.referralCode}</strong></span>
          <span>Share & earn ₹50 per friend</span>
        </div>
      </div>

      {/* LEVEL TIER FILTER TABS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-xs uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Task Level Tiers</span>
          </h3>
          <span className="text-[10px] text-zinc-400 font-bold">
            {tasks.filter((t) => t.completed).length} / {tasks.length} Completed
          </span>
        </div>

        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedLevelTab(0)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 border ${
              selectedLevelTab === 0
                ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            All Tasks ({tasks.length})
          </button>

          {LEVEL_MILESTONES.map((m) => {
            const isUnlocked = completedActionsCount >= m.minActions;
            return (
              <button
                key={m.level}
                onClick={() => setSelectedLevelTab(m.level)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 border flex items-center space-x-1 ${
                  selectedLevelTab === m.level
                    ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md"
                    : isUnlocked
                    ? "bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white"
                    : "bg-zinc-900/50 text-zinc-500 border-zinc-800/80"
                }`}
              >
                <span>{m.icon} L{m.level}</span>
                {!isUnlocked && <Lock className="w-3 h-3 text-amber-500 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* TASKS LISTING */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isUnlocked = completedActionsCount >= task.minActionsRequired;
          const actionsRemaining = task.minActionsRequired - completedActionsCount;

          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                task.completed
                  ? "bg-zinc-950/80 border-zinc-800/80 opacity-70"
                  : isUnlocked
                  ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700 shadow-sm"
                  : "bg-zinc-950/90 border-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 pr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      task.completed
                        ? "bg-zinc-900 border border-zinc-800"
                        : isUnlocked
                        ? "bg-zinc-800/80 border border-zinc-700"
                        : "bg-zinc-900/50 border border-zinc-800/60 opacity-60"
                    }`}
                  >
                    {task.icon}
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className="bg-zinc-800 text-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Level {task.levelRequired} • {task.tierName}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-zinc-100">{task.title}</h4>
                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5 leading-tight">
                      {task.description}
                    </p>
                  </div>
                </div>

                {/* Right Action / Reward Button */}
                <div className="shrink-0 text-right">
                  {task.completed ? (
                    <span className="bg-green-500/10 text-green-400 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl flex items-center space-x-1 border border-green-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span>CLAIMED</span>
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                      +₹{task.reward} EARN
                    </button>
                  ) : (
                    <div className="text-right">
                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 font-black px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-wider border border-zinc-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-amber-500" />
                        <span>₹{task.reward}</span>
                      </button>
                      <span className="text-[9px] text-amber-500 font-extrabold uppercase block mt-1">
                        Needs {actionsRemaining} More Act
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Locked Overlay Bar if task is locked */}
              {!isUnlocked && !task.completed && (
                <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center space-x-1 text-amber-500 font-bold">
                    <Lock className="w-3 h-3" />
                    <span>Locked Task • Unlock Level {task.levelRequired} Milestone</span>
                  </span>
                  <button
                    onClick={() => setSelectedLevelTab(currentLevelMilestone.level)}
                    className="text-zinc-300 font-bold underline hover:text-amber-400 cursor-pointer"
                  >
                    Complete L{currentLevelMilestone.level} Tasks
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LEVEL UNLOCKED CELEBRATION MODAL */}
      {unlockedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-950 text-zinc-50 rounded-2xl p-6 max-w-sm w-full border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center relative overflow-hidden">
            <button
              onClick={() => setUnlockedMilestone(null)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-xl border-2 border-amber-400 animate-bounce">
              {unlockedMilestone.icon}
            </div>

            <div className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border border-amber-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW MILESTONE UNLOCKED</span>
            </div>

            <h2 className="text-2xl font-black uppercase text-amber-500 tracking-tight leading-none mb-1">
              LEVEL {unlockedMilestone.level} {unlockedMilestone.name}!
            </h2>

            <p className="text-xs text-zinc-300 font-medium my-3">
              Badhaai ho! Aapne <strong className="text-amber-400">{unlockedMilestone.minActions} actions</strong> complete karke <strong className="text-white">{unlockedMilestone.name}</strong> milestone unlock kar liya hai!
            </p>

            <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 text-left mb-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                Unlocked Higher-Paying Task Rewards
              </div>
              <div className="text-lg font-black text-amber-500 flex items-center justify-between">
                <span>Tasks Up To ₹{unlockedMilestone.maxTaskReward}</span>
                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-black border border-green-500/20">
                  UNLOCKED NOW
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedLevelTab(unlockedMilestone.level);
                setUnlockedMilestone(null);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
            >
              <span>EXPLORE LEVEL {unlockedMilestone.level} TASKS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* LEVEL RULES MODAL */}
      {showLevelRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-950 text-zinc-50 rounded-2xl p-5 max-w-sm w-full border border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setShowLevelRules(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm uppercase text-zinc-100">
                Tasks Level & Milestone System
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="font-extrabold text-amber-500 uppercase block mb-0.5">
                  1. How To Level Up?
                </span>
                <p className="text-[11px] text-zinc-400">
                  Basic Micro Tasks complete karein. Har completed task aapka <strong className="text-zinc-200">+1 Action Point</strong> count karta hai.
                </p>
              </div>

              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="font-extrabold text-amber-500 uppercase block mb-0.5">
                  2. Level Milestones & Unlocks
                </span>
                <ul className="text-[11px] text-zinc-400 space-y-1">
                  <li>🥉 <strong>Level 1 (Bronze)</strong>: Starter tasks (₹30 - ₹60)</li>
                  <li>🥈 <strong>Level 2 (Silver)</strong>: 2 Actions needed (up to ₹120)</li>
                  <li>🥇 <strong>Level 3 (Gold)</strong>: 5 Actions needed (up to ₹250)</li>
                  <li>💎 <strong>Level 4 (Diamond)</strong>: 8 Actions needed (up to ₹500)</li>
                </ul>
              </div>

              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="font-extrabold text-amber-500 uppercase block mb-0.5">
                  3. Instant UPI Cash Out
                </span>
                <p className="text-[11px] text-zinc-400">
                  Earned cash wallet me instant add hota hai aur UPI ke dwara fast withdraw kar sakte hain!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLevelRules(false)}
              className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition border border-zinc-800"
            >
              Samajh Gaya (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
