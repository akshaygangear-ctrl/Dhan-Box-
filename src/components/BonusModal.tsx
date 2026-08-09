import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { User } from "../types";
import { Gift, CheckCircle2, Globe, Sparkles, ArrowRight, Award } from "lucide-react";

interface BonusModalProps {
  user: User;
  onClose: (updatedUserProps: { name: string; isNamePublic: boolean; isDibbaPublic: boolean }) => void;
}

export const BonusModal: React.FC<BonusModalProps> = ({ user, onClose }) => {
  const [name, setName] = useState(user.name || "Naye Earner");
  const [isNamePublic, setIsNamePublic] = useState(true);
  const [isDibbaPublic, setIsDibbaPublic] = useState(true);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#22c55e", "#e11d48", "#3b82f6"],
      });
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose({ name: name.trim() || "Dhan User", isNamePublic, isDibbaPublic });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 text-zinc-50 rounded-2xl p-6 max-w-sm w-full border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center">
          {/* Badge icon */}
          <div className="mx-auto w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-xl border-2 border-amber-400 mb-3 animate-bounce">
            <Gift className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPECIAL WELCOME OFFER</span>
          </div>

          <h2 className="text-4xl font-black text-amber-500 tracking-tighter uppercase leading-none">
            ₹200 BONUS
          </h2>
          <p className="text-xs text-zinc-400 font-medium mt-1.5">
            Badhaai ho! Aapke DhanBox wallet mein <strong className="text-zinc-100 font-bold">₹200</strong> credit kar diye gaye hain.
          </p>

          <div className="bg-zinc-900 rounded-xl p-3.5 my-4 border border-zinc-800 text-left">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
              <span>Current Wallet Balance</span>
              <span className="text-green-500 font-black">INSTANT CREDITED</span>
            </div>
            <div className="text-3xl font-black text-zinc-50 flex items-center justify-between tracking-tight">
              <span className="text-amber-500">₹200.00</span>
              <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-black tracking-wider border border-green-500/20">
                ACTIVE
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                Aapka Naam (Profile Name):
              </label>
              <input
                id="user-profile-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Apna naam likhein (e.g. Rahul Sharma)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-bold"
                required
              />
            </div>

            {/* Public Naam and Public Dibba Privacy Checkboxes */}
            <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800 space-y-2.5">
              <div className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Public Profile & Dibba Settings</span>
              </div>

              <label className="flex items-start space-x-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  id="checkbox-public-naam"
                  type="checkbox"
                  checked={isNamePublic}
                  onChange={(e) => setIsNamePublic(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-950 border-zinc-700"
                />
                <div>
                  <span className="font-extrabold text-white uppercase text-[11px]">Mera Naam Public Karein</span>
                  <p className="text-[10px] text-zinc-400">Leaderboard aur Public Dibba par aapka naam dikhega.</p>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  id="checkbox-public-dibba"
                  type="checkbox"
                  checked={isDibbaPublic}
                  onChange={(e) => setIsDibbaPublic(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-950 border-zinc-700"
                />
                <div>
                  <span className="font-extrabold text-white uppercase text-[11px]">Mera Dibba Public Karein</span>
                  <p className="text-[10px] text-zinc-400">Aapki Spin, Scratch aur Withdrawal ki updates Public Dibba box me auto-post hongi.</p>
                </div>
              </label>
            </div>

            <button
              id="claim-bonus-continue-btn"
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 text-sm uppercase tracking-wider transition active:scale-95 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              <span>CLAIM BONUS & START EARNING</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
