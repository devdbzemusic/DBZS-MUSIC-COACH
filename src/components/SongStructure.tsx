import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  GripVertical, 
  Volume2, 
  Music, 
  ListMusic, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  Upload
} from "lucide-react";
import { playChord } from "../utils/synth";
import { CHORD_FORMULATIONS } from "../App";
import { motion, AnimatePresence } from "motion/react";

// Define section structure
interface SongSection {
  id: "intro" | "verse" | "chorus" | "bridge";
  name: string;
  chords: string[]; // e.g. ["Am", "F", "C", "G"]
  color: string; // Tailwind class
  textColor: string;
  borderColor: string;
  bgLightColor: string;
}

// Default layout configurations
const SECTION_DEFAULTS: Record<string, { name: string; chords: string[]; color: string; textColor: string; borderColor: string; bgLightColor: string }> = {
  intro: { 
    name: "Intro", 
    chords: ["Am", "C"], 
    color: "bg-indigo-600", 
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    bgLightColor: "bg-indigo-950/20"
  },
  verse: { 
    name: "Verse / Strophe", 
    chords: ["Am", "F", "C", "G"], 
    color: "bg-emerald-600", 
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgLightColor: "bg-emerald-950/20"
  },
  chorus: { 
    name: "Chorus / Refrain", 
    chords: ["C", "G", "Am", "F"], 
    color: "bg-pink-600", 
    textColor: "text-pink-400",
    borderColor: "border-pink-500/30",
    bgLightColor: "bg-pink-950/20"
  },
  bridge: { 
    name: "Bridge / Überleitung", 
    chords: ["F", "G", "Em", "Am"], 
    color: "bg-amber-600", 
    textColor: "text-amber-450",
    borderColor: "border-amber-550/30",
    bgLightColor: "bg-amber-950/20"
  }
};

interface TimelineItem {
  uid: string; // unique identifier for list sorting
  sectionId: "intro" | "verse" | "chorus" | "bridge";
}

interface SongStructureProps {
  onLoadProgressionToStudio: (chords: string[]) => void;
  lang?: "en" | "de";
  bpm?: number;
}

export const SongStructure: React.FC<SongStructureProps> = ({ 
  onLoadProgressionToStudio,
  lang = "de",
  bpm = 100
}) => {
  // 1. Chords defined for each section
  const [sections, setSections] = useState<Record<string, SongSection>>({
    intro: { id: "intro", ...SECTION_DEFAULTS.intro },
    verse: { id: "verse", ...SECTION_DEFAULTS.verse },
    chorus: { id: "chorus", ...SECTION_DEFAULTS.chorus },
    bridge: { id: "bridge", ...SECTION_DEFAULTS.bridge }
  });

  // Active section currently selected/modified
  const [activeSectionId, setActiveSectionId] = useState<"intro" | "verse" | "chorus" | "bridge">("verse");

  // 2. Timeline Arrangement
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { uid: "t1", sectionId: "intro" },
    { uid: "t2", sectionId: "verse" },
    { uid: "t3", sectionId: "chorus" },
    { uid: "t4", sectionId: "verse" },
    { uid: "t5", sectionId: "chorus" },
    { uid: "t6", sectionId: "bridge" },
    { uid: "t7", sectionId: "chorus" }
  ]);

  // UI state feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [lastActionMsg, setLastActionMsg] = useState<string>("");

  // Playback state
  const [isPlayingSong, setIsPlayingSong] = useState<boolean>(false);
  const [playbackTimelineIndex, setPlaybackTimelineIndex] = useState<number>(-1);
  const [playbackChordIndex, setPlaybackChordIndex] = useState<number>(-1);

  const playbackTimerRef = useRef<any>(null);

  // Helper chord getter
  const getChordNotes = (chordName: string): { note: string; octave?: number }[] => {
    let cleaned = chordName.trim();
    if (cleaned.includes("/")) {
      cleaned = cleaned.split("/")[0].trim();
    }
    
    if (CHORD_FORMULATIONS[cleaned]) {
      return CHORD_FORMULATIONS[cleaned];
    }

    // Try finding basic match
    const baseNoteRegex = /^([A-G]#?b?)/;
    const match = cleaned.match(baseNoteRegex);
    if (match) {
      const base = match[1];
      const isMinor = cleaned.toLowerCase().includes("m") && !cleaned.toLowerCase().includes("maj");
      const is7 = cleaned.includes("7");
      
      let lookup = base;
      if (isMinor) lookup += "m";
      if (is7) lookup += "7";
      
      if (CHORD_FORMULATIONS[lookup]) return CHORD_FORMULATIONS[lookup];
      
      const basicLookup = isMinor ? base + "m" : base;
      if (CHORD_FORMULATIONS[basicLookup]) return CHORD_FORMULATIONS[basicLookup];
    }
    return [{ note: "A", octave: 3 }, { note: "C", octave: 3 }, { note: "E", octave: 3 }];
  };

  // Play a single section once 
  const playSectionOnce = (sec: SongSection) => {
    if (isPlayingSong) stopSong();
    
    let chIdx = 0;
    const notes = getChordNotes(sec.chords[chIdx]);
    playChord(notes, 1.4);
    showNotice(lang === "en" ? `Playing ${sec.name}` : `Spiele ${sec.name}`);

    // If section has more chords, play them sequentially
    if (sec.chords.length > 1) {
      let runCount = 1;
      const interval = setInterval(() => {
        if (runCount >= sec.chords.length) {
          clearInterval(interval);
          return;
        }
        const nextNotes = getChordNotes(sec.chords[runCount]);
        playChord(nextNotes, 1.4);
        runCount++;
      }, 1600);
    }
  };

  // Full timeline playback controller
  const startSong = () => {
    stopSong();
    if (timeline.length === 0) {
      showNotice(lang === "en" ? "Timeline empty!" : "Die Timeline ist leer!");
      return;
    }

    setIsPlayingSong(true);
    setPlaybackTimelineIndex(0);
    setPlaybackChordIndex(0);

    // Speed calculation from BPM (assuming 4 beats per chord or controllable step)
    // 60000 / BPM = 1 beat duration in ms. Let's make each chord last 2 beats.
    const chordDurationMs = Math.max(1200, (60000 / bpm) * 2);

    let currentTimelineIdx = 0;
    let currentChordIdx = 0;

    // Trigger first step
    const firstSecId = timeline[0].sectionId;
    const firstSec = sections[firstSecId];
    if (firstSec && firstSec.chords.length > 0) {
      const notes = getChordNotes(firstSec.chords[0]);
      playChord(notes, 1.5);
    }

    playbackTimerRef.current = setInterval(() => {
      const activeTimelineItem = timeline[currentTimelineIdx];
      const activeSec = sections[activeTimelineItem?.sectionId];

      if (!activeSec) {
        stopSong();
        return;
      }

      currentChordIdx++;
      if (currentChordIdx >= activeSec.chords.length) {
        // Jump to next timeline section
        currentTimelineIdx++;
        currentChordIdx = 0;

        if (currentTimelineIdx >= timeline.length) {
          // Finished entire song layout
          stopSong();
          showNotice(lang === "en" ? "✓ Playback finished" : "✓ Song fertig abgespielt!");
          return;
        }
      }

      setPlaybackTimelineIndex(currentTimelineIdx);
      setPlaybackChordIndex(currentChordIdx);

      const nextSec = sections[timeline[currentTimelineIdx].sectionId];
      if (nextSec && nextSec.chords[currentChordIdx]) {
        const chordName = nextSec.chords[currentChordIdx];
        const notes = getChordNotes(chordName);
        playChord(notes, 1.5);
      }
    }, chordDurationMs);
  };

  const stopSong = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlayingSong(false);
    setPlaybackTimelineIndex(-1);
    setPlaybackChordIndex(-1);
  };

  const showNotice = (msg: string) => {
    setLastActionMsg(msg);
    setTimeout(() => {
      setLastActionMsg((prev) => (prev === msg ? "" : prev));
    }, 4000);
  };

  // CRUD modifications on sections
  const handleUpdateChordString = (secId: string, chordStr: string) => {
    const list = chordStr
      .split(/[-–,→\s]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && c !== "–" && c !== "-");
    
    if (list.length === 0) return;

    setSections(prev => ({
      ...prev,
      [secId]: {
        ...prev[secId],
        chords: list
      }
    }));
  };

  // Add individual section to the end of timeline
  const appendSectionToTimeline = (secId: "intro" | "verse" | "chorus" | "bridge") => {
    const newUid = `t_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setTimeline(prev => [...prev, { uid: newUid, sectionId: secId }]);
    showNotice(lang === "en" ? `Added ${sections[secId].name} to Timeline` : `${sections[secId].name} zur Timeline hinzugefügt`);
  };

  // Duplicate an entity in the timeline at active index
  const duplicateTimelineItem = (idx: number) => {
    const item = timeline[idx];
    if (!item) return;
    const newUid = `t_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const updated = [...timeline];
    updated.splice(idx + 1, 0, { uid: newUid, sectionId: item.sectionId });
    setTimeline(updated);
  };

  // Delete entity in timeline
  const removeTimelineItem = (idx: number) => {
    const updated = timeline.filter((_, i) => i !== idx);
    setTimeline(updated);
  };

  // Move entity left (earlier) in timeline
  const moveItemLeft = (idx: number) => {
    if (idx <= 0) return;
    const updated = [...timeline];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setTimeline(updated);
  };

  // Move entity right (later) in timeline
  const moveItemRight = (idx: number) => {
    if (idx >= timeline.length - 1) return;
    const updated = [...timeline];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setTimeline(updated);
  };

  // Export full song text to Clipboard
  const handleExportSong = () => {
    const textLines = timeline.map((item, idx) => {
      const sec = sections[item.sectionId];
      return `[Abschnitt ${idx + 1}: ${sec.name}] ${sec.chords.join(" – ")}`;
    });
    const content = `=== SONG-ARRANGEMENT ===\nBPM: ${bpm}\n\n${textLines.join("\n")}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct injection to Studio logic
  const handlePushToStudio = (sec: SongSection) => {
    onLoadProgressionToStudio(sec.chords);
    showNotice(lang === "en" ? `Chords loaded into main Studio visualizer` : `Akkorde erfolgreich ins Musikstudio geladen`);
  };

  // Clean the layout
  const clearTimelineArrangement = () => {
    setTimeline([]);
    stopSong();
    showNotice(lang === "en" ? "Timeline cleared" : "Timeline geleert");
  };

  // HTML5 Drag & Drop Support
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const updated = [...timeline];
    const draggedItem = updated[draggedIdx];
    updated.splice(draggedIdx, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIdx(index);
    setTimeline(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  // Quick preset loader helper
  const loadPresetProgression = (presetType: "pop" | "jazz" | "blues") => {
    if (presetType === "pop") {
      setSections({
        intro: { id: "intro", ...SECTION_DEFAULTS.intro, chords: ["C", "G"] },
        verse: { id: "verse", ...SECTION_DEFAULTS.verse, chords: ["C", "G", "Am", "F"] },
        chorus: { id: "chorus", ...SECTION_DEFAULTS.chorus, chords: ["Am", "F", "C", "G"] },
        bridge: { id: "bridge", ...SECTION_DEFAULTS.bridge, chords: ["F", "G", "Am", "G"] }
      });
      setTimeline([
        { uid: "p1", sectionId: "intro" },
        { uid: "p2", sectionId: "verse" },
        { uid: "p3", sectionId: "chorus" },
        { uid: "p4", sectionId: "verse" },
        { uid: "p5", sectionId: "chorus" },
        { uid: "p6", sectionId: "bridge" },
        { uid: "p7", sectionId: "chorus" }
      ]);
      showNotice(lang === "en" ? "Standard Pop Preset loaded" : "Klassisches Pop-Preset geladen");
    } else if (presetType === "jazz") {
      setSections({
        intro: { id: "intro", ...SECTION_DEFAULTS.intro, chords: ["Dm7", "G7", "C"] },
        verse: { id: "verse", ...SECTION_DEFAULTS.verse, chords: ["Am7", "Dm7", "G7", "C"] },
        chorus: { id: "chorus", ...SECTION_DEFAULTS.chorus, chords: ["F", "Bb", "Em7", "Am7"] },
        bridge: { id: "bridge", ...SECTION_DEFAULTS.bridge, chords: ["Dm7", "G7", "Em7", "A7"] }
      });
      setTimeline([
        { uid: "j1", sectionId: "intro" },
        { uid: "j2", sectionId: "verse" },
        { uid: "j3", sectionId: "chorus" },
        { uid: "j4", sectionId: "verse" },
        { uid: "j5", sectionId: "chorus" },
        { uid: "j6", sectionId: "bridge" },
        { uid: "j7", sectionId: "chorus" }
      ]);
      showNotice(lang === "en" ? "Jazz 2-5-1 Preset loaded" : "Jazziges ii-V-I-Preset geladen");
    } else if (presetType === "blues") {
      setSections({
        intro: { id: "intro", ...SECTION_DEFAULTS.intro, chords: ["A7", "E7"] },
        verse: { id: "verse", ...SECTION_DEFAULTS.verse, chords: ["A7", "D7", "A7", "E7"] },
        chorus: { id: "chorus", ...SECTION_DEFAULTS.chorus, chords: ["A7", "D7", "A7", "E7"] },
        bridge: { id: "bridge", ...SECTION_DEFAULTS.bridge, chords: ["D7", "A7", "E7", "D7"] }
      });
      setTimeline([
        { uid: "b1", sectionId: "intro" },
        { uid: "b2", sectionId: "verse" },
        { uid: "b3", sectionId: "verse" },
        { uid: "b4", sectionId: "chorus" },
        { uid: "b5", sectionId: "bridge" },
        { uid: "b6", sectionId: "chorus" }
      ]);
      showNotice(lang === "en" ? "Blues 12-Bar Preset loaded" : "12-Takt-Blues-Preset geladen");
    }
  };

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-gray-950 p-6 rounded-2xl border border-gray-900 flex flex-col gap-6" id="song-structure-container">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <ListMusic size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100 font-mono flex items-center gap-2">
              🎵 {lang === "en" ? "Dynamic Song Arranger" : "Intelligenter Song-Arranger & Timeline"}
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              {lang === "en" 
                ? "Define chord blocks for song structures, sort them in a timeline with drag-and-drop, and preview the full arrangement."
                : "Definiere Akkordfolgen für Abschnitte und arrangiere sie per Drag-and-Drop in einer Timeline für komplette Songpreviews."}
            </p>
          </div>
        </div>

        {/* Preset fast switch actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase">{lang === "en" ? "Templates:" : "Vorlagen:"}</span>
          <button 
            onClick={() => loadPresetProgression("pop")}
            className="px-2.5 py-1 text-[10px] font-mono bg-indigo-950/40 text-indigo-300 rounded border border-indigo-900/35 hover:bg-indigo-900 hover:text-white"
          >
            🎸 {lang === "en" ? "Pop Ballad" : "Pop Ballade"}
          </button>
          <button 
            onClick={() => loadPresetProgression("jazz")}
            className="px-2.5 py-1 text-[10px] font-mono bg-emerald-950/40 text-emerald-300 rounded border border-emerald-900/35 hover:bg-emerald-900 hover:text-white"
          >
            🎹 {lang === "en" ? "Jazz ii-V-I" : "Jazz ii-V-I"}
          </button>
          <button 
            onClick={() => loadPresetProgression("blues")}
            className="px-2.5 py-1 text-[10px] font-mono bg-amber-950/40 text-amber-300 rounded border border-amber-900/35 hover:bg-amber-900 hover:text-white"
          >
            🌾 {lang === "en" ? "12-Bar Blues" : "12-Takt-Blues"}
          </button>
        </div>
      </div>

      {/* Part 1: Section Block Definitions cards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h4 className="text-xs font-bold text-gray-300 font-mono uppercase tracking-wide">
            1. {lang === "en" ? "Edit Structure Sections" : "Akkordfolgen nach Formteil definieren"}
          </h4>
          <span className="text-[10px] font-mono text-gray-500 italic">
            {lang === "en" ? "Click to play block or push block chords" : "Klick, um Block vorzuspielen oder ins Studio zu senden"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(Object.values(sections) as SongSection[]).map((sec) => {
            const isEditingActive = activeSectionId === sec.id;
            return (
              <div 
                key={sec.id}
                className={`relative rounded-xl border p-4.5 transition-all flex flex-col justify-between min-h-[175px] group
                  ${isEditingActive 
                    ? "bg-slate-900/70 border-indigo-500 shadow-lg shadow-indigo-950/20" 
                    : `${sec.bgLightColor} ${sec.borderColor} hover:bg-opacity-40`}`}
              >
                {/* Header Tag block */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${sec.color}`} />
                    <span className="text-xs font-black font-mono text-gray-200">{sec.name}</span>
                  </div>
                  
                  {/* Plus handle to add into timeline */}
                  <button
                    onClick={() => appendSectionToTimeline(sec.id)}
                    className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    title={lang === "en" ? "Add block to Timeline bottom" : "Zur Timeline hinzufügen"}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Input box chord string */}
                <div className="my-2.5">
                  <label className="text-[9px] font-mono text-gray-500 uppercase block mb-1">
                    {lang === "en" ? "Chords (separated by spaces or dash):" : "Akkorde (Leerschritt/Bindestrich):"}
                  </label>
                  <input
                    type="text"
                    defaultValue={sec.chords.join(" - ")}
                    onBlur={(e) => handleUpdateChordString(sec.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateChordString(sec.id, e.currentTarget.value);
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full bg-[#05070c] border border-gray-850 px-2 py-1 rounded text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-indigo-500 tracking-wide text-center uppercase"
                  />
                </div>

                {/* Chords preview badge layout */}
                <div className="flex flex-wrap items-center gap-1.5 py-1 mb-3.5 h-7 overflow-y-hidden">
                  {sec.chords.map((chord, cIdx) => (
                    <span 
                      key={`${sec.id}-ch-${cIdx}`}
                      className="px-1.5 py-0.5 bg-gray-950 rounded text-[9.5px] font-mono text-gray-300 font-bold border border-gray-800/65"
                    >
                      {chord}
                    </span>
                  ))}
                </div>

                {/* Footer action buttons inside card */}
                <div className="flex items-center justify-between gap-2 border-t border-gray-900/40 pt-2.5 mt-auto">
                  {/* Play chord block */}
                  <button
                    onClick={() => playSectionOnce(sec)}
                    className={`flex-1 py-1 rounded text-[9.5px] font-mono transition-all border flex items-center justify-center gap-1 uppercase font-bold cursor-pointer
                      bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-850 hover:text-white`}
                    title={lang === "en" ? "Play section chord progression" : "Diesen Teil vorspielen"}
                  >
                    <Volume2 size={10} />
                    <span>{lang === "en" ? "Hear" : "Anhöre"}</span>
                  </button>

                  {/* Send to studio direct layout */}
                  <button
                    onClick={() => handlePushToStudio(sec)}
                    className="flex-1 py-1 bg-indigo-950/30 border border-indigo-900/40 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded text-[9.5px] font-mono transition-all uppercase font-bold cursor-pointer flex items-center justify-center gap-1"
                    title={lang === "en" ? "Send sequence to central Studio" : "Akkorde in Studio visualisieren"}
                  >
                    <Upload size={10} />
                    <span>{lang === "en" ? "Load Studio" : "Studio"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Interactive Drag & Drop Timeline Builder */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h4 className="text-xs font-bold text-gray-300 font-mono uppercase tracking-wide flex items-center gap-1.5">
            <span>2. {lang === "en" ? "Timeline Arrangement (Song Timeline)" : "Song Timeline / Arrangement-Spur"}</span>
            <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-900 px-1.5 py-0.5 rounded-full font-mono animate-pulse">
              Drag & Drop {lang === "en" ? "supported" : "aktiviert"}
            </span>
          </h4>

          {/* Timeline action controls */}
          <div className="flex h-auto items-center gap-2">
            <button
              onClick={clearTimelineArrangement}
              className="px-2.5 py-1 text-[10px] font-mono text-gray-400 hover:text-white border border-gray-900 bg-gray-950 rounded hover:bg-gray-900 cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={11} />
              <span>{lang === "en" ? "Reset" : "Leeren"}</span>
            </button>

            <button
              onClick={handleExportSong}
              className="px-2.5 py-1 text-[10px] font-mono text-gray-200 bg-indigo-605/10 border border-indigo-900/50 hover:bg-indigo-900 hover:text-white rounded cursor-pointer flex items-center gap-1.5 transition-all"
              title={lang === "en" ? "Export full chords progression to clipboard" : "Kopiere den kompletten Song-Text für deine Notizen"}
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? (lang === "en" ? "Copied" : "Kopiert") : (lang === "en" ? "Copy Text" : "Songtext kopieren")}</span>
            </button>
          </div>
        </div>

        {/* Outer timeline box */}
        <div className="bg-[#04060b] p-5 rounded-2xl border border-gray-900 flex flex-col gap-5 shadow-inner">
          
          {/* Main timeline scroll container */}
          <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {timeline.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-gray-500 border border-dashed border-gray-900 rounded-xl flex flex-col items-center justify-center gap-2">
                <Music size={20} className="text-gray-600 animate-bounce" />
                <p>{lang === "en" ? "Arrangement track is empty. Tap standard block '+' buttons to insert!" : "Das Arrangement ist leer. Klicke bei den Formteilen oben das '+' an!"}</p>
                
                {/* Micro CTA help button */}
                <button
                  onClick={() => loadPresetProgression("pop")}
                  className="mt-2.5 px-3 py-1 bg-indigo-600 text-white rounded text-[10px] font-mono uppercase font-bold"
                >
                  {lang === "en" ? "Load Pop Preset template" : "Pop-Vorlage laden"}
                </button>
              </div>
            ) : (
              /* The Timeline Tracks Blocks list */
              <div className="flex items-center gap-3 py-2 pr-4 min-w-[750px]" style={{ minWidth: "750px" }}>
                
                {timeline.map((item, idx) => {
                  const sec = sections[item.sectionId];
                  if (!sec) return null;

                  const isBeingPlayedNow = isPlayingSong && playbackTimelineIndex === idx;
                  const isHoveredOrDragged = draggedIdx === idx;

                  return (
                    <div
                      key={item.uid}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`relative w-44 rounded-xl p-3 border transition-all select-none group flex flex-col justify-between shrink-0 cursor-grab active:cursor-grabbing
                        ${isBeingPlayedNow 
                          ? "bg-slate-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/40" 
                          : `${sec.bgLightColor} ${sec.borderColor} hover:bg-opacity-40`}
                        ${isHoveredOrDragged ? "opacity-45 scale-95 border-dashed border-indigo-500" : ""}
                      `}
                    >
                      {/* Playback step highlighter bar */}
                      {isBeingPlayedNow && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500 rounded-t-xl animate-pulse" />
                      )}

                      {/* Header row with part name, drag handle & removal */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <GripVertical size={11} className="text-gray-500 cursor-grab" />
                          <span className={`text-[10px] font-mono font-black ${sec.textColor} tracking-tight uppercase`}>
                            {idx + 1}. {sec.name}
                          </span>
                        </div>

                        {/* Remove from timeline */}
                        <button
                          onClick={() => removeTimelineItem(idx)}
                          className="w-4.5 h-4.5 rounded-full hover:bg-rose-950/40 hover:text-rose-400 text-gray-500 flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Chords of section indicator */}
                      <div className="bg-gray-950/80 p-2 rounded border border-gray-900 text-center my-2 select-text">
                        <div className="flex flex-wrap justify-center gap-1 max-h-[46px] overflow-y-auto">
                          {sec.chords.map((chord, chIdx) => {
                            const isSpecificChordPlaying = isBeingPlayedNow && playbackChordIndex === chIdx;
                            return (
                              <span
                                key={`tl-${item.uid}-ch-${chIdx}`}
                                className={`px-1 rounded text-[10.5px] font-mono font-bold tracking-tight
                                  ${isSpecificChordPlaying 
                                    ? "bg-amber-500 text-black font-black scale-110 shadow" 
                                    : "text-gray-400 bg-gray-900"}`}
                              >
                                {chord}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick structural re-order handles (arrow fallback buttons) */}
                      <div className="flex items-center justify-between gap-1 border-t border-gray-900/50 pt-2 opacity-35 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveItemLeft(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-gray-900 hover:bg-gray-850 text-gray-400 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                            title={lang === "en" ? "Move Left" : "Nach Links verschieben"}
                          >
                            <ArrowLeft size={10} />
                          </button>
                          <button
                            onClick={() => moveItemRight(idx)}
                            disabled={idx === timeline.length - 1}
                            className="p-1 rounded bg-gray-900 hover:bg-gray-850 text-gray-400 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                            title={lang === "en" ? "Move Right" : "Nach Rechts verschieben"}
                          >
                            <ArrowRight size={10} />
                          </button>
                        </div>

                        {/* Duplicate item block */}
                        <button
                          onClick={() => duplicateTimelineItem(idx)}
                          className="px-1.5 py-0.5 rounded bg-gray-900 hover:bg-indigo-950 hover:text-indigo-300 text-gray-400 text-[8px] font-mono uppercase font-bold transition-all cursor-pointer"
                          title={lang === "en" ? "Duplicate Block" : "Block duplizieren"}
                        >
                          {lang === "en" ? "Copy" : "Dupliz."}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Insertion micro card at the end */}
                <div className="w-32 h-24 border border-dashed border-gray-850 rounded-xl bg-gray-950/25 flex flex-col items-center justify-center p-2 text-center group shrink-0">
                  <span className="text-[9px] font-mono text-gray-500 mb-1.5">{lang === "en" ? "Add Form" : "Anhängen"}</span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {(Object.keys(sections) as ("intro" | "verse" | "chorus" | "bridge")[]).map((key) => (
                      <button
                        key={`append-tl-${key}`}
                        onClick={() => appendSectionToTimeline(key)}
                        className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold uppercase rounded border cursor-pointer hover:scale-105 active:scale-95
                          ${sections[key].color} bg-opacity-10 ${sections[key].textColor} ${sections[key].borderColor} hover:bg-opacity-30`}
                      >
                        +{key.substring(0, 1).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Part 3: Live Player Controller Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#090d16] p-4 rounded-xl border border-gray-900">
            <div className="flex items-center gap-3">
              {/* Play Song Action */}
              <button
                onClick={isPlayingSong ? stopSong : startSong}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-black uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md border border-transparent select-none
                  ${isPlayingSong 
                    ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105"}`}
              >
                {isPlayingSong ? (
                  <>
                    <Square size={12} className="fill-white" />
                    <span>{lang === "en" ? "Stop Arrangement" : "Song Preview stoppen"}</span>
                  </>
                ) : (
                  <>
                    <Play size={12} className="fill-white" />
                    <span>{lang === "en" ? "Play Entire Arrangement" : "Ganzes Arrangement abspielen"}</span>
                  </>
                )}
              </button>

              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest leading-none">
                  {lang === "en" ? "Tempo Status" : "Geschwindigkeits-Status"}
                </span>
                <span className="text-[11px] text-gray-300 font-mono font-bold mt-1">
                  {bpm} BPM ({lang === "en" ? "linked with mixer" : "synchron mit Mischpult"})
                </span>
              </div>
            </div>

            {/* Current step read-out indicator */}
            {isPlayingSong && playbackTimelineIndex >= 0 ? (
              <div className="flex items-center gap-2 bg-[#020408] border border-gray-850 px-3.5 py-1.5 rounded-lg animate-fade-in font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span className="text-[10px] text-gray-400">{lang === "en" ? "ACTIVE:" : "AKTIV:"}</span>
                <span className="text-amber-400 font-extrabold text-[11px] uppercase">
                  {playbackTimelineIndex + 1}. {sections[timeline[playbackTimelineIndex]?.sectionId]?.name} 
                  {" "}➔{" "}
                  {sections[timeline[playbackTimelineIndex]?.sectionId]?.chords[playbackChordIndex]}
                </span>
              </div>
            ) : (
              <div className="text-[10.5px] text-gray-500 font-mono leading-relaxed max-w-sm text-center sm:text-right hidden sm:block">
                💡 {lang === "en" 
                  ? "Rearrange by dragging cards. Speed of chords is determined by the live studio mix BPM."
                  : "Mische Intro, Strophe und Refrain beliebig. Die Taktgeschwindigkeit folgt dem Live-BPM-Regler links!"}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Action / Success notifications */}
      {lastActionMsg && (
        <div className="p-2 bg-indigo-950/20 border border-indigo-900/30 text-indigo-200 rounded-lg text-center font-mono text-[10px] animate-fade-in leading-snug">
          💡 {lastActionMsg}
        </div>
      )}

    </div>
  );
};
