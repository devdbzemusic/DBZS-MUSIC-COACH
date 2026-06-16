import React, { useState, useEffect } from "react";
import { RiffRecipe } from "../types";
import { Sparkles, Sliders, Play, Square, Info } from "lucide-react";
import { playSynthNote } from "../utils/synth";
import { motion } from "motion/react";

interface RiffForgeProps {
  moodId: string;
  riff: RiffRecipe;
}

export const RiffForge: React.FC<RiffForgeProps> = ({ moodId, riff }) => {
  const [tabContent, setTabContent] = useState<string>(riff.suggestedTab);
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRegler, setActiveRegler] = useState<string>("Standard");

  // Playback animation variables
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [playbackLines, setPlaybackLines] = useState<string[]>([]);
  
  useEffect(() => {
    // Reset tab content when mood changes
    setTabContent(riff.suggestedTab);
    setExplanation("");
    setActiveRegler("Standard");
    setError(null);
    setIsPlaying(false);
  }, [riff, moodId]);

  // Handle the Mood-Regler calls to proxy /api/gemini/vary-riff
  const handleVaryRiff = async (type: "heller" | "dunkler" | "trauriger" | "treibender" | "einfacher") => {
    setLoading(true);
    setError(null);
    setActiveRegler(type);
    setIsPlaying(false);

    try {
      const response = await fetch("/api/gemini/vary-riff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodId,
          variationType: type,
          currentRiff: riff.suggestedTab,
        }),
      });

      if (!response.ok) {
        throw new Error("Server antwortete mit Fehlercode: " + response.status);
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        if (data.newTab) setTabContent(data.newTab);
        if (data.explanation) setExplanation(data.explanation);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Es gab ein Problem beim Variieren des Riffs. Stell sicher, dass der GEMINI_API_KEY konfiguriert ist.");
    } finally {
      setLoading(false);
    }
  };

  // Tracing Playback Animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      // Split the ASCII Tab into columns
      const lines = tabContent.split("\n");
      setPlaybackLines(lines);
      
      // Determine length of a single string line (all strings should be roughly same length)
      const maxLen = Math.max(...lines.map(l => l.length));
      
      // Start stepping from index 3 (usually skipping 'e|--', 'B|--', etc.)
      setCurrentStep(3);

      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxLen - 1) {
            setIsPlaying(false);
            return -1;
          }
          
          // Audio metronome ticking sound on Web Audio API
          // Look down the column to see if there is any numerical fret value, e.g., "2" or "0" or "3"
          // If yes, trigger a synth note based on the string name
          lines.forEach((line, stringIndex) => {
            const char = line[prev];
            if (char && char !== "-" && char !== "|" && !isNaN(parseInt(char, 10))) {
              // Map standard guitar string notes E, A, D, G, B, e (from string index)
              const stringNotes = ["E", "B", "G", "D", "A", "E"]; // indices matching typical text lines: e.g. e| is line 0
              const isThinnest = line.startsWith("e|");
              const isThickest = line.startsWith("E|");
              let baseNote = "E";
              let octave = 2;

              if (line.toLowerCase().startsWith("e|")) { baseNote = "E"; octave = 4; }
              else if (line.toLowerCase().startsWith("b|")) { baseNote = "B"; octave = 3; }
              else if (line.toLowerCase().startsWith("g|")) { baseNote = "G"; octave = 3; }
              else if (line.toLowerCase().startsWith("d|")) { baseNote = "D"; octave = 3; }
              else if (line.toLowerCase().startsWith("a|")) { baseNote = "A"; octave = 2; }
              else if (line.toLowerCase().startsWith("e|") && isThickest) { baseNote = "E"; octave = 2; }
              
              const fretNum = parseInt(char, 10);
              // Simple audio playback based on fret offset
              const fretToNoteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
              const noteIdx = (fretToNoteOrder.indexOf(baseNote) + fretNum) % 12;
              const soundNoteName = fretToNoteOrder[noteIdx];
              
              playSynthNote(soundNoteName, octave, 0.5);
            }
          });
          
          return prev + 1;
        });
      }, 160); // 160ms per step represents roughly 92 bpm eighth notes
    } else {
      setCurrentStep(-1);
    }

    return () => clearInterval(interval);
  }, [isPlaying, tabContent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl"
      id="riff-forge-container"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-400" size={20} />
        <h3 className="text-lg font-sans font-semibold text-white">AI Riff Forge v0.1</h3>
      </div>

      <p className="text-sm text-gray-300 mb-4 h-auto">
        Hier wird aus Tonarten Melodie. Spiele das Standard-Riff oder nutze die <strong className="text-yellow-400">Mood-Regler</strong>,
        um das Riff dynamisch mit künstlicher Intelligenz umschreiben zu lassen.
      </p>

      {/* Riff Scale Tones Card */}
      <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-850 mb-5 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500 font-mono block uppercase">Melodiesieb</span>
          <div className="flex gap-1.5 mt-1">
            {riff.scaleTones.map((tone, idx) => (
              <span
                key={`tone-${idx}`}
                className="w-7 h-7 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono rounded-full flex items-center justify-center text-xs font-bold"
              >
                {tone}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500 font-mono block uppercase">Stimmung</span>
          <span className="text-xs font-bold text-gray-200 uppercase font-mono">{activeRegler}</span>
        </div>
      </div>

      {/* Mood-Regler sliders buttons in Modern Slate style */}
      <div className="mb-5">
        <span className="text-xs text-indigo-400 font-mono flex items-center gap-1 mb-2.5">
          <Sliders size={13} />
          <span>Mood-Regler betätigen:</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2" id="mood-regler-grid">
          {(["heller", "dunkler", "trauriger", "treibender", "einfacher"] as const).map((regler) => (
            <button
              key={regler}
              id={`regler-${regler}`}
              disabled={loading}
              onClick={() => handleVaryRiff(regler)}
              className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all flex flex-col items-center justify-center gap-1
                ${activeRegler === regler
                  ? "bg-amber-500 text-black font-bold border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : "bg-gray-900 border-gray-800 text-gray-300 hover:border-indigo-500/50 hover:text-white"
                } disabled:opacity-50`}
            >
              <span className="capitalize">{regler}</span>
              <span className="text-[10px] opacity-40">KI-Schnitt</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab block */}
      <div className="relative mb-5" id="ascii-tab-block">
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={loading}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-mono rounded border transition-all ${
              isPlaying 
                ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" 
                : "bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600 hover:text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={11} className="fill-red-400" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play size={11} className="fill-indigo-300 group-hover:fill-white" />
                <span>Abspielen</span>
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="bg-gray-950 p-6 rounded-lg border border-gray-800 h-44 flex flex-col items-center justify-center gap-2 animate-pulse">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-amber-400 font-mono mt-2 uppercase tracking-widest text-center">
              Varianzberechnung läuft... <br />
              <span className="text-[10px] text-gray-500 normal-case">Gemini modelliert Frequenzen neu</span>
            </p>
          </div>
        ) : (
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 relative font-mono text-sm leading-relaxed overflow-x-auto text-green-400 select-none shadow-inner h-44 flex items-center justify-center">
            {/* Playback trace overlapping */}
            {isPlaying ? (
              <div className="w-full">
                {playbackLines.map((line, lineIdx) => {
                  return (
                    <div key={`p-line-${lineIdx}`} className="whitespace-pre flex">
                      {line.split("").map((c, colIdx) => (
                        <span
                          key={`char-${colIdx}`}
                          className={`${colIdx === currentStep ? "bg-amber-500 text-black font-extrabold shadow-[0_0_8px_rgba(245,158,11,1)]" : ""}`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <pre className="whitespace-pre text-left w-full h-auto">{tabContent}</pre>
            )}
          </div>
        )}

        {/* Error layer */}
        {error && (
          <div className="mt-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Variation Hints / Explanation Reveal */}
      {explanation ? (
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-lg flex items-start gap-3">
          <Info className="text-indigo-400 mt-0.5 shrink-0" size={16} />
          <div>
            <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase">Theorie der Riff-Veränderung:</h4>
            <p className="text-sm text-gray-300 mt-1">{explanation}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-900">
          <h4 className="text-xs font-mono font-bold text-gray-500 uppercase mb-2">Variationstipps zum Üben:</h4>
          <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4 font-mono">
            {riff.variationHints.map((hint, index) => (
              <li key={`hint-${index}`}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};
