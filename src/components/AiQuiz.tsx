import React, { useState, useEffect } from "react";
import { User, QuizQuestion } from "../types";
import { Brain, CheckCircle2, XCircle, Sparkles, HelpCircle, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface AiQuizProps {
  user: User;
  onQuizSuccess: (reward: number, newBalance: number) => void;
}

export const AiQuiz: React.FC<AiQuizProps> = ({ user, onQuizSuccess }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/generate");
      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setSelectedOpt(null);
        setIsSubmitted(false);
        setCompleted(false);
      }
    } catch (e) {
      console.error("Quiz fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setSelectedOpt(index);
  };

  const handleCheckAnswer = async () => {
    if (selectedOpt === null || isSubmitted) return;
    setIsSubmitted(true);

    const currentQ = questions[currentIndex];
    if (selectedOpt === currentQ.correctIndex) {
      // Claim reward!
      try {
        const res = await fetch("/api/earn/quiz-reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            reward: currentQ.reward,
            questionId: currentQ.id,
          }),
        });
        const data = await res.json();
        if (data.success) {
          try {
            confetti({ particleCount: 50, spread: 50 });
          } catch (e) {}
          onQuizSuccess(data.winAmount, data.newBalance);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    } else {
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900 border border-emerald-700/60 rounded-3xl p-6 text-center text-white mb-4">
        <Brain className="w-8 h-8 text-amber-400 mx-auto animate-pulse mb-2" />
        <p className="text-xs text-emerald-200">AI Smart Quiz Questions Load Ho Rahe Hain...</p>
      </div>
    );
  }

  if (completed || questions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900 border border-emerald-700/60 rounded-3xl p-5 text-center text-white mb-4">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2 fill-amber-400" />
        <h3 className="font-bold text-base text-amber-300">Aaj Ka Smart Quiz Complete!</h3>
        <p className="text-xs text-emerald-200/90 my-2">
          Aapne quiz solve karke cash rewards claim kar liye hain!
        </p>
        <button
          onClick={fetchQuestions}
          className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs py-2 px-4 rounded-xl shadow cursor-pointer transition"
        >
          Naye Questions Load Karein
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-700/60 rounded-3xl p-4 shadow-2xl mb-4 text-white">
      <div className="flex items-center justify-between mb-3 border-b border-emerald-800/60 pb-2">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-base text-amber-300">AI Knowledge Quiz</h3>
        </div>
        <span className="bg-amber-400/20 text-amber-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30">
          Reward: +₹{currentQ.reward}
        </span>
      </div>

      <div className="text-xs text-emerald-200/80 mb-2 flex items-center justify-between">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Sahi Answer = Cash Reward 🎯</span>
      </div>

      <h4 className="font-bold text-sm text-white mb-3 bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800/50">
        {currentQ.question}
      </h4>

      {/* Options list */}
      <div className="space-y-2 mb-3">
        {currentQ.options.map((optionText, optIdx) => {
          let optionStyle = "bg-slate-900 border-emerald-800/60 text-emerald-100 hover:bg-emerald-900/60";

          if (selectedOpt === optIdx) {
            optionStyle = "bg-amber-400 text-emerald-950 font-bold border-amber-300";
          }

          if (isSubmitted) {
            if (optIdx === currentQ.correctIndex) {
              optionStyle = "bg-emerald-600 text-white font-bold border-emerald-400";
            } else if (selectedOpt === optIdx && selectedOpt !== currentQ.correctIndex) {
              optionStyle = "bg-rose-600 text-white font-bold border-rose-400";
            }
          }

          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(optIdx)}
              className={`w-full text-left text-xs p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${optionStyle}`}
            >
              <span>{optionText}</span>
              {isSubmitted && optIdx === currentQ.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              )}
              {isSubmitted && selectedOpt === optIdx && selectedOpt !== currentQ.correctIndex && (
                <XCircle className="w-4 h-4 text-rose-200" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer verification banner */}
      {isSubmitted && (
        <div className={`p-3 rounded-2xl mb-3 text-xs ${selectedOpt === currentQ.correctIndex ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-200" : "bg-rose-950/90 border border-rose-500/50 text-rose-200"}`}>
          <div className="font-bold mb-0.5">
            {selectedOpt === currentQ.correctIndex
              ? `🎉 Sahi Jawab! ₹${currentQ.reward} Wallet me jud gaye!`
              : "❌ Galat Jawab! Koi baat nahi agla question try karein."}
          </div>
          <p className="text-[11px] opacity-90">{currentQ.explanation}</p>
        </div>
      )}

      {/* Action Submit / Next Button */}
      {!isSubmitted ? (
        <button
          id="quiz-submit-answer-btn"
          onClick={handleCheckAnswer}
          disabled={selectedOpt === null}
          className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-emerald-950 font-bold py-2.5 px-4 rounded-2xl shadow transition disabled:opacity-50 cursor-pointer text-xs"
        >
          Answer Submit Karein
        </button>
      ) : (
        <button
          id="quiz-next-question-btn"
          onClick={handleNext}
          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-2xl shadow transition cursor-pointer text-xs"
        >
          Agla Question »
        </button>
      )}
    </div>
  );
};
