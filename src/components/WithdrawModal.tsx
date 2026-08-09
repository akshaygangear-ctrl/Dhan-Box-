import React, { useState } from "react";
import { User, WithdrawalRecord } from "../types";
import { Wallet, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap, X, QrCode } from "lucide-react";
import confetti from "canvas-confetti";

interface WithdrawModalProps {
  user: User;
  onClose: () => void;
  onWithdrawSuccess: (withdrawAmount: number, upiId: string, updatedUser: User) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ user, onClose, onWithdrawSuccess }) => {
  const MIN_LIMIT = 300;
  const [upiId, setUpiId] = useState(user.phoneOrUpi || "");
  const [amount, setAmount] = useState(300);
  const [method, setMethod] = useState("Paytm / PhonePe / Google Pay UPI");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successReceipt, setSuccessReceipt] = useState<WithdrawalRecord | null>(null);

  const progressPercent = Math.min((user.balance / MIN_LIMIT) * 100, 100);
  const neededAmount = Math.max(0, MIN_LIMIT - user.balance);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.balance < MIN_LIMIT) {
      setErrorMsg(`Minimum withdrawal limit ₹300 hai. Aapke paas abhi ₹${user.balance} hain. Sirf ₹${neededAmount} kam hain! Tasks complete karein.`);
      return;
    }

    if (!upiId || !upiId.includes("@")) {
      setErrorMsg("Kripya valid UPI ID daalein (e.g., example@paytm ya user@ybl)");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          upiId: upiId.trim(),
          method,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessReceipt(data.withdrawal);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch (e) {}

        onWithdrawSuccess(amount, upiId, data.user);
      } else {
        setErrorMsg(data.message || "Withdrawal failed");
      }
    } catch (e) {
      setErrorMsg("Network request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-5 max-w-sm w-full border-2 border-emerald-500/60 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-gray-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-emerald-950 flex items-center justify-center font-black text-xl shadow-lg border border-amber-200 mb-2">
            <Wallet className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-extrabold text-xl text-amber-300 tracking-tight">UPI / Paytm Instant Withdrawal</h2>
          <p className="text-xs text-emerald-200/80">
            Aapka Kamyabi Earning Dashboard
          </p>
        </div>

        {/* Current Balance & Progress Bar */}
        <div className="bg-emerald-900/60 rounded-2xl p-3 mb-4 border border-emerald-700/50">
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
            <span>Aapka Wallet Balance:</span>
            <span className="font-bold text-amber-300 text-sm">₹{user.balance}</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-emerald-700/40 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-300 mt-1.5 font-medium">
            <span>Progress: {Math.round(progressPercent)}%</span>
            <span>Min Target: ₹300</span>
          </div>

          {user.balance < MIN_LIMIT && (
            <div className="mt-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl p-2 text-[11px] text-amber-200 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Paise Thode Kam Hain:</strong> Withdrawal ke liye sirf <strong className="text-amber-300">₹{neededAmount}</strong> aur chahiye. Daily Spin, Scratch card ya Quiz karke threshold complete karein!
              </span>
            </div>
          )}
        </div>

        {/* Success Receipt State */}
        {successReceipt ? (
          <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-2xl p-4 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto fill-emerald-950" />
            <div>
              <h3 className="font-black text-lg text-emerald-300">PAYMENT SUCCESSFUL!</h3>
              <p className="text-xs text-emerald-100 mt-1">
                ₹{successReceipt.amount} ka payout aapke UPI ID <strong className="text-amber-300">{successReceipt.upiId}</strong> par bhej diya gaya hai.
              </p>
            </div>
            <div className="text-[11px] bg-slate-900 p-2 rounded-xl text-gray-300 text-left space-y-1 border border-emerald-800">
              <div>Transaction ID: {successReceipt.id}</div>
              <div>Status: {successReceipt.status} ✅</div>
              <div>Date: {successReceipt.date}</div>
              <div>Note: Direct Public Dibba Wall par receipt update kar di gayi hai!</div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
            >
              Done & Continue Earning
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleWithdraw} className="space-y-3">
            {errorMsg && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs p-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-emerald-200 mb-1">
                Aapka UPI ID / Paytm Phone Number:
              </label>
              <input
                id="withdraw-upi-id-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. 9876543210@paytm ya user@ybl"
                className="w-full bg-slate-900 border border-emerald-600/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-200 mb-1">
                Withdrawal Amount (Rupees ₹):
              </label>
              <select
                id="withdraw-amount-select"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-emerald-600/60 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value={300}>₹300 (Standard Instant Payout)</option>
                <option value={500}>₹500 (Medium Payout)</option>
                <option value={1000}>₹1000 (Pro Earner Payout)</option>
              </select>
            </div>

            <button
              id="withdraw-submit-btn"
              type="submit"
              disabled={loading || user.balance < MIN_LIMIT}
              className={`w-full font-extrabold py-3 px-4 rounded-xl shadow-xl flex items-center justify-center space-x-2 text-sm transition cursor-pointer ${
                user.balance < MIN_LIMIT
                  ? "bg-slate-800 text-gray-400 cursor-not-allowed border border-gray-700"
                  : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-emerald-950 active:scale-95"
              }`}
            >
              <Zap className="w-4 h-4 fill-emerald-950" />
              <span>
                {loading
                  ? "Transferring Cash..."
                  : user.balance < MIN_LIMIT
                  ? `₹${neededAmount} Kam Hain (Earn More First)`
                  : `₹${amount} Instant UPI Withdrawal Request`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
