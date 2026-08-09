export interface User {
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
  withdrawals: WithdrawalRecord[];
  transactions: Transaction[];
}

export interface WithdrawalRecord {
  id: string;
  amount: number;
  upiId: string;
  status: "PROCESSING" | "SUCCESS" | "FAILED";
  date: string;
  method: string;
}

export interface Transaction {
  id: string;
  type: "BONUS" | "SPIN" | "SCRATCH" | "DAILY_CHECKIN" | "TASK" | "QUIZ" | "REFERRAL" | "WITHDRAWAL";
  title: string;
  amount: number;
  timestamp: string;
}

export interface DibbaPost {
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

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  reward: number;
  explanation: string;
}

export interface EarnTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  completed: boolean;
  type: "SPONSOR" | "TELEGRAM" | "VIDEO" | "SURVEY" | "APP_DOWNLOAD" | "SOCIAL" | "FINANCIAL";
  levelRequired: number; // 1, 2, 3, 4
  minActionsRequired: number; // e.g. 0, 2, 5, 8
  tierName: "Bronze Starter" | "Silver Earner" | "Gold VIP" | "Diamond Legend";
}
