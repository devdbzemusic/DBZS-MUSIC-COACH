import React, { useState } from "react";
import { TheoryReveal } from "../types";
import { BookOpen, CheckCircle, HelpCircle, Heart } from "lucide-react";

interface TheoryRevealViewProps {
  theory: TheoryReveal;
}

export const TheoryRevealView: React.FC<TheoryRevealViewProps> = ({ theory }) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl" id="theory-reveal-view">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-emerald-400" size={20} />
        <h3 className="text-lg font-sans font-semibold text-white">Theory Reveal: Warum klingt das so?</h3>
      </div>

      <div className="bg-gray-950/70 p-4 border border-gray-850 rounded-lg mb-5">
        <h4 className="text-normal font-sans font-bold text-emerald-400 mb-2">
          {theory.headline}
        </h4>
        <p className="text-sm text-gray-350 leading-relaxed font-mono whitespace-pre-line">
          {theory.simpleExplanation}
        </p>
      </div>

      {/* Key terms bento stack */}
      <div className="mb-5">
        <span className="text-xs text-gray-500 font-mono block uppercase mb-2">Wichtigste Fachbegriffe:</span>
        <div className="grid grid-cols-2 gap-2" id="theory-terms-grid">
          {theory.keyTerms.map((term, index) => (
            <div
              key={`term-${index}`}
              className="px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg flex items-center gap-1.5 font-mono text-xs text-gray-300 transition-all hover:bg-indigo-950/20 hover:border-indigo-900/45 cursor-help"
            >
              <CheckCircle size={12} className="text-emerald-500 shrink-0" />
              <span>{term}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Memory card Game/Flahscard */}
      <div className="bg-[#0D1527] border border-emerald-950/60 rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-indigo-400 font-mono flex items-center gap-1">
            <HelpCircle size={13} />
            <span>Merkhilfe für dein Gehirn:</span>
          </span>
        </div>

        {!showAnswer ? (
          <div className="flex flex-col items-center py-3">
            <button
              id="flip-flashcard-button"
              onClick={() => setShowAnswer(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono rounded hover:from-emerald-700 hover:to-teal-700 font-bold text-xs shadow-md transition-all uppercase tracking-wider"
            >
              Merksatz umdrehen (Aha!)
            </button>
          </div>
        ) : (
          <div className="text-center py-2 animate-fade-in transition-all">
            <p className="italic text-emerald-300 font-sans text-sm font-semibold max-w-md mx-auto leading-relaxed">
              &ldquo;{theory.memoryPhrase}&rdquo;
            </p>
            <button
              onClick={() => setShowAnswer(false)}
              className="mt-3 text-[10px] text-gray-500 font-mono hover:text-gray-300 block mx-auto underline"
            >
              Nochmal ausblenden
            </button>
          </div>
        )}
      </div>

      {/* Encouraging Outro */}
      <div className="text-xs text-gray-500 font-mono flex items-center gap-2 border-t border-gray-850 pt-3">
        <Heart size={12} className="text-red-500 animate-pulse fill-red-500" />
        <span>Keine Angst vor Notenblätter-Druck: Du hast diese Theorie gerade praktisch über deine Finger begriffen!</span>
      </div>
    </div>
  );
};
