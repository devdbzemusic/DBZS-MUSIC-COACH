import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Calendar, Play, Square, Volume2, Sliders, Music, Zap } from "lucide-react";
import { translate } from "../utils/i18n";
import { playChord, playStrumPattern, playMetronomeTick, playShakerTick } from "../utils/synth";
import { CHORD_FORMULATIONS } from "../App";

interface DailySparkProps {
  currentMoodId: string;
  lang?: "de" | "en";
}

interface GeneratedJam {
  title: string;
  styleDescription: string;
  chordProgression: string;
  safeNotesPiano: string;
  safeNotesGuitar: string;
  safeNotesBass: string;
  jamTip: string;
}

export const DailySpark: React.FC<DailySparkProps> = ({ currentMoodId, lang = "de" }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const germanDefault = {
    title: "Herbstwind Arpeggios in A-Moll",
    styleDescription: "Melancholischer UK Pop / Indie Folk Vibe",
    chordProgression: "Am - F - C - G",
    safeNotesPiano: "A3, C4, E4 (Melancholietöne)",
    safeNotesGuitar: "Greife Am im 5. Bund (A-Moll Pentatoniktonleiter)",
    safeNotesBass: "A, F, C, G (Spiele nur Grundtöne auf der Zählzeit EINS)",
    jamTip: "Beginne extrem leise. Lass das Am voll ausklingen, bevor du fließend zum F-Akkord greifst. Wiederholung schlägt Schnelligkeit!"
  };

  const englishDefault = {
    title: "Autumn Wind Arpeggios in A Minor",
    styleDescription: "Melancholic UK Pop / Indie Folk Vibe",
    chordProgression: "Am - F - C - G",
    safeNotesPiano: "A3, C4, E4 (Melancholy tones)",
    safeNotesGuitar: "Fret Am on the 5th fret (A Minor pentatonic scale)",
    safeNotesBass: "A, F, C, G (Play only root notes on beat ONE)",
    jamTip: "Begin extremely softly. Let the Am ring out completely before smoothly transition to the F chord. Repetition beats speed here!"
  };

  const [jam, setJam] = useState<GeneratedJam | null>(germanDefault);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(null);
  const [jamBpm, setJamBpm] = useState<number>(105);
  const [jamPattern, setJamPattern] = useState<"groove" | "arpeggio" | "ballad" | "jazz" | "pad">("groove");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [drumsActive, setDrumsActive] = useState<boolean>(true);

  const currentStepRef = useRef<number>(0);
  const jamBpmRef = useRef<number>(jamBpm);
  const jamPatternRef = useRef<any>(jamPattern);
  const drumsActiveRef = useRef<boolean>(drumsActive);
  const totalStepsCountRef = useRef<number>(0);
  const stepTimerRef = useRef<any>(null);

  useEffect(() => { jamBpmRef.current = jamBpm; }, [jamBpm]);
  useEffect(() => { jamPatternRef.current = jamPattern; }, [jamPattern]);
  useEffect(() => { drumsActiveRef.current = drumsActive; }, [drumsActive]);

  const getChordsArray = () => {
    if (!jam) return [];
    return jam.chordProgression
      .split(/[-–,→\s]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && c !== "–" && c !== "-");
  };

  const stopPlayback = () => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentChordIndex(null);
    setCurrentStep(0);
  };

  const getChordNotes = (chordName: string): { note: string; octave?: number }[] => {
    let cleaned = chordName.trim();
    if (cleaned.includes("/")) {
      cleaned = cleaned.split("/")[0].trim();
    }
    
    if (CHORD_FORMULATIONS[cleaned]) {
      return CHORD_FORMULATIONS[cleaned];
    }

    const baseNoteRegex = /^([A-G]#?b?)/;
    const match = cleaned.match(baseNoteRegex);
    if (match) {
      const base = match[1];
      const isMinor = cleaned.toLowerCase().includes("m") && !cleaned.toLowerCase().includes("maj");
      const is7 = cleaned.includes("7");
      
      let lookup = base;
      if (isMinor) {
        lookup += "m";
      }
      if (is7) {
        lookup += "7";
      }
      
      if (CHORD_FORMULATIONS[lookup]) {
        return CHORD_FORMULATIONS[lookup];
      }
      
      const basicLookup = isMinor ? base + "m" : base;
      if (CHORD_FORMULATIONS[basicLookup]) {
        return CHORD_FORMULATIONS[basicLookup];
      }
    }

    return CHORD_FORMULATIONS["Am"] || [{ note: "A", octave: 3 }];
  };

  const startPlayback = () => {
    stopPlayback();
    const chords = getChordsArray();
    if (chords.length === 0) return;

    setIsPlaying(true);
    currentStepRef.current = 0;
    totalStepsCountRef.current = 0;
    setCurrentStep(0);
    setCurrentChordIndex(0);

    const runSequencerStep = () => {
      const activeChords = getChordsArray();
      if (activeChords.length === 0) return;

      const step = currentStepRef.current;
      const totalSteps = totalStepsCountRef.current;
      const bpmValue = jamBpmRef.current;
      const patternValue = jamPatternRef.current;
      const isDrumsOn = drumsActiveRef.current;

      // Each chord gets exactly 1 bar (8 eighth-note steps)
      const chordIndex = Math.floor(totalSteps / 8) % activeChords.length;
      setCurrentChordIndex(chordIndex);
      setCurrentStep(step);

      const activeChordName = activeChords[chordIndex];
      const notes = getChordNotes(activeChordName);

      // Play high-fidelity strumming pattern using VibeTheory's physical modeling engine
      playStrumPattern(notes, step, patternValue, bpmValue, "4/4", 1.0, 15);

      // Play drums/percussion
      if (isDrumsOn) {
        if (step % 2 === 0) {
          const mainBeat = Math.floor(step / 2) + 1;
          playMetronomeTick(mainBeat === 1, mainBeat === 1);
        } else {
          playShakerTick();
        }
      }

      currentStepRef.current = (step + 1) % 8;
      totalStepsCountRef.current = totalSteps + 1;

      const stepDurationMs = (30000 / bpmValue);
      stepTimerRef.current = setTimeout(runSequencerStep, stepDurationMs);
    };

    runSequencerStep();
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, []);

  // Stop playback if jam changes
  useEffect(() => {
    stopPlayback();
  }, [jam]);

  // Switch default fallback content based on language if user hasn't generated a custom one
  useEffect(() => {
    if (jam && (jam.title === germanDefault.title || jam.title === englishDefault.title)) {
      setJam(lang === "en" ? englishDefault : germanDefault);
    }
  }, [lang]);

  const handleGenerateDailyJam = async () => {
    setLoading(true);
    setError(null);
    setJam(null);

    try {
      const response = await fetch("/api/gemini/daily-jam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodId: currentMoodId, lang }),
      });

      if (!response.ok) {
        throw new Error(translate("generateError", lang) + " Status: " + response.status);
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setJam(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || translate("generateError", lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl relative overflow-hidden" id="daily-spark-container">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full filter blur-xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="text-amber-500 shrink-0" size={20} />
          <div>
            <h3 className="text-base sm:text-lg font-sans font-semibold text-white leading-tight">
              {translate("quickJamTitle", lang)}
            </h3>
            <p className="text-xs text-gray-400">{translate("quickJamSub", lang)}</p>
          </div>
        </div>

        <button
          onClick={handleGenerateDailyJam}
          disabled={loading}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold font-mono text-[10px] rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider disabled:opacity-50 cursor-pointer w-full sm:w-auto shrink-0"
        >
          <Sparkles size={11} className="animate-spin-slow" />
          <span>{translate("freshImpulse", lang)}</span>
        </button>
      </div>

      <p className="text-xs sm:text-sm text-gray-300 mb-5 leading-normal sm:leading-relaxed">
        {translate("generatorIntro", lang)}
      </p>

      {/* Jam Main Card */}
      {loading ? (
        <div className="bg-gray-950 p-6 rounded-xl border border-gray-850 h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest animate-pulse">
            {translate("loadingVibe", lang)}
          </p>
        </div>
      ) : jam ? (
        <div className="bg-gray-950 p-4 rounded-xl border border-gray-850 h-auto" id="jam-output-card">
          
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex-1 min-w-0">
              <span className="text-[9px] sm:text-[10px] font-mono text-amber-500 uppercase font-bold tracking-widest block">
                {translate("quickJamTitle", lang)}
              </span>
              <h4 className="text-sm sm:text-base font-sans font-bold text-white mt-0.5 break-words line-clamp-2 leading-tight">
                {jam.title}
              </h4>
            </div>
            <span className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-900/60 rounded text-[9px] uppercase tracking-wider font-mono whitespace-nowrap shrink-0">
              {translate("jamDuration", lang)}
            </span>
          </div>

          <div className="text-xs font-mono text-gray-300 mb-4 bg-gray-900/50 p-2.5 rounded border border-gray-850 italic break-words leading-relaxed">
            &ldquo;{jam.styleDescription}&rdquo;
          </div>

          {/* Golden chords progression block with interactive play/stop preview controls */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 font-mono block uppercase">
                {translate("recChords", lang)}
              </span>
              
              {/* Play / Preview Sequence Button */}
              <button
                onClick={isPlaying ? stopPlayback : startPlayback}
                id="daily-jam-hear-progression-btn"
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md select-none border border-transparent
                  ${isPlaying 
                    ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95"}`}
              >
                {isPlaying ? (
                  <>
                    <Square size={10} className="fill-white" />
                    <span>{lang === "en" ? "Stop Preview" : "Vorspielen Stoppen"}</span>
                  </>
                ) : (
                  <>
                    <Play size={10} className="fill-white" />
                    <span>{lang === "en" ? "Play Progression" : "Akkorde Vorspielen"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Interactive Chords Row/Grid */}
            <div className="relative flex flex-wrap items-center gap-2 bg-slate-950 p-3.5 rounded-xl border border-gray-900 justify-center shadow-inner min-h-[56px]" id="jam-interactive-chords-container">
              {getChordsArray().length > 0 ? (
                getChordsArray().map((chord, idx) => {
                  const isActive = isPlaying && currentChordIndex === idx;
                  return (
                    <div key={`jam-chord-badge-${idx}`} className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const notes = getChordNotes(chord);
                          playChord(notes, 1.6);
                          setCurrentChordIndex(idx);
                          if (!isPlaying) {
                            setTimeout(() => {
                              setCurrentChordIndex((prev) => (isPlaying ? prev : null));
                            }, 1200);
                          }
                        }}
                        className={`px-3.5 py-1.5 font-mono font-bold text-center rounded-lg border text-sm sm:text-base uppercase tracking-wider transition-all cursor-pointer active:scale-90 select-none flex items-center gap-1.5
                          ${isActive 
                            ? "bg-amber-500 text-black border-amber-400 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.65)] ring-2 ring-amber-400/50" 
                            : "bg-gray-900 border-gray-800 text-gray-300 hover:border-indigo-500 hover:text-white hover:scale-105"}`}
                        title={lang === "en" ? `Click to play ${chord} chord` : `Klicken, um Akkord ${chord} anzuspielen`}
                      >
                        {isActive && <Volume2 size={12} className="animate-bounce" />}
                        <span>{chord}</span>
                      </button>
                      {idx < getChordsArray().length - 1 && (
                        <span className="text-gray-700 font-bold select-none text-xs">➔</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <span className="text-sm text-yellow-500 font-mono font-bold italic">
                  {jam.chordProgression}
                </span>
              )}
            </div>
            <p className="text-[9px] text-gray-500 font-mono mt-1 text-center">
              {lang === "en" ? "💡 Protip: Click any individual chord badge to hear/preview that chord!" : "💡 Profi-Tipp: Klicke auf eine Akkordkarte, um diesen Akkord einzeln anzuhören!"}
            </p>
          </div>

          {/* Groove Control Center */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4" id="jam-groove-control-center">
            
            {/* Header with Title and LED Step Indicator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-800/80 mb-3" id="jam-groove-header">
              <div className="flex items-center gap-1.5">
                <Sliders className="text-amber-500 w-4 h-4 shrink-0 animate-pulse" />
                <span className="text-[11px] font-mono text-white uppercase font-bold tracking-wider">
                  {lang === "en" ? "Interactive Groove Settings" : "Interaktives Rhythmus & Groove-Center"}
                </span>
              </div>
              
              {/* Sequencer Step Lights */}
              <div className="flex items-center gap-1 bg-gray-950 px-2.5 py-1 rounded-full border border-gray-850 self-start" id="jam-step-indicator">
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold mr-1.5">{lang === "en" ? "Beat Step:" : "Takt-Beat:"}</span>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((stepIdx) => {
                  const isActive = isPlaying && currentStep === stepIdx;
                  return (
                    <div
                      key={`seq-light-${stepIdx}`}
                      className={`w-2 h-2 rounded-full transition-all duration-75
                        ${isActive 
                          ? "bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,0.9)]" 
                          : stepIdx % 2 === 0 
                            ? "bg-gray-700" 
                            : "bg-gray-800"}`}
                      title={`Step ${stepIdx + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Grid of Sliders & Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Pattern & Percussion */}
              <div className="flex flex-col gap-3">
                {/* Pattern Selection */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1.5 flex items-center gap-1">
                    <Music size={11} className="text-indigo-400" />
                    <span>{lang === "en" ? "Accompaniment Pattern:" : "Begleitmuster (Pattern):"}</span>
                  </label>
                  <select
                    value={jamPattern}
                    onChange={(e) => setJamPattern(e.target.value as any)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 px-3 text-xs font-mono text-gray-200 focus:ring-1 focus:ring-indigo-500 hover:border-gray-700 cursor-pointer"
                  >
                    <option value="groove">{lang === "en" ? "🥁 Folk-Pickup Groove" : "🥁 Folk-Pickup Groove"}</option>
                    <option value="arpeggio">{lang === "en" ? "🎹 Tender Arpeggio" : "🎹 Zärtliches Pick-Arpeggio"}</option>
                    <option value="ballad">{lang === "en" ? "🎸 Classic Steady Strum" : "🎸 Steady Balladen-Strum"}</option>
                    <option value="jazz">{lang === "en" ? "🎷 Syncopated Jazz Swing" : "🎷 Synkopierter Jazz-Swing"}</option>
                    <option value="pad">{lang === "en" ? "🎻 Sustained Soft Pad" : "🎻 Träumendes Sustained Pad"}</option>
                  </select>
                </div>

                {/* Percussion backing tracks */}
                <div className="flex items-center justify-between bg-gray-950/40 p-2.5 rounded-lg border border-gray-850">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white font-bold leading-none">{lang === "en" ? "Dynamic Rhythm Section" : "Rhythmische Perkussion"}</span>
                    <span className="text-[8px] font-mono text-gray-500 mt-0.5">{lang === "en" ? "Simulates Shaker & Wood Backbeats" : "Simuliert Shaker & Wood-Backbeats"}</span>
                  </div>
                  <button
                    onClick={() => setDrumsActive(!drumsActive)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm uppercase tracking-wider select-none border
                      ${drumsActive 
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30" 
                        : "bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700"}`}
                  >
                    <span>🥁</span>
                    <span>{drumsActive ? (lang === "en" ? "Active" : "Aktiv") : (lang === "en" ? "Muted" : "Stumm")}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Speed / Tempo Slider */}
              <div className="flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold flex items-center gap-1">
                      <Zap size={11} className="text-amber-500" />
                      <span>{lang === "en" ? "Tempo (BPM):" : "Tempo & Geschwindigkeit:"}</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-950/20 border border-amber-900/30 rounded">
                      {jamBpm} BPM
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="70"
                    max="145"
                    value={jamBpm}
                    onChange={(e) => setJamBpm(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-gray-950 h-2 rounded cursor-pointer mt-1"
                  />
                  
                  {/* Tempo quick presets */}
                  <div className="flex items-center gap-1.5 mt-2 justify-between" id="tempo-presets">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">{lang === "en" ? "Presets:" : "Presets:"}</span>
                    <div className="flex items-center gap-1">
                      {[76, 92, 108, 126].map((bpmPreset) => {
                        const isSelected = jamBpm === bpmPreset;
                        const label = bpmPreset <= 80 ? "Chill" : bpmPreset <= 95 ? "Flow" : bpmPreset <= 115 ? "Groove" : "Power";
                        return (
                          <button
                            key={`bpm-preset-${bpmPreset}`}
                            onClick={() => setJamBpm(bpmPreset)}
                            className={`px-2 py-1 text-[9px] font-mono rounded font-bold transition-all cursor-pointer whitespace-nowrap
                              ${isSelected 
                                ? "bg-amber-500 text-black shadow-md scale-105 animate-pulse" 
                                : "bg-gray-950 hover:bg-gray-850 text-gray-400 border border-gray-850"}`}
                          >
                            {bpmPreset} ({label})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Safe Notes Multi-Instrument Grid */}
          <div className="grid grid-cols-1 gap-2.5 mb-4" id="jam-safe-tones-grid">
            
            {/* Piano Safe Notes */}
            <div className="bg-gray-900/40 p-3 rounded border border-gray-850 flex flex-col justify-start min-h-[4rem]">
              <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">{translate("safePiano", lang)}</span>
              <p className="text-xs text-slate-300 font-mono font-bold pl-1 border-l-2 border-amber-500 break-words leading-normal whitespace-normal w-full overflow-hidden select-all">
                {jam.safeNotesPiano}
              </p>
            </div>

            {/* Guitar Safe Notes */}
            <div className="bg-gray-900/40 p-3 rounded border border-gray-850 flex flex-col justify-start min-h-[4rem]">
              <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">{translate("safeGuitar", lang)}</span>
              <p className="text-xs text-slate-300 font-mono font-bold pl-1 border-l-2 border-emerald-500 break-words leading-normal whitespace-normal w-full overflow-hidden select-all">
                {jam.safeNotesGuitar}
              </p>
            </div>

            {/* Bass Safe Notes */}
            <div className="bg-gray-900/40 p-3 rounded border border-gray-850 flex flex-col justify-start min-h-[4rem]">
              <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">{translate("safeBass", lang)}</span>
              <p className="text-xs text-slate-300 font-mono font-bold pl-1 border-l-2 border-sky-500 break-words leading-normal whitespace-normal w-full overflow-hidden select-all">
                {jam.safeNotesBass}
              </p>
            </div>

          </div>

          {/* Pro Jam Tip */}
          <div className="bg-[#0b101d] border border-indigo-950/50 p-3.5 rounded-lg h-auto">
            <span className="text-[9px] font-mono text-indigo-400 block uppercase font-bold">{translate("teacherHint", lang)}</span>
            <p className="text-xs text-slate-300 mt-1 font-mono leading-relaxed break-words">{jam.jamTip}</p>
          </div>

        </div>
      ) : (
        <div className="bg-gray-900/40 border border-gray-850 border-dashed rounded-xl p-5 text-center text-gray-500 text-xs font-mono h-32 flex items-center justify-center">
          {translate("generateFailback", lang)}
        </div>
      )}

      {/* Error layer */}
      {error && (
        <div className="mt-3 text-xs text-red-400 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg font-mono break-words">
          {error}
        </div>
      )}
    </div>
  );
};
