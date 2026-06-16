export type ChordProgression = {
  id: string;
  key: string;
  chords: string[];
  feel: string;
  difficulty: "easy" | "medium";
  tempoSuggestion: number;
};

export type GuitarRecipe = {
  approach: string;
  techniques: string[];
  strummingPattern?: string;
  pickingPattern?: string;
};

export type RiffRecipe = {
  scaleTones: string[];
  suggestedTab: string;
  variationHints: string[];
};

export type BassRecipe = {
  rootNotes: string[];
  suggestedTab: string;
  movementHints: string[];
};

export type TheoryReveal = {
  headline: string;
  simpleExplanation: string;
  keyTerms: string[];
  memoryPhrase: string;
};

export interface ScaleNote {
  note: string;       // e.g. "C", "E"
  interval: "Root" | "Third" | "Fifth" | "Other";
  octave?: number;    // e.g. 3, 4
}

export interface InstrumentMapping {
  piano: ScaleNote[]; // e.g., C3, E3, G3 with octave and interval info
  guitarTab: string;  // e.g. x-3-2-0-1-0 or custom visualization
  bassTab: string;    // e.g. x-3-2-5
}

export type MoodRecipe = {
  id: string;
  name: string;
  description: string;
  emotionalTags: string[];
  defaultKey: string;
  scaleSuggestions: string[];
  chordProgressions: ChordProgression[];
  guitar: GuitarRecipe;
  riff: RiffRecipe;
  bass: BassRecipe;
  theoryReveal: TheoryReveal;
  
  // Custom mapping for piano, guitar standard, bass standard
  trinityMapping: {
    [chordName: string]: InstrumentMapping;
  };
};

export type SavedIdea = {
  id: string;
  createdAt: string;
  moodId: string;
  moodName: string;
  key: string;
  chords: string[];
  durations?: number[];
  guitarTab?: string;
  bassTab?: string;
  notes: string;
  exportText: string;
};

export interface DiagnosticIssue {
  id: string;
  title: string;
  instrument: "Gitarre" | "Bass" | "Piano";
  simulatedError: string;
  description: string;
}
