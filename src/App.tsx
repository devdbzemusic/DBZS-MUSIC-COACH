import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MOOD_RECIPES } from "./data/recipes";
import { MoodRecipe, SavedIdea } from "./types";
import { TrinityVisualizer } from "./components/TrinityVisualizer";
import { RiffForge } from "./components/RiffForge";
import { BassGround } from "./components/BassGround";
import { ScaleTrainer } from "./components/ScaleTrainer";
import { TheoryRevealView } from "./components/TheoryRevealView";
import { AIMentor } from "./components/AIMentor";
import { DailySpark } from "./components/DailySpark";
import { IdeaLibrary } from "./components/IdeaLibrary";
import { WaveformVisualizer } from "./components/WaveformVisualizer";
import { SongStructure } from "./components/SongStructure";
import { playChord, playMetronomeTick, playShakerTick, playStrumPattern, getChordVoicing, setSoundCharacteristic, SoundCharacteristic, playSynthNoteInternal } from "./utils/synth";
import { activateMidi, getMidiState, setSelectedInputId, setSelectedOutputId, setMidiThruEnabled } from "./utils/midi";

export const CHORD_FORMULATIONS: { [key: string]: { note: string; octave?: number }[] } = {
  "Am": [{ note: "A", octave: 3 }, { note: "C", octave: 3 }, { note: "E", octave: 3 }],
  "C": [{ note: "C", octave: 3 }, { note: "E", octave: 3 }, { note: "G", octave: 3 }],
  "G": [{ note: "G", octave: 3 }, { note: "B", octave: 3 }, { note: "D", octave: 3 }],
  "F": [{ note: "F", octave: 3 }, { note: "A", octave: 3 }, { note: "C", octave: 3 }],
  "Em": [{ note: "E", octave: 3 }, { note: "G", octave: 3 }, { note: "B", octave: 3 }],
  "D": [{ note: "D", octave: 3 }, { note: "F#", octave: 3 }, { note: "A", octave: 3 }],
  "E7": [{ note: "E", octave: 3 }, { note: "G#", octave: 3 }, { note: "D", octave: 4 }],
  "A7": [{ note: "A", octave: 3 }, { note: "C#", octave: 3 }, { note: "G", octave: 3 }],
  "B7": [{ note: "B", octave: 3 }, { note: "D#", octave: 3 }, { note: "A", octave: 3 }],
  "Dm": [{ note: "D", octave: 3 }, { note: "F", octave: 3 }, { note: "A", octave: 3 }],
  "Bb": [{ note: "Bb", octave: 3 }, { note: "D", octave: 3 }, { note: "F", octave: 3 }],
  "Em7": [{ note: "E", octave: 3 }, { note: "G", octave: 3 }, { note: "D", octave: 4 }],
  "Am7": [{ note: "A", octave: 3 }, { note: "C", octave: 3 }, { note: "G", octave: 3 }],
  "D7": [{ note: "D", octave: 3 }, { note: "F#", octave: 3 }, { note: "C", octave: 4 }]
};

const getPitchValue = (note: string, octave: number = 3) => {
  const pitchMap: { [key: string]: number } = {
    "C": 0, "C#": 1, "Db": 1,
    "D": 2, "D#": 3, "Eb": 3,
    "E": 4,
    "F": 5, "F#": 6, "Gb": 6,
    "G": 7, "G#": 8, "Ab": 8,
    "A": 9, "A#": 10, "Bb": 10,
    "B": 11
  };
  const val = pitchMap[note] !== undefined ? pitchMap[note] : 0;
  return octave * 12 + val;
};

const getChordInterval = (chordName: string, noteName: string) => {
  const match = chordName.match(/^([A-G]#?|Bb|Db|Eb|Gb|Ab|[A-G]b?)/);
  if (!match) return { label: "?", colorClass: "text-gray-400 border-gray-800 bg-gray-950/40", textColorClass: "text-gray-400", bgClass: "bg-gray-950/40" };
  const chordRoot = match[1];

  const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const scaleFlats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  
  const getPitchClass = (n: string) => {
    let idx = scale.indexOf(n);
    if (idx === -1) idx = scaleFlats.indexOf(n);
    if (idx === -1) {
      const clean = n.replace("s", "#").replace("f", "b");
      idx = scale.indexOf(clean);
      if (idx === -1) idx = scaleFlats.indexOf(clean);
    }
    return idx;
  };

  const rootPitch = getPitchClass(chordRoot);
  const notePitch = getPitchClass(noteName);
  
  if (rootPitch === -1 || notePitch === -1) {
    return { label: "?", colorClass: "text-gray-400 border-gray-800 bg-gray-950/40", textColorClass: "text-gray-400", bgClass: "bg-gray-950/40" };
  }

  const diffObj = ((notePitch - rootPitch) % 12 + 12) % 12;

  if (diffObj === 0) {
    return { 
      label: "R", 
      colorClass: "text-emerald-400 border-emerald-900/50 bg-emerald-950/20 hover:border-emerald-500/50", 
      textColorClass: "text-emerald-400",
      bgClass: "bg-emerald-950/20"
    };
  } else if (diffObj === 3 || diffObj === 4) {
    return { 
      label: diffObj === 3 ? "m3" : "M3", 
      colorClass: "text-blue-400 border-blue-900/50 bg-blue-950/20 hover:border-blue-500/50", 
      textColorClass: "text-blue-400",
      bgClass: "bg-blue-950/20"
    };
  } else if (diffObj === 7) {
    return { 
      label: "5", 
      colorClass: "text-amber-400 border-amber-900/50 bg-amber-950/20 hover:border-amber-550/50", 
      textColorClass: "text-amber-400",
      bgClass: "bg-amber-950/20"
    };
  } else if (diffObj === 10 || diffObj === 11) {
    return { 
      label: diffObj === 10 ? "7" : "maj7", 
      colorClass: "text-purple-400 border-purple-900/50 bg-purple-950/20 hover:border-purple-500/50", 
      textColorClass: "text-purple-400",
      bgClass: "bg-purple-950/20"
    };
  } else if (diffObj === 2) {
    return { 
      label: "9", 
      colorClass: "text-teal-400 border-teal-900/50 bg-teal-950/20 hover:border-teal-500/50", 
      textColorClass: "text-teal-400",
      bgClass: "bg-teal-950/20"
    };
  } else if (diffObj === 5) {
    return { 
      label: "4", 
      colorClass: "text-pink-400 border-pink-900/50 bg-pink-950/20 hover:border-pink-500/50", 
      textColorClass: "text-pink-400",
      bgClass: "bg-pink-950/20"
    };
  } else if (diffObj === 6) {
    return { 
      label: "b5", 
      colorClass: "text-red-400 border-red-900/50 bg-red-950/20 hover:border-red-500/50", 
      textColorClass: "text-red-400",
      bgClass: "bg-red-950/20"
    };
  }

  return { 
    label: `${diffObj}`, 
    colorClass: "text-gray-400 border-gray-800 bg-gray-950/20 hover:border-gray-700/50", 
    textColorClass: "text-gray-400",
    bgClass: "bg-gray-950/20"
  };
};
import { 
  Music, 
  Volume2, 
  Sparkles, 
  BookOpen, 
  Pocket, 
  Sliders, 
  Radio, 
  MessageSquareHeart, 
  FolderHeart, 
  Eye,
  Heart,
  ChevronRight,
  PlusCircle,
  Compass,
  Edit,
  Trash2,
  Plus,
  RotateCcw,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  ListMusic,
  Play
} from "lucide-react";

export default function App() {
  const [soundChar, setSoundChar] = useState<SoundCharacteristic>("acoustic_piano");
  const [activeMoodId, setActiveMoodId] = useState<string>("traurig-schön");

  useEffect(() => {
    setSoundCharacteristic(soundChar);
  }, [soundChar]);
  const [activeChordIndex, setActiveChordIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"trinity" | "riff" | "bass" | "scales" | "theory" | "mentor" | "library" | "structure">("trinity");
  const [refreshLibraryTrigger, setRefreshLibraryTrigger] = useState<number>(0);
  const [isSavedMessage, setIsSavedMessage] = useState<boolean>(false);

  // Active mood recipe object
  const activeRecipe = MOOD_RECIPES.find(m => m.id === activeMoodId) || MOOD_RECIPES[0];

  // Custom chord progressions state per mood ID
  const [customProgressions, setCustomProgressions] = useState<Record<string, string[]>>({});
  // Custom chord durations state per mood ID (number of beats for each slot)
  const [customDurations, setCustomDurations] = useState<Record<string, number[]>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [chordSearchQuery, setChordSearchQuery] = useState<string>("");
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  const [autoPreviewEnabled, setAutoPreviewEnabled] = useState<boolean>(false);

  useEffect(() => {
    setChordSearchQuery("");
  }, [editingSlotIndex]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Active progression setup
  const baseProgression = activeRecipe.chordProgressions[0];
  const activeChords = customProgressions[activeRecipe.id] || baseProgression.chords;
  const activeDurations = customDurations[activeRecipe.id] || Array(activeChords.length).fill(4);
  const currentProgression = {
    ...baseProgression,
    chords: activeChords
  };

  // Helper to change chords and synchronize durations
  const handleUpdateChordsAndDurations = (newChords: string[], newDurations?: number[]) => {
    setCustomProgressions(prev => ({
      ...prev,
      [activeRecipe.id]: newChords
    }));
    
    setCustomDurations(prev => {
      let finalNewDurations: number[];
      if (newDurations) {
        finalNewDurations = newDurations;
      } else {
        const currentDurs = prev[activeRecipe.id] || Array(activeChords.length).fill(4);
        finalNewDurations = [...currentDurs];
        if (finalNewDurations.length < newChords.length) {
          while (finalNewDurations.length < newChords.length) {
            finalNewDurations.push(4);
          }
        } else if (finalNewDurations.length > newChords.length) {
          finalNewDurations = finalNewDurations.slice(0, newChords.length);
        }
      }
      return {
        ...prev,
        [activeRecipe.id]: finalNewDurations
      };
    });

    if (activeChordIndex >= newChords.length) {
      setActiveChordIndex(0);
    }
  };

  const handleUpdateChords = (newChords: string[]) => {
    handleUpdateChordsAndDurations(newChords);
  };

  const handleUpdateChordDuration = (index: number, beats: number) => {
    const updatedDurations = [...activeDurations];
    updatedDurations[index] = beats;
    setCustomDurations(prev => ({
      ...prev,
      [activeRecipe.id]: updatedDurations
    }));
  };

  // Context-aware harmonically compatible chord suggester
  const getSuggestedChordsForSlot = (index: number | null, chordsList: string[], keySymbol: string) => {
    if (index === null || index === undefined || chordsList.length === 0) return [];

    const total = chordsList.length;
    // Handle wrapping loop transitions
    const prevChord = chordsList[(index - 1 + total) % total];
    const nextChord = chordsList[(index + 1) % total];

    const pool = ["Am", "C", "G", "F", "Em", "D", "Dm", "Bb", "E7", "A7", "B7", "Em7", "Am7", "D7"];
    
    // Normalize key to match diatonic chords
    const lowerKey = keySymbol.toLowerCase();
    let diatonicSet = new Set(["C", "Am", "F", "G", "Dm", "Em", "Am7", "Em7"]);
    if (lowerKey.includes("a-m") || lowerKey.includes("am") || lowerKey.includes("a moll") || lowerKey.includes("a-moll")) {
      diatonicSet = new Set(["Am", "C", "F", "G", "Dm", "Em", "E7", "Am7", "Em7"]);
    } else if (lowerKey.includes("e-m") || lowerKey.includes("em") || lowerKey.includes("e moll") || lowerKey.includes("e-moll")) {
      diatonicSet = new Set(["Em", "G", "C", "D", "Am", "Bm", "B7", "Em7", "Am7"]);
    } else if (lowerKey.includes("d-m") || lowerKey.includes("dm") || lowerKey.includes("d moll") || lowerKey.includes("d-moll")) {
      diatonicSet = new Set(["Dm", "F", "Bb", "C", "Gm", "Am", "A7", "Dm7", "Am7"]);
    } else if (lowerKey.includes("g-d") || lowerKey.includes("g dur") || lowerKey.includes("g-dur") || lowerKey.includes("g major")) {
      diatonicSet = new Set(["G", "Am", "Bm", "C", "D", "Em", "D7", "Em7", "Am7", "B7"]);
    } else if (lowerKey.includes("c-d") || lowerKey.includes("c dur") || lowerKey.includes("c-dur") || lowerKey.includes("c major")) {
      diatonicSet = new Set(["C", "Dm", "Em", "F", "G", "Am", "G7", "Am7", "Em7", "B7", "D7"]);
    }

    const scored = pool.map(chord => {
      let score = 0;
      let reasons: string[] = [];

      // 1. Diatonic scale matching
      if (diatonicSet.has(chord)) {
        score += 3;
        reasons.push("In Tonleiter (" + keySymbol + ")");
      }

      // 2. Relationship with previous chord
      if (prevChord) {
        // Voice Leading score component: calculate shortest circle distance in semitones
        const getRootPitch = (cName: string): number => {
          let r = "";
          if (cName.length >= 2 && (cName[1] === "#" || cName[1] === "b")) {
            r = cName.slice(0, 2);
          } else if (cName.length >= 1) {
            r = cName[0];
          }
          const pitchMap: { [key: string]: number } = {
            "C": 0, "C#": 1, "Db": 1,
            "D": 2, "D#": 3, "Eb": 3,
            "E": 4,
            "F": 5, "F#": 6, "Gb": 6,
            "G": 7, "G#": 8, "Ab": 8,
            "A": 9, "A#": 10, "Bb": 10,
            "B": 11
          };
          return pitchMap[r] !== undefined ? pitchMap[r] : 0;
        };

        const prevPitch = getRootPitch(prevChord);
        const currPitch = getRootPitch(chord);
        const pitchDiff = Math.abs(prevPitch - currPitch);
        const semitoneDistance = Math.min(pitchDiff, 12 - pitchDiff);

        // Add bonus points for smooth, stepwise voice leading (within 2 semitones)
        if (semitoneDistance > 0 && semitoneDistance <= 2) {
          const vlBonus = semitoneDistance === 1 ? 5 : 3;
          score += vlBonus;
          reasons.push(`Voice-Leading: Stufenweiser Übergang von ${prevChord[0]} (${semitoneDistance} Hlb.)`);
        } else if (semitoneDistance === 0 && chord !== prevChord) {
          score += 2;
          reasons.push(`Stimmenführung: Gleicher Grundton (${prevChord[0]})`);
        }

        if ((prevChord === "G" || prevChord === "G7") && chord === "C") {
          score += 6;
          reasons.push("G -> C Dominantauflösung");
        }
        if (prevChord === "E7" && chord === "Am") {
          score += 6;
          reasons.push("E7 -> Am Klassischer Moll-Auflösungs-Pull");
        }
        if (prevChord === "A7" && (chord === "Dm" || chord === "D")) {
          score += 6;
          reasons.push("A7 -> Dm/D Dominantauflösung mit Leitton");
        }
        if (prevChord === "B7" && (chord === "Em" || chord === "Em7")) {
          score += 6;
          reasons.push("B7 -> Em Leittonspannung wird gelöst");
        }
        if ((prevChord === "D" || prevChord === "D7") && chord === "G") {
          score += 6;
          reasons.push("D -> G Traditionelle Dominant-Vorbereitung");
        }

        // Relative major/minors
        if ((prevChord === "Am" && chord === "C") || (prevChord === "C" && chord === "Am")) {
          score += 4;
          reasons.push("Parallelakkord-Verwandtschaft (Am/C)");
        }
        if ((prevChord === "Em" && chord === "G") || (prevChord === "G" && chord === "Em")) {
          score += 4;
          reasons.push("Parallelakkord-Verwandtschaft (Em/G)");
        }
        if ((prevChord === "Dm" && chord === "F") || (prevChord === "F" && chord === "Dm")) {
          score += 4;
          reasons.push("Parallelakkord-Verwandtschaft (Dm/F)");
        }

        // Cycle of fourths steps
        if (prevChord === "Am" && chord === "Dm") {
          score += 4;
          reasons.push("ii-V Kette (Am -> Dm)");
        }
        if (prevChord === "Dm" && chord === "G") {
          score += 4;
          reasons.push("ii-V Transition (Dm -> G)");
        }
        if (prevChord === "C" && chord === "F") {
          score += 4;
          reasons.push("Quintenzirkel Fortreihung (C -> F)");
        }

        // Steps
        if ((prevChord === "F" && chord === "G") || (prevChord === "G" && chord === "F")) {
          score += 3;
          reasons.push("Stufenmelodik F <-> G");
        }
        if ((prevChord === "G" && chord === "Am") || (prevChord === "Am" && chord === "G")) {
          score += 3;
          reasons.push("Melodischer Ganztonschritt G <-> Am");
        }
      }

      // 3. Relationship with next chord
      if (nextChord) {
        if ((chord === "G" || chord === "G7") && nextChord === "C") {
          score += 6;
          reasons.push("Dominante steuert ideal C an");
        }
        if (chord === "E7" && nextChord === "Am") {
          score += 6;
          reasons.push("Spannungsaufbau zu Am");
        }
        if (chord === "A7" && (nextChord === "Dm" || nextChord === "D")) {
          score += 6;
          reasons.push("Zielstrebiges Auflösen auf D/Dm");
        }
        if (chord === "B7" && (nextChord === "Em" || nextChord === "Em7")) {
          score += 6;
          reasons.push("Einführung des Leittons für Em");
        }
        if ((chord === "D" || chord === "D7") && nextChord === "G") {
          score += 6;
          reasons.push("Dominante löst sich auf G auf");
        }

        if (chord === "Dm" && (nextChord === "G" || nextChord === "G7")) {
          score += 5;
          reasons.push("Moderne ii-V Vorbereitung für G");
        }
        if (chord === "F" && nextChord === "G") {
          score += 4;
          reasons.push("Klassischer Subdominant-Schritt F -> G");
        }
      }

      // Voice leading adjustments / variety bias
      if (chord === prevChord) {
        score -= 2; // slight bias against repeating chords if avoidable
      }
      if (chord === nextChord) {
        score -= 2;
      }

      return {
        chord,
        score,
        reason: reasons[0] || "Harmonischer klangliche Ergänzung"
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  };

  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIdx === null || draggedIdx === index) return;
    const updatedChords = [...activeChords];
    const itemChord = updatedChords.splice(draggedIdx, 1)[0];
    updatedChords.splice(index, 0, itemChord);

    const updatedDurations = [...activeDurations];
    const itemDur = updatedDurations.splice(draggedIdx, 1)[0];
    updatedDurations.splice(index, 0, itemDur);

    handleUpdateChordsAndDurations(updatedChords, updatedDurations);
    setDraggedIdx(null);
  };

  const handleMoveChord = (fromIndex: number, direction: "left" | "right") => {
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= activeChords.length) return;
    const updatedChords = [...activeChords];
    const tempChord = updatedChords[fromIndex];
    updatedChords[fromIndex] = updatedChords[toIndex];
    updatedChords[toIndex] = tempChord;

    const updatedDurations = [...activeDurations];
    const tempDur = updatedDurations[fromIndex];
    updatedDurations[fromIndex] = updatedDurations[toIndex];
    updatedDurations[toIndex] = tempDur;

    handleUpdateChordsAndDurations(updatedChords, updatedDurations);
  };

  const handleAddChordSlot = () => {
    const defaultNewChord = activeChords[activeChords.length - 1] || "C";
    const updatedChords = [...activeChords, defaultNewChord];
    const updatedDurations = [...activeDurations, 4]; // default 4 beats for new slot

    handleUpdateChordsAndDurations(updatedChords, updatedDurations);
    // Auto edit the added slot
    setEditingSlotIndex(updatedChords.length - 1);
  };

  const handleRemoveChordSlot = (index: number) => {
    if (activeChords.length <= 2) return; // at least 2 chords required
    const updatedChords = activeChords.filter((_, i) => i !== index);
    const updatedDurations = activeDurations.filter((_, i) => i !== index);

    handleUpdateChordsAndDurations(updatedChords, updatedDurations);
    if (activeChordIndex >= updatedChords.length) {
      setActiveChordIndex(0);
    }
  };

  const handleResetChords = () => {
    setCustomProgressions(prev => {
      const copy = { ...prev };
      delete copy[activeRecipe.id];
      return copy;
    });
    setCustomDurations(prev => {
      const copy = { ...prev };
      delete copy[activeRecipe.id];
      return copy;
    });
    setActiveChordIndex(0);
    setEditingSlotIndex(null);
  };

  // Metronome and strumming states
  const [bpm, setBpm] = useState<number>(currentProgression.tempoSuggestion);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 to 7 (8th notes)
  const [swing, setSwing] = useState<number>(0); // Swing percentage (0 - 100%)
  const [timeSignature, setTimeSignature] = useState<"4/4" | "3/4" | "6/8">("4/4");
  const [strumPattern, setStrumPattern] = useState<"pad" | "ballad" | "groove" | "arpeggio" | "jazz">("ballad");
  const [syncChordChange, setSyncChordChange] = useState<boolean>(true);
  const [stepDynamics, setStepDynamics] = useState<number[]>([1.4, 0.7, 1.1, 0.7, 1.3, 0.7, 1.1, 0.7]);
  const [humanize, setHumanize] = useState<number>(15); // Dynamic humanize offset (0-60ms range, defaults to 15)

  // MIDI Controller Integrated Hub States
  const [midiInfo, setMidiInfo] = useState({
    isMidiActive: false,
    inputs: [] as { id: string; name: string }[],
    outputs: [] as { id: string; name: string }[],
    selectedInputId: "all",
    selectedOutputId: "none",
    midiThruEnabled: true
  });
  const [midiActiveStatus, setMidiActiveStatus] = useState<"idle" | "connecting" | "active" | "error">("idle");
  const [midiBlink, setMidiBlink] = useState<boolean>(false);

  const handleMidiStateChange = () => {
    setMidiInfo(getMidiState());
  };

  const handleMidiBlink = () => {
    setMidiBlink(true);
    setTimeout(() => setMidiBlink(false), 90);
  };

  const handleMidiInputNote = (noteName: string, octave: number, velocity: number) => {
    // Play with false to deny outward MIDI replication matching standard local-off principles
    playSynthNoteInternal(noteName, octave, 1.25, velocity, false);
    handleMidiBlink();
  };

  const handleInitializeMidi = async () => {
    setMidiActiveStatus("connecting");
    const success = await activateMidi(
      handleMidiStateChange,
      handleMidiInputNote,
      handleMidiBlink
    );
    if (success) {
      setMidiActiveStatus("active");
      setMidiInfo(getMidiState());
    } else {
      setMidiActiveStatus("error");
    }
  };

  useEffect(() => {
    handleInitializeMidi();
  }, []);

  // Synchronize state variables to references for atomic, desync-free Web Audio timing
  const strumPatternRef = useRef(strumPattern);
  const stepDynamicsRef = useRef(stepDynamics);
  const currentProgressionRef = useRef(currentProgression);
  const activeChordIndexRef = useRef(activeChordIndex);
  const bpmRef = useRef(bpm);
  const swingRef = useRef(swing);
  const timeSignatureRef = useRef(timeSignature);
  const syncChordChangeRef = useRef(syncChordChange);
  const isMetronomePlayingRef = useRef(isMetronomePlaying);
  const humanizeRef = useRef(humanize);
  const currentStepRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressionTimeoutsRef = useRef<any[]>([]);

  useEffect(() => {
    return () => {
      progressionTimeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => { strumPatternRef.current = strumPattern; }, [strumPattern]);
  useEffect(() => { stepDynamicsRef.current = stepDynamics; }, [stepDynamics]);
  useEffect(() => { currentProgressionRef.current = currentProgression; }, [currentProgression]);
  useEffect(() => { activeChordIndexRef.current = activeChordIndex; }, [activeChordIndex]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { swingRef.current = swing; }, [swing]);
  useEffect(() => { timeSignatureRef.current = timeSignature; }, [timeSignature]);
  useEffect(() => { syncChordChangeRef.current = syncChordChange; }, [syncChordChange]);
  useEffect(() => { isMetronomePlayingRef.current = isMetronomePlaying; }, [isMetronomePlaying]);
  useEffect(() => { humanizeRef.current = humanize; }, [humanize]);

  // If active chord index is somehow out of bounds after changing mood, reset it
  useEffect(() => {
    setActiveChordIndex(0);
    activeChordIndexRef.current = 0;
    setBpm(currentProgression.tempoSuggestion);
    setCurrentBeat(1);
    setCurrentStep(0);
    currentStepRef.current = 0;
    setIsMetronomePlaying(false); // Reset metronome active state on mood switch
  }, [activeMoodId]);

  // Reset steps on time signature change and set default dynamic accents
  useEffect(() => {
    setCurrentStep(0);
    currentStepRef.current = 0;
    setCurrentBeat(1);
    if (timeSignature === "4/4") {
      setStepDynamics([1.4, 0.7, 1.1, 0.7, 1.3, 0.7, 1.1, 0.7]);
    } else if (timeSignature === "3/4") {
      setStepDynamics([1.4, 0.6, 1.1, 0.6, 1.1, 0.6]);
    } else if (timeSignature === "6/8") {
      setStepDynamics([1.4, 0.5, 0.5, 1.1, 0.5, 0.5]);
    }
  }, [timeSignature]);

  // Highly robust single scheduling runner
  const runStep = (step: number) => {
    if (!isMetronomePlayingRef.current) return;

    // Trigger chords & progression sequence
    let chordIndexToPlay = activeChordIndexRef.current;
    if (step === 0 && syncChordChangeRef.current) {
      const nextIdx = (activeChordIndexRef.current + 1) % currentProgressionRef.current.chords.length;
      activeChordIndexRef.current = nextIdx;
      setActiveChordIndex(nextIdx);
      chordIndexToPlay = nextIdx;
    }

    const chordName = currentProgressionRef.current.chords[chordIndexToPlay];
    const notes = CHORD_FORMULATIONS[chordName] || [{ note: "A", octave: 3 }];
    const currentVelocity = stepDynamicsRef.current[step] !== undefined ? stepDynamicsRef.current[step] : 1.0;

    // Play synthesized instrument strum pattern
    playStrumPattern(notes, step, strumPatternRef.current, bpmRef.current, timeSignatureRef.current, currentVelocity, humanizeRef.current);

    // Play metronome wood percussion clicks
    if (timeSignatureRef.current === "4/4") {
      if (step % 2 === 0) {
        const mainBeat = Math.floor(step / 2) + 1;
        setCurrentBeat(mainBeat);
        playMetronomeTick(mainBeat === 1, mainBeat === 1);
      } else {
        playShakerTick();
      }
    } else if (timeSignatureRef.current === "3/4") {
      if (step % 2 === 0) {
        const mainBeat = Math.floor(step / 2) + 1;
        setCurrentBeat(mainBeat);
        playMetronomeTick(mainBeat === 1, mainBeat === 1);
      } else {
        playShakerTick();
      }
    } else if (timeSignatureRef.current === "6/8") {
      const mainBeat = step + 1;
      setCurrentBeat(mainBeat);
      if (mainBeat === 1) {
        playMetronomeTick(true, true);
      } else if (mainBeat === 4) {
        playMetronomeTick(true, false);
      } else {
        playShakerTick();
      }
    }

    // Determine precise delay to next step with swing coefficient
    const duration = 30000 / bpmRef.current; // 8th note duration
    const isEven = step % 2 === 0;
    const factor = 1 + (isEven ? 1 : -1) * (swingRef.current / 100) * (1 / 3);
    const stepDelay = duration * factor;

    // Schedule the next step sequence
    timeoutRef.current = setTimeout(() => {
      const maxSteps = timeSignatureRef.current === "4/4" ? 8 : 6;
      const nextStep = (step + 1) % maxSteps;
      currentStepRef.current = nextStep;
      setCurrentStep(nextStep);
      runStep(nextStep);
    }, stepDelay);
  };

  // Playback active/inactive listener link
  useEffect(() => {
    if (isMetronomePlaying) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      currentStepRef.current = 0;
      setCurrentStep(0);
      setCurrentBeat(1);
      runStep(0);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isMetronomePlaying]);

  const toggleMetronome = () => {
    setIsMetronomePlaying(!isMetronomePlaying);
  };


  const activeChordName = currentProgression.chords[activeChordIndex];
  const activeChordMapping = activeRecipe.trinityMapping[activeChordName] || {
    piano: [{ note: "A", interval: "Root", octave: 3 }],
    guitarTab: "x-0-2-2-1-0",
    bassTab: "x-0-2-2"
  };

  // Play the full progression
  const handlePlayProgression = () => {
    // Clear any existing scheduled timeouts in the handlePlayProgression queue
    progressionTimeoutsRef.current.forEach(t => clearTimeout(t));
    progressionTimeoutsRef.current = [];

    let accumulatedTimeMs = 0;
    const msPerBeat = 60000 / bpm;

    currentProgression.chords.forEach((chordName, i) => {
      const beats = activeDurations[i] || 4;
      const startMs = accumulatedTimeMs;
      accumulatedTimeMs += beats * msPerBeat;

      const timerId = setTimeout(() => {
        setActiveChordIndex(i);
        const notes = getChordVoicing(chordName, soundChar);
        playChord(notes, 1.0);
      }, startMs);

      progressionTimeoutsRef.current.push(timerId);
    });
  };

  // Save the current composition sketch to local storage
  const handleSaveToLibrary = () => {
    try {
      const chordsFormatted = currentProgression.chords.map((chord, i) => `${chord} (${activeDurations[i] || 4} Schläge)`).join(" – ");
      const exportText = `VibeTheory Idea Export
=======================
Datum: ${new Date().toLocaleDateString("de-DE")}
Mood: ${activeRecipe.name.toUpperCase()} - ${activeRecipe.description}
Key / Tonart: ${currentProgression.key}
Akkorde (und Dauern): ${chordsFormatted}

Gitarrenansatz:
----------------
${activeRecipe.guitar.approach} (Strumming: ${activeRecipe.guitar.strummingPattern || "N/A"})

Vorgeschlagenes Riff:
----------------------
${activeRecipe.riff.suggestedTab}

Bassbegleitung:
----------------
${activeRecipe.bass.suggestedTab} (Hinweise: ${activeRecipe.bass.movementHints.join("; ")})

Hintergrundtheorie (Reveal):
-----------------------------
${activeRecipe.theoryReveal.simpleExplanation}
`;

      const newIdea: SavedIdea = {
        id: "idea_" + Date.now(),
        createdAt: new Date().toISOString(),
        moodId: activeRecipe.id,
        moodName: activeRecipe.name,
        key: currentProgression.key,
        chords: currentProgression.chords,
        durations: activeDurations,
        guitarTab: activeRecipe.riff.suggestedTab,
        bassTab: activeRecipe.bass.suggestedTab,
        notes: "Projekt-Notizen hier bearbeiten...",
        exportText: exportText
      };

      const existingStored = localStorage.getItem("vibetheory_ideas");
      const ideasArray = existingStored ? JSON.parse(existingStored) as SavedIdea[] : [];
      
      localStorage.setItem("vibetheory_ideas", JSON.stringify([newIdea, ...ideasArray]));
      setRefreshLibraryTrigger(prev => prev + 1);
      
      setIsSavedMessage(true);
      setTimeout(() => setIsSavedMessage(false), 3000);
    } catch (err) {
      console.error("Failed to save idea to library:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-10" id="vibetheory-applet">
      
      {/* Top Banner Navigation */}
      <header className="bg-gray-950/80 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-shimmer">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center text-white font-extrabold text-sm tracking-wider font-mono">
                VT
              </div>
            </div>
            <div>
              <h1 className="text-xl font-sans font-bold tracking-tight text-white flex items-center gap-1.5">
                Harmonia: VibeTheory
                <span className="text-[10px] font-mono font-bold bg-indigo-950/80 border border-indigo-900 text-indigo-400 px-1.5 py-0.5 rounded tracking-widest uppercase">
                  v0.1 MVP
                </span>
              </h1>
              <p className="text-xs text-gray-400">Aus Gefühl wird Musikverständnis – Spiel erst. Versteh danach.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-900 border border-gray-800 p-0.5 rounded-lg text-xs" id="quick-tab-switcher">
              <button
                id="tab-btn-learn"
                onClick={() => setActiveTab("trinity")}
                className={`px-3 py-1 rounded transition-all font-mono text-[10px] uppercase ${activeTab !== "library" ? "bg-[#111827] text-white font-bold border border-gray-800" : "text-gray-400"}`}
              >
                Musikstudio
              </button>
              <button
                id="tab-btn-lib"
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1 rounded transition-all font-mono text-[10px] uppercase ${activeTab === "library" ? "bg-[#111827] text-white font-bold border border-gray-800" : "text-gray-400"}`}
              >
                Ideenbank
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-4 mt-6 w-full flex-grow flex flex-col gap-6 lg:grid lg:grid-cols-12">
        
        {/* LEFT COLUMN: Controls & Mood Selector (Bento Grid 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Bento Box 1: Mood Selector */}
          <div className="bg-[#111827] border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col" id="mood-selector-box">
            <span className="text-[10px] font-mono text-amber-500 tracking-wider uppercase font-bold block mb-1">
              Schritt 1: Mood wählen
            </span>
            <h2 className="text-base font-sans font-extrabold text-white mb-3">
              Wie soll es heute klingen?
            </h2>

            <div className="grid grid-cols-2 gap-2" id="mood-button-stack">
              {MOOD_RECIPES.map((recipe) => {
                const isActive = recipe.id === activeMoodId;
                return (
                  <button
                    key={recipe.id}
                    id={`mood-btn-${recipe.id}`}
                    onClick={() => setActiveMoodId(recipe.id)}
                    className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col gap-1.5 justify-between relative group
                      ${isActive
                        ? "bg-amber-955/5 bg-amber-950/10 border-amber-500 text-amber-400 shadow-[0_0_15px_-1px_rgba(245,158,11,0.2)]"
                        : "bg-gray-950 border-gray-850 text-gray-400 hover:border-gray-750 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs uppercase block truncate tracking-tight">{recipe.name}</span>
                      <ChevronRight size={11} className={`text-gray-600 group-hover:translate-x-0.5 transition-transform ${isActive ? "text-amber-500" : ""}`} />
                    </div>
                    <span className="text-[9px] text-gray-500 block leading-tight tracking-tighter truncate w-full h-3">
                      {recipe.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bento Box 2: Chord Mood & Progression Player */}
          <div className="bg-[#111827] border border-gray-800 p-5 rounded-2xl shadow-xl" id="progression-player-box">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase font-bold block">
                  Schritt 2: Akkorde spielen
                </span>
                <span className="text-xs text-gray-400 font-mono italic">
                  Tonart: {currentProgression.key} ({currentProgression.difficulty})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Klangcharakteristik Dropdown Selector */}
                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">Klang:</span>
                  <select
                    id="sound-characteristic-dropdown"
                    value={soundChar}
                    onChange={(e) => setSoundChar(e.target.value as SoundCharacteristic)}
                    className="bg-transparent text-white text-[10px] font-mono font-bold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="acoustic_piano" className="bg-gray-950 text-white">Akustik-Piano 🎹</option>
                    <option value="vintage_rhodes" className="bg-gray-950 text-white">Vintage-Rhodes 📻</option>
                    <option value="steel_guitar" className="bg-gray-950 text-white">Stahl-Gitarre 🎸</option>
                  </select>
                </div>

                {/* Vorspielen progression trigger */}
                <button
                  id="play-progression-sound"
                  onClick={handlePlayProgression}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-[10px] font-mono transition-all uppercase tracking-wider"
                  title="Akkordfolge anhören"
                >
                  <Volume2 size={12} />
                  <span>Loop Anhören</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between gap-2 mb-3 bg-gray-950/40 p-2 rounded-xl border border-gray-950">
              <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Akkordfolge-Modus:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  id="mode-play-btn"
                  onClick={() => setIsEditMode(false)}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${
                    !isEditMode 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-[#111827] border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Abspielen
                </button>
                <button
                  type="button"
                  id="mode-edit-btn"
                  onClick={() => {
                    setIsEditMode(true);
                    setEditingSlotIndex(null);
                  }}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1 ${
                    isEditMode 
                      ? "bg-amber-600 text-white shadow" 
                      : "bg-[#111827] border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  <Edit size={10} />
                  Anpassen
                </button>
              </div>
            </div>

            {/* Visual Timeline / Progress Bar tracking live playback loop steps */}
            <div className="mb-4 bg-gray-950/75 p-3 rounded-xl border border-gray-900/60" id="loop-timeline-container">
              <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono">
                <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Akkordschleife (Playback Timeline):
                </span>
                <span className="text-indigo-400 font-bold">
                  Schritt {activeChordIndex + 1} von {currentProgression.chords.length} (Klang: <span className="uppercase text-amber-400">{currentProgression.chords[activeChordIndex]}</span> – {activeDurations[activeChordIndex] || 4} Schläge)
                </span>
              </div>
              
              {/* Outer track bar divided into visual segments proportional to their beats */}
              <div className="h-4 w-full bg-gray-900/90 rounded-full overflow-hidden flex gap-1 p-[2.5px] border border-gray-850">
                {currentProgression.chords.map((chord, idx) => {
                  const isActive = idx === activeChordIndex;
                  const isPast = idx < activeChordIndex;
                  const beats = activeDurations[idx] || 4;
                  return (
                    <div 
                      key={`seg-${idx}`}
                      style={{ flexGrow: beats }}
                      className={`h-full transition-all duration-300 rounded-full relative group cursor-pointer flex items-center justify-center
                        ${isActive 
                          ? "bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.7)] text-white" 
                          : isPast 
                            ? "bg-indigo-950/70 border border-indigo-900/40 text-indigo-400" 
                            : "bg-gray-850 border border-gray-900 text-gray-500"
                        }`}
                      onClick={() => setActiveChordIndex(idx)}
                      title={`Klicke, um auf Akkord ${chord} (${beats} Schläge) zu wechseln`}
                    >
                      <span className="text-[8px] font-extrabold select-none truncate px-1">
                        {chord} <span className="text-[6.5px] opacity-75 font-normal">({beats}b)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 px-1 text-[9px] text-gray-400 font-mono font-semibold">
                {currentProgression.chords.map((chord, idx) => (
                  <span 
                    key={`lbl-${idx}`} 
                    className={`uppercase transition-colors ${idx === activeChordIndex ? "text-amber-400 font-extrabold" : "text-gray-500"}`}
                  >
                    {idx + 1}:{chord} ({activeDurations[idx] || 4}b)
                  </span>
                ))}
              </div>
            </div>

            {!isEditMode ? (
              <>
                <p className="text-xs text-gray-300 mb-4 h-auto leading-relaxed">
                  Drücke auf eine Akkordkarte, um diesen Akkord im Trinity-Visualizer zu laden und mitzuspielen:
                </p>

                {/* Chord Progression Stack Cards */}
                <div className="grid grid-cols-4 gap-2 mb-4" id="progression-chord-cards">
                  {currentProgression.chords.map((chord, index) => {
                    const isActive = index === activeChordIndex;
                    return (
                      <button
                        key={`chord-${index}`}
                        id={`chord-card-${index}`}
                        onClick={() => setActiveChordIndex(index)}
                        className={`h-16 rounded-xl border font-mono font-extrabold text-sm flex flex-col items-center justify-center transition-all relative
                          ${isActive
                            ? "bg-indigo-650 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.45)] bg-indigo-900/50"
                            : "bg-gray-950 border-gray-850 hover:border-gray-700 text-gray-300"
                          }`}
                      >
                        <span className="text-xs font-semibold text-gray-500 text-[9px] uppercase absolute top-1.5 tracking-tighter">
                          Stufe {index + 1}
                        </span>
                        <span className="relative top-1.5 tracking-tight text-sm uppercase">{chord}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-amber-400/90 mb-3 h-auto leading-relaxed bg-amber-950/20 border border-amber-900/40 p-2 rounded-xl">
                  <strong>Editor aktiv:</strong> Ziehe die Akkorde per Drag & Drop um die Reihenfolge zu ändern, klicke <strong>Akkord wählen</strong> um ihn anzupassen, oder füge neue Slots hinzu.
                </p>

                {/* Interactive Custom Drag Area */}
                <div className="grid grid-cols-2 gap-2 mb-4" id="custom-progression-editor">
                  {activeChords.map((chord, index) => {
                    const isEditingThis = editingSlotIndex === index;
                    return (
                      <div
                        key={`edit-slot-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        className={`p-2 rounded-xl border bg-gray-950 font-mono flex flex-col gap-1.5 transition-all relative ${
                          draggedIdx === index 
                            ? "opacity-35 border-dashed border-indigo-500 bg-indigo-950/15" 
                            : "border-gray-850"
                        }`}
                      >
                        {/* Control Bar: Handle, move arrows & delete */}
                        <div className="flex items-center justify-between gap-1 select-none">
                          <div className="flex items-center gap-1 text-gray-500">
                            <div className="cursor-grab hover:text-gray-300 p-0.5" title="Reihenfolge durch Ziehen ändern">
                              <GripVertical size={11} />
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-tighter">Slot {index + 1}</span>
                          </div>
                          
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveChord(index, "left")}
                              disabled={index === 0}
                              className="p-1 rounded bg-gray-900 border border-gray-850 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                              title="Links schieben"
                            >
                              <ArrowLeft size={8} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveChord(index, "right")}
                              disabled={index === activeChords.length - 1}
                              className="p-1 rounded bg-gray-900 border border-gray-850 text-gray-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                              title="Rechts schieben"
                            >
                              <ArrowRight size={8} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveChordSlot(index)}
                              disabled={activeChords.length <= 2}
                              className="p-1 rounded bg-red-950/10 border border-red-900/20 text-rose-400 hover:bg-rose-900/50 disabled:opacity-20 disabled:pointer-events-none ml-1.5"
                              title="Akkord löschen"
                            >
                              <Trash2 size={9} />
                            </button>
                          </div>
                        </div>

                        {/* Dropdown triggers */}
                        <button
                          type="button"
                          onClick={() => setEditingSlotIndex(isEditingThis ? null : index)}
                          className={`w-full py-1.5 rounded-lg border font-extrabold text-xs flex items-center justify-center gap-1 transition-all ${
                            isEditingThis 
                              ? "bg-amber-600/25 border-amber-500/80 text-amber-300 animate-pulse" 
                              : "bg-gray-900/70 border-gray-800 hover:border-gray-700 text-white"
                          }`}
                        >
                          <span className="uppercase tracking-tight text-xs">{chord}</span>
                          <span className="text-[8px] text-gray-400 font-medium">ändern</span>
                        </button>

                        {/* Chord Duration Selector */}
                        <div className="mt-1.5 pt-1.5 border-t border-gray-900 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[7.5px] font-mono text-gray-400 uppercase font-bold tracking-tight">Dauer (Beats):</span>
                            <span className="text-[8px] font-mono text-indigo-400 font-bold">{(activeDurations[index] || 4)}b</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 6, 8].map((bValue) => {
                              const isActive = (activeDurations[index] || 4) === bValue;
                              return (
                                <button
                                  key={`dur-${bValue}`}
                                  type="button"
                                  onClick={() => handleUpdateChordDuration(index, bValue)}
                                  className={`flex-1 py-1 rounded text-[8px] font-mono font-semibold transition-all border cursor-pointer ${
                                    isActive
                                      ? "bg-indigo-650 text-white border-indigo-500 font-extrabold shadow"
                                      : "bg-gray-900 border-gray-850 text-gray-500 hover:text-white hover:border-gray-750"
                                  }`}
                                  title={`${bValue} Schläge`}
                                >
                                  {bValue}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Popover Inline Chord Selector with harmonically compatible suggestions */}
                {editingSlotIndex !== null && editingSlotIndex < activeChords.length && (() => {
                  const rawSuggestions = getSuggestedChordsForSlot(editingSlotIndex, activeChords, currentProgression.key);
                  const filteredSuggestions = rawSuggestions.filter(item =>
                    item.chord.toLowerCase().includes(chordSearchQuery.trim().toLowerCase())
                  );

                  const containerVariants = {
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  };

                  const itemVariants = {
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 24 } }
                  };

                  return (
                    <div className="bg-gray-950 border border-amber-500/35 p-3.5 rounded-xl mb-4 animate-fade-in relative z-10 shadow-xl" id="smart-chord-selector-popover">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-400 animate-pulse" />
                            Harmonischer Berater für Slot #{editingSlotIndex + 1}
                          </span>
                          {activeChords.length > 1 && (
                            <span className="text-[8.5px] text-gray-500 font-mono">
                              Kontext: {activeChords[(editingSlotIndex - 1 + activeChords.length) % activeChords.length]} ➔ [?] ➔ {activeChords[(editingSlotIndex + 1) % activeChords.length]}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => setEditingSlotIndex(null)}
                          className="text-[9px] font-mono text-gray-500 hover:text-white uppercase transition-colors"
                        >
                          [X] Schließen
                        </button>
                      </div>

                      {/* Interactive Search Input Sub-Section */}
                      <div className="mt-2.5 pb-2.5 border-b border-gray-900/80 flex flex-col sm:flex-row sm:items-center gap-2.5 justify-between">
                        <div className="relative flex-1 w-full">
                          <input
                            id="chord-search-input"
                            type="text"
                            value={chordSearchQuery}
                            onChange={(e) => setChordSearchQuery(e.target.value)}
                            placeholder="Akkord filtern/suchen (z.B. C, Am, Em7...)"
                            className="w-full bg-gray-900/95 border border-gray-800 focus:border-amber-500 rounded-lg py-1 px-2.5 text-[10px] font-mono text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
                            autoComplete="off"
                          />
                          {chordSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setChordSearchQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-500 hover:text-gray-300 w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-800 transition-all cursor-pointer"
                              title="Text zurücksetzen"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 select-none">
                          {/* Auto-Preview Toggle */}
                          <label className="flex items-center gap-1.5 cursor-pointer" id="auto-preview-toggle-label">
                            <input 
                              type="checkbox" 
                              checked={autoPreviewEnabled} 
                              onChange={(e) => setAutoPreviewEnabled(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="relative w-7 h-4 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                            <span className="text-[8.5px] font-mono font-bold text-gray-400 uppercase tracking-wider" title="Akkord-Ton beim Berühren automatisch abspielen">
                              Auto-Preview
                            </span>
                          </label>

                          <span className="text-[8.5px] font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-850 select-none">
                            Ergebnisse: {filteredSuggestions.length}
                          </span>
                        </div>
                      </div>

                      {filteredSuggestions.length === 0 && (
                        <div className="text-center py-8 text-gray-400 font-mono text-xs flex flex-col items-center justify-center gap-1.5 animate-fade-in">
                          <p className="text-base text-gray-500">🔍</p>
                          <p>Keine passenden Akkorde für <strong className="text-amber-400">"{chordSearchQuery}"</strong> gefunden.</p>
                          <p className="text-[9px] text-gray-500">Versuche es mit Akkordnamen wie C, Am, Em7, F oder Bb.</p>
                        </div>
                      )}

                      {filteredSuggestions.length > 0 && (
                        <>
                          {/* Suggestions list representation */}
                          {/* Two-column bento-inspired layout */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3.5" id="smart-chord-selector-bento">
                            
                            {/* Left Side: Harmonic Recommendations list (7 cols) */}
                            <div className="lg:col-span-7 space-y-2.5 flex flex-col justify-between">
                              <div className="bg-indigo-950/20 border border-indigo-900/30 p-2.5 rounded-lg flex-1">
                                <span className="text-[9.5px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-2 px-0.5">
                                  ⭐ Harmonische Empfehlungen (Kontextbasiert):
                                </span>
                                <motion.div 
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="show"
                                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                                >
                                  {filteredSuggestions.slice(0, 4).map((item) => {
                                    const possibleChord = item.chord;
                                    const isSelected = activeChords[editingSlotIndex] === possibleChord;
                                    return (
                                      <motion.button
                                        variants={itemVariants}
                                        key={`suggested-${possibleChord}`}
                                        type="button"
                                        onMouseEnter={() => {
                                          setHoveredSuggestion(possibleChord);
                                          if (autoPreviewEnabled) {
                                            const notes = getChordVoicing(possibleChord, soundChar);
                                            playChord(notes, 1.0);
                                          }
                                        }}
                                        onMouseLeave={() => setHoveredSuggestion(null)}
                                        onClick={() => {
                                          const updated = [...activeChords];
                                          updated[editingSlotIndex] = possibleChord;
                                          handleUpdateChords(updated);
                                          setEditingSlotIndex(null);
                                          setHoveredSuggestion(null);
                                          
                                          const notes = getChordVoicing(possibleChord, soundChar);
                                          playChord(notes, 1.0);
                                        }}
                                        whileHover={{
                                          scale: [1, 1.05, 1.01, 1.07, 1],
                                          boxShadow: isSelected
                                            ? [
                                                "0 0 0px rgba(245, 158, 11, 0.4)",
                                                "0 0 14px rgba(245, 158, 11, 0.8)",
                                                "0 0 6px rgba(245, 158, 11, 0.5)",
                                                "0 0 18px rgba(245, 158, 11, 0.9)",
                                                "0 0 0px rgba(245, 158, 11, 0.4)"
                                              ]
                                            : [
                                                "0 0 0px rgba(99, 102, 241, 0)",
                                                "0 0 12px rgba(99, 102, 241, 0.5)",
                                                "0 0 4px rgba(99, 102, 241, 0.2)",
                                                "0 0 16px rgba(99, 102, 241, 0.7)",
                                                "0 0 0px rgba(99, 102, 241, 0)"
                                              ],
                                          transition: {
                                            duration: 60 / bpm,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                          }
                                        }}
                                        className={`p-2.5 rounded-lg text-left text-xs font-mono transition-all flex flex-col justify-between border cursor-pointer hover:border-amber-400/50
                                          ${isSelected
                                            ? "bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-950/20"
                                            : "bg-gray-900 border-gray-800 hover:border-gray-750 text-gray-300"
                                          }`}
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-sm uppercase">{possibleChord}</span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation(); // prevent selecting/closing the slot popover
                                                const notes = getChordVoicing(possibleChord, soundChar);
                                                playChord(notes, 1.0);
                                              }}
                                              className={`p-1 rounded-md transition-all flex items-center justify-center cursor-pointer border hover:scale-110 active:scale-95
                                                ${isSelected 
                                                  ? "bg-amber-800/80 hover:bg-amber-900 text-white border-amber-400/40" 
                                                  : "bg-gray-950 hover:bg-gray-850 text-amber-400 border-gray-850 hover:border-gray-700 font-bold"}`}
                                              title="Akkord vorhören (Preview)"
                                              id={`preview-chord-${possibleChord}`}
                                            >
                                              <Play size={8} className="fill-amber-400 stroke-amber-400" />
                                            </button>
                                          </div>
                                          <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase
                                            ${item.score >= 10 ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-indigo-950 text-indigo-400 border border-indigo-900"}`}>
                                            Score: +{item.score}
                                          </span>
                                        </div>
                                        <span className={`text-[9.5px] mt-1.5 italic leading-snug block
                                          ${isSelected ? "text-amber-100" : "text-gray-400"}`}>
                                          💡 {item.reason}
                                        </span>

                                        {/* Visual Stimmführung (Voice leading / inter-tone intervals) schematic */}
                                        {(() => {
                                          const chordNotes = getChordVoicing(possibleChord, soundChar);
                                          return (
                                            <div className="mt-2.5 pt-2 border-t border-gray-800/60 w-full" id={`stimmfuehrung-mini-${possibleChord}`}>
                                              <div className="flex items-center justify-between text-[8px] font-mono mb-1 text-gray-500 font-bold uppercase tracking-wider">
                                                <span>Stimmführung (Akkordtöne)</span>
                                                <span className={isSelected ? "text-amber-200" : "text-amber-400"}>Halbtöne</span>
                                              </div>
                                              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                                                {chordNotes.map((n, index) => {
                                                  const isLast = index === chordNotes.length - 1;
                                                  const nextNote = !isLast ? chordNotes[index + 1] : null;
                                                  
                                                  // Calculate pitch details
                                                  const cleanNote = n.note;
                                                  const oct = n.octave ?? 3;
                                                  const pCurrent = getPitchValue(cleanNote, oct);
                                                  const pNext = nextNote ? getPitchValue(nextNote.note, nextNote.octave ?? 3) : 0;
                                                  
                                                  const semitoneDistance = pNext - pCurrent;
                                                  
                                                  return (
                                                    <div key={`rec-tone-${possibleChord}-${index}`} className="flex items-center shrink-0">
                                                      {/* Note circular/oval tag */}
                                                      {(() => {
                                                        const interval = getChordInterval(possibleChord, cleanNote);
                                                        return (
                                                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold border transition-all flex items-center gap-1
                                                            ${isSelected
                                                              ? "bg-amber-600/80 text-white border-amber-400/60"
                                                              : `${interval.colorClass}`
                                                            }`}
                                                          >
                                                            <span>
                                                              {cleanNote}
                                                              <span className="text-[6.5px] opacity-75 ml-0.5">{oct}</span>
                                                            </span>
                                                            <span className={`text-[7px] font-extrabold px-0.5 py-0.2 rounded ${isSelected ? "bg-amber-900/50 text-amber-200" : "opacity-90 bg-black/45 text-gray-300 font-mono leading-none"}`} title={`Intervall: ${interval.label}`}>
                                                              {interval.label}
                                                            </span>
                                                          </span>
                                                        );
                                                      })()}
                                                      
                                                      {/* Interval indicator badge */}
                                                      {!isLast && (
                                                        <div className="flex items-center mx-0.5 shrink-0" title={`Abstand: ${semitoneDistance} Halbtöne`}>
                                                          <span className="text-[8px] text-gray-600 font-bold">➔</span>
                                                          <span className={`text-[8px] font-mono font-bold px-0.5 py-0.2 rounded mx-0.2
                                                            ${isSelected
                                                              ? "bg-amber-950/50 text-amber-300"
                                                              : "bg-indigo-950/40 text-indigo-400"
                                                            }`}
                                                          >
                                                            +{semitoneDistance}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </motion.button>
                                    );
                                  })}
                                </motion.div>
                              </div>
                            </div>

                            {/* Right Side: Interactive Animated Voice Leading Graphics Core (5 cols) */}
                            {(() => {
                              const prevChordName = editingSlotIndex > 0 ? activeChords[editingSlotIndex - 1] : activeChords[activeChords.length - 1];
                              const targetChordName = hoveredSuggestion || activeChords[editingSlotIndex] || (filteredSuggestions[0]?.chord || "C");
                              
                              const prevChordNotes = getChordVoicing(prevChordName, soundChar);
                              const targetChordNotes = getChordVoicing(targetChordName, soundChar);
                              
                              const matchVoiceLeading = (
                                pNotes: typeof prevChordNotes,
                                tNotes: typeof targetChordNotes
                              ) => {
                                const prevPitches = pNotes.map((n, idx) => ({
                                  id: `p-${idx}`,
                                  note: n.note,
                                  octave: n.octave ?? 3,
                                  pitch: getPitchValue(n.note, n.octave ?? 3),
                                  originalIndex: idx
                                }));

                                const nextPitches = tNotes.map((n, idx) => ({
                                  id: `n-${idx}`,
                                  note: n.note,
                                  octave: n.octave ?? 3,
                                  pitch: getPitchValue(n.note, n.octave ?? 3),
                                  originalIndex: idx
                                }));

                                const connections: { prevIdx: number; nextIdx: number; semitoneDiff: number; isEfficient: boolean }[] = [];
                                
                                prevPitches.forEach((p, pIdx) => {
                                  let bestNextIdx = 0;
                                  let minDiff = Infinity;
                                  nextPitches.forEach((n, nIdx) => {
                                    const diff = Math.abs(p.pitch - n.pitch);
                                    if (diff < minDiff) {
                                      minDiff = diff;
                                      bestNextIdx = nIdx;
                                    }
                                  });
                                  
                                  const realDiff = nextPitches[bestNextIdx].pitch - p.pitch;
                                  connections.push({
                                    prevIdx: pIdx,
                                    nextIdx: bestNextIdx,
                                    semitoneDiff: realDiff,
                                    isEfficient: Math.abs(realDiff) <= 2
                                  });
                                });

                                return { prevPitches, nextPitches, connections };
                              };

                              const { connections } = matchVoiceLeading(prevChordNotes, targetChordNotes);
                              const commonTonesCount = connections.filter(c => c.semitoneDiff === 0).length;
                              const efficientShiftsCount = connections.filter(c => Math.abs(c.semitoneDiff) > 0 && Math.abs(c.semitoneDiff) <= 2).length;
                              const avgShift = connections.reduce((acc, c) => acc + Math.abs(c.semitoneDiff), 0) / Math.max(1, connections.length);

                              return (
                                <div className="lg:col-span-5 bg-gray-900/90 border border-gray-800/80 rounded-xl p-3 flex flex-col justify-between h-full min-h-[320px] shadow-inner font-mono" id="voice-leading-interactive-panel">
                                  {/* Panel header */}
                                  <div>
                                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                                      <span className="flex items-center gap-1">
                                        <Sparkles size={11} className="text-amber-400 animate-pulse" />
                                        Stimmführungspfad
                                      </span>
                                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                                        {hoveredSuggestion ? "Hover Vorschau5" : "Ausgewählt"}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-1 leading-snug">
                                      Verbindung von <span className="text-indigo-400 font-bold">{prevChordName}</span> zu <span className="text-amber-400 font-bold">{targetChordName}</span>. Die hellsten Linien zeigen optimale, fließende Stimmführung.
                                    </p>
                                  </div>

                                  {/* Dynamic SVG Board */}
                                  <div className="relative flex-1 flex items-center justify-between my-2 border border-gray-800/50 rounded-lg p-2.5 bg-gray-950/90 h-[190px]" id="voice-leading-canvas">
                                    
                                    {/* Left Column (Previous) */}
                                    <div className="flex flex-col justify-between h-full z-10 w-22">
                                      <div className="text-[10px] font-mono font-extrabold text-indigo-400 text-center mb-1 bg-indigo-950/40 border border-indigo-900/40 py-0.5 rounded uppercase">
                                        {prevChordName}
                                      </div>
                                      <div className="flex-1 flex flex-col justify-around py-1 gap-1.5 w-full">
                                        {prevChordNotes.map((n, idx) => {
                                          const interval = getChordInterval(prevChordName, n.note);
                                          return (
                                            <div key={`vl-prev-chord-${idx}`} className="flex items-center gap-1.5 justify-start w-full">
                                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                interval.label === "R" ? "bg-emerald-500" :
                                                interval.label.includes("3") ? "bg-blue-400" :
                                                interval.label === "5" ? "bg-amber-400" :
                                                interval.label.includes("7") ? "bg-purple-400" :
                                                "bg-indigo-455"
                                              } animate-pulse`} />
                                              <span className={`text-[9.5px] font-mono font-extrabold px-1.5 py-0.5 rounded border transition-all flex items-center justify-between flex-1 ${interval.colorClass}`}>
                                                <span>
                                                  {n.note}<span className="text-[7px] opacity-65 font-semibold ml-0.5">{n.octave ?? 3}</span>
                                                </span>
                                                <span className="text-[7.5px] font-black opacity-80 uppercase leading-none font-mono">{interval.label}</span>
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* SVG Overlay */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 200" preserveAspectRatio="none" style={{ zIndex: 5 }}>
                                      <g>
                                        {connections.map((conn, cIdx) => {
                                          const M = prevChordNotes.length;
                                          const N = targetChordNotes.length;

                                          const sX = 75;
                                          const eX = 225;
                                          const sY = M > 1 ? 40 + (conn.prevIdx * (125 / (M - 1))) : 100;
                                          const eY = N > 1 ? 40 + (conn.nextIdx * (125 / (N - 1))) : 100;

                                          const cpX1 = sX + 45;
                                          const cpY1 = sY;
                                          const cpX2 = eX - 45;
                                          const cpY2 = eY;

                                          const absDiff = Math.abs(conn.semitoneDiff);
                                          let strokeColor = "#4B5563"; // default dim
                                          let glowColor = "rgba(75, 85, 99, 0.2)";
                                          let labelStyle = "text-gray-500 bg-gray-950 border border-gray-900";
                                          let strokeWidth = "1.5";
                                          let isDashed = true;

                                          if (absDiff === 0) {
                                            strokeColor = "#10B981"; // super clean, emerald green for common tone holding index
                                            glowColor = "rgba(16, 185, 129, 0.4)";
                                            strokeWidth = "2.5";
                                            isDashed = false;
                                            labelStyle = "text-emerald-400 bg-emerald-950 border border-emerald-900/80 font-bold";
                                          } else if (absDiff <= 2) {
                                            strokeColor = "#34D399"; // beautiful soft mint emerald for smooth voice leading transitions (1-2 semitones)
                                            glowColor = "rgba(52, 211, 153, 0.3)";
                                            strokeWidth = "2";
                                            isDashed = false;
                                            labelStyle = "text-teal-300 bg-teal-950 border border-teal-900/60 font-bold";
                                          } else if (absDiff <= 4) {
                                            strokeColor = "#F59E0B"; // fine amber transition
                                            strokeWidth = "1.5";
                                            isDashed = true;
                                            labelStyle = "text-amber-400 bg-gray-900 border border-amber-900/20";
                                          } else {
                                            strokeColor = "#6366F1"; // standard jump
                                            strokeWidth = "1";
                                            isDashed = true;
                                            labelStyle = "text-indigo-400 bg-indigo-950 border border-indigo-900/20";
                                          }

                                          const midX = (sX + eX) / 2;
                                          const midY = (sY + eY) / 2;

                                          return (
                                            <g key={`v-path-${cIdx}`} className="transition-all duration-300">
                                              {/* Glow Layer */}
                                              {!isDashed && (
                                                <path
                                                  d={`M ${sX} ${sY} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${eX} ${eY}`}
                                                  fill="none"
                                                  stroke={strokeColor}
                                                  strokeWidth="5"
                                                  strokeOpacity="0.25"
                                                />
                                              )}
                                              {/* Core dynamic line */}
                                              <path
                                                d={`M ${sX} ${sY} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${eX} ${eY}`}
                                                fill="none"
                                                stroke={strokeColor}
                                                strokeWidth={strokeWidth}
                                                strokeOpacity="1"
                                                strokeDasharray={isDashed ? "3,3" : "none"}
                                              />

                                              {/* Connecting text indicator card */}
                                              <foreignObject
                                                x={midX - 18}
                                                y={midY - 8}
                                                width="36"
                                                height="16"
                                                className="overflow-visible"
                                              >
                                                <div className={`flex items-center justify-center text-[7.5px] font-mono leading-none rounded px-1 py-0.5 text-center shadow select-none ${labelStyle}`}>
                                                  {conn.semitoneDiff === 0 ? "Hold" : `${conn.semitoneDiff > 0 ? "+" : ""}${conn.semitoneDiff}`}
                                                </div>
                                              </foreignObject>
                                            </g>
                                          );
                                        })}
                                      </g>
                                    </svg>

                                    {/* Right Column (Next Target) */}
                                    <div className="flex flex-col justify-between h-full z-10 w-22 items-end">
                                      <div className="text-[10px] font-mono font-extrabold text-amber-400 text-center mb-1 bg-amber-950/40 border border-amber-900/40 py-0.5 px-2 rounded uppercase">
                                        {targetChordName}
                                      </div>
                                      <div className="flex-1 flex flex-col justify-around py-1 gap-1.5 w-full items-end font-bold">
                                        {targetChordNotes.map((n, idx) => {
                                          const interval = getChordInterval(targetChordName, n.note);
                                          return (
                                            <div key={`vl-target-chord-${idx}`} className="flex items-center gap-1.5 justify-end w-full">
                                              <span className={`text-[9.5px] font-mono font-extrabold px-1.5 py-0.5 rounded border transition-all flex items-center justify-between flex-1 ${interval.colorClass}`}>
                                                <span className="text-[7.5px] font-black opacity-80 uppercase leading-none font-mono">{interval.label}</span>
                                                <span>
                                                  {n.note}<span className="text-[7px] opacity-65 font-semibold ml-0.5">{n.octave ?? 3}</span>
                                                </span>
                                              </span>
                                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                interval.label === "R" ? "bg-emerald-500" :
                                                interval.label.includes("3") ? "bg-blue-400" :
                                                interval.label === "5" ? "bg-amber-400" :
                                                interval.label.includes("7") ? "bg-purple-400" :
                                                "bg-amber-405/80"
                                              }`} />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                  </div>

                                  {/* Dynamic mini efficiency statistics */}
                                  <div className="bg-gray-950 border border-gray-800/50 rounded-lg p-2 flex items-center justify-between text-[8px] font-mono text-gray-400 mt-1" id="voice-leading-analysis-legend">
                                    <div className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      <span>Halte-Töne: <strong className="text-emerald-400">{commonTonesCount}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                      <span>Flow-Schritte: <strong className="text-teal-400">{efficientShiftsCount}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                      <span>Ø Distanz: <strong className="text-amber-400">{avgShift.toFixed(1)}</strong></span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                          </div>

                          {/* Remaining collapsible or lower score chords */}
                          {filteredSuggestions.length > 4 && (
                            <div className="border-t border-gray-900 pt-3 mt-1.5">
                              <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1.5">
                                Andere d’accord-Möglichkeiten:
                              </span>
                              <motion.div 
                                variants={containerVariants}
                                  initial="hidden"
                                animate="show"
                                className="grid grid-cols-5 gap-1.5"
                              >
                                {filteredSuggestions.slice(4).map((item) => {
                                  const possibleChord = item.chord;
                                  const isSelected = activeChords[editingSlotIndex] === possibleChord;
                                  return (
                                    <motion.button
                                      variants={itemVariants}
                                      key={`other-${possibleChord}`}
                                      type="button"
                                      title={item.reason}
                                      onMouseEnter={() => {
                                        setHoveredSuggestion(possibleChord);
                                        if (autoPreviewEnabled) {
                                          const notes = getChordVoicing(possibleChord, soundChar);
                                          playChord(notes, 1.0);
                                        }
                                      }}
                                      onMouseLeave={() => setHoveredSuggestion(null)}
                                      onClick={() => {
                                        const updated = [...activeChords];
                                        updated[editingSlotIndex] = possibleChord;
                                        handleUpdateChords(updated);
                                        setEditingSlotIndex(null);
                                        
                                        const notes = getChordVoicing(possibleChord, soundChar);
                                        playChord(notes, 1.0);
                                      }}
                                      whileHover={{
                                        scale: [1, 1.04, 1.01, 1.06, 1],
                                        boxShadow: isSelected
                                          ? [
                                              "0 0 0px rgba(245, 158, 11, 0.4)",
                                              "0 0 10px rgba(245, 158, 11, 0.7)",
                                              "0 0 4px rgba(245, 158, 11, 0.4)",
                                              "0 0 12px rgba(245, 158, 11, 0.8)",
                                              "0 0 0px rgba(245, 158, 11, 0.4)"
                                            ]
                                          : [
                                              "0 0 0px rgba(156, 163, 175, 0)",
                                              "0 0 8px rgba(156, 163, 175, 0.4)",
                                              "0 0 3px rgba(156, 163, 175, 0.15)",
                                              "0 0 10px rgba(156, 163, 175, 0.5)",
                                              "0 0 0px rgba(156, 163, 175, 0)"
                                            ],
                                        transition: {
                                          duration: 60 / bpm,
                                          repeat: Infinity,
                                          ease: "easeInOut"
                                        }
                                      }}
                                      className={`py-1 rounded text-[10px] font-bold font-mono transition-colors text-center border cursor-pointer
                                        ${isSelected
                                          ? "bg-amber-600 border-amber-500 text-white"
                                          : "bg-gray-900 border-gray-850 text-gray-500 hover:text-white hover:border-gray-750"
                                        }`}
                                    >
                                      {possibleChord}
                                    </motion.button>
                                  );
                                })}
                              </motion.div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Edit Controls toolbar */}
                <div className="flex gap-1.5 mb-4 select-none">
                  <button
                    type="button"
                    onClick={handleAddChordSlot}
                    className="flex-1 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-300 hover:text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={11} />
                    Slot hinzufügen
                  </button>
                  <button
                    type="button"
                    onClick={handleResetChords}
                    className="px-2.5 py-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1"
                    title="Akkorde auf Voreinstellung zurücksetzen"
                  >
                    <RotateCcw size={11} />
                    Reseten
                  </button>
                </div>
              </>
            )}

            {/* Metronome Tool Sub-Card */}
            <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-3.5 mb-4" id="metronome-control-box">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-900">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    {isMetronomePlaying && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isMetronomePlaying ? "bg-amber-500" : "bg-gray-600"}`}></span>
                  </span>
                  <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase">
                    Studio Metronom-Vibe
                  </span>
                </div>
                
                {/* Sync Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={syncChordChange} 
                    onChange={(e) => setSyncChordChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-7 h-4 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="text-[9px] font-mono text-gray-400 font-medium">Sync Akkorde</span>
                </label>
              </div>

              {/* BPM Slider & Big Text Dial Row */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Tempo</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <button 
                      onClick={() => setBpm(b => Math.max(40, b - 1))}
                      className="w-6 h-6 rounded bg-gray-900 border border-gray-800 hover:border-gray-700 font-bold text-xs flex items-center justify-center text-gray-300 transition-colors"
                      title="BPM verringern"
                    >
                      -
                    </button>
                    <span className="text-lg font-extrabold font-mono text-amber-500 tracking-tight w-10 text-center">
                      {bpm}
                    </span>
                    <button 
                      onClick={() => setBpm(b => Math.min(220, b + 1))}
                      className="w-6 h-6 rounded bg-gray-900 border border-gray-800 hover:border-gray-700 font-bold text-xs flex items-center justify-center text-gray-300 transition-colors"
                      title="BPM erhöhen"
                    >
                      +
                    </button>
                    <span className="text-[9px] font-mono text-gray-500 font-medium">BPM</span>
                  </div>
                </div>

                {/* Beat Visualizer Indicator LEDs */}
                <div className="flex flex-col items-center gap-1 bg-[#111827] border border-gray-900 p-1.5 rounded-lg flex-1 h-12 justify-center">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-tight">Takt-Beat</span>
                  <div className="flex justify-center gap-1.5">
                    {Array.from({ length: timeSignature === "4/4" ? 4 : timeSignature === "3/4" ? 3 : 6 }).map((_, idx) => {
                      const beat = idx + 1;
                      const isActive = isMetronomePlaying && currentBeat === beat;
                      const isStrongBeat = beat === 1 || (timeSignature === "6/8" && beat === 4);
                      const activeColor = isStrongBeat 
                        ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.85)]" 
                        : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.85)]";
                      
                      return (
                        <div key={beat} className="flex flex-col items-center gap-0.5">
                          <div 
                            className={`w-3 h-1.5 rounded transition-all duration-75 
                              ${isActive ? activeColor : "bg-gray-800"}`}
                          />
                          <span className={`text-[7px] font-mono ${isActive ? "text-gray-200 font-bold" : "text-gray-600"}`}>
                            {beat}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Takt-Format / Time Signature Selection */}
              <div className="mb-3 bg-[#0b0f19] p-2 rounded-xl border border-gray-900/40">
                <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1.5 text-center">
                  Taktmaß (Time Signature)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["4/4", "3/4", "6/8"] as const).map((sig) => {
                    const isActive = timeSignature === sig;
                    return (
                      <button
                        key={sig}
                        type="button"
                        onClick={() => setTimeSignature(sig)}
                        className={`py-1 rounded text-[10px] font-mono font-extrabold transition-all border text-center
                          ${isActive 
                            ? "bg-amber-600/15 border-amber-500 text-amber-400 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.15)]" 
                            : "bg-gray-950 border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                          }`}
                      >
                        {sig}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pattern Selector / Groove Profiles */}
              <div className="mb-3 bg-[#0b0f19] p-2 rounded-xl border border-gray-900/40">
                <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1.5 text-center">
                  Strumming- u. Groove-Pattern
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {(["pad", "ballad", "groove", "arpeggio", "jazz"] as const).map((pat) => {
                    const isActive = strumPattern === pat;
                    const patLabels: Record<string, { title: string; desc: string }> = {
                      pad: { title: "Pad", desc: "Getragener, warmer Akkordwechsel" },
                      ballad: { title: "Ballade", desc: "Klassisches 8-Beat Anschlagsmuster" },
                      groove: { title: "Groove", desc: "Akustischer Schlagmuster-Groove" },
                      arpeggio: { title: "Zupfen", desc: "Fließendes klassisches Arpeggio" },
                      jazz: { title: "Jazz", desc: "Synkopierter Bossa-Nova-Rhythmus" }
                    };
                    return (
                      <button
                        key={pat}
                        type="button"
                        onClick={() => setStrumPattern(pat)}
                        className={`py-1 rounded text-[8px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center border
                          ${isActive 
                            ? "bg-amber-600/15 border-amber-500 text-amber-300 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                            : "bg-gray-950 border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                          }`}
                        title={patLabels[pat].desc}
                      >
                        <span>{patLabels[pat].title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Anschlag-Dynamik Editor (Beat Accents Editor) */}
              <div className="mb-3 bg-[#0b0f19] p-2.5 rounded-xl border border-gray-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest block text-center">
                    Anschlag-Dynamik (Step Accents)
                  </span>
                  <span className="text-[7.5px] font-mono text-gray-450 italic">
                    Klicken zum Umschalten
                  </span>
                </div>
                
                {/* Visual Accent Bars */}
                <div className="grid gap-1.5 h-20 items-end" style={{ gridTemplateColumns: `repeat(${timeSignature === "4/4" ? 8 : 6}, minmax(0, 1fr))` }}>
                  {Array.from({ length: timeSignature === "4/4" ? 8 : 6 }).map((_, idx) => {
                    const velocity = stepDynamics[idx] !== undefined ? stepDynamics[idx] : 1.0;
                    const isStepActiveNow = isMetronomePlaying && currentStep === idx;
                    
                    // Determine color and height representation based on step velocity
                    let barHeightClass = "h-[30%]";
                    let barBgClass = "bg-gray-800 border-gray-900";
                    let labelText = "Mute";
                    let labelColor = "text-gray-600";
                    let scoreGlow = "";

                    if (velocity === 0.0) {
                      barHeightClass = "h-[15%]";
                      barBgClass = "bg-red-950/20 border-red-900/30 text-red-650";
                      labelText = "Off";
                      labelColor = "text-red-550 font-extrabold";
                    } else if (velocity <= 0.7) {
                      barHeightClass = "h-[45%]";
                      barBgClass = "bg-sky-950/30 border-sky-850/40 text-sky-400 hover:border-sky-500/50";
                      labelText = "Soft";
                      labelColor = "text-sky-400";
                    } else if (velocity <= 1.2) {
                      barHeightClass = "h-[75%]";
                      barBgClass = "bg-emerald-950/30 border-emerald-850/40 text-emerald-400 hover:border-emerald-500/50";
                      labelText = "Mid";
                      labelColor = "text-emerald-400";
                    } else {
                      barHeightClass = "h-[100%]";
                      barBgClass = "bg-amber-600/15 border-amber-500 text-amber-300 hover:brightness-110";
                      labelText = "Acc";
                      labelColor = "text-amber-400 font-extrabold";
                      scoreGlow = "shadow-[0_0_8px_rgba(245,158,11,0.2)]";
                    }

                    const handleToggleStep = () => {
                      setStepDynamics((prev) => {
                        const next = [...prev];
                        const current = next[idx] ?? 1.0;
                        if (current >= 1.4) {
                          next[idx] = 0.0; // Mute
                        } else if (current === 0.0) {
                          next[idx] = 0.6; // Soft
                        } else if (current <= 0.7) {
                          next[idx] = 1.1; // Normal/Medium
                        } else {
                          next[idx] = 1.6; // Accent
                        }
                        return next;
                      });
                    };

                    // Label helpers:
                    const getStepFormattedLabel = () => {
                      if (timeSignature === "4/4") {
                        return ["1", "+", "2", "+", "3", "+", "4", "+"][idx] || "";
                      } else if (timeSignature === "3/4") {
                        return ["1", "+", "2", "+", "3", "+"][idx] || "";
                      } else {
                        return `${idx + 1}`;
                      }
                    };

                    return (
                      <div key={`dyn-step-${idx}`} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        {/* Step playhead indicator LED */}
                        <div className={`w-1 h-1 rounded-full transition-all duration-75 ${
                          isStepActiveNow 
                            ? "bg-amber-500 scale-125 shadow-[0_0_4px_#f59e0b]" 
                            : "bg-gray-800 scale-100"
                        }`} />
                        
                        {/* Clickable Bar Box */}
                        <button
                          type="button"
                          onClick={handleToggleStep}
                          className={`w-full ${barHeightClass} ${barBgClass} ${isStepActiveNow ? "ring-1 ring-amber-500/50" : ""} ${scoreGlow} rounded border transition-all duration-100 flex flex-col items-center justify-end pb-1 cursor-pointer active:scale-95`}
                          title={`Schritt ${idx + 1}: ${labelText} (Faktor: ${velocity}x)`}
                        >
                          <span className={`text-[7px] font-sans font-bold select-none leading-none ${labelColor}`}>
                            {labelText}
                          </span>
                        </button>

                        {/* Musical Step Coordinate */}
                        <span className={`text-[7px] font-mono leading-none ${isStepActiveNow ? "text-amber-400 font-extrabold" : "text-gray-500"}`}>
                          {getStepFormattedLabel()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic mini-legend */}
                <div className="flex justify-between items-center mt-2 pb-1 text-[7px] font-mono text-gray-500">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded bg-red-950/40 border border-red-900/30"></div>
                    <span>Off: Stumm</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded bg-sky-950/30 border border-sky-800/40"></div>
                    <span>Soft: Sanft</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded bg-emerald-950/30 border border-emerald-850/40"></div>
                    <span>Mid: Normal</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded bg-amber-500/10 border border-amber-500/30"></div>
                    <span>Acc: Akzent</span>
                  </div>
                </div>
              </div>

              {/* Swing parameter / shuffle style */}
              <div className="mb-3 bg-[#0b0f19] p-2.5 rounded-xl border border-gray-900/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                    Swing-Offset (Shuffle-Groove)
                  </span>
                  <span className="text-[10px] font-mono font-extrabold text-amber-500 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/40">
                    {swing}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500 font-mono">Gerade (0%)</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={swing}
                    onChange={(e) => setSwing(parseInt(e.target.value, 10))}
                    className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[8px] text-amber-500/80 font-mono font-bold">Swing (100%)</span>
                </div>
              </div>

              {/* Humanize/Organisches Timing parameter */}
              <div className="mb-3 bg-[#0b0f19] p-2.5 rounded-xl border border-gray-900/40">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                      Humanize (Organisches Timing)
                    </span>
                    <span className="text-[6.5px] font-mono text-gray-400 italic mt-0.5">
                      Fügt kleine Startzeit- & Anschlags-Variationen hinzu
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold text-amber-500 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/40">
                    {humanize} ms
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500 font-mono">Exakt (0ms)</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="60" 
                    value={humanize}
                    onChange={(e) => setHumanize(parseInt(e.target.value, 10))}
                    className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[8px] text-amber-500/80 font-mono font-bold">Menschlich (60ms)</span>
                </div>
              </div>

              {/* Slider bar & Toggle Play Button */}
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="40" 
                  max="200" 
                  value={bpm} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setBpm(val);
                  }}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <button
                  type="button"
                  onClick={toggleMetronome}
                  className={`px-3 py-1 bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-mono tracking-wider font-extrabold flex items-center gap-1.5 uppercase transition-all shrink-0
                    ${isMetronomePlaying 
                      ? "bg-rose-600/20 border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white" 
                      : "bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600 hover:text-white"
                    }`}
                >
                  {isMetronomePlaying ? (
                    <>
                      <div className="w-2 h-2 bg-rose-400 rounded-sm animate-pulse"></div>
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-current border-b-4 border-b-transparent"></div>
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real-time Waveform-Visualisierung */}
              <div className="mt-3">
                <WaveformVisualizer isPlaying={isMetronomePlaying} />
              </div>
            </div>

            {/* MIDI Controller Config Sub-Card */}
            <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-3.5 mb-4" id="midi-control-box">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-900">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    {midiBlink && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${midiInfo.isMidiActive ? (midiBlink ? "bg-emerald-400" : "bg-emerald-500") : "bg-gray-600"}`}></span>
                  </span>
                  <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase">
                    MIDI Studio Controller
                  </span>
                </div>
                
                {midiInfo.isMidiActive && (
                  <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded">
                    AKTIV
                  </span>
                )}
              </div>

              {!midiInfo.isMidiActive ? (
                <div className="flex flex-col gap-2 py-1">
                  <p className="text-[9px] text-gray-500 font-mono leading-relaxed">
                    Schließe dein MIDI-Keyboard (USB/Interface) an, um Töne und Akkorde live einzuspielen.
                  </p>
                  <button
                    type="button"
                    onClick={handleInitializeMidi}
                    className="py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>MIDI-Geräte suchen</span>
                  </button>
                  {midiActiveStatus === "error" && (
                    <span className="text-[8px] font-mono text-red-500 text-center">
                      Web MIDI wird blockiert oder nicht unterstützt.
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {/* MIDI Input Select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                      MIDI-Eingang (Keyboard)
                    </label>
                    <select
                      value={midiInfo.selectedInputId}
                      onChange={(e) => {
                        setSelectedInputId(e.target.value);
                        handleMidiStateChange();
                      }}
                      className="bg-gray-950/80 border border-gray-900 rounded-lg p-1.5 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">Alle Eingänge (Sammelkanal)</option>
                      {midiInfo.inputs.map((inp) => (
                        <option key={inp.id} value={inp.id}>
                          {inp.name}
                        </option>
                      ))}
                      {midiInfo.inputs.length === 0 && (
                        <option disabled>Keine Keyboards erkannt</option>
                      )}
                    </select>
                  </div>

                  {/* MIDI Output Select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                      MIDI-Ausgang (Synth)
                    </label>
                    <select
                      value={midiInfo.selectedOutputId}
                      onChange={(e) => {
                        setSelectedOutputId(e.target.value);
                        handleMidiStateChange();
                      }}
                      className="bg-gray-950/80 border border-gray-900 rounded-lg p-1.5 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="none">Stumm / Nur In-App Ton</option>
                      {midiInfo.outputs.map((out) => (
                        <option key={out.id} value={out.id}>
                          {out.name}
                        </option>
                      ))}
                      {midiInfo.outputs.length === 0 && (
                        <option disabled>Keine Hardware-Synths erkannt</option>
                      )}
                    </select>
                  </div>

                  {/* MIDI Thru Toggle */}
                  <div className="flex items-center justify-between pt-1 pb-0.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-gray-400 font-bold">MIDI Thru</span>
                      <span className="text-[7px] text-gray-500 font-mono">Keyboard direkt an Synth weiterleiten</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={midiInfo.midiThruEnabled} 
                        onChange={(e) => {
                          setMidiThruEnabled(e.target.checked);
                          handleMidiStateChange();
                        }}
                        className="sr-only peer"
                      />
                      <div className="relative w-7 h-4 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Active Monitor Bar */}
                  <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 pt-1.5 border-t border-gray-900">
                    <span>Erkannte Geräte: {midiInfo.inputs.length + midiInfo.outputs.length}</span>
                    <span className={midiBlink ? "text-emerald-400 font-extrabold transition-all" : "text-gray-650 transition-all"}>
                      ● Signal-Aktivität
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Save chord idea action */}
            <button
              id="save-chord-draft-button"
              onClick={handleSaveToLibrary}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-mono rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
            >
              <PlusCircle size={14} />
              <span>Akkord-Idee lokal sichern</span>
            </button>

            {/* Feedback notifications */}
            {isSavedMessage && (
              <div className="mt-2.5 text-center text-[10px] text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-900/40 p-1.5 rounded-lg animate-fade-in">
                ✓ Idee erfolgreich in deiner Ideenbank gesichert!
              </div>
            )}
          </div>

          {/* Bento Box 3: Quick Jam Widget */}
          <DailySpark currentMoodId={activeRecipe.id} />

        </div>

        {/* RIGHT COLUMN: Studio Dashboard (Bento Grid 8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Only render dashboard tabs if activeTab is not "library"  */}
          {activeTab !== "library" ? (
            <>
              {/* Dashboard Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-gray-900 pb-3 h-auto overflow-x-auto" id="dashboard-subnavigation-tabs">
                <button
                  id="tab-sub-trinity"
                  onClick={() => setActiveTab("trinity")}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0
                    ${activeTab === "trinity" 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                    }`}
                >
                  <Eye size={13} />
                  <span>Klavier/Trinity Mapping</span>
                </button>

                <button
                  id="tab-sub-riff"
                  onClick={() => setActiveTab("riff")}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0
                    ${activeTab === "riff" 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                    }`}
                >
                  <Sliders size={13} />
                  <span>AI Riff Forge</span>
                </button>

                <button
                  id="tab-sub-bass"
                  onClick={() => setActiveTab("bass")}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0
                    ${activeTab === "bass" 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                    }`}
                >
                  <Radio size={13} />
                  <span>Bass Fundament</span>
                </button>

                <button
                  id="tab-sub-scales"
                  onClick={() => setActiveTab("scales")}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0
                    ${activeTab === "scales" 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                    }`}
                >
                  <Compass size={13} />
                  <span>Skalen-Trainer</span>
                </button>

                <button
                  id="tab-sub-theory"
                  onClick={() => setActiveTab("theory")}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0
                    ${activeTab === "theory" 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                    }`}
                >
                  <BookOpen size={13} />
                  <span>Theorie Reveal</span>
                </button>

                <button
                  id="tab-sub-mentor"
                  onClick={() => setActiveTab("mentor")}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0
                    ${activeTab === "mentor" 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                    }`}
                >
                  <MessageSquareHeart size={13} />
                  <span>AI Mentor</span>
                </button>

                <button
                  id="tab-sub-structure"
                  onClick={() => setActiveTab("structure")}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0
                    ${activeTab === "structure" 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-gray-950 border border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white"
                    }`}
                >
                  <ListMusic size={13} />
                  <span>Song-Struktur</span>
                </button>
              </div>

              {/* Active Tab Panel Switching */}
              <div className="transition-all duration-300">
                {activeTab === "trinity" && (
                  <TrinityVisualizer 
                    chordName={activeChordName} 
                    mapping={activeChordMapping} 
                    currentScaleName={currentProgression.key}
                  />
                )}

                {activeTab === "structure" && (
                  <SongStructure 
                    onLoadProgressionToStudio={handleUpdateChords}
                    bpm={bpm}
                  />
                )}

                {activeTab === "riff" && (
                  <RiffForge 
                    moodId={activeRecipe.id} 
                    riff={{
                      scaleTones: activeRecipe.riff.scaleTones,
                      suggestedTab: activeRecipe.riff.suggestedTab,
                      variationHints: activeRecipe.riff.variationHints
                    }}
                  />
                )}

                {activeTab === "bass" && (
                  <BassGround 
                    chordProgression={currentProgression.chords} 
                    bass={activeRecipe.bass} 
                  />
                )}

                {activeTab === "scales" && (
                  <ScaleTrainer 
                    chordProgression={currentProgression.chords}
                    scaleSuggestions={activeRecipe.scaleSuggestions}
                    progressionKey={currentProgression.key}
                  />
                )}

                {activeTab === "theory" && (
                  <TheoryRevealView 
                    theory={activeRecipe.theoryReveal} 
                  />
                )}

                {activeTab === "mentor" && (
                  <AIMentor />
                )}
              </div>
            </>
          ) : (
            /* Render Idea Bank directly if activeTab === "library" */
            <div className="transition-all duration-300">
              <IdeaLibrary refreshTrigger={refreshLibraryTrigger} />
            </div>
          )}

        </div>

      </main>

      {/* Cozy Footer Status */}
      <footer className="mt-12 max-w-7xl mx-auto px-4 w-full border-t border-gray-900 pt-5 text-center text-xs text-gray-500 font-mono">
        <p className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>Verwurzelt im <strong>&ldquo;Modern Cozy Studio&rdquo;</strong>-Erlebnis</span>
          <span className="text-slate-750 font-bold">&#8226;</span>
          <span className="flex items-center gap-1">Intervalle: <span className="text-amber-400 font-bold">Root</span>, <span className="text-emerald-400 font-bold">Terz</span>, <span className="text-sky-450 font-bold">Quinte</span></span>
        </p>
        <p className="mt-2 text-[10px] text-gray-600">
          Harmonia VibeTheory MVP v0.1 © 2026. Made server-side with Gemini 3.5-Flash text model safely.
        </p>
      </footer>

    </div>
  );
}
