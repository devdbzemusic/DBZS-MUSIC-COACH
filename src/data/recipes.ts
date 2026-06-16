import { MoodRecipe, DiagnosticIssue } from "../types";

export const DIAGNOSTIC_ISSUES: DiagnosticIssue[] = [
  {
    id: "guitar_transition_delay",
    title: "Verzögerter Wechsel (Am nach C)",
    instrument: "Gitarre",
    simulatedError: "User spielte A-Moll auf der Gitarre, verzögerte jedoch den Wechsel zu C-Dur um 0.24 Sekunden.",
    description: "Der Rhythmus bricht beim Greifwechsel kurz ein, was den Groove stoppt."
  },
  {
    id: "bass_scale_drift",
    title: "Skalen-Drift (Falscher Ton im Bass)",
    instrument: "Bass",
    simulatedError: "User rutschte im Bass-Lauf auf den 6. Bund (F#) ab, welcher außerhalb der A-Moll-Pentatonik liegt.",
    description: "Das Spielen außerhalb der Tonleiter erzeugt Reibung und schiefe Dissonanzen im Fundament."
  },
  {
    id: "piano_third_rush",
    title: "Gehetzte Terz (Piano-Timing)",
    instrument: "Piano",
    simulatedError: "User betonte die kleine Terz (C3 nach Eb3) 120ms zu früh während eines langsamen Cm-Wechsels.",
    description: "Zu frühes Anschlagen der Charakter-Notes zerstört die melancholische Ruhe."
  },
  {
    id: "guitar_muted_barre",
    title: "Abgedämpfte G-Saite beim F-Akkord",
    instrument: "Gitarre",
    simulatedError: "User versuchte, den F-Dur Barre-Akkord zu greifen, dämpfte jedoch die G-Saite (3. Saite) unbeabsichtigt ab.",
    description: "Ohne die G-Saite fehlt dem Akkord die Terz (A), er klingt leer (wie ein Powerchord ohne Gesang)."
  },
  {
    id: "bass_5string_low_b",
    title: "Ungriffiges Low-B (5-Saiter)",
    instrument: "Bass",
    simulatedError: "User schlug auf der tiefen B-Saite den 1. Bund (C) anstelle des 3. Bundes (D) an, was eine störende kleine Sekunde erzeugte.",
    description: "Auf der extrem tiefen 5. Saite fallen falsche Töne physisch und akustisch besonders störend auf."
  }
];

export const MOOD_RECIPES: MoodRecipe[] = [
  {
    id: "melancholisch",
    name: "melancholisch",
    description: "Nachdenklich, weich, leicht traurig, erinnernd.",
    emotionalTags: ["nachdenklich", "weich", "leicht traurig", "erinnernd"],
    defaultKey: "A-Moll",
    scaleSuggestions: ["A-Moll", "A-Moll Pentatonik"],
    chordProgressions: [
      {
        id: "melancholisch_01",
        key: "A-Moll",
        chords: ["Am", "F", "C", "G"],
        feel: "Langsames, gefühlvolles Strumming",
        difficulty: "easy",
        tempoSuggestion: 65
      },
      {
        id: "melancholisch_02",
        key: "E-Moll",
        chords: ["Em", "C", "G", "D"],
        feel: "Warmes Zupfen im 3/4 Takt",
        difficulty: "medium",
        tempoSuggestion: 72
      }
    ],
    guitar: {
      approach: "offene Akkorde, langsames Strumming, wenig Plektrumdruck",
      techniques: ["open chords", "slow arpeggio", "soft touch"],
      strummingPattern: "↓   ↓ ↑   ↑ ↓ ↑",
      pickingPattern: "Daumen (Bass) → Zeige (D) → Mittel (G) → Ring (B)"
    },
    riff: {
      scaleTones: ["A", "C", "E", "G"],
      suggestedTab: `e|--------------------|
B|-------1------------|
G|-----2---2----------|
D|---2-------2--------|
A|-0------------------|
E|--------------------|`,
      variationHints: [
        "Lasse den letzten Ton stehen, bis er verrauscht.",
        "Greife das C im 3. Bund auf der A-Saite als Akzent.",
        "Nimm einen Hauch Chorus-Pedal dazu."
      ]
    },
    bass: {
      rootNotes: ["A", "F", "C", "G"],
      suggestedTab: `G|--------------------|
D|--------------------|
A|-0----8----3--------|
E|-----------------3--|`,
      movementHints: [
        "Spiele im ersten Durchgang nur den nackten Grundton.",
        "Blende die Quinte (E auf Bund 2 der D-Saite) weich ein.",
        "Fühle die tiefe Last des F-Grundtensors."
      ]
    },
    theoryReveal: {
      headline: "Das Geheimnis von Am – F – C – G",
      simpleExplanation: "A-Moll (I) verankert uns in tiefer Melancholie. Der plötzliche Schritt zum großen F-Dur (VI) fühlt sich an wie ein schwerer Seufzer. C-Dur (III) und G-Dur (VII) öffnen kurz das Fenster und lassen Sonnenstrahlen herein, bevor wir wieder nach Hause ins melancholische A-Moll kehren.",
      keyTerms: ["Moll-Tonalität", "Stufenakkorde", "Seufzer-Verbindung", "Aufhellung"],
      memoryPhrase: "Melancholie ist kein reiner Schmerz; sie ist die warme Erinnerung an glücklichere Tage."
    },
    trinityMapping: {
      "Am": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C", interval: "Third", octave: 3 },
          { note: "E", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-0-2-2-1-0",
        bassTab: "x-0-2-2"
      },
      "F": {
        piano: [
          { note: "F", interval: "Root", octave: 3 },
          { note: "A", interval: "Third", octave: 3 },
          { note: "C", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "1-3-3-2-1-1",
        bassTab: "1-3-3-x"
      },
      "C": {
        piano: [
          { note: "C", interval: "Root", octave: 3 },
          { note: "E", interval: "Third", octave: 3 },
          { note: "G", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-3-2-0-1-0",
        bassTab: "x-3-2-5"
      },
      "G": {
        piano: [
          { note: "G", interval: "Root", octave: 3 },
          { note: "B", interval: "Third", octave: 3 },
          { note: "D", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "3-2-0-0-0-3",
        bassTab: "3-5-5-x"
      }
    }
  },
  {
    id: "traurig-schoen",
    name: "traurig-schön",
    description: "Emotional, offen, verletzlich, bildhaft schön und hoffnungsvoll.",
    emotionalTags: ["verletzlich", "warm", "melancholisch", "hoffnungsvoll"],
    defaultKey: "A-Moll",
    scaleSuggestions: ["A-Natürliches Moll", "A-Moll Pentatonik"],
    chordProgressions: [
      {
        id: "sad_beautiful_01",
        key: "A-Moll",
        chords: ["Am", "C", "G", "F"],
        feel: "Weich gezupft (Arpeggio)",
        difficulty: "easy",
        tempoSuggestion: 72
      },
      {
        id: "sad_beautiful_02",
        key: "D-Moll",
        chords: ["Dm", "Bb", "F", "C"],
        feel: "Breit, cineastisch, getragen",
        difficulty: "medium",
        tempoSuggestion: 68
      }
    ],
    guitar: {
      approach: "Arpeggios mit offenen Saiten, langsame Anschläge, vibrierendes Ausklingen",
      techniques: ["open string resonance", "ring out", "arpeggiated movement"],
      strummingPattern: "↓   ↓   ↓   ↓↓",
      pickingPattern: "Daumen → Zeige → Mittel → Ring → Mittel → Zeige"
    },
    riff: {
      scaleTones: ["A", "C", "D", "E", "G"],
      suggestedTab: `e|--------------------|
B|---------0-1--------|
G|-----0-2-----2------|
D|---2-----------2----|
A|-0------------------|
E|--------------------|`,
      variationHints: [
        "Spiele die Töne ultra-langsam an.",
        "Streiche leicht über die Saiten nah am Steg für metallische Schönheit.",
        "Variiere am Ende, indem du den 3. Bund auf der B-Saite greifst."
      ]
    },
    bass: {
      rootNotes: ["A", "C", "G", "F"],
      suggestedTab: `G|--------------------|
D|--------------------|
A|-0---3--------------|
E|---------3---1------|`,
      movementHints: [
        "Spiele eine tiefe Note exakt auf der Eins des Taktes.",
        "Lass den Ton atmen – dämpfe ihn nicht künstlich ab.",
        "Ergänze die Oktave auf dem G-Akkord im 5. Bund auf der D-Saite."
      ]
    },
    theoryReveal: {
      headline: "Die 'Golden Ratio' der Emotionen: Am – C – G – F",
      simpleExplanation: "Warum fesselt uns diese Folge sofort? Das Mollzentrum (Am) legt das emotionale Fundament. Die Schritte zu C-Dur (Dur-Parallele) und G-Dur (Helligkeit) heben unsere Stimmung ins Licht. Doch der Abstieg zum F-Dur reißt uns sanft zurück auf den Boden. Es ist ein ständiges emotionales Atmen.",
      keyTerms: ["Dur-Parallele", "Stufen-Abstieg", "Emotionaler Atem", "Diatonische Harmonie"],
      memoryPhrase: "Dunkelheit leuchtet am stärksten, wenn man ein klitzekleines Licht hineinstellt."
    },
    trinityMapping: {
      "Am": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C", interval: "Third", octave: 3 },
          { note: "E", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-0-2-2-1-0",
        bassTab: "x-0-2-2"
      },
      "C": {
        piano: [
          { note: "C", interval: "Root", octave: 3 },
          { note: "E", interval: "Third", octave: 3 },
          { note: "G", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-3-2-0-1-0",
        bassTab: "x-3-2-5"
      },
      "G": {
        piano: [
          { note: "G", interval: "Root", octave: 3 },
          { note: "B", interval: "Third", octave: 3 },
          { note: "D", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "3-2-0-0-0-3",
        bassTab: "3-5-5-x"
      },
      "F": {
        piano: [
          { note: "F", interval: "Root", octave: 3 },
          { note: "A", interval: "Third", octave: 3 },
          { note: "C", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "1-3-3-2-1-1",
        bassTab: "1-3-3-x"
      }
    }
  },
  {
    id: "dunkel",
    name: "dunkel",
    description: "Schwer, mystisch, bedrohlich, tief, voller Spannung.",
    emotionalTags: ["schwer", "mystisch", "bedrohlich", "tief", "Spannung"],
    defaultKey: "E-Moll",
    scaleSuggestions: ["E-Moll", "E Phrygisch"],
    chordProgressions: [
      {
        id: "dunkel_01",
        key: "E-Moll",
        chords: ["Em", "F", "Em", "D"],
        feel: "Schwere Powerchords mit Palm Muting",
        difficulty: "easy",
        tempoSuggestion: 80
      },
      {
        id: "dunkel_02",
        key: "A-Moll",
        chords: ["Am", "Bb", "Am", "Gm"],
        feel: "Dissonante Arpeggios, starr",
        difficulty: "medium",
        tempoSuggestion: 70
      }
    ],
    guitar: {
      approach: "Palm-Muting auf den tiefen Saiten, dicke Anschläge, schleppender Puls",
      techniques: ["palm muting", "heavy downstrokes", "low-end focus"],
      strummingPattern: "↓. ↓. ↓. ↓↑",
      pickingPattern: "Dumpfes Schlagen auf die tiefen 3 Saiten (Powerchords)"
    },
    riff: {
      scaleTones: ["E", "F", "G", "B", "D"],
      suggestedTab: `e|--------------------|
B|--------------------|
G|--------------------|
D|--------------------|
A|------1-2-1---------|
E|-0-1-3-----3-1-0---|`,
      variationHints: [
        "Betone den Wechsel von E (0. Bund) zu F (1. Bund) extrem stark.",
        "Nutze aggressive Plektrum-Abwärtsschläge.",
        "Vergiss den Hals-Tonabnehmer für dumpfen, drückenden Bassklang."
      ]
    },
    bass: {
      rootNotes: ["E", "F", "E", "D"],
      suggestedTab: `G|--------------------|
D|--------------------|
A|---------1----1-----|
E|-0---1----------3---|`,
      movementHints: [
        "Spiele so tief wie physiologisch möglich.",
        "Bleibe stoisch auf der Zählzeit, um Trägheit zu simulieren.",
        "Dämpfe die Saiten leicht mit dem Handballen ab."
      ]
    },
    theoryReveal: {
      headline: "Die Bedrohung der kleinen Sekunde (Phrygisch)",
      simpleExplanation: "Woher kommt dieses eiskalte Gefühl? Es ist der Schritt von Em zu F-Dur. Hier schleicht eine kleine Sekunde (nur ein Bund Unterschied!) in die Harmonie. Dieser winzige Halbtonschritt erzeugt sofort Reibung, Mystik und das unheimliche Gefühl von Phrygisch.",
      keyTerms: ["Kleine Sekunde", "Phrygischer Modus", "Rauheit/Dissonanz", "Halbtonschritt"],
      memoryPhrase: "Bedrohung entsteht nicht durch Lautstärke, sondern durch extrem enge Abstände der Töne."
    },
    trinityMapping: {
      "Em": {
        piano: [
          { note: "E", interval: "Root", octave: 3 },
          { note: "G", interval: "Third", octave: 3 },
          { note: "B", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "0-2-2-0-0-0",
        bassTab: "0-2-2-x"
      },
      "F": {
        piano: [
          { note: "F", interval: "Root", octave: 3 },
          { note: "A", interval: "Third", octave: 3 },
          { note: "C", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "1-3-3-2-1-1",
        bassTab: "1-3-3-x"
      },
      "D": {
        piano: [
          { note: "D", interval: "Root", octave: 3 },
          { note: "F#", interval: "Third", octave: 3 },
          { note: "A", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-x-0-2-3-2",
        bassTab: "x-5-4-7"
      }
    }
  },
  {
    id: "hoffnungsvoll",
    name: "hoffnungsvoll",
    description: "Hell, warm, aufstrebend, offen, motivierend, energetisch.",
    emotionalTags: ["hell", "warm", "aufstrebend", "offen", "motivierend"],
    defaultKey: "C-Dur",
    scaleSuggestions: ["C-Dur (Ionisch)", "C-Dur Pentatonik"],
    chordProgressions: [
      {
        id: "hoffnungsvoll_01",
        key: "C-Dur",
        chords: ["C", "G", "Am", "F"],
        feel: "Offene Akkorde, lebhaftes Durchspielen",
        difficulty: "easy",
        tempoSuggestion: 92
      },
      {
        id: "hoffnungsvoll_02",
        key: "G-Dur",
        chords: ["G", "D", "Em", "C"],
        feel: "Strahlendes Fingerpicking, aufsteigend",
        difficulty: "medium",
        tempoSuggestion: 88
      }
    ],
    guitar: {
      approach: "klare offene Akkorde, lockeres Handgelenk, stetiger Beat",
      techniques: ["strumming", "bright attack", "open ringing"],
      strummingPattern: "↓   ↓ ↑   ↑ ↓ ↑",
      pickingPattern: "Schnelles Folk-Zupfen oder volles Plektrumspiel"
    },
    riff: {
      scaleTones: ["C", "D", "E", "G", "A"],
      suggestedTab: `e|--------------------|
B|--------1-----------|
G|----0-2---2-0-------|
D|--2-----------2-----|
A|----------------3---|
E|--------------------|`,
      variationHints: [
        "Spiele dieses Riff lebendig und mit Betonung des Grundtons C.",
        "Variiere das Tempo, indem du ansteigend lauter wirst.",
        "Füge die hohe E-Saite als offene Resonanz hinzu."
      ]
    },
    bass: {
      rootNotes: ["C", "G", "A", "F"],
      suggestedTab: `G|--------------------|
D|------5-------------|
A|-3---------0--------|
E|----------------1---|`,
      movementHints: [
        "Spiele synkopisch (vorgezogene Anschläge knapp vor dem Takt).",
        "Nutze die Quinte (G auf C-Akkord), um Weite zu symbolisieren.",
        "Laufe im Geiste mit dem Rhythmus mit."
      ]
    },
    theoryReveal: {
      headline: "Das Licht im Dunkeln: C – G – Am – F",
      simpleExplanation: "C-Dur (I) steht für maximale Stabilität und Fundament. G-Dur (V) wirft uns nach vorne ins Unbekannte. A-Moll (vi) holt eine kleine Prise Sehnsucht zurück, doch F-Dur (IV) schließt das Ganze meisterlich mit dem warmen Versprechen der Heimkehr ab. Das ist pure Pop-Gold-Magie.",
      keyTerms: ["Diatonische Akkordfolge", "Dur-Dominanz", "Subdominante-Rückkehr", "Akkordauflösung"],
      memoryPhrase: "Ein glücklicher Song braucht kein Dauer-Grinsen. Erst ein Hauch von Moll macht die Hoffnung spürbar."
    },
    trinityMapping: {
      "C": {
        piano: [
          { note: "C", interval: "Root", octave: 3 },
          { note: "E", interval: "Third", octave: 3 },
          { note: "G", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-3-2-0-1-0",
        bassTab: "x-3-2-5"
      },
      "G": {
        piano: [
          { note: "G", interval: "Root", octave: 3 },
          { note: "B", interval: "Third", octave: 3 },
          { note: "D", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "3-2-0-0-0-3",
        bassTab: "3-5-5-x"
      },
      "Am": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C", interval: "Third", octave: 3 },
          { note: "E", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-0-2-2-1-0",
        bassTab: "x-0-2-2"
      },
      "F": {
        piano: [
          { note: "F", interval: "Root", octave: 3 },
          { note: "A", interval: "Third", octave: 3 },
          { note: "C", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "1-3-3-2-1-1",
        bassTab: "1-3-3-x"
      }
    }
  },
  {
    id: "bluesig",
    name: "bluesig",
    description: "Rau, ehrlich, dreckig, menschlich, swingend.",
    emotionalTags: ["rau", "ehrlich", "menschlich", "swingend", "dreckig"],
    defaultKey: "E-Dur",
    scaleSuggestions: ["E-Blues-Tonleiter", "E-Moll Pentatonik"],
    chordProgressions: [
      {
        id: "bluesig_01",
        key: "E",
        chords: ["E7", "A7", "E7", "B7"],
        feel: "Lässiger Shuffle-Beat",
        difficulty: "easy",
        tempoSuggestion: 90
      },
      {
        id: "bluesig_02",
        key: "A",
        chords: ["A7", "D7", "A7", "E7"],
        feel: "Schleppender Slow-Blues",
        difficulty: "medium",
        tempoSuggestion: 60
      }
    ],
    guitar: {
      approach: "Call & Response Licks, Saitenziehen (Bendings), Slides",
      techniques: ["bends", "slides", "shuffle feel", "double stops"],
      strummingPattern: "↓   ↓↓   ↓↓   ↓",
      pickingPattern: "Hybrid Picking (Plektrum + Mittelfinger/Ringfinger)"
    },
    riff: {
      scaleTones: ["E", "G", "A", "Bb", "B", "D"],
      suggestedTab: `e|--------------------|
B|--------------------|
G|--------------------|
D|------0-2-----------|
A|--0-1-----1-0-------|
E|-3------------3-0---|`,
      variationHints: [
        "Zieh den Ton G (Bund 3 auf der tiefen E-Saite) minimal nach oben (Micro-Bend).",
        "Spiele Bb (Bund 1 auf der A-Saite) sehr kurz – es ist die giftige 'Blue Note'!",
        "Lass das E (leere tiefe Saite) unüberhörbar dröhnen."
      ]
    },
    bass: {
      rootNotes: ["E", "A", "E", "B"],
      suggestedTab: `G|--------------------|
D|------0-2-----------|
A|--0-2---------------|
E|-0--------3-0-3-0---|`,
      movementHints: [
        "Spiele einen typischen 'Walking Bass' mit Schritten über Terz und Quinte.",
        "Halte das Shuffletiming stabil im Bauch.",
        "Akzentuiere die kleine Septime."
      ]
    },
    theoryReveal: {
      headline: "Die süße Reibung der dominanten Septimen und Blue Notes",
      simpleExplanation: "Der Blues bricht alle klassischen Regeln. Wir spielen Moll-Soli (Moll-Pentatonik) über helle Dur7-Akkorde (E7, A7). Genau aus dieser bewussten Kollision entsteht die unnachahmliche, raue Sehnsucht. Bb fungiert hier als Blue Note – als tritonische Reibung im Gefüge.",
      keyTerms: ["Dominantseptakkord", "Blue Note", "Shuffle-Rhythmus", "Moll-Soli über Dur-Akkorde"],
      memoryPhrase: "Der Blues fragt dich nicht nach deinen Notenkenntnissen. Er fragt dich nur, wo es wehtut."
    },
    trinityMapping: {
      "E7": {
        piano: [
          { note: "E", interval: "Root", octave: 3 },
          { note: "G#", interval: "Third", octave: 3 },
          { note: "D", interval: "Other", octave: 3 }
        ],
        guitarTab: "0-2-0-1-3-0",
        bassTab: "0-2-0-x"
      },
      "A7": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C#", interval: "Third", octave: 3 },
          { note: "G", interval: "Other", octave: 3 }
        ],
        guitarTab: "x-0-2-0-2-0",
        bassTab: "x-0-2-0"
      },
      "B7": {
        piano: [
          { note: "B", interval: "Root", octave: 3 },
          { note: "D#", interval: "Third", octave: 3 },
          { note: "A", interval: "Other", octave: 3 }
        ],
        guitarTab: "x-2-1-2-0-2",
        bassTab: "x-2-1-2"
      }
    }
  },
  {
    id: "treibend",
    name: "treibend",
    description: "Vorwärts gerichtet, energiereich, antreibend, pulsierend.",
    emotionalTags: ["vorwärts", "Spielfluss", "Energie", "pulsierend"],
    defaultKey: "E-Moll",
    scaleSuggestions: ["E-Moll Pentatonik", "E-Äolisch"],
    chordProgressions: [
      {
        id: "treibend_01",
        key: "E-Moll",
        chords: ["Em", "G", "D", "A"],
        feel: "Durchgehender Achtelpuls mit Akzenten",
        difficulty: "easy",
        tempoSuggestion: 110
      },
      {
        id: "treibend_02",
        key: "A-Moll",
        chords: ["Am", "G", "F", "D"],
        feel: "Harter Offbeat-Rhythmus",
        difficulty: "medium",
        tempoSuggestion: 116
      }
    ],
    guitar: {
      approach: "ununterbrochener Achtel-Downstroke-Teppich, Betonung auf der Eins und Drei",
      techniques: ["driving eighth notes", "bridge muting", "constant rhythm"],
      strummingPattern: "↓↓↓↓↓↓↓↓",
      pickingPattern: "Konstante Auf- und Abschläge"
    },
    riff: {
      scaleTones: ["E", "G", "A", "B", "D"],
      suggestedTab: `e|--------------------|
B|--------------------|
G|--------------------|
D|-------2-0---0------|
A|---0-2-----2--------|
E|-0------------------|`,
      variationHints: [
        "Lass alle Töne vollkommen staccato / kurz abgehackt klingen.",
        "Treibe den Song durch ein kurzes Break vorwärts.",
        "Benutze die flache Hand für straffes Abdämpfen am Steg."
      ]
    },
    bass: {
      rootNotes: ["E", "G", "D", "A"],
      suggestedTab: `G|--------------------|
D|--------------------|
A|---------5---5------|
E|-0---3---------5-5--|`,
      movementHints: [
        "Spiele exakte Achteltöne mit zwei Fingern abwechselnd (Zeige-/Mittelfinger).",
        "Atme synchron im Takt für absolute Stabilität.",
        "Betone die Akkordübergänge durch kleine Vorschlagtöne."
      ]
    },
    theoryReveal: {
      headline: "Der Motor des Vorwärtsdrangs: Em – G – D – A",
      simpleExplanation: "Warum treibt dieses Gefüge so an? Uns zieht die harmonische Schleife: Em (Ruhepunkt) geht über G (Licht) und D (Weite) schließlich zu A-Dur (das die helle dorische Quinte C# andeutet). Weil A-Dur eigentlich nicht in natürlichem E-Moll liegt, weckt es das Ohr auf und verlangt einen Neuanlauf zu Em.",
      keyTerms: ["Dorische Nuance", "Achtel-Konstanz", "Treibende Schleife", "Akkordreizung"],
      memoryPhrase: "Energie kommt von Bewegung. Wiederhole ein Motiv, bis es zur Hypnose wird."
    },
    trinityMapping: {
      "Em": {
        piano: [
          { note: "E", interval: "Root", octave: 3 },
          { note: "G", interval: "Third", octave: 3 },
          { note: "B", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "0-2-2-0-0-0",
        bassTab: "0-2-2-x"
      },
      "G": {
        piano: [
          { note: "G", interval: "Root", octave: 3 },
          { note: "B", interval: "Third", octave: 3 },
          { note: "D", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "3-2-0-0-0-3",
        bassTab: "3-5-5-x"
      },
      "D": {
        piano: [
          { note: "D", interval: "Root", octave: 3 },
          { note: "F#", interval: "Third", octave: 3 },
          { note: "A", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-x-0-2-3-2",
        bassTab: "x-5-4-7"
      },
      "A": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C#", interval: "Third", octave: 3 },
          { note: "E", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-0-2-2-2-0",
        bassTab: "x-0-2-2"
      }
    }
  },
  {
    id: "ruhig",
    name: "ruhig",
    description: "Friedlich, langsam, geerdet, klar, entspannt.",
    emotionalTags: ["friedlich", "langsam", "geerdet", "klar", "entspannt"],
    defaultKey: "D-Dur",
    scaleSuggestions: ["D-Dur", "D-Dur Pentatonik"],
    chordProgressions: [
      {
        id: "ruhig_01",
        key: "D-Dur",
        chords: ["D", "A", "Bm", "G"],
        feel: "Langsames Picking auf dünnen Saiten, schwebend",
        difficulty: "easy",
        tempoSuggestion: 62
      },
      {
        id: "ruhig_02",
        key: "G-Dur",
        chords: ["G", "Cadd9", "G", "D"],
        feel: "Minimalistischer Puls, weich",
        difficulty: "medium",
        tempoSuggestion: 65
      }
    ],
    guitar: {
      approach: "Pausen einbauen, luftige Akkorde greifen, sanftes Arpeggiospiel",
      techniques: ["slow release", "ambient ring", "soft plucking"],
      strummingPattern: "↓       ↓       ",
      pickingPattern: "Basssaite → G → B → e → B → G"
    },
    riff: {
      scaleTones: ["D", "E", "F#", "A", "B"],
      suggestedTab: `e|------2-------------|
B|----3---3-----------|
G|--2-------2---------|
D|0-----------0-------|
A|--------------------|
E|--------------------|`,
      variationHints: [
        "Spiele nur drei Töne und atme tief ein- und aus.",
        "Längere Pausen erzeugen die absolute Erdung des Körpers.",
        "Stimme deine Gitarre akkurat, um Schwebungen zu vermeiden."
      ]
    },
    bass: {
      rootNotes: ["D", "A", "B", "G"],
      suggestedTab: `G|--------------------|
D|--------------------|
A|-5----0----2--------|
E|-----------------3--|`,
      movementHints: [
        "Spiele nur die glockenklare Eins im Takt und halte den Ton lange.",
        "Lass die Saitenschwingungen physisch abebben.",
        "Schließe beim Spielen des Tiefbasses kurz die Augen."
      ]
    },
    theoryReveal: {
      headline: "Die Kraft der Symmetrie und Weite: D – A – Bm – G",
      simpleExplanation: "Dieses Gebilde schenkt uns absolute Entspannung. Der Beginn in D-Dur (I) wirkt gelassen. G-Dur (IV) und A-Dur (V) spannen den reinsten harmonischen Bogen auf. Bm (vi) fängt uns wie eine Wolke ab, bevor wir über den beruhigenden Grundton am Boden aufbauen.",
      keyTerms: ["Diatonische Ruhe", "Grundton-Erdung", "Weite Abstände", "Offene Klangfarbe"],
      memoryPhrase: "Musik entsteht erst durch die Stille zwischen den Tönen. Lass den Noten ihren Raum."
    },
    trinityMapping: {
      "D": {
        piano: [
          { note: "D", interval: "Root", octave: 3 },
          { note: "F#", interval: "Third", octave: 3 },
          { note: "A", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-x-0-2-3-2",
        bassTab: "x-5-4-7"
      },
      "A": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C#", interval: "Third", octave: 3 },
          { note: "E", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-0-2-2-2-0",
        bassTab: "x-0-2-2"
      },
      "Bm": {
        piano: [
          { note: "B", interval: "Root", octave: 3 },
          { note: "D", interval: "Third", octave: 3 },
          { note: "F#", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "x-2-4-4-3-2",
        bassTab: "x-2-4-4"
      },
      "G": {
        piano: [
          { note: "G", interval: "Root", octave: 3 },
          { note: "B", interval: "Third", octave: 3 },
          { note: "D", interval: "Fifth", octave: 3 }
        ],
        guitarTab: "3-2-0-0-0-3",
        bassTab: "3-5-5-x"
      }
    }
  },
  {
    id: "funky",
    name: "funky",
    description: "Rhythmisch, verspielt, körperlich, trocken, federnd.",
    emotionalTags: ["rhythmisch", "verspielt", "trocken", "federnd"],
    defaultKey: "E-Moll / E-7",
    scaleSuggestions: ["E Dorian", "E-Moll Pentatonik"],
    chordProgressions: [
      {
        id: "funky_01",
        key: "E-Moll",
        chords: ["Em7", "A7"],
        feel: "Kurze Chops, synkopiert auf die 'Zwei' und 'Vier'",
        difficulty: "medium",
        tempoSuggestion: 104
      },
      {
        id: "funky_02",
        key: "A-Moll",
        chords: ["Am7", "D7"],
        feel: "Kratziger Sechzehntel-Feder-Style",
        difficulty: "medium",
        tempoSuggestion: 98
      }
    ],
    guitar: {
      approach: "Saiten blitzschnell lockern für 'Chika-Chika' Ghost-Notes, perkussives Greifen",
      techniques: ["scratching", "staccato chops", "16th dynamic swing"],
      strummingPattern: "↓x↑x ↓x↑x (Ghost Notes)",
      pickingPattern: "Akkord anschlagen, sofort loslassen um abzudämpfen"
    },
    riff: {
      scaleTones: ["E", "G", "A", "B", "D"],
      suggestedTab: `e|-----7-x-7--|
B|-----8-x-8--|
G|-----7-x-7--|
D|------------|
A|--7---------|
E|------------|`,
      variationHints: [
        "Spiele kurzes 'x' und dämpfe die Saiten mit der linken Hand.",
        "Akzentuiere den Offbeat (die Zwischenzeiten wie '2-und').",
        "Wackle leicht mit dem Handgelenk, um den Rhythmus-Motor anzuwerfen."
      ]
    },
    bass: {
      rootNotes: ["E", "A"],
      suggestedTab: `G|--------------------|
D|-----5-7------------|
A|--7-x-----7-5-------|
E|-0------------7-5-0-|`,
      movementHints: [
        "Spiele 'Slap und Pop' für perkussiven Metallglanz.",
        "Die Bassgitarre ist hier der Chef-Motor, halte engen Kontakt zum Drum-Puls.",
        "Baue winzige Pausen (Ghost Notes) im Takt ein."
      ]
    },
    theoryReveal: {
      headline: "Der Motor des Dorian Funk: Em7 – A7",
      simpleExplanation: "Im Funk genügen zwei Akkorde für pure Ekstase! Der Schritt von Em7 zu A7 deutet E-Dorian an (wegen des C# im A7 Akkord, welcher die große Sexte von E darstellt). Diese Dorian-Sexte nimmt dem traditionellen Moll das Traurige und versieht es mit einer frechen, tanzbaren Note.",
      keyTerms: ["Dorische Sexte", "Akkordmischung (Modal Interchange)", "Synkopierung", "Ghost Notes"],
      memoryPhrase: "Im Funk zählt nicht, welche Akkorde du spielst, sondern wie viel Luft du zwischen ihnen frei lässt."
    },
    trinityMapping: {
      "Em7": {
        piano: [
          { note: "E", interval: "Root", octave: 3 },
          { note: "G", interval: "Third", octave: 3 },
          { note: "D", interval: "Other", octave: 4 }
        ],
        guitarTab: "0-2-2-0-3-0",
        bassTab: "0-2-0-x"
      },
      "A7": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C#", interval: "Third", octave: 3 },
          { note: "G", interval: "Other", octave: 3 }
        ],
        guitarTab: "x-0-2-0-2-0",
        bassTab: "x-0-2-0"
      },
      "Am7": {
        piano: [
          { note: "A", interval: "Root", octave: 3 },
          { note: "C", interval: "Third", octave: 3 },
          { note: "G", interval: "Other", octave: 3 }
        ],
        guitarTab: "x-0-2-0-1-0",
        bassTab: "x-0-2-0"
      },
      "D7": {
        piano: [
          { note: "D", interval: "Root", octave: 3 },
          { note: "F#", interval: "Third", octave: 3 },
          { note: "C", interval: "Other", octave: 4 }
        ],
        guitarTab: "x-x-0-2-1-2",
        bassTab: "x-5-4-5"
      }
    }
  }
];
