// Bidirectional Web MIDI Integration for VibeTheory
// Handles MIDI Keyboard Inputs, MIDI Synthesizer Outputs, and Real-time MIDI Thru.

let midiAccess: any = null;
let inputs: any[] = [];
let outputs: any[] = [];
let selectedInputId: string = "all";
let selectedOutputId: string = "none";
let midiThruEnabled: boolean = true;
let isMidiActive: boolean = false;

// Callbacks
let stateChangeCallback: (() => void) | null = null;
let noteInputCallback: ((noteName: string, octave: number, velocity: number) => void) | null = null;
let activityCallback: (() => void) | null = null;

const pitchMap: { [key: string]: number } = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8,
  "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11
};

const noteNameArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function triggerActivity() {
  if (activityCallback) {
    activityCallback();
  }
}

function handleMidiMessage(message: any) {
  const data = message.data;
  if (!data || data.length < 1) return;

  const status = data[0];
  const command = status & 0xf0;
  const channel = status & 0x0f;

  // Track activity LED
  triggerActivity();

  // MIDI Thru routing
  if (midiThruEnabled && selectedOutputId !== "none") {
    sendRawMidi(data);
  }

  // MIDI Note On message: 0x90
  if (command === 0x90 && data.length >= 3) {
    const noteNumber = data[1];
    const velocity = data[2];

    if (velocity > 0) {
      const noteName = noteNameArray[noteNumber % 12];
      const octave = Math.floor(noteNumber / 12) - 1;
      
      // Play note locally in-app
      if (noteInputCallback) {
        noteInputCallback(noteName, octave, velocity / 127);
      }
    } else {
      // Velocity 0 is actually Note Off
      // Standard note off (0x80) can also be ignored/handled by audio context decay
    }
  }
}

function updateDevices() {
  if (!midiAccess) return;

  inputs = Array.from(midiAccess.inputs.values());
  outputs = Array.from(midiAccess.outputs.values());

  // Set up listeners for all inputs
  inputs.forEach((input: any) => {
    input.onmidimessage = (message: any) => {
      // If "all" inputs or this specific input is selected
      if (selectedInputId === "all" || selectedInputId === input.id) {
        handleMidiMessage(message);
      }
    };
  });

  if (stateChangeCallback) {
    stateChangeCallback();
  }
}

// Public API Functions
export async function activateMidi(
  onStateChange: () => void,
  onNoteInput: (noteName: string, octave: number, velocity: number) => void,
  onActivity: () => void
): Promise<boolean> {
  stateChangeCallback = onStateChange;
  noteInputCallback = onNoteInput;
  activityCallback = onActivity;

  if (typeof window === "undefined" || !navigator) return false;

  const nav = navigator as any;
  if (!nav.requestMIDIAccess) {
    console.warn("Web MIDI API is not supported in this browser.");
    return false;
  }

  try {
    midiAccess = await nav.requestMIDIAccess({ sysex: false });
    isMidiActive = true;
    
    midiAccess.onstatechange = () => {
      updateDevices();
    };

    updateDevices();
    return true;
  } catch (error) {
    console.error("Failed to access MIDI devices:", error);
    isMidiActive = false;
    return false;
  }
}

export function getMidiState() {
  return {
    isMidiActive,
    inputs: inputs.map((i: any) => ({ id: i.id, name: i.name || "Unknown Port", manufacturer: i.manufacturer })),
    outputs: outputs.map((o: any) => ({ id: o.id, name: o.name || "Unknown Port", manufacturer: o.manufacturer })),
    selectedInputId,
    selectedOutputId,
    midiThruEnabled
  };
}

export function setSelectedInputId(id: string) {
  selectedInputId = id;
  if (stateChangeCallback) stateChangeCallback();
}

export function setSelectedOutputId(id: string) {
  selectedOutputId = id;
  if (stateChangeCallback) stateChangeCallback();
}

export function setMidiThruEnabled(enabled: boolean) {
  midiThruEnabled = enabled;
  if (stateChangeCallback) stateChangeCallback();
}

export function sendRawMidi(data: Uint8Array | number[]) {
  if (selectedOutputId === "none") return;
  const outputPort = outputs.find((o: any) => o.id === selectedOutputId);
  if (outputPort) {
    try {
      outputPort.send(data);
    } catch (e) {
      console.warn("Error sending raw MIDI:", e);
    }
  }
}

// Sends bidirectional Note On to selected output device
export function sendMidiNoteOn(noteName: string, octave: number, velocity: number = 0.8, duration: number = 0.8) {
  if (selectedOutputId === "none" || !isMidiActive) return;

  const pitch = pitchMap[noteName];
  if (pitch === undefined) return;

  const noteNum = (octave + 1) * 12 + pitch;
  if (noteNum < 0 || noteNum > 127) return;

  const velByte = Math.round(velocity * 127);

  // Status byte 0x90 (Note On Channel 1)
  sendRawMidi([0x90, noteNum, velByte]);
  triggerActivity();

  // Schedule Note Off on matching note to prevent infinite drone notes
  setTimeout(() => {
    // Status byte 0x80 (Note Off Channel 1)
    sendRawMidi([0x80, noteNum, 0]);
    triggerActivity();
  }, duration * 1000);
}
