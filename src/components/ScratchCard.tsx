import React, { useState, useRef, useEffect } from "react";
import { User } from "../types";
import { Sparkles, Gift, CheckCircle2, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";

interface ScratchCardProps {
  user: User;
  onScratchSuccess: (winAmount: number, newBalance: number) => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ user, onScratchSuccess }) => {
  const [scratched, setScratched] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchProgress, setScratchProgress] = useState(0);

  // Initialize canvas scratch surface
  useEffect(() => {
    initCanvas();
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 280;
    canvas.height = 140;

    // Fill with metallic gold scratch coating
    const grad = ctx.createLinearGradient(0, 0, 280, 140);
    grad.addColorStop(0, "#f59e0b");
    grad.addColorStop(0.5, "#d97706");
    grad.addColorStop(1, "#b45309");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative text on scratch layer
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ YAHAN SCRATCH KAREIN ✨", 140, 65);
    ctx.font = "12px sans-serif";
    ctx.fillText("Scratch & Reveal Instant Cash", 140, 90);
  };

  const handleScratchMove = async (e: React.MouseEvent | React.TouchEvent) => {
    if (scratched || loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch progress threshold
    const newProg = Math.min(scratchProgress + 8, 100);
    setScratchProgress(newProg);

    if (newProg >= 50 && !winAmount) {
      await claimScratchReward();
    }
  };

  const claimScratchReward = async () => {
    if (loading || scratched) return;
    setLoading(true);

    try {
      const res = await fetch("/api/earn/scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();

      if (data.success) {
        setWinAmount(data.winAmount);
        setScratched(true);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        onScratchSuccess(data.winAmount, data.newBalance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetCard = () => {
    setScratched(false);
    setWinAmount(null);
    setScratchProgress(0);
    setTimeout(() => {
      initCanvas();
    }, 100);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900 border border-emerald-700/60 rounded-3xl p-5 shadow-2xl mb-4 text-white text-center">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <Gift className="w-5 h-5 text-amber-400" />
        <h3 className="font-extrabold text-base text-amber-300">Magic Scratch Card</h3>
      </div>
      <p className="text-xs text-emerald-200/90 mb-3">
        Card ko scratch karke instant cash unlock karein!
      </p>

      <div className="relative w-[280px] h-[140px] mx-auto my-2 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-950 flex items-center justify-center">
        {/* Hidden Reward underneath */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-emerald-950 flex flex-col items-center justify-center p-3">
          <Sparkles className="w-6 h-6 text-emerald-950 animate-bounce" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Aapne Jeeta
          </span>
          <span className="text-3xl font-black text-emerald-950 my-0.5">
            ₹{winAmount !== null ? winAmount : "??"}
          </span>
          <span className="text-[10px] bg-emerald-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            Credited to Wallet
          </span>
        </div>

        {/* Scratchable Surface Canvas */}
        {!scratched && (
          <canvas
            ref={canvasRef}
            onMouseMove={handleScratchMove}
            onTouchMove={handleScratchMove}
            className="absolute inset-0 cursor-pointer touch-none z-10"
          />
        )}
      </div>

      {scratched && (
        <div className="mt-3 space-y-2">
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-2.5 text-xs text-emerald-200 flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>₹{winAmount} Wallet mein add ho chuka hai!</span>
          </div>
          <button
            id="scratch-card-again-btn"
            onClick={resetCard}
            className="inline-flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer border border-emerald-600/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Naya Card Scratch Karein</span>
          </button>
        </div>
      )}
    </div>
  );
};
