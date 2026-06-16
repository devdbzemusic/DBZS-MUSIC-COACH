import { MoodRecipe, DiagnosticIssue } from "../types";

// Standard UI & App Translations Dictionary
export const UI_TRANSLATIONS: { [key: string]: { de: string; en: string } } = {
  // Navigation / Header
  appTitle: { de: "Harmonia: VibeTheory", en: "Harmonia: VibeTheory" },
  appSubtitle: { de: "Aus Gefühl wird Musikverständnis – Spiel erst. Versteh danach.", en: "Emotion turns into music understanding – Play first. Understand later." },
  estCozy: { de: "Est. Cozy Studio Vibe", en: "Est. Cozy Studio Vibe" },
  musicStudio: { de: "Musikstudio", en: "Music Studio" },
  ideaBank: { de: "Ideenbank", en: "Idea Bank" },
  versionLabel: { de: "v0.1 MVP", en: "v0.1 MVP" },

  // Settings
  settingsTitle: { de: "Cozy Studio Einstellungen", en: "Cozy Studio Settings" },
  settingsButton: { de: "Einstellungen", en: "Settings" },
  languageLabel: { de: "Sprache / Language", en: "Language / Sprache" },
  layoutLabel: { de: "Layout-Skalierung", en: "Layout Scaling" },
  layoutFluid: { de: "Fließend & Fluid (Auto-Scale)", en: "Flowing & Fluid (Auto-Scale)" },
  layoutCompact: { de: "Kompakte Boxen (Fixiert)", en: "Compact Boxes (Fixed Grid)" },
  synthVolume: { de: "Synthesizer Lautstärke", en: "Synthesizer Volume" },
  instrumentPriority: { de: "Standard Instrumententab", en: "Default Instrument Tab" },
  saveSettings: { de: "Schließen & Sichern", en: "Close & Save" },
  resetSettings: { de: "Standard wiederherstellen", en: "Restore Defaults" },

  // Sidebar / Steps
  step1: { de: "Schritt 1: Mood wählen", en: "Step 1: Select Mood" },
  step2: { de: "Schritt 2: Akkorde spielen", en: "Step 2: Play Chords" },
  moodQuestion: { de: "Wie soll es heute klingen?", en: "How should it sound today?" },
  keyLabel: { de: "Tonart", en: "Key" },
  listenLoop: { de: "Loop Anhören", en: "Listen to Loop" },
  chordInstructions: { de: "Drücke auf eine Akkordkarte, um diesen Akkord im Trinity-Visualizer zu laden und mitzuspielen:", en: "Click a chord card to load this chord in the Trinity Visualizer and play along:" },
  stepDegree: { de: "Stufe", en: "Degree" },
  metronomeTitle: { de: "Studio Metronom-Vibe", en: "Studio Metronome Vibe" },
  syncChords: { de: "Sync Akkorde", en: "Sync Chords" },
  tempoLabel: { de: "Tempo", en: "Tempo" },
  bpmLabel: { de: "BPM", en: "BPM" },
  beatCounter: { de: "Takt-Beat", en: "Time Beat" },
  saveChordLocal: { de: "Akkord-Idee lokal sichern", en: "Save chord idea locally" },
  saveSuccessMessage: { de: "✓ Idee erfolgreich in deiner Ideenbank gesichert!", en: "✓ Idea successfully saved in your idea bank!" },

  // Daily Spark / 2-Min Jam Generator
  quickJamTitle: { de: "2-Minuten-Quick Jam Generator", en: "2-Minute Quick Jam Generator" },
  quickJamSub: { de: "Tägliche Inspiration ohne Leistungsdruck", en: "Daily inspiration without pressure" },
  freshImpulse: { de: "Frischer Impuls", en: "Fresh Vibe" },
  generatorIntro: { de: "Fehlt dir heute eine kreative Idee? Lass dir hier einen brandneuen, unkomplizierten Jam-Vibe basierend auf deinem ausgewählten Mood erzeugen. Schnapp dir dein Instrument und spiele sofort die sicheren Noten mit!", en: "Lacking a creative idea today? Let us generate a brand new, uncomplicated jam vibe based on your selected mood. Grab your instrument and play the safe notes right away!" },
  safePiano: { de: "🎹 Safe Piano", en: "🎹 Safe Piano" },
  safeGuitar: { de: "🎸 Safe Guitar", en: "🎸 Safe Guitar" },
  safeBass: { de: "🎸 Safe Bass", en: "🎸 Safe Bass" },
  teacherHint: { de: "Inspirationstipp des Lehrers (Daily Hint):", en: "Teacher's Inspiration Tip (Daily Hint):" },
  recChords: { de: "Empfohlene Akkordfolge:", en: "Recommended chord sequence:" },
  jamDuration: { de: "2 Min Übung", en: "2 Min Practice" },
  loadingVibe: { de: "Erschaffe neuen Daily-Vibe...", en: "Creating new daily vibe..." },
  generateError: { de: "Fehler beim Generieren des Daily Jams.", en: "Error generating the daily jam." },
  generateFailback: { de: "Es konnte kein Jam-Beispiel geladen werden. Klicke oben auf 'Frischer Impuls' zum Neu-Aufsetzen des Jam-Boards.", en: "Could not load a jam example. Click 'Fresh Vibe' above to reset the jam board." },

  // Trinity Visualizer Tabs
  visualizerTab: { de: "Klavier/Trinity Mapping", en: "Piano/Trinity Mapping" },
  riffForgeTab: { de: "AI Riff Forge", en: "AI Riff Forge" },
  bassTabLabel: { de: "Bass Fundament", en: "Bass Foundation" },
  theoryTab: { de: "Theorie Reveal", en: "Theory Reveal" },
  aiMentorTab: { de: "AI Mentor", en: "AI Mentor" },

  // Trinity Keyboard
  inNotation: { de: "Tonleiter-Töne in", en: "Scale tones in" },
  keyboardLegend: { de: "🎹 Leuchtende Tasten gehören zur Tonleiter. Ausgedunkelte Tasten liegen außerhalb", en: "🎹 Illuminated keys belong to the scale. Darkened keys lie outside" },
  keyboardMutedLegend: { de: "🎹 Klicke auf die markierten Klaviertasten, um die Intervalle einzeln zu hören.", en: "🎹 Click the highlighted piano keys to hear individual intervals." },
  voicingLabel: { de: "Akkord-Voicing / Umkehrung", en: "Chord Voicing / Inversion" },
  voicingSub: { de: "Prismatische Rotation der Akkordstruktur für alternative Sound-Ästhetik", en: "Prismatic rotation of the chord structure for alternative sonic aesthetics" },
  rootPosition: { de: "Grundstellung", en: "Root Position" },
  firstInversion: { de: "1. Umkehrung", en: "1st Inversion" },
  secondInversion: { de: "2. Umkehrung", en: "2nd Inversion" },
  thirdInversion: { de: "3. Umkehrung", en: "3rd Inversion" },
  activeTabPattern: { de: "Aktives Griffmuster:", en: "Active chord map:" },
  recommendedBassTab: { de: "Empfohlenes Bass-Intervall-Greifen:", en: "Recommended bass interval fingerings:" },
  standardTabLabel: { de: "Keine Tab verfügbar", en: "No tab available" },
  playWholeChord: { de: "Ganzen Akkord spielen", en: "Play entire chord" },
  showInScale: { de: "Tonleiter einblenden", en: "Show scale notes" },
  interactiveQuiz: { de: "Interaktive Tastenerkennung", en: "Interactive key matching" },

  // Riff Forge
  riffIntro: { de: "Hier schmiedet die KI exklusive Gitarren-Riffs für dich.", en: "Here the AI forges exclusive guitar riffs for you." },
  scaleDegrees: { de: "Skaleneigene Töne (Pentatonik):", en: "Diatonic scale tones (Pentatonic):" },
  recommendedRiff: { de: "Empfohlenes Riff:", en: "Recommended Riff:" },
  variationSelector: { de: "Riff-Variierung mit KI verfeinern:", en: "Refine Riff variation with AI:" },
  variationExplain: { de: "Gib deinem Riff einen neuen emotionalen Drall. Gemini rechnet das Tabulatorgürtel-Muster im Hintergrund an:", en: "Give your riff a new emotional twist. Gemini recalculates the tab board in the background:" },
  higherVibe: { de: "Heller", en: "Brighter" },
  darkerVibe: { de: "Dunkler", en: "Darker" },
  sadderVibe: { de: "Trauriger", en: "Sadder" },
  pumpedVibe: { de: "Treibender", en: "Driving" },
  simplerVibe: { de: "Einfacher", en: "Simpler" },
  loadingRiff: { de: "Schmiede Riff...", en: "Forging riff..." },
  coachExplain: { de: "Erklärung des Coaches:", en: "Coach's Explanation:" },

  // Bass Ground
  bassIntro: { de: "Fühle die Gravitation des Grooves. Der Bass trägt die Band.", en: "Feel the gravity of the groove. The bass carries the band." },
  accentFirstBeat: { de: "Betöne die Zählzeit EINS schwer.", en: "Accent the DOWNBEAT heavily." },
  bassPattern: { de: "Aktives Bass-Muster:", en: "Active bass pattern:" },
  rootOctaveExplain: { de: "Spiele den Grundton und gleite geschmeidig in die Oktave.", en: "Play the root note and slide smoothly into the octave." },

  // Theory Reveal
  theoryTitle: { de: "Musiktheorie Enthüllt", en: "Music Theory Revealed" },
  theoryIntro: { de: "Hinter jedem Gänsehaut-Moment steckt eine logische Ordnung. Hier ist sie:", en: "Behind every goosebump moment lies logical order. Here it is:" },
  keyTermsLabel: { de: "Schlüsselbegriffe:", en: "Key terms:" },
  memoryPhraseLabel: { de: "Merkspruch für das Gedächtnis:", en: "Memory mantra for the mind:" },

  // AI Mentor
  mentorIntro: { de: "Dein digitaler Premium-Coach. Die KI simuliert Spielfehler aus der Praxis und zeigt dir, wie du sie behoben kriegst.", en: "Your premium digital coach. The AI simulates typical student mistakes and shows you how to conquer them." },
  simulatedIssueLabel: { de: "Simuliertes Fehler-Szenario zum Lernen", en: "Simulated Student Error Scenario for Learning" },
  diagnoseButton: { de: "Fehler diagnostizieren & Feedback holen", en: "Diagnose mistake & get feedback" },
  submittingMentor: { de: "Mentor analysiert...", en: "Mentor analyzing..." },
  mentorFeedback: { de: "Feedback des Premium AI Mentors", en: "Premium AI Mentor Feedback" },
  selectIssue: { de: "Wähle ein typisches Fehler-Szenario aus der Liste oben.", en: "Choose a typical mistake scenario from the list above." },

  // Idea Library
  libraryHeader: { de: "Deine Skizzen & Song-Keime", en: "Your Sketches & Song Foundations" },
  librarySub: { de: "Gesicherte Akkorde und Vibe-Ideen zum Exportieren in die DAW", en: "Saved chords and vibe ideas to export to your DAW" },
  noIdeasYet: { de: "Noch keine Ideen gesichert. Klicke im Musikstudio auf 'Akkord-Idee lokal sichern'.", en: "No ideas saved yet. Click 'Save chord idea locally' in the Music Studio." },
  dawExportButton: { de: "DAW Text-Export kopieren", en: "Copy DAW Text Export" },
  rawChords: { de: "Akkorde", en: "Chords" },
  dateLabel: { de: "Gesichert am", en: "Saved on" },
  deleteButton: { de: "Löschen", en: "Delete" },
  copiedLabel: { de: "Kopiert!", en: "Copied!" }
};

// Static translation maps for curated Mood Recipes
export const MOOD_RECIPE_TRANSLATIONS: {
  [moodId: string]: {
    name: { de: string; en: string };
    description: { de: string; en: string };
    emotionalTags: string[];
    defaultKey: { de: string; en: string };
    scaleSuggestions: string[];
    guitar: {
      approach: { de: string; en: string };
      techniques: string[];
    };
    riff: {
      variationHints: string[];
    };
    bass: {
      movementHints: string[];
    };
    theoryReveal: {
      headline: { de: string; en: string };
      simpleExplanation: { de: string; en: string };
      keyTerms: string[];
      memoryPhrase: { de: string; en: string };
    };
  };
} = {
  melancholisch: {
    name: { de: "melancholisch", en: "melancholy" },
    description: { de: "Nachdenklich, weich, leicht traurig, erinnernd.", en: "Thoughtful, soft, slightly sad, reminiscent." },
    emotionalTags: ["thoughtful", "soft", "nostalgic", "reminiscent"],
    defaultKey: { de: "A-Moll", en: "A Minor" },
    scaleSuggestions: ["A Minor", "A Pentatonic Minor"],
    guitar: {
      approach: { de: "offene Akkorde, langsames Strumming, wenig Plektrumdruck", en: "open chords, slow strumming, soft pick pressure" },
      techniques: ["open chords", "slow arpeggio", "soft touch"]
    },
    riff: {
      variationHints: [
        "Let the final tone ring out until it fades fully.",
        "Fret the C on fret 3 of the A string for an accent.",
        "Add a subtle touch of chorus pedal."
      ]
    },
    bass: {
      movementHints: [
        "Play only the bare root note on the first repetition.",
        "Fade in the fifth (E on fret 2 of the D string) softly.",
        "Feel the heavy weight of the F root node."
      ]
    },
    theoryReveal: {
      headline: { de: "Das Geheimnis von Am – F – C – G", en: "The Secret of Am – F – C – G" },
      simpleExplanation: { 
        de: "A-Moll (I) verankert uns in tiefer Melancholie. Der plötzliche Schritt zum großen F-Dur (VI) fühlt sich an wie ein schwerer Seufzer. C-Dur (III) und G-Dur (VII) öffnen kurz das Fenster und lassen Sonnenstrahlen herein, bevor wir wieder nach Hause ins melancholische A-Moll kehren.", 
        en: "A minor (I) anchors us in deep melancholy. The sudden move to major F (VI) feels like a heavy sigh. C major (III) and G major (VII) briefly open the window to let sunbeams in, before we return home to melancholic A minor." 
      },
      keyTerms: ["Minor Tonality", "Degrees", "Sigh Connection", "Brief Brightening"],
      memoryPhrase: { de: "Melancholie ist kein reiner Schmerz; sie ist die warme Erinnerung an glücklichere Tage.", en: "Melancholy is not pure pain; it is the warm remembrance of happier days." }
    }
  },
  "traurig-schoen": {
    name: { de: "traurig-schön", en: "sadly beautiful" },
    description: { de: "Zuckersüßer Weltschmerz, bittersüß, episch fließend.", en: "Bittersweet, sugary world-weariness, epic flow." },
    emotionalTags: ["bittersweet", "celestial", "gorgeous", "reflective"],
    defaultKey: { de: "A-Moll", en: "A Minor" },
    scaleSuggestions: ["A Minor Scale", "C Major Scale"],
    guitar: {
      approach: { de: "Warmes Arpeggio-Zupfen (Fingerstyle)", en: "Warm arpeggio picking (Fingerstyle)" },
      techniques: ["fingerstyle", "let ring", "hybrid picking"]
    },
    riff: {
      variationHints: [
        "Pull-off the B string from 1 to 0 for a weeping release.",
        "Slide from G string fret 2 to 4 to lift the mood.",
        "Let the bass string drone open while picking."
      ]
    },
    bass: {
      movementHints: [
        "Arpeggiate upward on the Root and Third of each chord.",
        "Play eighth notes consistently to drive the epic emotion.",
        "Dampen strings with your palm for a rounder organic tone."
      ]
    },
    theoryReveal: {
      headline: { de: "Die 'Golden Ratio' der Emotionen: Am – C – G – F", en: "The 'Golden Ratio' of Emotions: Am – C – G – F" },
      simpleExplanation: {
        de: "Diese Akkordfolge balanciert perfekt auf der Rasierklinge zwischen Trost (C-Dur) und Abgrund (Am/F). Weil wir die traurige Moll-Mitte (Am) verlassen, um über die heroische Helligkeit von C und G nach unten zu F-Dur abzufallen, entsteht ein heroischer, bittersüßer Drang, der nie ganz aufgelöst wird.",
        en: "This progression balances perfectly on the razor's edge between comfort (C major) and the abyss (Am/F). Leaving the melancholic minor center (Am) through the heroic lightness of C and G, only to descend to F major, creates a bittersweet, unresolved forward momentum."
      },
      keyTerms: ["Golden Ratio Connection", "Resolution", "Unresolved Loop", "Tension Line"],
      memoryPhrase: { de: "Tränen reinigen das Auge, damit wir den Regenbogen wieder schärfer sehen.", en: "Tears cleanse the eyes so we can see the rainbow with absolute clarity." }
    }
  },
  dunkel: {
    name: { de: "dunkel", en: "dark" },
    description: { de: "Bedrohlich, mystisch, dichte Spannung, Metal/Phrygisch.", en: "Threatening, mystical, heavy tension, Metal/Phrygian." },
    emotionalTags: ["evil", "mysterious", "heavy", "phrygian"],
    defaultKey: { de: "E-Phrygisch", en: "E Phrygian" },
    scaleSuggestions: ["E Phrygian Mode", "E Pentatonic Minor"],
    guitar: {
      approach: { de: "Heavy Palm Muting auf den tiefen Saiten, steifer Plektrumdruck", en: "Heavy palm muting on low strings, stiff pick attack" },
      techniques: ["palm muting", "heavy attack", "downstrokes only"]
    },
    riff: {
      variationHints: [
        "Enforce palm-mute on the open E strings heavily.",
        "Slide up to the 5th fret aggressively as a warning shout.",
        "Bend the G string on fret 2 a quarter step up for dissonance."
      ]
    },
    bass: {
      movementHints: [
        "Lock into the bass drum on open E string.",
        "Slide from fret 7 to fret 1 heavily downward.",
        "Crank up the fuzz/overdrive pedal for a gritty, heavy wall of sound."
      ]
    },
    theoryReveal: {
      headline: { de: "Die Bedrohung der kleinen Sekunde (Phrygisch)", en: "The Threat of the Minor Second (Phrygian)" },
      simpleExplanation: {
        de: "Der Wechsel von E-Moll zu F-Dur (oder das Ersetzen durch ein unheimliches F) nutzt die kleine Sekunde (E nach F) – das dunkelste Intervall der Musikgeschichte. Es aktiviert augenblicklich unsere Urangst und erzeugt dichte, bedrohliche Suspense (wie das berühmte 'Der weiße Hai'-Motiv).",
        en: "Moving from E minor to F major (or substituting it with an eerie F) uses the minor second (E to F) – the darkest interval in music history. It instantly triggers suspense and primeval tension (akin to the legendary 'Jaws' theme)."
      },
      keyTerms: ["Phrygian Mode", "Minor Second", "Suspense Interval", "Dissonant Pull"],
      memoryPhrase: { de: "In der Dunkelheit ist das leiseste Geräusch ein Schrei nach Aufmerksamkeit.", en: "In total darkness, the quietest sound is a scream for attention." }
    }
  },
  hoffnungsvoll: {
    name: { de: "hoffnungsvoll", en: "hopeful" },
    description: { de: "Optimistisch, strahlend, befreiend, Hymnen-Vibe.", en: "Optimistic, shining, liberating, anthemic vibe." },
    emotionalTags: ["optimistic", "liberating", "anthem", "bright"],
    defaultKey: { de: "C-Dur", en: "C Major" },
    scaleSuggestions: ["C Major Scale", "C Major Pentatonic"],
    guitar: {
      approach: { de: "Volles, offenes Strumming mit Akzenten auf den hohen Saiten", en: "Full, open strumming focusing accents on high strings" },
      techniques: ["open chords", "dynamic strumming", "accented high notes"]
    },
    riff: {
      variationHints: [
        "Play with a bright acoustic guitar tone if possible.",
        "Hammer-on the index finger on G-string 0 to 2.",
        "Let the high e-string ring open for an airy, floating breeze."
      ]
    },
    bass: {
      movementHints: [
        "Play short, bounce-like staccato notes.",
        "Walk up step-by-step from C to D to E to F.",
        "Use a subtle plate reverb to give the low end breathing space."
      ]
    },
    theoryReveal: {
      headline: { de: "Das Licht im Dunkeln: C – G – Am – F", en: "The Light in the Dark: C – G – Am – F" },
      simpleExplanation: {
        de: "Wir starten auf C-Dur (I), dem stabilsten Fundament. Der Sprung zu G-Dur (V) gibt Aufwind, während Am7 (vi) uns kognitiv erdet, bevor das helle F-Dur (IV) uns befreit. Diese 'Pop-Akkordfolge' ist das emotionale Schweizer Taschenmesser für Hoffnung und Triumphe.",
        en: "We begin on C major (I), the most stable foundation. Jumping to G major (V) provides an updraft, while Am7 (vi) cognitively grounds us, until the bright F major (IV) sets us free. This 'pop progression' is the ultimate toolkit for hope."
      },
      keyTerms: ["Major Stability", "Anthemic Rise", "Diatonic Release", "Perfect Cadence"],
      memoryPhrase: { de: "Selbst die schwärzeste Nacht endet mit dem sanften Versprechen des Sonnenaufgangs.", en: "Even the darkest night ends with the gentle promise of sunrise." }
    }
  },
  bluesig: {
    name: { de: "bluesig", en: "bluesy" },
    description: { de: "Dreckig, staubig, emotionale Spannung, rauchig.", en: "Gritty, dusty, emotional friction, smoky blues." },
    emotionalTags: ["gritty", "smoky", "expressive", "dominant"],
    defaultKey: { de: "E7-Blues", en: "E7 Blues" },
    scaleSuggestions: ["E Blues Scale", "E Minor Pentatonic"],
    guitar: {
      approach: { de: "Kräftige Abschlags-Riffs, Akzent-Slides und gefühlvolle Saiten-Bends", en: "Heavy downstroke riffs, accented slides, emotional string bends" },
      techniques: ["slides", "vibrato", "quarter-bends", "double stops"]
    },
    riff: {
      variationHints: [
        "Apply heavy string vibrato to the note on fret 2 of G string.",
        "Slide into the 3rd fret on high e string for a dirty bite.",
        "Use a crunchy overdrive setting with analog grit."
      ]
    },
    bass: {
      movementHints: [
        "Play a traditional walking bass line using active swing.",
        "Connect the root E and A with chromatic passing tones.",
        "Accent the syncopated off-beat on count '2-and'."
      ]
    },
    theoryReveal: {
      headline: { de: "Die süße Reibung der dominanten Septimen und Blue Notes", en: "The Sweet Friction of Dominant 7ths and Blue Notes" },
      simpleExplanation: {
        de: "Dominante Septakkorde wie E7 enthalten sowohl ein Major-Intervall (Terz G#) als auch ein Minor-Intervall (Septime D). Diese innere Reibung brennt wie scharfer Tabak. Die zusätzliche 'Blue Note' (die verminderte Quinte Bb) verzieht das Gesicht im Schmerz-Genuss.",
        en: "Dominant 7th chords like E7 contain both a major interval (third G#) and a minor interval (seventh D). This inner tension burns like smoky tobacco. Adding the 'Blue Note' (diminished fifth Bb) twists pain into expressive pleasure."
      },
      keyTerms: ["Dominant Seventh", "Tritonus Friction", "Blue Note Tension", "Walking Line"],
      memoryPhrase: { de: "Der Blues ist, wenn man sich schlecht fühlt, aber die Musik es verdammt gut klingen lässt.", en: "The blues is when you feel bad, but the music makes it sound so damn good." }
    }
  },
  treibend: {
    name: { de: "treibend", en: "driving" },
    description: { de: "Vorwärtsstrebend, energisch, kraftvoll, Roadtrip.", en: "Forward-striving, energetic, powerful, roadtrip." },
    emotionalTags: ["forward", "energetic", "heavy drive", "highway"],
    defaultKey: { de: "E-Moll / G-Dur", en: "E Minor / G Major" },
    scaleSuggestions: ["E Minor Pentatonic", "D Dorian"],
    guitar: {
      approach: { de: "Schnelles, gleichmäßiges Stopp-Strumming (Muted Chords)", en: "Fast, steady strumming with palm muting (Muted Chords)" },
      techniques: ["alternate picking", "palm muting", "gallop feel"]
    },
    riff: {
      variationHints: [
        "Pick consistently in sixteenth notes matching the tempo.",
        "Mute strings with your palm slightly to keep the pattern tight.",
        "Strike the open A string between chords as a rhythmic engine."
      ]
    },
    bass: {
      movementHints: [
        "Play steady eighth-note roots without pause ('pumping bass').",
        "Accent the downbeat of each bar with extra finger pluck.",
        "Throw in a quick octave pop at the end of every 4th bar."
      ]
    },
    theoryReveal: {
      headline: { de: "Der Motor des Vorwärtsdrangs: Em – G – D – A", en: "The Engine of Forward Drive: Em – G – D – A" },
      simpleExplanation: {
        de: "Der unerbittliche Wechsel von der eisigen Energie von E-Moll (i) über das sonnige G-Dur (III) zur kraftvollen Offenheit von D-Dur (VII) und dem strahlenden A-Dur (IV) erzeugt eine endlose spiralförmige Spirale, die uns unaufhaltsam vorwärts treibt (Dorischer Vibe).",
        en: "The relentless transition from the freezing energy of E minor (i) through sunny G major (III) to the powerful openness of D major (VII) and bright A major (IV) creates an endless spiral driving us forward (Dorian Vibe)."
      },
      keyTerms: ["Dorian Vibe", "Pumping Movement", "Modal Progression", "Drive Accumulation"],
      memoryPhrase: { de: "Es kommt nicht darauf an, wie schnell das Auto fährt, sondern wohin dich der Herzschlag treibt.", en: "It doesn't matter how fast the car goes, but where the driving heartbeat steers you." }
    }
  },
  ruhig: {
    name: { de: "ruhig", en: "peaceful" },
    description: { de: "Ausgeglichen, friedvoll, weite Steppen, schwebend.", en: "Balanced, peaceful, wide plains, ambient float." },
    emotionalTags: ["calm", "airy", "floating", "meditative"],
    defaultKey: { de: "D-Dur", en: "D Major" },
    scaleSuggestions: ["D Major Pentatonic", "D Lydian Mode"],
    guitar: {
      approach: { de: "Langsames Gleiten von Bund zu Bund, sanfte Akkord-Verbindungen", en: "Slow sliding fret-to-fret, gentle chord connections" },
      techniques: ["ambient slides", "soft volume swells", "fingerstyle"]
    },
    riff: {
      variationHints: [
        "Pick string-by-string extremely quietly as if whispering.",
        "Use a heavy delay pedal setting to create a wash of chords.",
        "Slide your finger gently to the next note for continuity."
      ]
    },
    bass: {
      movementHints: [
        "Play only whole notes, holding the ground tones patiently.",
        "Slide into the D root from a minor third below very slowly.",
        "Use your thumb to pluck for a pillowy, soft low end."
      ]
    },
    theoryReveal: {
      headline: { de: "Die Kraft der Symmetrie und Weite: D – A – Bm – G", en: "The Power of Symmetry & Space: D – A – Bm – G" },
      simpleExplanation: {
        de: "D-Dur (I) und A-Dur (V) spannen den idealen Konsonanz-Bogen der Musikgeschichte. Der Schritt zum schwebenden B-Moll (vi) hält kurz den Atem an, während G-Dur (IV) uns sanft auffängt. Diese Symmetrie beruhigt den Gehirnrhythmus und lässt das Herz langsamer schlagen.",
        en: "D major (I) and A major (V) span the historic ideal consonances. Moving to suspended B minor (vi) holds our breath briefly, while G major (IV) gently cushions our fall. This symmetry calms brain rhythms and slows the heartbeat."
      },
      keyTerms: ["Consonance", "Symmetric Tension", "Calming Cadence", "Airy Soundscape"],
      memoryPhrase: { de: "In der absoluten Ruhe des Waldes hört man die eigene Melodie wieder am lautesten.", en: "In the absolute quiet of the woods, your own melody rings loudest once more." }
    }
  },
  funky: {
    name: { de: "funky", en: "funky" },
    description: { de: "Tanzbar, synkopiert, rhythmische Reibung, 70s Funk Vibe.", en: "Danceable, syncopated, rhythmic friction, 70s Funk Vibe." },
    emotionalTags: ["groove", "dance", "dorian", "syncopated"],
    defaultKey: { de: "Em7-Funk", en: "Em7 Funk" },
    scaleSuggestions: ["E Dorian Mode", "E Pentatonic Minor"],
    guitar: {
      approach: { de: "Akkord-Kratzen (Scratching), perkussives Abdämpfen der Schlaghand", en: "Chord scratching, percussive left-hand dampening" },
      techniques: ["muting", "scratching", "staccato chops", "16th-note rhythm"]
    },
    riff: {
      variationHints: [
        "Add short, sharp percussion 'scratches' (xxxx) on beat 2 & 4.",
        "Hammer-on E minor 7 on fret 7 of the middle strings.",
        "Use a clean but snappy single-coil pickup setting."
      ]
    },
    bass: {
      movementHints: [
        "Slap the low E string and pop the octave on D string.",
        "Use heavy syncopation, playing on off-beats.",
        "Mute strings with your left hand for tight staccato breaks."
      ]
    },
    theoryReveal: {
      headline: { de: "Der Motor des Dorian Funk: Em7 – A7", en: "The Motor of Dorian Funk: Em7 – A7" },
      simpleExplanation: {
        de: "Das harmonische Pendel zwischen Em7 (i) und A7 (IV) ist der Treibstoff der 70er Funk-Welle. A7 enthält das helle F# (die große Sechste von E), das dem dunklen Moll-Vibe ein strahlendes Lächeln aufsetzt. Es ensteht der typische, lockere Seattler/Dorian-Dancefloor-Vibe.",
        en: "The harmonic pendulum between Em7 (i) and A7 (IV) is the fuel of the 70s Funk movement. A7 contains the bright F# (the major 6th of E), putting a beaming grin on the dark minor mood. It creates the typical Dorian dancefloor feel."
      },
      keyTerms: ["Dorian Funk", "Syncopation", "Slap & Pop", "Rhythmic Friction"],
      memoryPhrase: { de: "Wenn der Rhythmus deinen Körper übernimmt, muss der Verstand endlich Pause machen.", en: "When the rhythm takes control of your body, your mind is finally allowed to rest." }
    }
  }
};

// Translates simulated issue titles and details
export const DIAGNOSTIC_ISSUE_TRANSLATIONS: {
  [issueId: string]: {
    title: { de: string; en: string };
    simulatedError: { de: string; en: string };
    description: { de: string; en: string };
  };
} = {
  guitar_transition_delay: {
    title: { de: "Verzögerter Wechsel (Am nach C)", en: "Delayed Transition (Am to C)" },
    simulatedError: { 
      de: "User spielte A-Moll auf der Gitarre, verzögerte jedoch den Wechsel zu C-Dur um 0.24 Sekunden.", 
      en: "User played A minor on guitar but delayed transitioning to C Major by 0.24 seconds." 
    },
    description: { 
      de: "Der Rhythmus bricht beim Greifwechsel kurz ein, was den Groove stoppt.", 
      en: "The rhythm briefly breaks during the chord change, stopping the groove." 
    }
  },
  bass_scale_drift: {
    title: { de: "Skalen-Drift (Falscher Ton im Bass)", en: "Scale Drift (Wrong Note in Bass)" },
    simulatedError: { 
      de: "User rutschte im Bass-Lauf auf den 6. Bund (F#) ab, welcher außerhalb der A-Moll-Pentatonik liegt.", 
      en: "User slipped to the 6th fret (F#) in the bass run, which lies outside A Minor Pentatonic." 
    },
    description: { 
      de: "Das Spielen außerhalb der Tonleiter erzeugt Reibung und schiefe Dissonanzen im Fundament.", 
      en: "Playing outside the scale creates unwanted friction and dissonance in the foundation." 
    }
  },
  piano_third_rush: {
    title: { de: "Gehetzte Terz (Piano-Timing)", en: "Rushed Third (Piano Timing)" },
    simulatedError: { 
      de: "User betonte die kleine Terz (C3 nach Eb3) 120ms zu früh während eines langsamen Cm-Wechsels.", 
      en: "User accented the minor third (C3 to Eb3) 120ms too early during a slow Cm transition." 
    },
    description: { 
      de: "Zu frühes Anschlagen der Charakter-Notes zerstört die melancholische Ruhe.", 
      en: "An early strike of character notes disrupts the serene and steady calm." 
    }
  },
  guitar_muted_barre: {
    title: { de: "Abgedämpfte G-Saite beim F-Akkord", en: "Muted G-String on F Barre" },
    simulatedError: { 
      de: "User versuchte, den F-Dur Barre-Akkord zu greifen, dämpfte jedoch die G-Saite (3. Saite) unbeabsichtigt ab.", 
      en: "User attempted to fret the F Major Barre chord, but inadvertently muted the G-string (3rd string)." 
    },
    description: { 
      de: "Ohne die G-Saite fehlt dem Akkord die Terz (A), er klingt leer (wie ein Powerchord ohne Gesang).", 
      en: "Without the G-string, the chord lacks the third (A). It sounds empty like a power chord." 
    }
  },
  bass_5string_low_b: {
    title: { de: "Ungriffiges Low-B (5-Saiter)", en: "Fumbled Low-B (5-String Bass)" },
    simulatedError: { 
      de: "User schlug auf der tiefen B-Saite den 1. Bund (C) anstelle des 3. Bundes (D) an, was eine störende kleine Sekunde erzeugte.", 
      en: "User struck fret 1 (C) instead of fret 3 (D) on the low B string, creating a jarring minor second." 
    },
    description: { 
      de: "Auf der extrem tiefen 5. Saite fallen falsche Töne physisch und akustisch besonders störend auf.", 
      en: "On the ultra-deep 5th string, incorrect notes impact physically and acoustically with severe dissonance." 
    }
  }
};

/**
 * Helper to fetch a static UI translation
 */
export function translate(key: string, lang: "de" | "en" = "de"): string {
  const item = UI_TRANSLATIONS[key];
  if (!item) return key;
  return item[lang] || item["de"] || key;
}

/**
 * Returns translated Mood Recipe
 */
export function getTranslatedRecipe(recipe: MoodRecipe, lang: "de" | "en" = "de") {
  const trans = MOOD_RECIPE_TRANSLATIONS[recipe.id];
  if (!trans || lang === "de") {
    return {
      ...recipe,
      name: recipe.name,
      description: recipe.description,
      defaultKey: recipe.defaultKey,
      guitar: {
        ...recipe.guitar,
        approach: recipe.guitar.approach,
      },
      riff: {
        ...recipe.riff,
        variationHints: recipe.riff.variationHints,
      },
      bass: {
        ...recipe.bass,
        movementHints: recipe.bass.movementHints,
      },
      theoryReveal: {
        ...recipe.theoryReveal,
        headline: recipe.theoryReveal.headline,
        simpleExplanation: recipe.theoryReveal.simpleExplanation,
        memoryPhrase: recipe.theoryReveal.memoryPhrase,
      }
    };
  }

  return {
    ...recipe,
    name: trans.name.en,
    description: trans.description.en,
    emotionalTags: trans.emotionalTags,
    defaultKey: trans.defaultKey.en,
    scaleSuggestions: trans.scaleSuggestions,
    guitar: {
      ...recipe.guitar,
      approach: trans.guitar.approach.en,
    },
    riff: {
      ...recipe.riff,
      variationHints: trans.riff.variationHints,
    },
    bass: {
      ...recipe.bass,
      movementHints: trans.bass.movementHints,
    },
    theoryReveal: {
      ...recipe.theoryReveal,
      headline: trans.theoryReveal.headline.en,
      simpleExplanation: trans.theoryReveal.simpleExplanation.en,
      memoryPhrase: trans.theoryReveal.memoryPhrase.en,
    }
  };
}

/**
 * Returns translated Diagnostic Issues
 */
export function getTranslatedIssues(issues: DiagnosticIssue[], lang: "de" | "en" = "de") {
  return issues.map(iss => {
    const trans = DIAGNOSTIC_ISSUE_TRANSLATIONS[iss.id];
    if (!trans || lang === "de") return iss;
    return {
      ...iss,
      title: trans.title.en,
      simulatedError: trans.simulatedError.en,
      description: trans.description.en
    };
  });
}
