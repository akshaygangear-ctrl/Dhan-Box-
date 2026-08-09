import React from "react";
import { User } from "../types";
import { Wallet, ShieldCheck, UserCheck, Settings, Sparkles, Globe } from "lucide-react";

interface HeaderProps {
  user: User;
  onOpenSettings: () => void;
  onOpenWithdraw: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenSettings, onOpenWithdraw }) => {
  return (
    <header className="bg-emerald-900 text-white shadow-lg border-b border-emerald-700/50 sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Title & Public Status */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-emerald-950 font-black text-xl shadow-md border border-amber-200">
            ₹
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
                DhanBox
              </h1>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                ₹200 Bonus
              </span>
            </div>
            {/* Public Status Badge */}
            <div className="flex items-center space-x-1 text-[11px] text-emerald-200 mt-0.5">
              <Globe className="w-3 h-3 text-emerald-300 animate-pulse" />
              <span>
                {user.isNamePublic && user.isDibbaPublic ? (
                  <span className="text-amber-300 font-medium">Naam & Dibba: PUBLIC 🌐</span>
                ) : user.isNamePublic ? (
                  <span>Naam Public 👤</span>
                ) : user.isDibbaPublic ? (
                  <span>Dibba Public 📦</span>
                ) : (
                  <span className="text-gray-300">Private Profile 🔒</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Wallet Balance Pill & Settings */}
        <div className="flex items-center space-x-2">
          <button
            id="wallet-balance-button"
            onClick={onOpenWithdraw}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-emerald-950 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg hover:brightness-110 transition active:scale-95 cursor-pointer border border-amber-200"
          >
            <Wallet className="w-4 h-4 text-emerald-950 fill-amber-300" />
            <span className="text-base">₹{user.balance}</span>
          </button>

          <button
            id="open-privacy-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition border border-emerald-600/40 cursor-pointer"
            title="Naam aur Dibba Public Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
