import React, { useState, useEffect } from "react";
import { BassRecipe } from "../types";
import { Play, ToggleLeft, ToggleRight, Radio, Award } from "lucide-react";
import { playSynthNote } from "../utils/synth";

interface BassGroundProps {
  chordProgression: string[];
  bass: BassRecipe;
}

export const BassGround: React.FC<BassGroundProps> = ({
  chordProgression,
  bass,
}) => {
  const [addFifth, setAddFifth] = useState<boolean>(false);
  const [addOctave, setAddOctave] = useState<boolean>(false);
  const [modifiedTab, setModifiedTab] = useState<string>(bass.suggestedTab);

  // Dynamically recalculate tab if Quinte or Oktave is checked
  useEffect(() => {
    let tab = bass.suggestedTab;
    if (addFifth && addOctave) {
      tab = `G|---------12---5---------|  <- Oktave (+8va)
D|------9-------7---------|  <- Quinte (+5)
A|-0--7-3-------0---------|  <- Grundtöne
E|----------3-------1-x---|`;
    } else if (addFifth) {
      tab = `G|------------------------|
D|------5-----------------|  <- Quinte (+5) hinzugefügt
A|-0--7-3-----------------|
E|-----------3----1-------|`;
    } else if (addOctave) {
      tab = `G|---------5--------------|  <- Oktave (+8va) hinzugefügt
D|------7-----------------|
A|-0--3---------0---------|
E|----------3-------1-----|`;
    } else {
      tab = bass.suggestedTab;
    }
    setModifiedTab(tab);
  }, [addFifth, addOctave, bass]);

  const handlePlayBassline = () => {
    // Play warm bass root notes
    const bassNotesMap: { [key: string]: string } = {
      "Am": "A", "C": "C", "G": "G", "F": "F", "Em": "E", "D": "D", "E7": "E", "A7": "A", "B7": "B", "Dm": "D", "Bb": "Bb", "Am7": "A"
    };

    chordProgression.forEach((chord, idx) => {
      setTimeout(() => {
        const root = bassNotesMap[chord] || "A";
        // Play deep bass note (octave 1 or 2)
        playSynthNote(root, 1, 1.4);
        
        if (addFifth) {
          setTimeout(() => {
            // Circle of fifths simple offset
            const fifthsOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            const rootIdx = fifthsOrder.indexOf(root);
            const fifthNote = fifthsOrder[(rootIdx + 7) % 12];
            playSynthNote(fifthNote, 2, 0.8);
          }, 350);
        }

        if (addOctave) {
          setTimeout(() => {
            playSynthNote(root, 2, 0.8);
          }, 700);
        }
      }, idx * 1100);
    });
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl" id="bass-ground-container">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="text-sky-400" size={20} />
        <h3 className="text-lg font-sans font-semibold text-white">Bass Ground v0.1</h3>
      </div>

      <p className="text-sm text-gray-300 mb-5">
        Der Bass ist das harmonische Fundament des Songs. Er verbindet den Trommelrhythmus mit den Akkorden der Gitarre.
        Experimentiere mit der <strong className="text-sky-400">Quinte</strong> oder der <strong className="text-sky-400">Oktave</strong>, um deinen Lines Bewegung einzuhauchen.
      </p>

      {/* Interactive additions switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* toggle Fifth */}
        <button
          onClick={() => setAddFifth(!addFifth)}
          className={`flex items-center justify-between p-3.5 rounded-lg border font-mono transition-all text-xs
            ${addFifth 
              ? "bg-sky-550/10 border-sky-400 text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.3)] bg-sky-950/20" 
              : "bg-gray-950 border-gray-850 hover:border-gray-700 text-gray-400"
            }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>+ Quinte zuschalten (5th)</span>
          </div>
          {addFifth ? <ToggleRight className="text-sky-400" size={20} /> : <ToggleLeft className="text-gray-600" size={20} />}
        </button>

        {/* toggle Octave */}
        <button
          onClick={() => setAddOctave(!addOctave)}
          className={`flex items-center justify-between p-3.5 rounded-lg border font-mono transition-all text-xs
            ${addOctave 
              ? "bg-sky-550/10 border-sky-400 text-sky-450 shadow-[0_0_8px_rgba(14,165,233,0.3)] bg-sky-950/20" 
              : "bg-gray-950 border-gray-850 hover:border-gray-700 text-gray-400"
            }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
            <span>+ Oktave zuschalten (8va)</span>
          </div>
          {addOctave ? <ToggleRight className="text-sky-400" size={20} /> : <ToggleLeft className="text-gray-600" size={20} />}
        </button>
      </div>

      {/* Playback trigger */}
      <div className="relative mb-5" id="bass-tab-frame">
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            onClick={handlePlayBassline}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white rounded transition-all"
          >
            <Play size={12} className="fill-indigo-300 group-hover:fill-white" />
            <span>Bassline vorspielen</span>
          </button>
        </div>

        {/* Dynamic Fretboard output */}
        <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 font-mono text-xs text-sky-400 leading-relaxed overflow-x-auto min-h-24 flex items-center shadow-inner">
          <pre className="whitespace-pre text-left w-full">{modifiedTab}</pre>
        </div>
      </div>

      {/* Movement recipe hints */}
      <div className="bg-gray-950 p-4 border border-gray-900 rounded-lg">
        <h4 className="text-xs font-mono font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
          <Award size={13} className="text-indigo-400" />
          <span>Groove-Formel des Mentors:</span>
        </h4>
        <ul className="text-xs text-gray-300 space-y-2 list-none font-mono">
          {bass.movementHints.map((hint, index) => (
            <li key={`hint-${index}`} className="flex items-start gap-1.5 leading-relaxed">
              <span className="text-sky-500">›</span>
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
