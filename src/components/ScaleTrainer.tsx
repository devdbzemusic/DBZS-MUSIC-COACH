import React, { useState, useEffect } from "react";
import { playSynthNote, playChord } from "../utils/synth";
import { Music, Play, Square, Info, Shield, Compass, Sparkles, BookOpen, Volume2 } from "lucide-react";

interface ScaleTrainerProps {
  chordProgression: string[];
  scaleSuggestions: string[];
  progressionKey: string;
}

interface ScaleInfo {
  name: string;
  notes: string[];
  intervals: string[];
  explanation: string;
  lickNotes: { note: string; octave: number }[];
  guitarLick: {
    title: string;
    tab: string;
    description: string;
  };
}

export const ScaleTrainer: React.FC<ScaleTrainerProps> = ({
  chordProgression,
  scaleSuggestions,
  progressionKey,
}) => {
  const [activeScaleIndex, setActiveScaleIndex] = useState<number>(0);
  const [isLoopingBacking, setIsLoopingBacking] = useState<boolean>(false);
  const [currentBackingChordIndex, setCurrentBackingChordIndex] = useState<number>(-1);
  const [isPlayingLick, setIsPlayingLick] = useState<boolean>(false);
  const [activeLickNoteIndex, setActiveLickNoteIndex] = useState<number>(-1);

  // Normalizer lists
  const notesOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const guitarStrings = ["E", "B", "G", "D", "A", "E"];
  const guitarOpenOctaves = [4, 3, 3, 3, 2, 2];

  // Reset indices on trigger change
  useEffect(() => {
    setActiveScaleIndex(0);
    setIsLoopingBacking(false);
    setCurrentBackingChordIndex(-1);
    setIsPlayingLick(false);
    setActiveLickNoteIndex(-1);
  }, [chordProgression, scaleSuggestions, progressionKey]);

  // Selected scale text representation
  const activeScaleName = scaleSuggestions[activeScaleIndex] || scaleSuggestions[0] || "A-Moll Pentatonik";

  // Resolve scale details statically for perfect robustness with maximum educational depth
  const resolveScaleData = (scaleName: string): ScaleInfo => {
    const normalized = scaleName.toLowerCase().trim();

    if (normalized.includes("a-moll pentatonik") || normalized.includes("a minor pentatonic")) {
      return {
        name: "A-Moll Pentatonik",
        notes: ["A", "C", "D", "E", "G"],
        intervals: ["1 (Koll)", "b3 (Terz)", "4 (Quarte)", "5 (Quinte)", "b7 (Septime)"],
        explanation: "Die Allzweckwaffe für ehrlichen Rock- und Folk-Groove. Da wir die kritischen Töne H (B) und F völlig auslassen, klingt hier garantiert jeder Solo-Ton flüssig und stimmig over the loop.",
        lickNotes: [
          { note: "A", octave: 3 },
          { note: "C", octave: 4 },
          { note: "D", octave: 4 },
          { note: "E", octave: 4 },
          { note: "G", octave: 4 },
          { note: "A", octave: 4 },
        ],
        guitarLick: {
          title: "A-Moll Pentatonik-Drill (Spiegelung im 5. Bund)",
          tab: `e|-------------------|\nB|-------------5-8---|\nG|---------5-7-------|\nD|-----5-7-----------|\nA|-5-7---------------|\nE|-------------------|`,
          description: "Dieser Musterlauf verbindet Zeige- und Ringfinger fließend ab dem 5. Bund aller Saiten. Perfekt für ein schwebendes, kontrolliertes Solo.",
        },
      };
    } else if (normalized.includes("a-moll") || normalized.includes("a-natürliches moll") || normalized.includes("äolisch") && normalized.includes("a")) {
      return {
        name: "A-Natürliches Moll (Äolisch)",
        notes: ["A", "B", "C", "D", "E", "F", "G"],
        intervals: ["1 (Kohl)", "2 (Sekunde)", "b3 (Terz)", "4 (Quarte)", "5 (Quinte)", "b6 (Sexte)", "b7 (Septime)"],
        explanation: "Die natürliche Moll-Skala bringt mit dem F (kleine Sexte) und H (große Sekunde) die klassisch verregnete Melancholie des herbstlichen Folk-Sounds voll zur Geltung.",
        lickNotes: [
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "C", octave: 4 },
          { note: "D", octave: 4 },
          { note: "E", octave: 4 },
          { note: "F", octave: 4 },
          { note: "G", octave: 4 },
          { note: "A", octave: 4 },
        ],
        guitarLick: {
          title: "Klassischer Moll-Melodielauf",
          tab: `e|-------------5-7-8-|\nB|---------5-6-------|\nG|-----5-7-----------|\nD|-5-7---------------|`,
          description: "Steigt elegant die A-Moll-Leiter aufwärts. Beachte den weichen Schritt zwischen F (kleine Sexte) und G auf den hohen Saiten.",
        },
      };
    } else if (normalized.includes("e-moll pentatonik") || normalized.includes("e minor pentatonic")) {
      return {
        name: "E-Moll Pentatonik",
        notes: ["E", "G", "A", "B", "D"],
        intervals: ["1 (Koll)", "b3 (Terz)", "4 (Quarte)", "5 (Quinte)", "b7 (Septime)"],
        explanation: "Super erdig und kraftvoll auf der Gitarre. Nutzt die leeren Saiten hervorragend aus. Liefert druckvolle, soulige und bluesige Soli.",
        lickNotes: [
          { note: "E", octave: 2 },
          { note: "G", octave: 2 },
          { note: "A", octave: 2 },
          { note: "B", octave: 2 },
          { note: "D", octave: 3 },
          { note: "E", octave: 3 },
        ],
        guitarLick: {
          title: "Offenes E-Moll Pentatonik Lick",
          tab: `e|-----------------0-3-|\nB|-------------0-3-----|\nG|---------0-2---------|\nD|-----0-2-------------|\nA|-0-2-----------------|\nE|---------------------|`,
          description: "Hier erklingen die offenen leeren Saiten im schnellen Wechselspiel mit den gezupften Tönen im 2. und 3. Bund.",
        },
      };
    } else if (normalized.includes("e-moll") || normalized.includes("e-äolisch") || normalized.includes("aeolian") && normalized.includes("e")) {
      return {
        name: "E-Moll (Äolisch)",
        notes: ["E", "F#", "G", "A", "B", "C", "D"],
        intervals: ["1 (Kohl)", "2 (Sekunde)", "b3 (Terz)", "4 (Quarte)", "5 (Quinte)", "b6 (Sexte)", "b7 (Septime)"],
        explanation: "Tiefe, nordische Melancholie. Perfekt für nachdenkliche Rockballaden oder atmosphärische, winterliche Soundscapes.",
        lickNotes: [
          { note: "E", octave: 3 },
          { note: "F#", octave: 3 },
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "C", octave: 4 },
          { note: "D", octave: 4 },
        ],
        guitarLick: {
          title: "Nordischer Nebellauf",
          tab: `e|-------2-3-5-------|\nB|-3-5---------------|\nG|-------------------|`,
          description: "Atmosphärischer, weiter Melodiebogen auf der H- und E-Saite ab dem 3. Bund. Klingt dramatisch und ausgedehnt.",
        },
      };
    } else if (normalized.includes("e phrygisch") || normalized.includes("phrygian")) {
      return {
        name: "E Phrygisch",
        notes: ["E", "F", "G", "A", "B", "C", "D"],
        intervals: ["1 (Koll)", "b2 (Sekunde)", "b3 (Terz)", "4 (Quarte)", "5 (Quinte)", "b6 (Sexte)", "b7 (Septime)"],
        explanation: "Spanisch angehaucht, geheimnisvoll und dunkel. Durch den reibungsvollen Halbtonschritt direkt über dem Grundton (E zu F) entsteht feurige Exotik.",
        lickNotes: [
          { note: "E", octave: 3 },
          { note: "F", octave: 3 },
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "C", octave: 4 },
          { note: "D", octave: 4 },
        ],
        guitarLick: {
          title: "Spanischer Phrygischer Drang",
          tab: `e|-------------------|\nB|-------------3-5---|\nG|---------2-4-------|\nD|-----2-3-----------|\nA|-2-3---------------|\nE|-------------------|`,
          description: "Schwerpunkt dieses Riffs liegt auf der tiefen F-Note (D-Saite, Bund 3). Bringt lodernde Flamenco-Spannung.",
        },
      };
    } else if (normalized.includes("e-blues") || normalized.includes("blues")) {
      return {
        name: "E-Blues-Tonleiter",
        notes: ["E", "G", "A", "A#", "B", "D"],
        intervals: ["1 (Grund)", "b3 (Terz)", "4 (Quarte)", "b5 (Blue Note)", "5 (Quinte)", "b7 (Septime)"],
        explanation: "Fügt der Pentatonik die legendäre 'Blue Note' (A# / Bb) hinzu. Das erzeugt das schmutzig-bittersüße Gefühl von melancholischem Blues-Schmerz.",
        lickNotes: [
          { note: "E", octave: 3 },
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "A#", octave: 3 },
          { note: "B", octave: 3 },
          { note: "D", octave: 4 },
          { note: "E", octave: 4 },
        ],
        guitarLick: {
          title: "The Cry of Blue Note",
          tab: `e|-------------5-6-7-|\nB|---------5-8-------|\nG|-----5-7-----------|\nD|-5-7---------------|`,
          description: "Wandere chromatisch von der Quarte zur Quinte über die schillernde Blue Note im b5-Bund.",
        },
      };
    } else if (normalized.includes("c-dur pentatonik") || normalized.includes("c major pentatonic")) {
      return {
        name: "C-Dur Pentatonik",
        notes: ["C", "D", "E", "G", "A"],
        intervals: ["1 (Koll)", "2 (Sekunde)", "3 (Große Terz)", "5 (Quinte)", "6 (Sexte)"],
        explanation: "Heller, lachender Folk-Sonnenschein. Unbelastet von jeglichem melodischen Druck oder leittonbehafteten Reibungen.",
        lickNotes: [
          { note: "C", octave: 3 },
          { note: "D", octave: 3 },
          { note: "E", octave: 3 },
          { note: "G", octave: 3 },
          { note: "A", octave: 4 },
          { note: "C", octave: 4 },
        ],
        guitarLick: {
          title: "Sunbeam Pop Rise",
          tab: `e|-------------------|\nB|---------5-8/10----|\nG|-----5-7-----------|\nD|-5-7---------------|`,
          description: "Klingt herrlich unbeschwert. Der abschließende Saiten-Slide auf dem Griffbrett öffnet das Klangspektrum weit.",
        },
      };
    } else if (normalized.includes("c-dur") || normalized.includes("ionisch") || normalized.includes("c major")) {
      return {
        name: "C-Dur (Ionisch)",
        notes: ["C", "D", "E", "F", "G", "A", "B"],
        intervals: ["1 (Grund)", "2 (Sekunde)", "3 (Terz)", "4 (Quarte)", "5 (Quinte)", "6 (Sexte)", "7 (Große Septime)"],
        explanation: "Unsere vertrauteste, klarste Tonleiter. Sie repräsentiert ungetrübten Trost, harmonische Ordnung und vollendete Aufhebung.",
        lickNotes: [
          { note: "C", octave: 3 },
          { note: "D", octave: 3 },
          { note: "E", octave: 3 },
          { note: "F", octave: 3 },
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "C", octave: 4 },
        ],
        guitarLick: {
          title: "Major Scale C-Dur Ascent",
          tab: `e|-------------5-7-8-|\nB|---------5-6-------|\nG|-----5-7-----------|`,
          description: "Ein feiner, vollendeter Aufstieg, der mit dem finalen Ton C auf dem 8. Bund der hohen E-Saite triumphiert.",
        },
      };
    } else if (normalized.includes("g-dur pentatonik") || normalized.includes("g major pentatonic")) {
      return {
        name: "G-Dur Pentatonik",
        notes: ["G", "A", "B", "D", "E"],
        intervals: ["1 (Koll)", "2 (Sekunde)", "3 (Terz)", "5 (Quinte)", "6 (Sexte)"],
        explanation: "Ein warmer, freudiger und unbeschwerter Pop-Begleiter. Passt reibungslos über helle, aufwärtsstrebende Melodien.",
        lickNotes: [
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "D", octave: 4 },
          { note: "E", octave: 4 },
          { note: "G", octave: 4 },
        ],
        guitarLick: {
          title: "Warm Campfire Lick",
          tab: `e|-------------3-5---|\nB|---------3-5-------|\nG|-----2-4-----------|\nD|-2-4---------------|`,
          description: "Ein schöner, unkomplizierter Lagerfeuer-Klassiker. Fließt mühelos von der D-Saite empor zur E-Saite.",
        },
      };
    } else if (normalized.includes("g-dur") || normalized.includes("g major")) {
      return {
        name: "G-Dur",
        notes: ["G", "A", "B", "C", "D", "E", "F#"],
        intervals: ["1 (Grund)", "2 (Sekunde)", "3 (Terz)", "4 (Quarte)", "5 (Quinte)", "6 (Sexte)", "7 (Septime)"],
        explanation: "Heroischer Aufbruch mit glänzenden Akzenten. Durch den charakterisitischen Ton F# erzeugt sie ein strahlendes Höhenlicht.",
        lickNotes: [
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "C", octave: 4 },
          { note: "D", octave: 4 },
          { note: "E", octave: 4 },
          { note: "F#", octave: 4 },
        ],
        guitarLick: {
          title: "G-Dur Hymnal Climb",
          tab: `e|-------2-3-5-------|\nB|-3-5---------------|\nG|-------------------|`,
          description: "Konzentriert sich auf das strahlende Intervall auf der hohen E-Saite. Spielt bewusst mit dem Leitton F#.",
        },
      };
    } else if (normalized.includes("d-dur pentatonik") || normalized.includes("d major pentatonic")) {
      return {
        name: "D-Dur Pentatonik",
        notes: ["D", "E", "F#", "A", "B"],
        intervals: ["1 (Grund)", "2 (Sekunde)", "3 (Terz)", "5 (Quinte)", "6 (Sexte)"],
        explanation: "Schwebend, zart und schimmernd wie das weite Nordlicht. Bietet flüssigen Trost ohne scharfe Reibungen im Ohr.",
        lickNotes: [
          { note: "D", octave: 3 },
          { note: "E", octave: 3 },
          { note: "F#", octave: 3 },
          { note: "A", octave: 4 },
          { note: "B", octave: 4 },
          { note: "D", octave: 4 },
        ],
        guitarLick: {
          title: "Serene Serendipity",
          tab: `e|-------------5-7---|\nB|---------5-7-------|\nG|-----4-7-----------|`,
          description: "Offene Intervalle über die mittleren und hohen Saiten für einen wolkenleichten, entspannenden Sound.",
        },
      };
    } else if (normalized.includes("d-dur") || normalized.includes("d major")) {
      return {
        name: "D-Dur",
        notes: ["D", "E", "F#", "G", "A", "B", "C#"],
        intervals: ["1 (Koll)", "2 (Sekunde)", "3 (Terz)", "4 (Quarte)", "5 (Quinte)", "6 (Sexte)", "7 (Septime)"],
        explanation: "Eine festliche, strahlende und weite Tonart. Sie klingt triumphal und unheimlich tröstlich zugleich.",
        lickNotes: [
          { note: "D", octave: 3 },
          { note: "E", octave: 3 },
          { note: "F#", octave: 3 },
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "C#", octave: 4 },
          { note: "D", octave: 4 },
        ],
        guitarLick: {
          title: "Cinematic Dreamscape",
          tab: `e|-------------5-7-9-|\nB|---------5-7-------|\nG|-----4-6-----------|`,
          description: "Filmmusik-hafter Aufstieg in den hohen Registern ab dem 4. Bund aufwärts.",
        },
      };
    } else if (normalized.includes("dorian") || normalized.includes("dorisch") || normalized.includes("dorian")) {
      return {
        name: "E-Dorisch (Dorian Mode)",
        notes: ["E", "F#", "G", "A", "B", "C#", "D"],
        intervals: ["1 (Kohl)", "2 (Sekunde)", "b3 (Terz)", "4 (Quarte)", "5 (Quinte)", "6 (Dorian Sexte)", "b7 (Septime)"],
        explanation: "Die ultimative, coole Jazz & Funk-Skala. Mit der großen Sexte (C#) klingt sie wunderbar unbeschwerter und grooviger im Vergleich zu natürlichem Moll.",
        lickNotes: [
          { note: "E", octave: 3 },
          { note: "F#", octave: 3 },
          { note: "G", octave: 3 },
          { note: "A", octave: 3 },
          { note: "B", octave: 3 },
          { note: "C#", octave: 4 },
          { note: "D", octave: 4 },
        ],
        guitarLick: {
          title: "Groovy Dorian Slide-Lick",
          tab: `e|-------------7-9---|\nB|---------7-8-------|\nG|-----7-9-----------|`,
          description: "Betont gezielt die markante dorische Sexte C# im 9. Bund für einen weichen Funk- und Fusion-Jazz-Charakter.",
        },
      };
    }

    // Dynamic, solid fallback
    return {
      name: scaleName || "Universelle Pentatonik",
      notes: ["A", "C", "D", "E", "G"],
      intervals: ["1", "b3", "4", "5", "b7"],
      explanation: "Eine wunderbar harmonische Fünftonleiter. Perfekt dafür geeignet, ohne klangliche Reibung über die Akkorde zu improvisieren.",
      lickNotes: [
        { note: "A", octave: 3 },
        { note: "C", octave: 4 },
        { note: "D", octave: 4 },
        { note: "E", octave: 4 },
        { note: "G", octave: 4 },
      ],
      guitarLick: {
        title: "Cozy Pentatonic Step",
        tab: `e|-------------------|\nB|-------------5-8---|\nG|---------5-7-------|\nD|-----5-7-----------|`,
        description: "Ein unkomplizierter Lauf, über den du dich langsam an Tonleitern herantasten kannst.",
      },
    };
  };

  const scaleData = resolveScaleData(activeScaleName);

  // Backing track loop playback mechanism
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoopingBacking) {
      let localIndex = 0;
      setCurrentBackingChordIndex(0);

      const chordFormulations: { [key: string]: { note: string; octave?: number }[] } = {
        "Am": [{ note: "A", octave: 2 }, { note: "C", octave: 3 }, { note: "E", octave: 3 }],
        "C": [{ note: "C", octave: 3 }, { note: "E", octave: 3 }, { note: "G", octave: 3 }],
        "G": [{ note: "G", octave: 2 }, { note: "B", octave: 3 }, { note: "D", octave: 3 }],
        "F": [{ note: "F", octave: 2 }, { note: "A", octave: 3 }, { note: "C", octave: 3 }],
        "Em": [{ note: "E", octave: 2 }, { note: "G", octave: 3 }, { note: "B", octave: 3 }],
        "D": [{ note: "D", octave: 3 }, { note: "F#", octave: 3 }, { note: "A", octave: 3 }],
        "E7": [{ note: "E", octave: 2 }, { note: "G#", octave: 3 }, { note: "D", octave: 4 }],
        "A7": [{ note: "A", octave: 2 }, { note: "C#", octave: 3 }, { note: "G", octave: 3 }],
        "B7": [{ note: "B", octave: 2 }, { note: "D#", octave: 3 }, { note: "A", octave: 3 }],
        "Dm": [{ note: "D", octave: 3 }, { note: "F", octave: 3 }, { note: "A", octave: 3 }],
        "Bb": [{ note: "Bb", octave: 2 }, { note: "D", octave: 3 }, { note: "F", octave: 3 }],
        "Em7": [{ note: "E", octave: 2 }, { note: "G", octave: 3 }, { note: "D", octave: 4 }],
        "Am7": [{ note: "A", octave: 2 }, { note: "C", octave: 3 }, { note: "G", octave: 3 }],
        "D7": [{ note: "D", octave: 3 }, { note: "F#", octave: 3 }, { note: "C", octave: 4 }]
      };

      // Trigger first immediately
      const initialChord = chordProgression[0];
      if (initialChord) {
        playChord(chordFormulations[initialChord] || [{ note: initialChord, octave: 3 }], 1.8);
      }

      timer = setInterval(() => {
        localIndex = (localIndex + 1) % chordProgression.length;
        setCurrentBackingChordIndex(localIndex);
        const nextChord = chordProgression[localIndex];
        if (nextChord) {
          playChord(chordFormulations[nextChord] || [{ note: nextChord, octave: 3 }], 1.8);
        }
      }, 2200);
    } else {
      setCurrentBackingChordIndex(-1);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoopingBacking, chordProgression]);

  // Handle Lick sequential audio demo
  const handlePlayLickTest = () => {
    if (isPlayingLick) return;
    setIsPlayingLick(true);
    let index = 0;
    setActiveLickNoteIndex(0);

    const playNext = () => {
      if (index >= scaleData.lickNotes.length) {
        setIsPlayingLick(false);
        setActiveLickNoteIndex(-1);
        return;
      }

      const point = scaleData.lickNotes[index];
      playSynthNote(point.note, point.octave, 0.6);
      setActiveLickNoteIndex(index);

      index++;
      setTimeout(playNext, 400); // tempo of demonstration
    };

    playNext();
  };

  // Convert string and fret number to note names on the guitar
  const getGuitarNoteNameAndOctave = (stringIndex: number, fret: number) => {
    const baseNote = guitarStrings[stringIndex];
    const startOctave = guitarOpenOctaves[stringIndex];
    const startIndex = notesOrder.indexOf(baseNote);

    let curOctave = startOctave;
    let curIndex = startIndex;
    for (let i = 0; i < fret; i++) {
      curIndex++;
      if (curIndex >= 12) {
        curIndex = 0;
        curOctave++;
      }
    }
    return { name: notesOrder[curIndex], octave: curOctave };
  };

  // Determine fret hover background color
  const isGuitarFretInScale = (stringIndex: number, fret: number) => {
    const calculated = getGuitarNoteNameAndOctave(stringIndex, fret);
    return scaleData.notes.includes(calculated.name);
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl animate-fade-in" id="scale-trainer-box">
      
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-3 border-b border-gray-900 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="text-emerald-400 animate-pulse" size={20} />
          <div>
            <h3 className="text-lg font-sans font-semibold text-white">Interactive Skalen-Trainer</h3>
            <p className="text-xs text-gray-400">Welcher Tonleiter passt über den Loop {chordProgression.join(" – ")}?</p>
          </div>
        </div>

        {/* Scale Toggle pill switcher */}
        <div className="flex items-center gap-1.5 bg-gray-950 p-1.5 rounded-lg border border-gray-900">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tight px-1 block">Auswahl:</span>
          {scaleSuggestions.map((sug, i) => (
            <button
              key={`sug-${i}`}
              onClick={() => {
                setActiveScaleIndex(i);
                setIsPlayingLick(false);
                setActiveLickNoteIndex(-1);
              }}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                activeScaleIndex === i
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Description and Backing Track Loop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        
        {/* Explanation Column */}
        <div className="md:col-span-8 bg-gray-950/40 p-4 border border-gray-900 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-amber-400" />
              <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider">{scaleData.name}</h4>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight">Best Match</span>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {scaleData.explanation} Over the Progression can be practiced effortlessly. Let's explore the interval structures below.
            </p>

            {/* Note Circles with interval tags */}
            <div className="flex gap-2.5 pb-2 overflow-x-auto">
              {scaleData.notes.map((n, i) => {
                const interval = scaleData.intervals[i] || "Interval";
                return (
                  <button
                    key={`note-card-${i}`}
                    onClick={() => playSynthNote(n, 3, 0.8)}
                    className="flex flex-col items-center gap-1 shrink-0 p-2 bg-gray-905 border border-gray-800 rounded-lg hover:border-emerald-500 transition-colors pointer group"
                    title={`Höre den Ton ${n}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-extrabold text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-all transform active:scale-90 shadow-sm">
                      {n}
                    </div>
                    <span className="text-[8px] font-mono text-gray-500">{interval}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-900 text-[10px] text-gray-400 font-mono flex items-center gap-1">
            <Info size={11} className="text-emerald-400" />
            <span>Klicke auf die Noten-Kreise, die Klaviertasten oder Fretboards, um Töne anzuspielen.</span>
          </div>
        </div>

        {/* Backing Track Loop Controller */}
        <div className="md:col-span-4 bg-[#1E293B]/30 border border-slate-800/60 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-mono text-emerald-400 tracking-widest uppercase font-bold block mb-1">Backing Playground</span>
            <h4 className="text-xs font-sans font-bold text-white mb-2">Groove-Loop Begleitung</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              Starte die akkordische Begleitung im Hintergrund, um dein Solo in Echtzeit zu begleiten:
            </p>

            {/* Flash visualizer chords */}
            <div className="grid grid-cols-4 gap-1 mb-3">
              {chordProgression.map((cp, idx) => {
                const isCurrent = idx === currentBackingChordIndex;
                return (
                  <div
                    key={`back-cp-${idx}`}
                    className={`h-9 border rounded flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all relative ${
                      isCurrent
                        ? "bg-emerald-600/30 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-[1.02]"
                        : "bg-gray-950 border-gray-900 text-gray-500"
                    }`}
                  >
                    <span className="text-[7px] text-gray-600 absolute top-0.5">I{idx + 1}</span>
                    <span className="relative top-1">{cp}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strum button */}
          <button
            onClick={() => setIsLoopingBacking(!isLoopingBacking)}
            className={`w-full py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg border flex items-center justify-center gap-2 transition-all ${
              isLoopingBacking
                ? "bg-rose-600/10 border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white"
                : "bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white"
            }`}
          >
            {isLoopingBacking ? (
              <>
                <Square size={12} className="fill-current animate-pulse" />
                <span>Stop Backing Track</span>
              </>
            ) : (
              <>
                <Play size={12} />
                <span>Play Backing Track</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* SECTION A: Visual Piano Roll */}
      <div className="mb-6 p-4 bg-gray-950/60 border border-gray-900 rounded-xl" id="scale-piano-roll-container">
        <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <BookOpen size={12} className="text-emerald-400" />
          <span>Piano Skalen-Muster: {scaleData.name}</span>
        </h4>

        {/* 2-Octave Keyboard rendering starting from C3 to B4 */}
        <div className="relative h-28 border border-gray-900 rounded-lg overflow-hidden bg-gray-950">
          
          {/* White keys stack */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 14 }).map((_, i) => {
              // C3 is offset 0; D3 is offset 1...
              const whiteKeyNoteNames = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E", "F", "G", "A", "B"];
              const octOff = i >= 7 ? 4 : 3;
              const noteName = whiteKeyNoteNames[i];
              const isInScale = scaleData.notes.includes(noteName);

              return (
                <button
                  key={`white-p-${i}`}
                  onClick={() => playSynthNote(noteName, octOff, 0.8)}
                  style={{ width: `${100 / 14}%` }}
                  className={`h-full border-r border-gray-900/40 select-none relative flex flex-col justify-end pb-3 items-center transition-all hover:bg-slate-900/70 active:scale-y-[0.96] active:origin-top duration-75 ${
                    isInScale ? "bg-emerald-950/25 text-emerald-400 border-b-2 border-b-emerald-500" : "bg-gray-950 text-gray-600"
                  }`}
                  title={`Piano Taste: ${noteName}${octOff}`}
                >
                  {isInScale && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[9px] font-extrabold text-emerald-300 shadow-sm animate-fade-in">
                      {noteName}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Black keys positioning overlay */}
          <div className="absolute inset-x-0 top-0 h-16 pointer-events-none flex">
            {Array.from({ length: 14 }).map((_, i) => {
              const hasBlackRight = i !== 2 && i !== 6 && i !== 9 && i !== 13;
              if (!hasBlackRight || i === 13) return <div key={`empty-blk-${i}`} style={{ width: `${100 / 14}%` }} className="h-full pointer-events-none" />;

              const blackNotesList = ["C#", "D#", "F#", "G#", "A#", "C#", "D#", "F#", "G#", "A#"];
              // Map index parameter correctly to index inside note arrays
              const blackKeyMap: Record<number, { note: string; oct: number }> = {
                0: { note: "C#", oct: 3 },
                1: { note: "D#", oct: 3 },
                3: { note: "F#", oct: 3 },
                4: { note: "G#", oct: 3 },
                5: { note: "A#", oct: 3 },
                7: { note: "C#", oct: 4 },
                8: { note: "D#", oct: 4 },
                10: { note: "F#", oct: 4 },
                11: { note: "G#", oct: 4 },
                12: { note: "A#", oct: 4 }
              };

              const keyData = blackKeyMap[i];
              if (!keyData) return <div key={`empty-blk-${i}`} style={{ width: `${100 / 14}%` }} className="h-full pointer-events-none" />;

              const isInScale = scaleData.notes.includes(keyData.note);
              const percentLeft = ((i + 0.72) / 14) * 100;

              return (
                <button
                  key={`black-p-${i}`}
                  onClick={() => playSynthNote(keyData.note, keyData.oct, 0.8)}
                  style={{
                    left: `${percentLeft}%`,
                    width: "4.5%",
                  }}
                  className={`absolute h-16 rounded-b border shadow-md active:scale-y-[0.93] active:origin-top duration-75 pointer-events-auto flex flex-col justify-end pb-1 items-center ${
                    isInScale
                      ? "bg-slate-900 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                      : "bg-[#090D16] border-gray-900 text-gray-700 hover:bg-slate-950"
                  }`}
                  title={`Piano Taste: ${keyData.note}${keyData.oct}`}
                >
                  {isInScale && (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-250 flex items-center justify-center text-[7px] font-bold text-gray-950">
                      {keyData.note.replace("#", "")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* SECTION B: Visual Guitar Fretboard */}
      <div className="p-4 bg-gray-950/60 border border-gray-900 rounded-xl mb-6" id="scale-guitar-fretboard-container">
        <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Music size={12} className="text-emerald-400" />
          <span>Gitarren Griffbrett-Muster: {scaleData.name} (Bund 0 bis 12)</span>
        </h4>

        {/* Fretboard visual board layout */}
        <div className="relative border-l-4 border-amber-900 h-36 bg-[#161210] rounded-r font-mono overflow-x-auto overflow-y-hidden" id="practice-fretboard">
          
          {/* Fret marker dots on wood: Frets 3, 5, 7, 9, 12 */}
          {[3, 5, 7, 9, 12].map((f) => (
            <div
              key={`dot-fret-${f}`}
              style={{ left: `${(f / 12) * 100 - 4}%` }}
              className="absolute top-[44%] w-3 h-3 bg-gray-700/60 rounded-full border border-gray-800 pointer-events-none"
            />
          ))}

          {/* Vertical silver steel frets */}
          {Array.from({ length: 13 }).map((_, fretIndex) => (
            <div
              key={`fr-${fretIndex}`}
              style={{ left: `${(fretIndex / 12) * 100}%` }}
              className={`absolute top-0 bottom-0 w-0.5 ${
                fretIndex === 0 ? "bg-amber-800" : "bg-slate-600/50 shadow-[1px_0_2px_rgba(255,255,255,0.1)]"
              }`}
            >
              <span className="absolute bottom-1 pl-1 text-[8px] text-gray-600 font-bold select-none">{fretIndex}</span>
            </div>
          ))}

          {/* Horizontal strings stack */}
          <div className="absolute inset-0 flex flex-col justify-between py-1.5 z-10">
            {guitarStrings.map((strName, strIdx) => {
              const strThickClass = strIdx === 5 ? "h-[2.5px]" : strIdx === 4 ? "h-[2px]" : "h-[1px]";
              const strColorVal = strIdx >= 4 ? "bg-amber-400/40" : "bg-slate-300/40";

              return (
                <div key={`str-${strIdx}`} className="relative h-5 flex items-center w-full">
                  
                  {/* Linear visual string rope */}
                  <div className={`absolute inset-x-0 ${strThickClass} ${strColorVal} pointer-events-none`} />

                  {/* Frets clickable notes anchor */}
                  {Array.from({ length: 13 }).map((_, f) => {
                    const isInScale = isGuitarFretInScale(strIdx, f);
                    const noteInfo = getGuitarNoteNameAndOctave(strIdx, f);
                    const isLickTrigger = isPlayingLick && activeLickNoteIndex >= 0 && scaleData.lickNotes[activeLickNoteIndex] 
                      ? (scaleData.lickNotes[activeLickNoteIndex].note === noteInfo.name && scaleData.lickNotes[activeLickNoteIndex].octave === noteInfo.octave)
                      : false;

                    return (
                      <div
                        key={`not-f-${strIdx}-${f}`}
                        style={{ left: f === 0 ? "-2px" : `${((f - 0.5) / 12) * 100}%` }}
                        className="absolute -translate-x-1/2 flex items-center justify-center p-1 cursor-pointer"
                      >
                        {isInScale ? (
                          <button
                            onClick={() => playSynthNote(noteInfo.name, noteInfo.octave, 0.8)}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-extrabold transition-all active:scale-90 hover:scale-125 hover:brightness-110 select-none ${
                              isLickTrigger
                                ? "bg-amber-500 text-white border-white scale-125 shadow-[0_0_12px_#f59e0b]"
                                : "bg-emerald-950 border-emerald-400/80 text-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-300"
                            }`}
                            title={`Spiele ${noteInfo.name}${noteInfo.octave}`}
                          >
                            <span>{noteInfo.name}</span>
                          </button>
                        ) : (
                          <div 
                            onClick={() => playSynthNote(noteInfo.name, noteInfo.octave, 0.8)}
                            className="w-2.5 h-2.5 rounded-full border border-gray-800/20 bg-gray-900/10 hover:border-indigo-500 hover:bg-indigo-950/40 opacity-15 hover:opacity-100 hover:scale-125 transition-all select-none"
                            title={`Hier dämpfen/Nicht-Scale Note: ${noteInfo.name}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* SECTION C: Suggested Practice Lick (Melodielauf) */}
      <div className="bg-gray-950 p-4 border border-gray-900 rounded-xl flex flex-col md:flex-row gap-5 items-stretch" id="practice-lick-card-box">
        
        {/* Left Side: interactive lick control */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-mono text-emerald-400 tracking-widest uppercase font-bold block mb-1">Empfehlung</span>
            <h4 className="text-sm font-sans font-bold text-white mb-2">{scaleData.guitarLick.title}</h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {scaleData.guitarLick.description} Triggere den Lick-Vorspieler, um die genaue Abfolge auf dem Griffbett leuchtend mitzuverfolgen.
            </p>
          </div>

          <button
            onClick={handlePlayLickTest}
            disabled={isPlayingLick}
            className={`py-2 px-4 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 select-none ${
              isPlayingLick
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
            }`}
          >
            <Play size={13} className={isPlayingLick ? "animate-spin" : ""} />
            <span>{isPlayingLick ? "Lick läuft..." : "Solo-Lick vorspielen"}</span>
          </button>
        </div>

        {/* Right Side: ASCII representation of the drill */}
        <div className="flex-1 bg-gray-950 border border-gray-900 p-4 rounded-xl font-mono text-xs text-emerald-400 flex flex-col justify-center h-auto">
          <span className="text-[8px] text-gray-500 uppercase tracking-wider block mb-2 font-bold">Acoustic Tab Drills (Lick)</span>
          <pre className="text-[11px] leading-tight select-all text-lime-400/90 whitespace-pre overflow-x-auto">
            {scaleData.guitarLick.tab}
          </pre>
        </div>

      </div>

    </div>
  );
};
