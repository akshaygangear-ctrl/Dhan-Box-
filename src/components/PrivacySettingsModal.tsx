import React, { useState } from "react";
import { User } from "../types";
import { Globe, UserCheck, Shield, Check, X } from "lucide-react";

interface PrivacySettingsModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedProps: { name: string; isNamePublic: boolean; isDibbaPublic: boolean }) => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [isNamePublic, setIsNamePublic] = useState(user.isNamePublic);
  const [isDibbaPublic, setIsDibbaPublic] = useState(user.isDibbaPublic);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim() || "Dhan User", isNamePublic, isDibbaPublic });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-5 max-w-sm w-full border-2 border-emerald-500/60 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-gray-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-emerald-950 flex items-center justify-center font-black text-xl shadow-lg border border-amber-200 mb-2">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-extrabold text-lg text-amber-300 tracking-tight">Public Profile & Dibba Settings</h2>
          <p className="text-xs text-emerald-200/80">
            Aapka naam aur dibba wall public privacy control
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-200 mb-1">
              Display Name (Aapka Naam):
            </label>
            <input
              id="privacy-setting-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-emerald-600/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-3 border border-emerald-700/50 space-y-3">
            <label className="flex items-start space-x-2.5 text-xs text-emerald-100 cursor-pointer">
              <input
                id="toggle-is-name-public"
                type="checkbox"
                checked={isNamePublic}
                onChange={(e) => setIsNamePublic(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-gray-600"
              />
              <div>
                <span className="font-bold text-white block">Mera Naam Public Karein</span>
                <p className="text-[11px] text-emerald-300/80">
                  Leaderboard aur public chat me aapka sachha naam sabko dikhega.
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-2.5 text-xs text-emerald-100 cursor-pointer">
              <input
                id="toggle-is-dibba-public"
                type="checkbox"
                checked={isDibbaPublic}
                onChange={(e) => setIsDibbaPublic(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-gray-600"
              />
              <div>
                <span className="font-bold text-white block">Mera Dibba Public Karein</span>
                <p className="text-[11px] text-emerald-300/80">
                  Aapki daily earnings, spin activity aur payout status Public Dibba box me auto-share honge.
                </p>
              </div>
            </label>
          </div>

          <button
            id="privacy-settings-save-btn"
            type="submit"
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-emerald-950 font-bold py-2.5 px-4 rounded-xl shadow transition cursor-pointer text-xs"
          >
            Settings Save Karein
          </button>
        </form>
      </div>
    </div>
  );
};
