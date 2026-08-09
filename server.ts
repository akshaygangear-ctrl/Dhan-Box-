import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gemini AI client lazily/safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// In-Memory Database Store for App State
interface User {
  id: string;
  name: string;
  avatar: string;
  phoneOrUpi: string;
  balance: number;
  bonusClaimed: boolean;
  isNamePublic: boolean;
  isDibbaPublic: boolean;
  dailyStreak: number;
  lastCheckinDate: string | null;
  totalEarned: number;
  referralCode: string;
  referralCount: number;
  withdrawals: Array<{
    id: string;
    amount: number;
    upiId: string;
    status: "PROCESSING" | "SUCCESS" | "FAILED";
    date: string;
    method: string;
  }>;
  transactions: Array<{
    id: string;
    type: "BONUS" | "SPIN" | "SCRATCH" | "DAILY_CHECKIN" | "TASK" | "QUIZ" | "REFERRAL" | "WITHDRAWAL";
    title: string;
    amount: number;
    timestamp: string;
  }>;
}

interface DibbaPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  tag: "EARNING_PROOF" | "SHOUTOUT" | "GENERAL" | "WITHDRAWAL";
  amountEarned?: number;
  timestamp: string;
  likes: number;
  isSystem?: boolean;
}

// Initial Mock Seed Data for Public Dibba & Leaderboard
const users: Map<string, User> = new Map();

const dibbaPosts: DibbaPost[] = [
  {
    id: "post-1",
    userId: "sys-1",
    userName: "DhanBox Official Bot 🤖",
    userAvatar: "⚡",
    message: "🎉 Welcome to DhanBox! Signup now to instantly claim ₹200 Welcome Bonus! Sabka Naal Aur Dibba Public Hai! 🚀",
    tag: "SHOUTOUT",
    timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likes: 124,
    isSystem: true,
  },
  {
    id: "post-2",
    userId: "user-101",
    userName: "Rahul Kumar (Delhi)",
    userAvatar: "👨‍💼",
    message: "Mujhe ₹200 sign up bonus mil gaya aur ₹150 UPI withdrawal bhi instantly receive ho gaya Paytm mein! DhanBox op 🔥",
    tag: "EARNING_PROOF",
    amountEarned: 350,
    timestamp: new Date(Date.now() - 3600000 * 1.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likes: 45,
  },
  {
    id: "post-3",
    userId: "user-102",
    userName: "Priya Sharma (Jaipur)",
    userAvatar: "👩‍🏫",
    message: "Aaj ka Spin and Win mein ₹80 jita aur scratch card mein ₹50! Aap log bhi Daily Check-in miss mat karo guys! 🎁",
    tag: "SHOUTOUT",
    amountEarned: 130,
    timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likes: 38,
  },
  {
    id: "post-4",
    userId: "user-103",
    userName: "Amit Verma (Lucknow)",
    userAvatar: "🧑‍💻",
    message: "₹500 Withdrawal Successfully Transferred to UPI ID rahul***@paytm! Live proof on Dibba wall! ✅",
    tag: "WITHDRAWAL",
    amountEarned: 500,
    timestamp: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likes: 89,
    isSystem: false,
  }
];

// Helper to generate realistic random reward
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "DhanBox ₹200 Bonus Earning App" });
});

// Initialize or fetch user
app.post("/api/user/login-or-register", (req, res) => {
  const { userId, name, phoneOrUpi, avatar } = req.body;
  const id = userId || `user-${Date.now()}`;

  let user = users.get(id);

  if (!user) {
    const refCode = `DHAN${Math.floor(1000 + Math.random() * 9000)}`;
    user = {
      id,
      name: name || "Naye Kumaar",
      avatar: avatar || "👤",
      phoneOrUpi: phoneOrUpi || "",
      balance: 200, // Instant ₹200 Sign-Up Bonus!
      bonusClaimed: true,
      isNamePublic: true, // Default public as requested
      isDibbaPublic: true, // Default public dibba
      dailyStreak: 1,
      lastCheckinDate: new Date().toISOString().split('T')[0],
      totalEarned: 200,
      referralCode: refCode,
      referralCount: 0,
      withdrawals: [],
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: "BONUS",
          title: "₹200 Welcome Bonus (Welcome Gift)",
          amount: 200,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };
    users.set(id, user);

    // Automatically announce in Public Dibba if isDibbaPublic is true!
    dibbaPosts.unshift({
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.isNamePublic ? user.name : "Anonymous Earn User",
      userAvatar: user.avatar,
      message: `🎉 Naya Member Join Hua! ${user.isNamePublic ? user.name : 'Gupt User'} ne ₹200 Signup Bonus Claim Kiya! Dibba mein Welcome karo! 🥳`,
      tag: "SHOUTOUT",
      amountEarned: 200,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 5,
    });
  }

  res.json({ success: true, user });
});

// Update user profile public toggles
app.post("/api/user/update-privacy", (req, res) => {
  const { userId, isNamePublic, isDibbaPublic, name } = req.body;
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (typeof isNamePublic === "boolean") user.isNamePublic = isNamePublic;
  if (typeof isDibbaPublic === "boolean") user.isDibbaPublic = isDibbaPublic;
  if (name) user.name = name;

  users.set(userId, user);
  res.json({ success: true, user });
});

// Get Dibba posts (Public Wall & Community Box)
app.get("/api/dibba/posts", (_req, res) => {
  res.json({ success: true, posts: dibbaPosts });
});

// Create Dibba post
app.post("/api/dibba/post", (req, res) => {
  const { userId, message, tag, amountEarned } = req.body;
  const user = users.get(userId);

  if (!message || message.trim() === "") {
    return res.status(400).json({ success: false, message: "Message cannot be empty" });
  }

  const newPost: DibbaPost = {
    id: `post-${Date.now()}`,
    userId: userId || "guest",
    userName: user && user.isNamePublic ? user.name : (user ? "Public Dhan User" : "Guest User"),
    userAvatar: user ? user.avatar : "💬",
    message: message.trim(),
    tag: tag || "SHOUTOUT",
    amountEarned: amountEarned || (user ? user.totalEarned : undefined),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likes: 1,
  };

  dibbaPosts.unshift(newPost);
  // Keep last 100 posts
  if (dibbaPosts.length > 100) dibbaPosts.pop();

  res.json({ success: true, post: newPost, posts: dibbaPosts });
});

// Like a dibba post
app.post("/api/dibba/like", (req, res) => {
  const { postId } = req.body;
  const post = dibbaPosts.find(p => p.id === postId);
  if (post) {
    post.likes += 1;
    return res.json({ success: true, likes: post.likes });
  }
  res.status(404).json({ success: false, message: "Post not found" });
});

// Spin Wheel Endpoint
app.post("/api/earn/spin", (req, res) => {
  const { userId } = req.body;
  const user = users.get(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const winAmount = getRandomInt(10, 80);
  user.balance += winAmount;
  user.totalEarned += winAmount;
  user.transactions.unshift({
    id: `tx-${Date.now()}`,
    type: "SPIN",
    title: `Lucky Spin Wheel Earnings (₹${winAmount})`,
    amount: winAmount,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Dibba auto alert if big win
  if (winAmount >= 50 && user.isDibbaPublic) {
    dibbaPosts.unshift({
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.isNamePublic ? user.name : "Anonymous Spin Winner",
      userAvatar: user.avatar,
      message: `🎉 Bada Dhamaka! Luck Wheel mein ₹${winAmount} jeeta! DhanBox par earning chalu hai 🎯`,
      tag: "EARNING_PROOF",
      amountEarned: winAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 12,
    });
  }

  res.json({ success: true, winAmount, newBalance: user.balance, user });
});

// Scratch Card Endpoint
app.post("/api/earn/scratch", (req, res) => {
  const { userId } = req.body;
  const user = users.get(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const winAmount = getRandomInt(15, 95);
  user.balance += winAmount;
  user.totalEarned += winAmount;
  user.transactions.unshift({
    id: `tx-${Date.now()}`,
    type: "SCRATCH",
    title: `Scratch Card Bonus Win (₹${winAmount})`,
    amount: winAmount,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  if (winAmount >= 60 && user.isDibbaPublic) {
    dibbaPosts.unshift({
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.isNamePublic ? user.name : "Scratch Winner",
      userAvatar: user.avatar,
      message: `✨ Magic Scratch Card unlocked ₹${winAmount} Cash! DhanBox Dibba me live update! 🎁`,
      tag: "EARNING_PROOF",
      amountEarned: winAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 8,
    });
  }

  res.json({ success: true, winAmount, newBalance: user.balance, user });
});

// Daily Check-in
app.post("/api/earn/checkin", (req, res) => {
  const { userId } = req.body;
  const user = users.get(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const today = new Date().toISOString().split('T')[0];
  if (user.lastCheckinDate === today) {
    return res.status(400).json({ success: false, message: "Aaj ka Check-in pehle hi ho chuka hai! Kal fir aayein." });
  }

  const streakRewards = [20, 30, 40, 50, 75, 100, 150];
  const rewardIndex = Math.min(user.dailyStreak - 1, streakRewards.length - 1);
  const rewardAmount = streakRewards[rewardIndex];

  user.balance += rewardAmount;
  user.totalEarned += rewardAmount;
  user.dailyStreak += 1;
  user.lastCheckinDate = today;

  user.transactions.unshift({
    id: `tx-${Date.now()}`,
    type: "DAILY_CHECKIN",
    title: `Day ${user.dailyStreak - 1} Daily Attendance Bonus`,
    amount: rewardAmount,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  res.json({ success: true, rewardAmount, newStreak: user.dailyStreak, newBalance: user.balance, user });
});

// Gemini AI Earning Quiz Questions Endpoint
app.get("/api/quiz/generate", async (_req, res) => {
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Generate 3 quick fun Hindi/English trivia questions for a Indian Money Earning App quiz where users earn cash rewards. Return ONLY valid JSON array with format: [ { \"id\": \"q1\", \"question\": \"Which city is called Pink City in India?\", \"options\": [\"Delhi\", \"Jaipur\", \"Mumbai\", \"Agra\"], \"correctIndex\": 1, \"reward\": 25, \"explanation\": \"Jaipur is known as Pink City!\" } ]"
              }
            ]
          }
        ]
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, questions });
      }
    } catch (e) {
      console.warn("Gemini quiz fallback used due to:", e);
    }
  }

  // Fallback Quiz questions
  const fallbackQuestions = [
    {
      id: "q-1",
      question: "Bharat mein UPI ka full form kya hai?",
      options: ["Unified Payments Interface", "United Payment Indiana", "Universal Pay India", "Unique Personal ID"],
      correctIndex: 0,
      reward: 30,
      explanation: "Unified Payments Interface (UPI) se instant paise transfer hote hain!"
    },
    {
      id: "q-2",
      question: "200 Rupaye ke note par kiski tasveer ya monument hai?",
      options: ["Red Fort", "Sanchi Stupa", "Taj Mahal", "Qutub Minar"],
      correctIndex: 1,
      reward: 35,
      explanation: "₹200 ke naye note ke pichhe Sanchi Stupa ka chitra hai!"
    },
    {
      id: "q-3",
      question: "DhanBox app par Sign Up karne par kitna Instant Welcome Bonus milta hai?",
      options: ["₹50", "₹100", "₹200", "₹500"],
      correctIndex: 2,
      reward: 50,
      explanation: "DhanBox par aapko milta hai ₹200 instant signup bonus!"
    }
  ];

  res.json({ success: true, questions: fallbackQuestions });
});

// Submit Quiz Answer & Earn Cash
app.post("/api/earn/quiz-reward", (req, res) => {
  const { userId, reward, questionId } = req.body;
  const user = users.get(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const winAmount = reward || 25;
  user.balance += winAmount;
  user.totalEarned += winAmount;

  user.transactions.unshift({
    id: `tx-${Date.now()}`,
    type: "QUIZ",
    title: `Smart Quiz Reward Claimed (${questionId || 'Q'})`,
    amount: winAmount,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  res.json({ success: true, winAmount, newBalance: user.balance, user });
});

// Process Referral Code
app.post("/api/earn/referral", (req, res) => {
  const { userId, refCode } = req.body;
  const user = users.get(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const cleanCode = (refCode || "").trim().toUpperCase();
  if (!cleanCode || cleanCode === user.referralCode) {
    return res.status(400).json({ success: false, message: "Aap apna hi referral code use nahi kar sakte!" });
  }

  // Increment referral count & award referrer if found
  const referrerUser = Array.from(users.values()).find(u => u.referralCode === cleanCode);
  if (referrerUser) {
    referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
    referrerUser.balance += 50;
    referrerUser.totalEarned += 50;
    referrerUser.transactions.unshift({
      id: `tx-${Date.now()}`,
      type: "REFERRAL",
      title: `Friend Joined via Your Referral Code (${user.name})`,
      amount: 50,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    if (referrerUser.isDibbaPublic) {
      dibbaPosts.unshift({
        id: `post-${Date.now()}`,
        userId: referrerUser.id,
        userName: referrerUser.isNamePublic ? referrerUser.name : "Invite Champion",
        userAvatar: referrerUser.avatar,
        message: `🚀 SUCCESSFUL REFERRAL! Naye friend ne DHAN code use kiya! ₹50 Referral Bonus Credited! Total Invites: ${referrerUser.referralCount}! 🎁`,
        tag: "EARNING_PROOF",
        amountEarned: 50,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: 12,
      });
    }
  }

  // Award user who applied the referral code
  user.referralCount = (user.referralCount || 0);
  const bonus = 50;
  user.balance += bonus;
  user.totalEarned += bonus;
  user.transactions.unshift({
    id: `tx-${Date.now()}`,
    type: "REFERRAL",
    title: `Referral Gift Code Bonus Applied (${cleanCode})`,
    amount: bonus,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  res.json({ success: true, bonus, newBalance: user.balance, user });
});

// UPI / Paytm Withdrawal Request
app.post("/api/withdraw", (req, res) => {
  const { userId, amount, upiId, method } = req.body;
  const user = users.get(userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const withdrawAmount = Number(amount);
  if (isNaN(withdrawAmount) || withdrawAmount < 300) {
    return res.status(400).json({
      success: false,
      message: "Minimum Withdrawal limit ₹300 hai. Aapke wallet me bas thode paise kam hain, tasks complete karke withdraw karein!"
    });
  }

  if (user.balance < withdrawAmount) {
    return res.status(400).json({
      success: false,
      message: `Aapke wallet me ₹${user.balance} hain. Withdrawal amount ₹${withdrawAmount} ke liye paise kam hain! Task complete karke wallet badhayein.`
    });
  }

  if (!upiId || !upiId.includes("@")) {
    return res.status(400).json({ success: false, message: "Kripya sahi UPI ID daalein (e.g., example@paytm ya user@ybl)" });
  }

  // Deduct balance and create successful withdrawal transaction
  user.balance -= withdrawAmount;
  const withdrawalObj = {
    id: `wd-${Date.now()}`,
    amount: withdrawAmount,
    upiId,
    status: "SUCCESS" as const,
    date: new Date().toLocaleDateString("hi-IN"),
    method: method || "UPI Instant Transfer"
  };

  user.withdrawals.unshift(withdrawalObj);
  user.transactions.unshift({
    id: `tx-${Date.now()}`,
    type: "WITHDRAWAL",
    title: `UPI Payout Transferred to ${upiId}`,
    amount: -withdrawAmount,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Post live withdrawal proof on Public Dibba if user's Dibba is public!
  if (user.isDibbaPublic) {
    dibbaPosts.unshift({
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.isNamePublic ? user.name : "Verified Earn User",
      userAvatar: user.avatar,
      message: `💰 SUCCESS! Mera ₹${withdrawAmount} ka Withdrawal Direct UPI (${upiId.slice(0, 3)}***@upi) par receive ho gaya! DhanBox Dibba me live entry! 🚀`,
      tag: "WITHDRAWAL",
      amountEarned: withdrawAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 25,
    });
  }

  res.json({
    success: true,
    message: `₹${withdrawAmount} ka Instant Payment aapke UPI (${upiId}) par bheja gaya!`,
    withdrawal: withdrawalObj,
    user
  });
});

// Top Public Leaderboards (Earners & Referrers)
app.get("/api/leaderboard", (_req, res) => {
  // Top Earners
  const topEarners = Array.from(users.values())
    .filter(u => u.isNamePublic)
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, 10)
    .map(u => ({
      name: u.name,
      avatar: u.avatar,
      totalEarned: u.totalEarned,
      referralCount: u.referralCount || 0,
      isDibbaPublic: u.isDibbaPublic,
      rankTitle: u.totalEarned > 1000 ? "👑 Dhan Raja" : u.totalEarned > 500 ? "🌟 Star Earner" : "⚡ Rising Champ"
    }));

  if (topEarners.length < 5) {
    const dummyEarners = [
      { name: "Ramesh Pawar (Mumbai)", avatar: "🧔", totalEarned: 1850, referralCount: 24, isDibbaPublic: true, rankTitle: "👑 Dhan Raja" },
      { name: "Sunita Devi (Patna)", avatar: "👩", totalEarned: 1420, referralCount: 18, isDibbaPublic: true, rankTitle: "👑 Dhan Raja" },
      { name: "Vikram Singh (Jaipur)", avatar: "🤠", totalEarned: 980, referralCount: 12, isDibbaPublic: true, rankTitle: "🌟 Star Earner" },
      { name: "Pooja Hegde (Bengaluru)", avatar: "👩‍💼", totalEarned: 740, referralCount: 8, isDibbaPublic: true, rankTitle: "🌟 Star Earner" },
      { name: "Suresh Yadav (Ranchi)", avatar: "👷", totalEarned: 520, referralCount: 5, isDibbaPublic: true, rankTitle: "⚡ Rising Champ" }
    ];
    topEarners.push(...dummyEarners.slice(0, 5 - topEarners.length));
  }

  // Top Referrers (Invite Champions)
  const topReferrers = Array.from(users.values())
    .filter(u => u.isNamePublic)
    .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
    .slice(0, 10)
    .map(u => ({
      name: u.name,
      avatar: u.avatar,
      totalEarned: u.totalEarned,
      referralCount: u.referralCount || 0,
      isDibbaPublic: u.isDibbaPublic,
      rankTitle: (u.referralCount || 0) >= 20 ? "🚀 Invite Sultan" : (u.referralCount || 0) >= 10 ? "🔥 Super Ambassador" : "✨ Viral Promoter"
    }));

  if (topReferrers.length < 5) {
    const dummyReferrers = [
      { name: "Amit Sharma (Delhi)", avatar: "👨‍💻", totalEarned: 2450, referralCount: 42, isDibbaPublic: true, rankTitle: "🚀 Invite Sultan" },
      { name: "Neha Verma (Lucknow)", avatar: "👩‍🎓", totalEarned: 1980, referralCount: 35, isDibbaPublic: true, rankTitle: "🚀 Invite Sultan" },
      { name: "Rajesh Kumar (Indore)", avatar: "👨‍🔧", totalEarned: 1620, referralCount: 28, isDibbaPublic: true, rankTitle: "🔥 Super Ambassador" },
      { name: "Ananya Roy (Kolkata)", avatar: "👩‍🎨", totalEarned: 1100, referralCount: 19, isDibbaPublic: true, rankTitle: "🔥 Super Ambassador" },
      { name: "Deepak Joshi (Pune)", avatar: "🧑‍💻", totalEarned: 890, referralCount: 14, isDibbaPublic: true, rankTitle: "✨ Viral Promoter" }
    ];
    topReferrers.push(...dummyReferrers.slice(0, 5 - topReferrers.length));
  }

  res.json({
    success: true,
    leaders: topEarners,
    topEarners,
    topReferrers
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DhanBox Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
