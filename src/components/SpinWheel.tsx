import React, { useState } from "react";
import { User } from "../types";
import { Sparkles, Disc, Trophy, Zap } from "lucide-react";
import confetti from "canvas-confetti";

interface SpinWheelProps {
  user: User;
  onSpinSuccess: (winAmount: number, newBalance: number) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ user, onSpinSuccess }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const wheelSegments = [
    { label: "₹10", value: 10, bg: "from-emerald-600 to-teal-700" },
    { label: "₹25", value: 25, bg: "from-amber-500 to-yellow-600" },
    { label: "₹50", value: 50, bg: "from-purple-600 to-indigo-700" },
    { label: "₹80", value: 80, bg: "from-rose-600 to-pink-700" },
    { label: "₹15", value: 15, bg: "from-blue-600 to-cyan-700" },
    { label: "₹100", value: 100, bg: "from-amber-400 to-yellow-300 text-emerald-950 font-black" },
  ];

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setLastWin(null);

    // Call server to fetch deterministic win amount
    try {
      const res = await fetch("/api/earn/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();

      if (data.success) {
        // Spin calculation animation: rotate multiple full rounds plus slice offset
        const winAmount = data.winAmount;
        const extraRotations = 360 * 5; // 5 full spins
        const segmentAngle = 360 / wheelSegments.length;
        
        // Find segment index or fallback
        let targetIndex = wheelSegments.findIndex(s => s.value === winAmount);
        if (targetIndex === -1) targetIndex = Math.floor(Math.random() * wheelSegments.length);

        const targetDegree = 360 - (targetIndex * segmentAngle) - (segmentAngle / 2);
        const totalNewRotation = rotation + extraRotations + targetDegree;

        setRotation(totalNewRotation);

        setTimeout(() => {
          setSpinning(false);
          setLastWin(winAmount);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {}

          onSpinSuccess(winAmount, data.newBalance);
        }, 3200);
      } else {
        setSpinning(false);
      }
    } catch (e) {
      setSpinning(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-700/60 rounded-3xl p-5 shadow-2xl mb-4 text-white text-center relative overflow-hidden">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Disc className="w-6 h-6 text-amber-400 animate-spin-slow" />
        <h3 className="font-black text-lg text-amber-300 tracking-tight">Lucky Spin & Win Wheel</h3>
      </div>
      <p className="text-xs text-emerald-200/90 mb-4">
        Wheel ghumayein aur instant <strong className="text-amber-300">₹10 se ₹100</strong> tak cash jeetein!
      </p>

      {/* Wheel Visual Container */}
      <div className="relative w-56 h-56 mx-auto my-3 flex items-center justify-center">
        {/* Top Pointer Arrow */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

        {/* Rotating Wheel Circle */}
        <div
          className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl relative overflow-hidden transition-all duration-[3200ms] cubic-bezier(0.15, 0.85, 0.35, 1.05)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {wheelSegments.map((seg, idx) => {
            const angle = (360 / wheelSegments.length) * idx;
            return (
              <div
                key={idx}
                className={`absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left bg-gradient-to-br ${seg.bg} flex items-center justify-center text-xs font-black shadow-inner border border-white/20`}
                style={{
                  transform: `rotate(${angle}deg) skewY(-30deg)`,
                }}
              >
                <span
                  className="inline-block transform skewY(30deg) rotate(30deg) -translate-y-4 text-white font-extrabold text-sm drop-shadow"
                >
                  {seg.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center Spin Knob */}
        <div className="absolute w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full border-4 border-emerald-950 shadow-xl flex items-center justify-center text-emerald-950 font-black text-xs z-10 pointer-events-none">
          SPIN
        </div>
      </div>

      {/* Win Celebration Alert */}
      {lastWin !== null && (
        <div className="bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 border border-amber-400/60 rounded-2xl p-3 my-3 animate-bounce">
          <div className="flex items-center justify-center space-x-1.5 text-amber-300 font-extrabold text-base">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Badhaai Ho! Aapne ₹{lastWin} Cash Jeeta! 🎉</span>
          </div>
          <p className="text-[11px] text-emerald-200 mt-0.5">
            Yeh paise aapke DhanBox wallet mein add ho chuke hain!
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        id="spin-wheel-action-btn"
        onClick={handleSpin}
        disabled={spinning}
        className="w-full mt-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-emerald-950 font-black py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2 text-base transition active:scale-95 cursor-pointer disabled:opacity-60"
      >
        <Zap className="w-5 h-5 fill-emerald-950" />
        <span>{spinning ? "Wheel Ghum Raha Hai..." : "Wheel Ghumayein (Instant Cash)"}</span>
      </button>
    </div>
  );
};
