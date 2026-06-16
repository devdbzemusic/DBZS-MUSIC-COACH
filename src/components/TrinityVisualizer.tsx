import React, { useState } from "react";
import { ScaleNote, InstrumentMapping } from "../types";
import { playSynthNote, playChord } from "../utils/synth";
import { Music, Eye, Volume2, Sparkles, RotateCcw } from "lucide-react";
import { translate } from "../utils/i18n";
import { motion } from "motion/react";

interface TrinityVisualizerProps {
  chordName: string;
  mapping: InstrumentMapping;
  currentScaleName: string;
  lang?: "de" | "en";
}

// Helpers to list all scale notes for a given key signature
const getScaleNotes = (keySig: string): string[] => {
  const norm = keySig.trim().toLowerCase();
  if (norm.includes("a-moll") || norm === "am" || norm === "a_moll") {
    return ["A", "B", "C", "D", "E", "F", "G"];
  }
  if (norm.includes("e-moll") || norm === "em" || norm === "e_moll") {
    return ["E", "F#", "G", "A", "B", "C", "D"];
  }
  if (norm.includes("d-moll") || norm === "dm" || norm === "d_moll") {
    return ["D", "E", "F", "G", "A", "A#", "C"]; // normalized flat below
  }
  if (norm.includes("c-dur") || norm === "c" || norm === "c_dur") {
    return ["C", "D", "E", "F", "G", "A", "B"];
  }
  if (norm.includes("g-dur") || norm === "g" || norm === "g_dur") {
    return ["G", "A", "B", "C", "D", "E", "F#"];
  }
  if (norm.includes("d-dur") || norm === "d" || norm === "d_dur") {
    return ["D", "E", "F#", "G", "A", "B", "C#"];
  }
  if (norm === "e" || norm.includes("e-")) {
    return ["E", "F#", "G", "G#", "A", "A#", "B", "C#", "D"];
  }
  if (norm === "a" || norm.includes("a-")) {
    return ["A", "B", "C", "C#", "D", "D#", "E", "F#", "G"];
  }
  return ["A", "B", "C", "D", "E", "F", "G"];
};

const normalizeNote = (note: string): string => {
  const n = note.toUpperCase().trim();
  if (n === "BB" || n === "B♭" || n === "B-FLAT") return "A#";
  if (n === "DB" || n === "D♭" || n === "D-FLAT") return "C#";
  if (n === "EB" || n === "E♭" || n === "E-FLAT") return "D#";
  if (n === "GB" || n === "G♭" || n === "G-FLAT") return "F#";
  if (n === "AB" || n === "A♭" || n === "A-FLAT") return "G#";
  return n;
};

interface VoicingDetail {
  piano: ScaleNote[];
  guitarTab: string;
  bassTab: string;
}

const VOICING_PRESETS: { [chordName: string]: { [voicingIndex: number]: Partial<VoicingDetail> } } = {
  "Am": {
    1: {
      piano: [
        { note: "C", interval: "Third", octave: 3 },
        { note: "E", interval: "Fifth", octave: 3 },
        { note: "A", interval: "Root", octave: 4 }
      ],
      guitarTab: "x-3-2-2-1-0",
      bassTab: "x-3-2-2"
    },
    2: {
      piano: [
        { note: "E", interval: "Fifth", octave: 3 },
        { note: "A", interval: "Root", octave: 3 },
        { note: "C", interval: "Third", octave: 4 }
      ],
      guitarTab: "0-2-2-1-0-0",
      bassTab: "0-2-2-x"
    }
  },
  "C": {
    1: {
      piano: [
        { note: "E", interval: "Third", octave: 3 },
        { note: "G", interval: "Fifth", octave: 3 },
        { note: "C", interval: "Root", octave: 4 }
      ],
      guitarTab: "0-3-2-0-1-0",
      bassTab: "0-3-2-0"
    },
    2: {
      piano: [
        { note: "G", interval: "Fifth", octave: 3 },
        { note: "C", interval: "Root", octave: 4 },
        { note: "E", interval: "Third", octave: 4 }
      ],
      guitarTab: "3-3-2-0-1-0",
      bassTab: "3-3-2-x"
    }
  },
  "G": {
    1: {
      piano: [
        { note: "B", interval: "Third", octave: 3 },
        { note: "D", interval: "Fifth", octave: 4 },
        { note: "G", interval: "Root", octave: 4 }
      ],
      guitarTab: "x-2-0-0-0-3",
      bassTab: "x-2-0-0"
    },
    2: {
      piano: [
        { note: "D", interval: "Fifth", octave: 3 },
        { note: "G", interval: "Root", octave: 3 },
        { note: "B", interval: "Third", octave: 3 }
      ],
      guitarTab: "x-x-0-0-0-3",
      bassTab: "x-x-0-2"
    }
  },
  "F": {
    1: {
      piano: [
        { note: "A", interval: "Third", octave: 3 },
        { note: "C", interval: "Fifth", octave: 4 },
        { note: "F", interval: "Root", octave: 4 }
      ],
      guitarTab: "x-0-3-2-1-1",
      bassTab: "x-0-3-2"
    },
    2: {
      piano: [
        { note: "C", interval: "Fifth", octave: 3 },
        { note: "F", interval: "Root", octave: 3 },
        { note: "A", interval: "Third", octave: 3 }
      ],
      guitarTab: "x-3-3-2-1-1",
      bassTab: "x-3-3-x"
    }
  },
  "Em": {
    1: {
      piano: [
        { note: "G", interval: "Third", octave: 3 },
        { note: "B", interval: "Fifth", octave: 3 },
        { note: "E", interval: "Root", octave: 4 }
      ],
      guitarTab: "3-2-2-0-0-0",
      bassTab: "3-2-2-0"
    },
    2: {
      piano: [
        { note: "B", interval: "Fifth", octave: 3 },
        { note: "E", interval: "Root", octave: 4 },
        { note: "G", interval: "Third", octave: 4 }
      ],
      guitarTab: "x-2-2-0-0-0",
      bassTab: "x-2-2-x"
    }
  },
  "D": {
    1: {
      piano: [
        { note: "F#", interval: "Third", octave: 3 },
        { note: "A", interval: "Fifth", octave: 3 },
        { note: "D", interval: "Root", octave: 4 }
      ],
      guitarTab: "2-0-0-2-3-2",
      bassTab: "2-0-0-2"
    },
    2: {
      piano: [
        { note: "A", interval: "Fifth", octave: 3 },
        { note: "D", interval: "Root", octave: 4 },
        { note: "F#", interval: "Third", octave: 4 }
      ],
      guitarTab: "x-0-0-2-3-2",
      bassTab: "x-0-4-2"
    }
  },
  "E7": {
    1: {
      piano: [
        { note: "G#", interval: "Third", octave: 3 },
        { note: "D", interval: "Other", octave: 4 },
        { note: "E", interval: "Root", octave: 4 }
      ],
      guitarTab: "4-2-0-1-0-0",
      bassTab: "4-2-0-x"
    },
    2: {
      piano: [
        { note: "D", interval: "Other", octave: 3 },
        { note: "E", interval: "Root", octave: 3 },
        { note: "G#", interval: "Third", octave: 3 }
      ],
      guitarTab: "x-x-0-1-0-0",
      bassTab: "x-x-0-1"
    }
  },
  "A7": {
    1: {
      piano: [
        { note: "C#", interval: "Third", octave: 3 },
        { note: "G", interval: "Other", octave: 3 },
        { note: "A", interval: "Root", octave: 4 }
      ],
      guitarTab: "x-4-2-0-2-0",
      bassTab: "x-4-2-0"
    },
    2: {
      piano: [
        { note: "G", interval: "Other", octave: 3 },
        { note: "A", interval: "Root", octave: 3 },
        { note: "C#", interval: "Third", octave: 4 }
      ],
      guitarTab: "x-0-2-2-2-3",
      bassTab: "3-0-2-2"
    }
  },
  "B7": {
    1: {
      piano: [
        { note: "D#", interval: "Third", octave: 3 },
        { note: "A", interval: "Other", octave: 3 },
        { note: "B", interval: "Root", octave: 4 }
      ],
      guitarTab: "x-6-4-4-4-x",
      bassTab: "x-6-4-4"
    },
    2: {
      piano: [
        { note: "A", interval: "Other", octave: 3 },
        { note: "B", interval: "Root", octave: 3 },
        { note: "D#", interval: "Third", octave: 4 }
      ],
      guitarTab: "5-x-4-4-4-x",
      bassTab: "5-2-4-4"
    }
  },
  "Dm": {
    1: {
      piano: [
        { note: "F", interval: "Third", octave: 3 },
        { note: "A", interval: "Fifth", octave: 3 },
        { note: "D", interval: "Root", octave: 4 }
      ],
      guitarTab: "1-0-0-2-3-1",
      bassTab: "1-0-0-2"
    },
    2: {
      piano: [
        { note: "A", interval: "Fifth", octave: 3 },
        { note: "D", interval: "Root", octave: 4 },
        { note: "F", interval: "Third", octave: 4 }
      ],
      guitarTab: "x-0-0-2-3-1",
      bassTab: "x-0-2-2"
    }
  },
  "Bb": {
    1: {
      piano: [
        { note: "D", interval: "Third", octave: 3 },
        { note: "F", interval: "Fifth", octave: 3 },
        { note: "A#", interval: "Root", octave: 3 }
      ],
      guitarTab: "x-5-3-3-3-x",
      bassTab: "x-5-3-3"
    },
    2: {
      piano: [
        { note: "F", interval: "Fifth", octave: 3 },
        { note: "A#", interval: "Root", octave: 3 },
        { note: "D", interval: "Third", octave: 4 }
      ],
      guitarTab: "x-x-3-3-3-1",
      bassTab: "x-x-3-3"
    }
  },
  "Em7": {
    1: {
      piano: [
        { note: "G", interval: "Third", octave: 3 },
        { note: "D", interval: "Other", octave: 4 },
        { note: "E", interval: "Root", octave: 4 }
      ],
      guitarTab: "3-2-2-0-3-0",
      bassTab: "3-2-0-0"
    },
    2: {
      piano: [
        { note: "D", interval: "Other", octave: 3 },
        { note: "E", interval: "Root", octave: 3 },
        { note: "G", interval: "Third", octave: 3 }
      ],
      guitarTab: "x-r-x-2-0-3-0",
      bassTab: "x-5-2-0"
    }
  },
  "Am7": {
    1: {
      piano: [
        { note: "C", interval: "Third", octave: 3 },
        { note: "G", interval: "Other", octave: 3 },
        { note: "A", interval: "Root", octave: 4 }
      ],
      guitarTab: "x-3-2-0-1-0",
      bassTab: "x-3-2-0"
    },
    2: {
      piano: [
        { note: "G", interval: "Other", octave: 3 },
        { note: "A", interval: "Root", octave: 3 },
        { note: "C", interval: "Third", octave: 4 }
      ],
      guitarTab: "3-0-2-0-1-0",
      bassTab: "3-0-2-2"
    }
  },
  "D7": {
    1: {
      piano: [
        { note: "F#", interval: "Third", octave: 3 },
        { note: "C", interval: "Other", octave: 4 },
        { note: "D", interval: "Root", octave: 4 }
      ],
      guitarTab: "2-0-0-2-1-2",
      bassTab: "2-0-4-x"
    },
    2: {
      piano: [
        { note: "C", interval: "Other", octave: 3 },
        { note: "D", interval: "Root", octave: 3 },
        { note: "F#", interval: "Third", octave: 3 }
      ],
      guitarTab: "x-3-0-2-1-2",
      bassTab: "8-x-0-2"
    }
  },
  "Gm": {
    1: {
      piano: [
        { note: "A#", interval: "Third", octave: 3 },
        { note: "D", interval: "Fifth", octave: 3 },
        { note: "G", interval: "Root", octave: 4 }
      ],
      guitarTab: "x-1-0-0-3-3",
      bassTab: "x-1-0-0"
    },
    2: {
      piano: [
        { note: "D", interval: "Fifth", octave: 3 },
        { note: "G", interval: "Root", octave: 3 },
        { note: "A#", interval: "Third", octave: 3 }
      ],
      guitarTab: "x-x-0-3-3-3",
      bassTab: "x-5-x-x"
    }
  },
  "Bm": {
    1: {
      piano: [
        { note: "D", interval: "Third", octave: 3 },
        { note: "F#", interval: "Fifth", octave: 3 },
        { note: "B", interval: "Root", octave: 3 }
      ],
      guitarTab: "x-5-4-4-3-x",
      bassTab: "x-5-4-4"
    },
    2: {
      piano: [
        { note: "F#", interval: "Fifth", octave: 3 },
        { note: "B", interval: "Root", octave: 3 },
        { note: "D", interval: "Third", octave: 4 }
      ],
      guitarTab: "2-2-4-4-3-2",
      bassTab: "2-2-4-4"
    }
  },
  "Cadd9": {
    1: {
      piano: [
        { note: "E", interval: "Third", octave: 3 },
        { note: "G", interval: "Fifth", octave: 3 },
        { note: "C", interval: "Root", octave: 4 },
        { note: "D", interval: "Other", octave: 4 }
      ],
      guitarTab: "0-3-2-0-3-0",
      bassTab: "0-3-2-5"
    },
    2: {
      piano: [
        { note: "G", interval: "Fifth", octave: 3 },
        { note: "C", interval: "Root", octave: 4 },
        { note: "D", interval: "Other", octave: 4 },
        { note: "E", interval: "Third", octave: 4 }
      ],
      guitarTab: "3-3-2-0-3-0",
      bassTab: "3-3-2-5"
    }
  }
};

function getPianoInversion(pianoNotes: ScaleNote[], inversionLevel: number): ScaleNote[] {
  if (!pianoNotes || pianoNotes.length === 0) return [];
  let result = [...pianoNotes];
  for (let step = 0; step < inversionLevel; step++) {
    if (result.length > 0) {
      const firstNote = { ...result[0] };
      const currentOctave = firstNote.octave !== undefined ? firstNote.octave : 3;
      firstNote.octave = currentOctave === 3 ? 4 : (currentOctave === 4 ? 4 : currentOctave + 1);
      result = [...result.slice(1), firstNote];
    }
  }
  return result;
}

export const TrinityVisualizer: React.FC<TrinityVisualizerProps> = ({
  chordName,
  mapping,
  currentScaleName,
  lang = "de",
}) => {
  const [bassStringsCount, setBassStringsCount] = useState<4 | 5>(4);
  const [activeTab, setActiveTab] = useState<"piano" | "guitar" | "bass" | "fretboard">("piano");
  const [highlightScale, setHighlightScale] = useState<boolean>(true); // default to true so users immediately see it!
  const [selectedVoicing, setSelectedVoicing] = useState<number>(0);

  // Reset selected voicing when chord details change
  React.useEffect(() => {
    setSelectedVoicing(0);
  }, [chordName]);

  // Derive the active instrument mapping based on selected voicing
  const getActiveMapping = (): InstrumentMapping => {
    if (selectedVoicing === 0 || !mapping) return mapping;
    
    const presetGroup = VOICING_PRESETS[chordName];
    if (presetGroup && presetGroup[selectedVoicing]) {
      const preset = presetGroup[selectedVoicing];
      return {
        piano: (preset.piano || getPianoInversion(mapping.piano, selectedVoicing)) as ScaleNote[],
        guitarTab: preset.guitarTab || mapping.guitarTab,
        bassTab: preset.bassTab || mapping.bassTab
      };
    }

    // Default dynamic fallback if no predefined preset for chord
    return {
      piano: getPianoInversion(mapping.piano, selectedVoicing),
      guitarTab: mapping.guitarTab,
      bassTab: mapping.bassTab
    };
  };

  const activeMapping = getActiveMapping();
  const scaleNotes = getScaleNotes(currentScaleName).map(normalizeNote);


  // Format note colors
  const getIntervalColor = (interval: "Root" | "Third" | "Fifth" | "Other") => {
    switch (interval) {
      case "Root":
        return "bg-amber-500 text-black border-amber-350 shadow-[0_0_12px_-1px_rgba(245,158,11,0.8)]";
      case "Third":
        return "bg-emerald-500 text-black border-emerald-350 shadow-[0_0_12px_-1px_rgba(16,185,129,0.8)]";
      case "Fifth":
        return "bg-sky-500 text-white border-sky-350 shadow-[0_0_12px_-1px_rgba(14,165,233,0.8)]";
      default:
        return "bg-purple-500 text-white border-purple-350 shadow-[0_0_12px_-1px_rgba(168,85,247,0.8)]";
    }
  };

  const getIntervalBgHex = (interval: "Root" | "Third" | "Fifth" | "Other") => {
    switch (interval) {
      case "Root": return "#F59E0B"; // Amber
      case "Third": return "#10B981"; // Mint
      case "Fifth": return "#0EA5E9"; // Ocean Blue
      default: return "#A855F7"; // Purple
    }
  };

  const handlePlayWholeChord = () => {
    if (activeMapping && activeMapping.piano) {
      playChord(activeMapping.piano, 1.5);
    }
  };

  // Piano keys config (from C3 up to B4)
  const pianoKeys = [
    { note: "C", type: "white", octave: 3 },
    { note: "C#", type: "black", octave: 3 },
    { note: "D", type: "white", octave: 3 },
    { note: "D#", type: "black", octave: 3 },
    { note: "E", type: "white", octave: 3 },
    { note: "F", type: "white", octave: 3 },
    { note: "F#", type: "black", octave: 3 },
    { note: "G", type: "white", octave: 3 },
    { note: "G#", type: "black", octave: 3 },
    { note: "A", type: "white", octave: 3 },
    { note: "A#", type: "black", octave: 3 },
    { note: "B", type: "white", octave: 3 },
    
    { note: "C", type: "white", octave: 4 },
    { note: "C#", type: "black", octave: 4 },
    { note: "D", type: "white", octave: 4 },
    { note: "D#", type: "black", octave: 4 },
    { note: "E", type: "white", octave: 4 },
    { note: "F", type: "white", octave: 4 },
    { note: "F#", type: "black", octave: 4 },
    { note: "G", type: "white", octave: 4 },
    { note: "G#", type: "black", octave: 4 },
    { note: "A", type: "white", octave: 4 },
    { note: "A#", type: "black", octave: 4 },
    { note: "B", type: "white", octave: 4 },
  ];

  // Helper to parse guitar string coordinates e.g. "x-3-2-0-1-0"
  // from thickest (E) to thinnest (e)
  const parseGuitarTab = (tabStr: string) => {
    if (!tabStr) return [];
    // Split by "-"
    return tabStr.split("-").map(v => v.trim() === "x" ? -1 : parseInt(v, 10));
  };

  // For Guitar Fretboard Rendering (E A D G B e)
  const guitarStrings = [
    { name: "e", openNote: "E", octave: 4 },
    { name: "B", openNote: "B", octave: 3 },
    { name: "G", openNote: "G", octave: 3 },
    { name: "D", openNote: "D", octave: 3 },
    { name: "A", openNote: "A", octave: 2 },
    { name: "E", openNote: "E", octave: 2 },
  ];

  const guitarFrets = [0, 1, 2, 3, 4, 5];

  // Guitar chord positions derived from activeMapping
  const guitarPositions = parseGuitarTab(activeMapping?.guitarTab || "");

  // Calculated exact note & correct octave for any guitar fret
  const getGuitarNoteAndOctave = (stringIndex: number, fret: number) => {
    const notesOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const openNotes = ["E", "B", "G", "D", "A", "E"];
    const openOctaves = [4, 3, 3, 3, 2, 2];
    
    const baseNote = openNotes[stringIndex];
    const startOctave = openOctaves[stringIndex];
    const startIndex = notesOrder.indexOf(baseNote);
    
    let curOctave = startOctave;
    let curIndex = startIndex;
    for (let step = 0; step < fret; step++) {
      curIndex++;
      if (curIndex >= 12) {
        curIndex = 0;
        curOctave++;
      }
    }
    return { note: notesOrder[curIndex], octave: curOctave };
  };

  // Calculated exact note & correct octave for any bass fret
  const getBassNoteAndOctave = (stringIndex: number, fret: number, isFiveString: boolean) => {
    const notesOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const openNotes = isFiveString 
      ? ["G", "D", "A", "E", "B"]
      : ["G", "D", "A", "E"];
    const openOctaves = isFiveString
      ? [2, 2, 1, 1, 0]
      : [2, 2, 1, 1];
      
    const baseNote = openNotes[stringIndex];
    const startOctave = openOctaves[stringIndex];
    const startIndex = notesOrder.indexOf(baseNote);
    
    let curOctave = startOctave;
    let curIndex = startIndex;
    for (let step = 0; step < fret; step++) {
      curIndex++;
      if (curIndex >= 12) {
        curIndex = 0;
        curOctave++;
      }
    }
    return { note: notesOrder[curIndex], octave: curOctave };
  };

  // Match current guitar chord notes with mapped Piano ScaleNote interval info for highlighting
  const getGuitarFretIntervalInfo = (stringIndex: number, fret: number): ScaleNote | null => {
    if (guitarPositions.length === 0) return null;
    const playFret = guitarPositions[5 - stringIndex];
    if (playFret !== fret) return null;

    // We can compute the note name on this string/fret to assign the color
    // 0: E, 1: B, 2: G, 3: D, 4: A, 5: E
    const notesOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const openNotes = ["E", "B", "G", "D", "A", "E"];
    const baseNote = openNotes[stringIndex];
    const startIndex = notesOrder.indexOf(baseNote);
    const finalNote = notesOrder[(startIndex + fret) % 12];
    
    // Find matching piano note from activeMapping
    const match = activeMapping.piano.find(p => p.note.toUpperCase() === finalNote.toUpperCase());
    if (match) {
      return { note: finalNote, interval: match.interval, octave: 3 };
    }
    return { note: finalNote, interval: "Other" };
  };

  // For Bass (4-Saiter E A D G, 5-Saiter B E A D G)
  const bassStrings4 = [
    { name: "G", openNote: "G", octave: 2 },
    { name: "D", openNote: "D", octave: 2 },
    { name: "A", openNote: "A", octave: 1 },
    { name: "E", openNote: "E", octave: 1 },
  ];

  const bassStrings5 = [
    { name: "G", openNote: "G", octave: 2 },
    { name: "D", openNote: "D", octave: 2 },
    { name: "A", openNote: "A", octave: 1 },
    { name: "E", openNote: "E", octave: 1 },
    { name: "B", openNote: "B", octave: 0 },
  ];

  const bassFrets = [0, 1, 2, 3, 4, 5, 6, 7];

  // Map of basic root positions on bass for the primary root note of our chords
  const getBassFretIntervalInfo = (stringIndex: number, fret: number, isFiveString: boolean): ScaleNote | null => {
    // Determine note played on this bass string and fret
    const notesOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const openNotes = isFiveString 
      ? ["G", "D", "A", "E", "B"]
      : ["G", "D", "A", "E"];
      
    const baseNote = openNotes[stringIndex];
    const startIndex = notesOrder.indexOf(baseNote);
    const finalNote = notesOrder[(startIndex + fret) % 12];

    // Check if this note matches any in the chord definition
    const match = activeMapping.piano.find(p => p.note.toUpperCase() === finalNote.toUpperCase());
    if (match) {
      return { note: finalNote, interval: match.interval };
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl relative overflow-hidden"
      id="trinity-visualizer-container"
    >
      {/* Glow Ambient Layer */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-505/10 rounded-full filter blur-xl pointer-events-none"></div>
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-800">
        <div>
          <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase font-medium">Trinity Mapping</span>
          <h3 className="text-xl font-sans font-semibold text-white flex items-center gap-2">
            {lang === "en" ? "Chord Color-Code:" : "Akkord-Farbcode:"} <span className="px-3 py-0.5 bg-gray-950 border border-gray-800 text-indigo-300 font-mono rounded text-lg">{chordName}</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scale Highlight Toggle Switch */}
          <button
            id="toggle-scale-highlight"
            onClick={() => setHighlightScale(!highlightScale)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center gap-2
              ${highlightScale 
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)] bg-amber-950/20" 
                : "bg-gray-950 border-gray-850 hover:border-gray-750 text-gray-400"
              }`}
            title={lang === "en" ? `Show/hide ${currentScaleName} scale` : `Tonleiter ${currentScaleName} ein/ausblenden`}
          >
            <Sparkles size={13} className={highlightScale ? "text-amber-400 animate-pulse" : "text-gray-500"} />
            <span>{lang === "en" ? "Scale Focus:" : "Tonleiter-Fokus:"} {currentScaleName}</span>
          </button>

          {/* Tabs */}
          <div className="bg-gray-950 p-1 rounded-lg border border-gray-800 flex flex-wrap gap-1">
            <button
              id="tap-piano"
              onClick={() => setActiveTab("piano")}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${activeTab === "piano" ? "bg-indigo-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
            >
              🎹 {lang === "en" ? "Piano" : "Klavier"}
            </button>
            <button
              id="tap-guitar"
              onClick={() => setActiveTab("guitar")}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${activeTab === "guitar" ? "bg-indigo-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
            >
              🎸 {lang === "en" ? "Guitar" : "Gitarre"}
            </button>
            <button
              id="tap-fretboard"
              onClick={() => setActiveTab("fretboard")}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${activeTab === "fretboard" ? "bg-indigo-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
            >
              👁️‍🗨️ {lang === "en" ? "Fretboard Overlay" : "Griffbrett-Overlay"}
            </button>
            <button
              id="tap-bass"
              onClick={() => setActiveTab("bass")}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${activeTab === "bass" ? "bg-indigo-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
            >
              🎸 {lang === "en" ? "Bass" : "Bass"}
            </button>
          </div>

          <button
            id="play-chord-sound"
            onClick={handlePlayWholeChord}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-xs font-mono transition-all"
            title={lang === "en" ? "Listen to Chord" : "Akkord anhören"}
          >
            <Volume2 size={14} />
            <span>{lang === "en" ? "Listen to Chord" : "Akkord anhören"}</span>
          </button>
        </div>
      </div>

      {/* Voicing Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 p-3.5 bg-gray-950/60 border border-gray-800 rounded-xl" id="voicing-container">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-mono uppercase tracking-wider font-semibold mb-1">
            {lang === "en" ? "Chord Voicing / Inversion" : "Akkord-Voicing / Umkehrung"}
          </span>
          <span className="text-[11px] text-gray-500 font-mono">
            {lang === "en" ? "Prismatic rotation of the chord structure for alternative sonic aesthetics" : "Prismatische Rotation der Akkordstruktur für alternative Sound-Ästhetik"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 0, label: lang === "en" ? "Root Position" : "Grundstellung" },
            { id: 1, label: lang === "en" ? "1st Inversion" : "1. Umkehrung" },
            { id: 2, label: lang === "en" ? "2nd Inversion" : "2. Umkehrung" },
            { id: 3, label: lang === "en" ? "3rd Inversion" : "3. Umkehrung" }
          ].map((v) => (
            <button
              key={`voicing-btn-${v.id}`}
              id={`voicing-btn-${v.id}`}
              onClick={() => setSelectedVoicing(v.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer
                ${selectedVoicing === v.id
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)] font-bold"
                  : "bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-850 text-gray-400 hover:text-gray-205 hover:text-white"
                }`}
              title={`${v.label} for ${chordName}`}
            >
              <RotateCcw size={12} className={`transition-transform duration-350 ${selectedVoicing === v.id ? "text-indigo-400 rotate-180" : "text-gray-500"}`} />
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interval Legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6 text-center text-xs font-mono">
        <div className="flex items-center justify-center gap-2 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
          <span className="text-amber-400 font-semibold">{lang === "en" ? "Root Note (Root)" : "Grundton (Root)"}</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span className="text-emerald-400 font-semibold">{lang === "en" ? "Third" : "Terz (Third)"}</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-sky-950/20 border border-sky-900/30 rounded-lg p-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
          <span className="text-sky-400 font-semibold">{lang === "en" ? "Fifth" : "Quinte (Fifth)"}</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-2">
          <span className={`w-2.5 h-2.5 rounded-full ${highlightScale ? "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-gray-700"}`}></span>
          <span className={highlightScale ? "text-indigo-400 font-semibold" : "text-gray-500"}>
            {lang === "en" ? `Scale Notes (${currentScaleName})` : `Tonleiter-Töne (${currentScaleName})`}
          </span>
        </div>
      </div>

      {/* PIANO PANEL */}
      {activeTab === "piano" && (
        <div className="transition-all duration-300">
          <p className="text-xs text-gray-400 mb-3 font-mono">
            {highlightScale 
              ? (lang === "en" ? `🎹 Keys belonging to the scale are glowing. Keys in background are dimmed (${currentScaleName}).` : "🎹 Leuchtende Tasten gehören zur Tonleiter. Ausgedunkelte Tasten liegen außerhalb (" + currentScaleName + ").")
              : (lang === "en" ? "🎹 Click on highlighted piano keys to hear original intervals individually." : "🎹 Klicke auf die markierten Klaviertasten, um die Intervalle einzeln zu hören.")
            }
          </p>
          <div className="relative bg-gray-950 p-6 rounded-xl border border-gray-800 flex justify-center overflow-x-auto">
            <div className="flex relative h-40 w-[600px] select-none" style={{ minWidth: "600px" }}>
              {/* White keys */}
              {pianoKeys.map((key, i) => {
                if (key.type === "black") return null;

                // Check if note is included in activeMapping
                const matchInChord = activeMapping?.piano?.find(
                  p => p.note.toUpperCase() === key.note.toUpperCase() && (p.octave === undefined || p.octave === key.octave)
                );

                const isScaleNote = scaleNotes.includes(normalizeNote(key.note));
                const showAsScale = highlightScale && isScaleNote;
                const outOfScale = highlightScale && !isScaleNote;

                let keyStyleClass = "bg-white text-gray-850 hover:bg-indigo-100 border-gray-800";
                if (matchInChord) {
                  keyStyleClass = "bg-gray-900 text-white border-b-4 border-b-indigo-500 border-gray-850 border-gray-800";
                } else if (showAsScale) {
                  keyStyleClass = "bg-indigo-50/90 text-indigo-950 border-b-4 border-b-indigo-400 border-indigo-200 hover:bg-indigo-100";
                } else if (outOfScale) {
                  keyStyleClass = "bg-gray-900/40 text-gray-600 border-gray-950 opacity-25 hover:opacity-75";
                }

                return (
                  <button
                    key={`piano-w-${i}`}
                    onClick={() => playSynthNote(key.note, key.octave, 1)}
                    style={{ width: `${100 / 14}%` }}
                    className={`h-full border rounded-b-md transition-all relative flex flex-col justify-end pb-3 items-center group active:scale-y-[0.96] active:origin-top duration-75 ${keyStyleClass}`}
                  >
                    {matchInChord ? (
                      <div className={`absolute bottom-8 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${getIntervalColor(matchInChord.interval)}`}>
                        {matchInChord.interval[0]}
                      </div>
                    ) : (
                      <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity font-mono">{key.note}{key.octave}</span>
                    )}
                    <span className="text-[9px] font-mono font-bold uppercase mt-1 block tracking-tighter">
                      {key.note}
                    </span>
                  </button>
                );
              })}

              {/* Black keys overlaid */}
              {pianoKeys.map((key, i) => {
                if (key.type === "white") return null;

                // Check if black key is in chord
                const matchInChord = activeMapping?.piano?.find(
                  p => p.note.toUpperCase() === key.note.toUpperCase() && (p.octave === undefined || p.octave === key.octave)
                );

                const isScaleNote = scaleNotes.includes(normalizeNote(key.note));
                const showAsScale = highlightScale && isScaleNote;
                const outOfScale = highlightScale && !isScaleNote;

                let blackKeyStyleClass = "bg-black hover:bg-gray-900 text-white border-black";
                if (matchInChord) {
                  blackKeyStyleClass = "bg-slate-900 text-white border-indigo-950";
                } else if (showAsScale) {
                  blackKeyStyleClass = "bg-indigo-950 border border-indigo-500 text-indigo-300 hover:bg-indigo-900";
                } else if (outOfScale) {
                  blackKeyStyleClass = "bg-black/60 border-black opacity-15 hover:opacity-60";
                }

                // Calculate horizontal position
                // Mapping the indexes of white keys to align black keys properly
                const whitePositions = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15];
                // Finding where this black key should hang
                // C# is between C and D (index 0 and 1 of white positions)
                let relativePositionIndex = 0;
                if (key.note === "C#") relativePositionIndex = 0.65;
                else if (key.note === "D#") relativePositionIndex = 1.7;
                else if (key.note === "F#") relativePositionIndex = 3.65;
                else if (key.note === "G#") relativePositionIndex = 4.7;
                else if (key.note === "A#") relativePositionIndex = 5.75;
                // Next octave offset
                const isOctave4 = key.octave === 4;
                const offset = isOctave4 ? 7 : 0;
                const percentLeft = ((relativePositionIndex + offset) * (100 / 14));

                return (
                  <button
                    key={`piano-b-${i}`}
                    onClick={() => playSynthNote(key.note, key.octave, 1)}
                    style={{
                      left: `${percentLeft}%`,
                      width: "4.5%",
                    }}
                    className={`absolute h-24 rounded-b border shadow transition-all z-15 flex flex-col justify-end pb-2 items-center group active:scale-y-[0.93] active:origin-top duration-75 ${blackKeyStyleClass}`}
                  >
                    {matchInChord ? (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border mb-1 ${getIntervalColor(matchInChord.interval)}`}>
                        {matchInChord.interval[0]}
                      </div>
                    ) : (
                      <span className="text-[8px] opacity-0 group-hover:opacity-60 transition-opacity font-mono mb-1">{key.note}</span>
                    )}
                    <span className="text-[8px] font-mono tracking-tighter text-gray-400 uppercase">
                      {key.note}
                    </span>
                  </button>
                );
              })}

            </div>
          </div>
        </div>
      )}

      {activeTab === "guitar" && (
        <div className="transition-all duration-300">
          <p className="text-xs text-gray-400 mb-3 font-mono">
            {lang === "en" 
              ? "🎸 Guitar Chord Diagram (Standard tuning: E-A-D-G-B-e). Color dots display fretting positions."
              : "🎸 Gitarren-Akkorddiagramm (Standardstimmung: E-A-D-G-B-e). Farbpunkte zeigen die bündelweisen Greifpositionen."}
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Traditional Fretboard Model */}
            <div className="lg:col-span-7 bg-gray-950 p-6 rounded-xl border border-gray-800 overflow-x-auto flex flex-col justify-between">
              <div className="relative w-[500px] mx-auto py-4" style={{ minWidth: "500px" }}>
                {/* String coordinates text */}
                <div className="absolute left-[-24px] top-0 bottom-0 flex flex-col justify-between py-1 text-xs text-gray-500 font-mono text-right w-5">
                  {guitarStrings.map((s, index) => (
                    <button 
                      key={`s-lbl-${index}`}
                      onClick={() => playSynthNote(s.openNote, s.octave, 1.0)}
                      className="h-6 flex items-center justify-end font-bold text-gray-400 hover:text-indigo-400 cursor-pointer transition-colors active:scale-90 w-full text-right"
                      title={lang === "en" ? `Play open string: ${s.openNote}${s.octave}` : `Leere Saite anspielen: ${s.openNote}${s.octave}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                {/* Fretboard representation */}
                <div className="relative border-l-4 border-amber-800 h-36 bg-[#161210] rounded-r font-mono">
                  {/* Frets vertical lines */}
                  {guitarFrets.map((fret) => (
                    <div
                      key={`fret-g-${fret}`}
                      style={{ left: `${(fret / 5) * 100}%` }}
                      className="absolute top-0 bottom-0 border-r-2 border-slate-700 font-mono text-[9px] text-gray-500 pt-1 pl-1"
                    >
                      {fret === 0 ? (lang === "en" ? "Nut" : "Sattel") : `${lang === "en" ? "Fret" : "Bund"} ${fret}`}
                    </div>
                  ))}

                  {/* Horizontal strings lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2">
                    {guitarStrings.map((s, stringIndex) => {
                      const mappedFretValue = guitarPositions[5 - stringIndex];
                      return (
                        <div key={`g-str-${stringIndex}`} className="relative h-2 flex items-center group">
                          {/* String Line */}
                          <div 
                            className="w-full bg-slate-500 shadow-inner" 
                            style={{ height: `${1.5 + (0.3 * stringIndex)}px` }}
                          ></div>

                          {/* Open String Dot Indicator */}
                          {mappedFretValue === 0 ? (
                            <div 
                              style={{ left: "-4px" }}
                              className="absolute z-10 w-3 h-3 bg-indigo-505 rounded-full border border-white cursor-pointer hover:scale-125 transition-transform shadow-[0_0_8px_#6366f1] active:scale-95"
                              onClick={() => playSynthNote(s.openNote, s.octave, 1.0)}
                              title={lang === "en" ? `Open string: ${s.openNote}` : `Leere Saite: ${s.openNote}`}
                            />
                          ) : (
                            <div 
                              style={{ left: "-4px" }}
                              className="absolute z-10 w-2.5 h-2.5 bg-gray-955/70 rounded-full border border-gray-700/60 cursor-pointer hover:scale-125 transition-all opacity-20 hover:opacity-100 hover:bg-indigo-900 hover:border-indigo-400 active:scale-95"
                              onClick={() => playSynthNote(s.openNote, s.octave, 1.0)}
                              title={lang === "en" ? `Play free open string: ${s.openNote}${s.octave}` : `Spiele freie leere Saite: ${s.openNote}${s.octave}`}
                            />
                          )}

                          {/* Muted String Indicator */}
                          {mappedFretValue === -1 && (
                            <div 
                              style={{ left: "-6px" }}
                              className="absolute z-15 text-[10px] font-extrabold text-red-500 font-mono select-none"
                              title={lang === "en" ? "Muted string (Do not play)" : "Nicht anspielen (Dämpfen)"}
                            >
                              X
                            </div>
                          )}

                          {/* Fret Markers */}
                          {guitarFrets.slice(1).map((fret) => {
                            const fretInfo = getGuitarFretIntervalInfo(stringIndex, fret);
                            const calculated = getGuitarNoteAndOctave(stringIndex, fret);

                            if (fretInfo) {
                              return (
                                <button
                                  key={`g-dot-${stringIndex}-${fret}`}
                                  onClick={() => playSynthNote(calculated.note, calculated.octave, 1.0)}
                                  style={{ left: `${((fret - 0.5) / 5) * 100}%` }}
                                  className={`absolute z-10 w-7 h-7 -translate-x-1/2 rounded-full border flex items-center justify-center text-[10px] font-extrabold transition-all hover:scale-125 hover:brightness-110 active:scale-90 ${getIntervalColor(fretInfo.interval)}`}
                                  title={lang === "en" ? `Play ${calculated.note}${calculated.octave} (Interval: ${fretInfo.interval})` : `Spiele ${calculated.note}${calculated.octave} (Intervall: ${fretInfo.interval})`}
                                >
                                  <span>{calculated.note}</span>
                                </button>
                              );
                            }

                            // Playable non-chord notes
                            return (
                              <button
                                key={`g-dot-free-${stringIndex}-${fret}`}
                                onClick={() => playSynthNote(calculated.note, calculated.octave, 1.0)}
                                style={{ left: `${((fret - 0.5) / 5) * 100}%` }}
                                className="absolute z-10 w-6 h-6 -translate-x-1/2 rounded-full border border-gray-750 bg-gray-900/40 text-gray-550 hover:text-indigo-300 hover:border-indigo-500/85 hover:bg-slate-900/95 flex items-center justify-center text-[9px] font-medium transition-all hover:scale-125 opacity-20 hover:opacity-100 active:scale-90"
                                title={lang === "en" ? `Play free note: ${calculated.note}${calculated.octave}` : `Spiele freie Note: ${calculated.note}${calculated.octave}`}
                              >
                                <span>{calculated.note}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Guitar coordinate representation string */}
              <div className="mt-4 flex justify-between items-center text-xs font-mono border-t border-gray-800 pt-3">
                <span className="text-gray-400">{lang === "en" ? "Active fingering pattern:" : "Aktives Griffmuster:"}</span>
                <span className="px-3 py-1 bg-gray-950 border border-gray-800 rounded font-bold text-amber-400 tracking-wider">
                  {activeMapping?.guitarTab || (lang === "en" ? "No tab available" : "Keine Tab verfügbar")}
                </span>
              </div>
            </div>

            {/* Right Column: Highly Readable Vertical Tab View */}
            <div className="lg:col-span-5 bg-gray-955 p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-sans font-bold text-white mb-1 flex items-center gap-2">
                  <Music className="text-indigo-400 w-4 h-4" />
                  <span>{lang === "en" ? "Vertical Tab & Fingerings" : "Vertikale Tabulatur & Griffweise"}</span>
                </h4>
                <p className="text-[11px] text-gray-500 font-mono mb-4 leading-normal">
                  {lang === "en" 
                    ? "Detailed split of chord structure from top (thinnest) string to bottom (thickest) string. Click any row to play individual notes."
                    : "Detaillierte Aufteilung der Akkordstruktur von oben (dünnste Saite) bis unten (dickste Saite). Klicke auf eine Reihe, um den Ton anzuhören."}
                </p>

                <div className="flex flex-col gap-2">
                  {guitarStrings.map((stringItem, stringIndex) => {
                    const fret = guitarPositions[5 - stringIndex];
                    const isMuted = fret === -1;
                    const isOpen = fret === 0;
                    const calculated = getGuitarNoteAndOctave(stringIndex, fret);
                    const fretInfo = getGuitarFretIntervalInfo(stringIndex, fret);
                    const interval = fretInfo ? fretInfo.interval : null;

                    // Get string name mapping explanation
                    const getStringDescription = () => {
                      const names: Record<string, { de: string; en: string }> = {
                        "e": { de: "1. Saite (hoch e)", en: "1st String (high e)" },
                        "B": { de: "2. Saite (H/B)", en: "2nd String (B)" },
                        "G": { de: "3. Saite (G)", en: "3rd String (G)" },
                        "D": { de: "4. Saite (D)", en: "4th String (D)" },
                        "A": { de: "5. Saite (A)", en: "5th String (A)" },
                        "E": { de: "6. Saite (tief E)", en: "6th String (low E)" }
                      };
                      return names[stringItem.name]?.[lang] || stringItem.name;
                    };

                    return (
                      <button
                        key={`v-tabrow-${stringIndex}`}
                        onClick={() => {
                          if (!isMuted) {
                            playSynthNote(calculated.note, calculated.octave, 1.0);
                          }
                        }}
                        disabled={isMuted}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all group
                          ${isMuted 
                            ? "bg-red-950/5 border-red-900/10 opacity-40 cursor-not-allowed" 
                            : isOpen 
                              ? "bg-indigo-950/10 border-indigo-900/20 hover:border-indigo-700/50 hover:bg-indigo-950/20 cursor-pointer" 
                              : "bg-gray-900/40 border-gray-800/80 hover:border-indigo-500/50 hover:bg-gray-900 cursor-pointer"
                          }`}
                      >
                        {/* String details left */}
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-extrabold border transition-colors
                            ${isMuted
                              ? "bg-gray-900 border-gray-850 text-gray-500"
                              : isOpen
                                ? "bg-indigo-900/40 border-indigo-500/60 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500"
                                : "bg-gray-800 border-gray-700 text-gray-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500"
                            }`}
                          >
                            {stringItem.name}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-bold text-gray-300 group-hover:text-white">
                              {getStringDescription()}
                            </span>
                            <span className="text-[8.5px] font-mono text-gray-500 leading-tight">
                              {isMuted 
                                ? (lang === "en" ? "Mute / Do not play" : "Dämpfen / Nicht spielen")
                                : (lang === "en" ? `Note: ${calculated.note}${calculated.octave}` : `Ton: ${calculated.note}${calculated.octave}`)
                              }
                            </span>
                          </div>
                        </div>

                        {/* Middle: brief instruction */}
                        <div className="hidden sm:block text-[9px] font-mono text-gray-500 px-2 italic text-center truncate max-w-[120px]">
                          {isMuted 
                            ? (lang === "en" ? "Dampen" : "Gedämpft") 
                            : isOpen 
                              ? (lang === "en" ? "Let ring" : "Klingen lassen")
                              : (lang === "en" ? `Press fret ${fret}` : `Finger auf Bund ${fret}`)
                          }
                        </div>

                        {/* Fret & Interval Details right */}
                        <div className="flex items-center gap-2.5">
                          <div className="text-right">
                            <span className={`text-[11px] font-mono font-black tracking-tight block
                              ${isMuted 
                                ? "text-red-500" 
                                : isOpen 
                                  ? "text-indigo-400 group-hover:text-indigo-300" 
                                  : "text-amber-400 group-hover:text-amber-300"
                              }`}
                            >
                              {isMuted 
                                ? "X" 
                                : isOpen 
                                  ? (lang === "en" ? "OPEN" : "OFFEN") 
                                  : `${lang === "en" ? "FRET" : "BUND"} ${fret}`}
                            </span>
                          </div>

                          <div className="w-14 flex justify-end">
                            {!isMuted && interval ? (
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold font-mono uppercase tracking-tighter border
                                ${interval === "Root" 
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                                  : interval === "Third"
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : interval === "Fifth"
                                      ? "bg-sky-500/10 border-sky-500/30 text-sky-450"
                                      : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                }`}
                              >
                                {interval === "Root" 
                                  ? "Root" 
                                  : interval === "Third"
                                    ? (lang === "en" ? "3rd" : "Terz")
                                    : interval === "Fifth"
                                      ? (lang === "en" ? "5th" : "Quinte")
                                      : "Other"
                                }
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-gray-650">—</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tips block */}
              <div className="mt-4 p-2.5 bg-indigo-950/15 border border-indigo-900/20 rounded-lg text-[10px] font-mono text-indigo-300/90 leading-normal">
                💡 <strong className="text-indigo-200">{lang === "en" ? "Practice Tip:" : "Übungs-Tipp:"}</strong> {lang === "en" 
                  ? "Arpeggiate the chord by clicking the string rows from bottom to top to check if each note rings clearly."
                  : "Spiele den Akkord arpeggiert an, indem du die Saiten-Reihen von unten nach oben einzeln anklickst, um die Saitenreinheit zu prüfen."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE FRETBOARD OVERLAY */}
      {activeTab === "fretboard" && (
        <div className="transition-all duration-300">
          <p className="text-xs text-gray-400 mb-3.5 font-mono">
            {lang === "en"
              ? "🎯 Interactive Fretboard Visualizer (Frets 0 to 12). Highlights scale-conforming notes and the active chord tones across standard tuning."
              : "🎯 Interaktives Griffbrett-Visualizer (Bünde 0 bis 12). Bietet farbige Markierung der tonleiter- und akkordkonformen Töne für das solistische Spiel."}
          </p>

          <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex flex-col gap-5">
            {/* Scroll indicators for mobile */}
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
              <span>{lang === "en" ? "Guitar Neck (Nut left, 12th Fret right)" : "Gitarrenhals (Sattel links, 12. Bund rechts)"}</span>
              <span className="animate-pulse bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded text-[8.5px]">
                {lang === "en" ? "← Scroll horizontally on mobile →" : "← Auf Mobilgeräten horizontal wischen →"}
              </span>
            </div>

            {/* Scrolling neck wrapper */}
            <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              <div className="relative w-[860px] mx-auto py-5 pr-4" style={{ minWidth: "860px" }}>
                
                {/* Fret indices headers above neck */}
                <div className="relative h-5 mb-2.5 text-[9px] font-mono font-bold tracking-tight text-gray-400">
                  {Array.from({ length: 13 }).map((_, f) => (
                    <div 
                      key={`fret-lbl-${f}`}
                      style={{ left: f === 0 ? "14px" : `${((f - 0.5) / 12) * 100}%` }}
                      className={`absolute -translate-x-1/2 text-center select-none font-bold
                        ${f === 0 ? "text-amber-400/90 text-[10px]" : "text-gray-500"}
                      `}
                    >
                      {f === 0 ? (lang === "en" ? "OPEN" : "OFFEN") : `${lang === "en" ? "FRET" : "BUND"} ${f}`}
                    </div>
                  ))}
                </div>

                {/* Left side guitar string names trigger buttons */}
                <div className="absolute left-[-26px] top-[24px] bottom-0 flex flex-col justify-between py-2 text-xs text-gray-500 font-mono text-right w-5">
                  {guitarStrings.map((s, index) => (
                    <button 
                      key={`fb-lbl-${index}`}
                      onClick={() => playSynthNote(s.openNote, s.octave, 1.1)}
                      className="h-8 flex items-center justify-end font-black text-gray-400 hover:text-indigo-400 cursor-pointer transition-colors active:scale-90 w-full text-right text-xs uppercase"
                      title={lang === "en" ? `Click to play open ${s.name} string (${s.openNote})` : `Klicken, um leere ${s.name}-Saite anzuschlagen (${s.openNote})`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                {/* Fretboard Wooden / Dark Carbon neck body */}
                <div 
                  className="relative border-l-[6px] border-amber-900/60 h-48 bg-gradient-to-r from-stone-900 via-[#181515] to-[#251e1c] rounded-r shadow-2xl relative overflow-hidden"
                  id="fretboard-overlay-neck"
                >
                  {/* Fretboard Nut (Ivory style white bar at fret 0) */}
                  <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r from-amber-100 to-amber-200 border-r border-amber-900/40 z-20 shadow-inner" />

                  {/* Pearloid dot inlays (Frets 3, 5, 7, 9) */}
                  {[3, 5, 7, 9].map((f) => (
                    <div
                      key={`fb-inlay-${f}`}
                      style={{ left: `${((f - 0.5) / 12) * 100}%` }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-400/10 border border-slate-500/15 flex items-center justify-center select-none pointer-events-none"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white/25 shadow-inner" />
                    </div>
                  ))}

                  {/* 12th Fret Octave Double Pearloid Inlay dots */}
                  <div
                    style={{ left: `${((12 - 0.5) / 12) * 100}%` }}
                    className="absolute top-[28%] -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-slate-400/10 border border-slate-500/15 flex items-center justify-center select-none pointer-events-none"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/25 shadow-inner" />
                  </div>
                  <div
                    style={{ left: `${((12 - 0.5) / 12) * 100}%` }}
                    className="absolute top-[72%] -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-slate-400/10 border border-slate-500/15 flex items-center justify-center select-none pointer-events-none"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/25 shadow-inner" />
                  </div>

                  {/* Metal fretwire lines (boundary columns) */}
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const fretNumber = idx + 1;
                    return (
                      <div
                        key={`fb-wire-${fretNumber}`}
                        style={{ left: `${(fretNumber / 12) * 100}%` }}
                        className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-slate-400 via-slate-500 to-slate-650 shadow-[0_0_2px_rgba(255,255,255,0.15)] z-10 pointer-events-none"
                      />
                    );
                  })}

                  {/* String Wires Overlay (with varying authentic thickness) */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                    {guitarStrings.map((s, stringIdx) => {
                      // Thickness increases from top (e) to bottom (E)
                      const stiffness = 1.0 + (0.4 * stringIdx);
                      return (
                        <div key={`fb-str-${stringIdx}`} className="relative h-2 flex items-center">
                          <div 
                            className="w-full bg-slate-405 shadow-inner opacity-75"
                            style={{ height: `${stiffness}px` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Note triggers layer Grid */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2 z-20">
                    {guitarStrings.map((s, stringIndex) => {
                      return (
                        <div key={`fb-trigger-row-${stringIndex}`} className="relative h-2 flex items-center">
                          
                          {/* Loop through frets 0 to 12 */}
                          {Array.from({ length: 13 }).map((_, fret) => {
                            const calculated = getGuitarNoteAndOctave(stringIndex, fret);
                            const noteNormalized = normalizeNote(calculated.note);
                            
                            // Check if this note matches any inside the active chord
                            const chordNote = activeMapping.piano.find(p => normalizeNote(p.note) === noteNormalized);
                            
                            // Check if note is part of scale
                            const isScaleConforming = scaleNotes.includes(noteNormalized);

                            // Left position formula:
                            // Fret 0 is open, placed in front of the nut. Frets 1-12 placed between wires
                            const percentLeft = fret === 0 ? "14px" : `${((fret - 0.5) / 12) * 100}%`;

                            if (chordNote) {
                              // Highlighted Chord tone: Amber/Root, Green/Third, Blue/Fifth
                              return (
                                <button
                                  key={`fb-dot-chord-${stringIndex}-${fret}`}
                                  onClick={() => playSynthNote(calculated.note, calculated.octave, 1.1)}
                                  style={{ left: percentLeft }}
                                  className={`absolute z-30 w-7 h-7 -translate-x-1/2 rounded-full border flex items-center justify-center text-[10px] font-black tracking-tight cursor-pointer hover:scale-125 transition-all shadow-md hover:brightness-115 active:scale-90 ${getIntervalColor(chordNote.interval)}`}
                                  title={lang === "en" 
                                    ? `Chord Tone: ${calculated.note}${calculated.octave} (${chordNote.interval} interval) - Click to listen`
                                    : `Akkordton: ${calculated.note}${calculated.octave} (${chordNote.interval === "Root" ? "Grundton" : chordNote.interval === "Third" ? "Terz" : "Quinte"}) - Klicken zum Anspielen`}
                                >
                                  <span>{calculated.note}</span>
                                </button>
                              );
                            }

                            if (isScaleConforming) {
                              // Highlighted Scale conforming note (but not pressed in the active chord voicing)
                              return (
                                <button
                                  key={`fb-dot-scale-${stringIndex}-${fret}`}
                                  onClick={() => playSynthNote(calculated.note, calculated.octave, 1.0)}
                                  style={{ left: percentLeft }}
                                  className="absolute z-25 w-6 h-6 -translate-x-1/2 rounded-full border-2 border-indigo-500 bg-indigo-950/80 text-indigo-300 hover:text-white hover:border-indigo-400 hover:bg-indigo-900 shadow-[0_0_8px_rgba(99,102,241,0.45)] text-[9.5px] font-extrabold flex items-center justify-center cursor-pointer hover:scale-125 transition-all active:scale-90"
                                  title={lang === "en"
                                    ? `Scale Note: ${calculated.note}${calculated.octave} - Click to play`
                                    : `Tonleiter-Note: ${calculated.note}${calculated.octave} - Klicken zum Anspielen`}
                                >
                                  <span>{calculated.note}</span>
                                </button>
                              );
                            }

                            // Non-scale (chromatic helper notes) of low opacity/size for clean UI
                            return (
                              <button
                                key={`fb-dot-free-${stringIndex}-${fret}`}
                                onClick={() => playSynthNote(calculated.note, calculated.octave, 0.95)}
                                style={{ left: percentLeft }}
                                className={`absolute z-10 w-5.5 h-5.5 -translate-x-1/2 rounded-full border border-gray-800 bg-gray-900/20 text-gray-550 flex items-center justify-center text-[8.5px] font-medium transition-all hover:scale-125 hover:z-30 hover:bg-gray-800 hover:text-gray-200 cursor-pointer active:scale-90
                                  ${highlightScale ? "opacity-[0.04] hover:opacity-100" : "opacity-30 hover:opacity-100"}`}
                                title={lang === "en"
                                  ? `Non-scale Note: ${calculated.note}${calculated.octave} - Click to play`
                                  : `Skalenfremde Note: ${calculated.note}${calculated.octave} - Klicken zum Anspielen`}
                              >
                                <span className={highlightScale ? "opacity-0 hover:opacity-100" : ""}>{calculated.note}</span>
                              </button>
                            );
                          })}

                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>

            {/* Premium color and legend code explainer footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 border-t border-gray-800 pt-4 text-xs">
              <div className="flex flex-col gap-1.5 p-2 bg-gray-900/60 rounded-lg border border-gray-900">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{lang === "en" ? "Interval: Root" : "Intervall: Grundton"}</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-[9px] shadow-[0_0_8px_rgba(245,158,11,0.5)]">R</div>
                  <span className="text-gray-305 text-[11px] font-mono font-bold text-gray-200">{lang === "en" ? "Root Note (Tonic)" : "Grundton (Tonausgang)"}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-2 bg-gray-900/60 rounded-lg border border-gray-900">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{lang === "en" ? "Interval: Third" : "Intervall: Terz"}</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black text-[9px] shadow-[0_0_8px_rgba(16,185,129,0.5)]">3</div>
                  <span className="text-gray-305 text-[11px] font-mono font-bold text-gray-200">{lang === "en" ? "Third (Vibe Creator)" : "Terz (Charaktergeber)"}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-2 bg-gray-900/60 rounded-lg border border-gray-900">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{lang === "en" ? "Interval: Fifth" : "Intervall: Quinte"}</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white font-black text-[9px] shadow-[0_0_8px_rgba(14,165,233,0.5)]">5</div>
                  <span className="text-gray-305 text-[11px] font-mono font-bold text-gray-200">{lang === "en" ? "Fifth (Power Support)" : "Quinte (Klangfülle)"}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-2 bg-gray-900/60 rounded-lg border border-gray-900">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{lang === "en" ? "Scale Conforming" : "Skalengetreu"}</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-indigo-950/80 text-indigo-300 flex items-center justify-center font-black text-[8px] shadow-[0_0_8px_rgba(99,102,241,0.3)]">★</div>
                  <span className="text-gray-305 text-[11px] font-mono font-bold text-gray-200">{lang === "en" ? "In-scale solo tones" : "Andere Skalentöne"}</span>
                </div>
              </div>
            </div>

            {/* Instruction tooltip */}
            <div className="mt-1 p-2.5 bg-indigo-950/15 border border-indigo-900/25 rounded-lg text-[10.5px] font-mono text-indigo-200/90 leading-relaxed text-center">
              💡 <strong className="text-indigo-200">{lang === "en" ? "Pro Improvisation Tip:" : "Profi-Impro-Tipp:"}</strong> {lang === "en" 
                ? "Switch on 'Scale Focus' in the header to gray out out-of-scale notes. Play a melody using purple-circled notes for solos that sit perfectly in the mix."
                : "Schalte den 'Tonleiter-Fokus' oben ein, um skalenfremde Töne auszublenden. Spiele solistische Noten über die violetten Kreise für perfekte Melodien."}
            </div>
          </div>
        </div>
      )}

      {/* BASS PANEL */}
      {activeTab === "bass" && (
        <div className="transition-all duration-300">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-gray-400 font-mono">🎸 Bass-Wechselzone (Freies Fundamentspiel für Grundtöne und Begleitung).</p>
            <div className="flex bg-gray-900 border border-gray-800 p-0.5 rounded text-xs select-none">
              <button
                id="bass-4s"
                onClick={() => setBassStringsCount(4)}
                className={`px-2 py-0.5 rounded font-mono transition-all ${bassStringsCount === 4 ? "bg-indigo-600 text-white" : "text-gray-400"}`}
              >
                4-Saiter
              </button>
              <button
                id="bass-5s"
                onClick={() => setBassStringsCount(5)}
                className={`px-2 py-0.5 rounded font-mono transition-all ${bassStringsCount === 5 ? "bg-indigo-600 text-white" : "text-gray-400"}`}
              >
                5-Saiter
              </button>
            </div>
          </div>

          <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 overflow-x-auto">
            <div className="relative w-[500px] mx-auto py-4" style={{ minWidth: "500px" }}>
              {/* String labels */}
              <div className="absolute left-[-24px] top-0 bottom-0 flex flex-col justify-between py-1 text-xs text-gray-500 font-mono text-right w-5">
                {(bassStringsCount === 5 ? bassStrings5 : bassStrings4).map((s, index) => (
                  <button 
                    key={`b-lbl-${index}`}
                    onClick={() => playSynthNote(s.openNote, s.octave, 1.2)}
                    className="h-6 flex items-center justify-end font-bold text-gray-350 hover:text-indigo-400 cursor-pointer transition-colors active:scale-90 w-full text-right"
                    title={`Leere Bass-Saite anspielen: ${s.openNote}${s.octave}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {/* Bass Fretboard */}
              <div className="relative border-l-4 border-slate-600 h-36 bg-[#121620] rounded-r font-mono">
                {/* Frets markers */}
                {bassFrets.map((fret) => (
                  <div
                    key={`fret-b-${fret}`}
                    style={{ left: `${(fret / 7) * 100}%` }}
                    className="absolute top-0 bottom-0 border-r-2 border-slate-700 font-mono text-[9px] text-gray-500 pt-0.5 pl-1"
                  >
                    {fret === 0 ? "0" : `${fret}`}
                  </div>
                ))}

                {/* Horizontal strings */}
                <div className="absolute inset-0 flex flex-col justify-between py-2">
                  {(bassStringsCount === 5 ? bassStrings5 : bassStrings4).map((s, stringIndex) => {
                    return (
                      <div key={`b-str-${stringIndex}`} className="relative h-2 flex items-center">
                        {/* Big Thick string line */}
                        <div 
                          className="w-full bg-slate-400 shadow-inner" 
                          style={{ height: `${3.5 - (0.4 * stringIndex)}px` }}
                        ></div>

                        {/* Fret Markers for Bass */}
                        {bassFrets.map((fret) => {
                          const fretInfo = getBassFretIntervalInfo(stringIndex, fret, bassStringsCount === 5);
                          const calculated = getBassNoteAndOctave(stringIndex, fret, bassStringsCount === 5);

                          if (fretInfo) {
                            return (
                              <button
                                key={`b-dot-${stringIndex}-${fret}`}
                                onClick={() => playSynthNote(calculated.note, calculated.octave, 1.2)}
                                style={{ left: fret === 0 ? "-2px" : `${((fret - 0.5) / 7) * 100}%` }}
                                className={`absolute z-10 w-7 h-7 -translate-x-1/2 rounded-full border flex items-center justify-center text-[10px] font-extrabold transition-all hover:scale-125 hover:brightness-110 active:scale-90 ${getIntervalColor(fretInfo.interval)}`}
                                title={`Spiele ${calculated.note}${calculated.octave} (Intervall: ${fretInfo.interval})`}
                              >
                                <span>{calculated.note}</span>
                              </button>
                            );
                          }

                          // Playable non-chord notes for Bass
                          return (
                            <button
                              key={`b-dot-free-${stringIndex}-${fret}`}
                              onClick={() => playSynthNote(calculated.note, calculated.octave, 1.2)}
                              style={{ left: fret === 0 ? "-2px" : `${((fret - 0.5) / 7) * 100}%` }}
                              className="absolute z-10 w-6 h-6 -translate-x-1/2 rounded-full border border-gray-750 bg-gray-900/40 text-gray-500 hover:text-indigo-300 hover:border-indigo-500/85 hover:bg-slate-900/95 flex items-center justify-center text-[9px] font-medium transition-all hover:scale-125 opacity-15 hover:opacity-100 active:scale-90"
                              title={`Spiele freie Bass-Note: ${calculated.note}${calculated.octave}`}
                            >
                              <span>{calculated.note}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs font-mono border-t border-gray-800 pt-3 text-gray-400">
              <span>Empfohlenes Bass-Intervall-Greifen:</span>
              <span className="px-3 py-1 bg-gray-950 border border-gray-800 rounded text-sky-400 font-bold">
                {bassStringsCount === 4 ? `4-Saiter Griffmuster: ${activeMapping?.bassTab || "N/A"}` : `5-Saiter: Verwende B-Saite für tiefe Töne`}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
