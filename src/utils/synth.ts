// High-Fidelity Physical Modeling Web Audio Synthesizer for VibeTheory
// Simulates accurate, highly realistic steel strings, physical hammer-strikes, and woody bass thumps natively.

import { sendMidiNoteOn } from "./midi";

export type SoundCharacteristic = "acoustic_piano" | "vintage_rhodes" | "steel_guitar";

let activeSoundCharacteristic: SoundCharacteristic = "acoustic_piano";

export function setSoundCharacteristic(characteristic: SoundCharacteristic) {
  activeSoundCharacteristic = characteristic;
}

export function getSoundCharacteristic(): SoundCharacteristic {
  return activeSoundCharacteristic;
}

let audioCtx: AudioContext | null = null;
let globalReverbNode: DelayNode | null = null;
let globalReverbGain: GainNode | null = null;
let globalFeedbackGain: GainNode | null = null;
let masterAnalyser: AnalyserNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAudioAnalyser(): AnalyserNode | null {
  if (typeof window === "undefined") return null;
  const ctx = getAudioContext();
  if (!masterAnalyser) {
    masterAnalyser = ctx.createAnalyser();
    masterAnalyser.fftSize = 128; // Small fftSize is perfect for neat, smooth real-time waves
    masterAnalyser.connect(ctx.destination);
  }
  return masterAnalyser;
}

function connectToOutput(node: AudioNode, ctx: AudioContext) {
  const analyser = getAudioAnalyser();
  if (analyser) {
    node.connect(analyser);
  } else {
    node.connect(ctx.destination);
  }
}

// Global warmth-reverberation node (Tape Feed Slapback Delay) simulating an ambient, woody acoustic recording studio space.
function setupGlobalReverb(ctx: AudioContext) {
  if (globalReverbNode) return;
  try {
    // 160ms space delay for standard high-end studio slapback echo
    globalReverbNode = ctx.createDelay(1.0);
    globalReverbNode.delayTime.setValueAtTime(0.16, ctx.currentTime);

    globalReverbGain = ctx.createGain();
    globalReverbGain.gain.setValueAtTime(0.18, ctx.currentTime); // subtle ambient blend (wet)

    globalFeedbackGain = ctx.createGain();
    globalFeedbackGain.gain.setValueAtTime(0.32, ctx.currentTime); // controlled studio decay feedback

    const reverbFilter = ctx.createBiquadFilter();
    reverbFilter.type = "lowpass";
    reverbFilter.frequency.setValueAtTime(1400, ctx.currentTime); // warm high-frequency absorption

    // feedback connection path: delay -> filter -> feedback -> delay
    globalReverbNode.connect(reverbFilter);
    reverbFilter.connect(globalFeedbackGain);
    globalFeedbackGain.connect(globalReverbNode);

    // split path out to destination
    globalReverbNode.connect(globalReverbGain);
    connectToOutput(globalReverbGain, ctx);
  } catch (err) {
    console.warn("Could not initialze global reverb space:", err);
  }
}

// Map base note names to octave 0 frequencies
const NOTE_FREQS: { [key: string]: number } = {
  "C": 16.35, "C#": 17.32, "Db": 17.32, "D": 18.35, "D#": 19.45, "Eb": 19.45,
  "E": 20.60, "F": 21.83, "F#": 23.12, "Gb": 23.12, "G": 24.50, "G#": 25.96,
  "Ab": 25.96, "A": 27.50, "A#": 29.14, "Bb": 29.14, "B": 30.87
};

function getFreqForNoteName(noteName: string, octave: number = 3): number {
  const match = noteName.match(/^([A-G]#?|Bb|Db|Eb|Gb|Ab)/);
  if (!match) return 440;
  const baseNote = match[1];
  const baseFreq = NOTE_FREQS[baseNote];
  if (!baseFreq) return 440;
  return baseFreq * Math.pow(2, octave);
}

function getSynthVolumeMultiplier(): number {
  try {
    const saved = localStorage.getItem("vibetheory_synth_volume");
    return saved ? parseFloat(saved) : 0.6;
  } catch {
    return 0.6;
  }
}

// Generates an on-the-fly random white-noise buffer for plectrum attack/hammer click transients
function createNoiseBuffer(ctx: AudioContext, durationSec: number = 0.035): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // White noise distribution
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playSynthNote(noteName: string, octave: number = 3, duration: number = 0.8, velocity: number = 1.0) {
  playSynthNoteInternal(noteName, octave, duration, velocity, true);
}

export function playSynthNoteInternal(noteName: string, octave: number = 3, duration: number = 0.8, velocity: number = 1.0, emitMidi: boolean = true) {
  try {
    if (emitMidi) {
      sendMidiNoteOn(noteName, octave, velocity, duration);
    }
    const ctx = getAudioContext();
    setupGlobalReverb(ctx);

    const freq = getFreqForNoteName(noteName, octave);
    const volumeMultiplier = getSynthVolumeMultiplier();
    const now = ctx.currentTime;

    // Master gain for this specific voice note
    const voiceMainGainNode = ctx.createGain();
    voiceMainGainNode.gain.setValueAtTime(0, now);
    voiceMainGainNode.gain.linearRampToValueAtTime(1.0 * volumeMultiplier * velocity, now + 0.005); // fast attack

    // Filter node to simulate natural physical string damping (high frequencies fade quicker)
    const voiceDampFilter = ctx.createBiquadFilter();
    voiceDampFilter.type = "lowpass";

    // Direct connections to speakers and global studio space
    voiceMainGainNode.connect(voiceDampFilter);
    connectToOutput(voiceDampFilter, ctx);
    if (globalReverbNode) {
      voiceDampFilter.connect(globalReverbNode);
    }

    // Dynamic Instrument Mode Selection
    let instrumentMode: "bass" | "guitar" | "piano" | "rhodes" = "guitar";
    if (octave <= 2) {
      instrumentMode = "bass";
    } else {
      if (activeSoundCharacteristic === "steel_guitar") {
        instrumentMode = "guitar";
      } else if (activeSoundCharacteristic === "vintage_rhodes") {
        instrumentMode = "rhodes";
      } else {
        instrumentMode = "piano";
      }
    }

    if (instrumentMode === "bass") {
      // --- MODEL A: Deep Resonant Woody Double Bass ---
      // Low fundamental focus, wood cabinet comb resonance, and warm finger slider knock

      voiceDampFilter.frequency.setValueAtTime(350, now);
      voiceDampFilter.frequency.exponentialRampToValueAtTime(120, now + duration);

      // 1. Deep Sub-Thump (Triangle fundamental)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, now);
      gain1.gain.setValueAtTime(0.25 * velocity, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain1);
      gain1.connect(voiceMainGainNode);
      osc1.start(now);
      osc1.stop(now + duration + 0.1);

      // 2. Warm Second Harmonic (Electric growl / woody vibration blend)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, now);
      gain2.gain.setValueAtTime(0.12 * velocity, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.75);

      osc2.connect(gain2);
      gain2.connect(voiceMainGainNode);
      osc2.start(now);
      osc2.stop(now + duration + 0.1);

      // Woody chamber resonance filter to emulate wood cabinet volume
      const resonanceDelay = ctx.createDelay();
      const resonanceGain = ctx.createGain();
      resonanceDelay.delayTime.setValueAtTime(0.016, now); // ~60Hz comb filter
      resonanceGain.gain.setValueAtTime(0.22, now);

      voiceMainGainNode.connect(resonanceDelay);
      resonanceDelay.connect(resonanceGain);
      resonanceGain.connect(resonanceDelay);
      resonanceGain.connect(voiceDampFilter); // feed resonance back to filter

      // Finger pluck knock transient noise
      const noiseBuffer = createNoiseBuffer(ctx, 0.018);
      const noiseSource = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();

      noiseSource.buffer = noiseBuffer;
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(260, now); // wood plunk frequencies
      noiseFilter.Q.setValueAtTime(3.0, now);

      noiseGain.gain.setValueAtTime(0.35 * velocity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(voiceMainGainNode);
      noiseSource.start(now);

    } else if (instrumentMode === "guitar") {
      // --- MODEL B: Warm Nylon/Steel Acoustic Guitar with Body Resonance ---
      // Uses multi-harmonic overtones, low string metallic buzz/winding growl, and physical waveguides

      const isSteel = activeSoundCharacteristic === "steel_guitar";
      voiceDampFilter.frequency.setValueAtTime(isSteel ? 3500 : 2400, now);
      voiceDampFilter.frequency.exponentialRampToValueAtTime(isSteel ? 320 : 200, now + duration);

      // Thick copper/steel strings vs. thin nylon wire formula
      // Note ranges: Low E (82Hz) to High E (330Hz). If freq < 170, it's a wound brass string
      const isWoundString = freq < 170;

      // Harmonic profile list
      let overtones = [
        { mult: 1.0, detune: -1.5, amp: 0.24, dec: 1.0 },      // Fundamental
        { mult: 2.0, detune: 1.5, amp: 0.14, dec: 0.7 },       // 2nd Partial (Octave)
        { mult: 3.0, detune: 3.0, amp: isSteel ? 0.12 : 0.08, dec: 0.5 },       // 3rd Partial
        { mult: 4.0, detune: -2.0, amp: isSteel ? 0.08 : 0.05, dec: 0.3 },      // 4th Partial
        { mult: 5.0, detune: 4.5, amp: isSteel ? 0.06 : 0.03, dec: 0.15 }       // 5th Chime Partial
      ];

      overtones.forEach((part, index) => {
        const osc = ctx.createOscillator();
        const overtoneGain = ctx.createGain();

        // Real guitar windings vibrate with higher warmth and slightly growlier attack
        if (isWoundString && index === 0) {
          osc.type = "triangle"; // Woody round bass focus
        } else if (isWoundString && index === 1) {
          osc.type = "sine"; // smooth support
        } else {
          osc.type = index === 0 ? "triangle" : "sine";
        }

        osc.frequency.setValueAtTime(freq * part.mult, now);
        osc.detune.setValueAtTime(part.detune, now);

        // Low winding metallic growl simulator for heavy strings (wound E/A/D)
        if (isWoundString && index === 0) {
          // Add a subtle buzzy secondary low-pass oscillator for the brass winding fret friction
          const wireOsc = ctx.createOscillator();
          const wireGain = ctx.createGain();
          const wireFilter = ctx.createBiquadFilter();

          wireOsc.type = "sawtooth";
          wireOsc.frequency.setValueAtTime(freq, now);
          wireOsc.detune.setValueAtTime(3.0, now);

          wireFilter.type = "lowpass";
          wireFilter.frequency.setValueAtTime(280, now); // extreme high-frequency roll-off

          wireGain.gain.setValueAtTime(0.08 * velocity, now);
          wireGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.35);

          wireOsc.connect(wireFilter);
          wireFilter.connect(wireGain);
          wireGain.connect(voiceMainGainNode);
          wireOsc.start(now);
          wireOsc.stop(now + duration + 0.1);
        }

        overtoneGain.gain.setValueAtTime(part.amp * velocity, now);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + duration * part.dec);

        osc.connect(overtoneGain);
        overtoneGain.connect(voiceMainGainNode);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Wooden sound chamber physical body waveguide delay feedback simulation
      const guitarResonanceDelay = ctx.createDelay();
      const guitarResonanceGain = ctx.createGain();
      guitarResonanceDelay.delayTime.setValueAtTime(0.011, now); // ~90Hz wooden box air volume resonance
      guitarResonanceGain.gain.setValueAtTime(0.18, now);

      voiceMainGainNode.connect(guitarResonanceDelay);
      guitarResonanceDelay.connect(guitarResonanceGain);
      guitarResonanceGain.connect(guitarResonanceDelay);
      guitarResonanceGain.connect(voiceDampFilter);

      // Human picking pick strike noise transient
      const noiseBuf = createNoiseBuffer(ctx, 0.035);
      const pluckSource = ctx.createBufferSource();
      const pluckGain = ctx.createGain();
      const pluckFilter = ctx.createBiquadFilter();

      pluckSource.buffer = noiseBuf;
      pluckFilter.type = "highpass";
      pluckFilter.frequency.setValueAtTime(1200, now); // pick string scratching sound

      pluckGain.gain.setValueAtTime(0.20 * velocity, now);
      pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      pluckSource.connect(pluckFilter);
      pluckFilter.connect(pluckGain);
      pluckGain.connect(voiceMainGainNode);
      pluckSource.start(now);

    } else if (instrumentMode === "rhodes") {
      // --- MODEL D: Warm Vintage Rhodes Electric Piano ---
      // Replicates the mellow tine strike, rubber hammer impact, and sweet tube cabinet tremolo/vibrato.
      
      voiceDampFilter.frequency.setValueAtTime(1400, now);
      voiceDampFilter.frequency.exponentialRampToValueAtTime(320, now + duration);

      // Tremolo LFO
      const tremoloOsc = ctx.createOscillator();
      const tremoloGain = ctx.createGain();
      tremoloOsc.frequency.setValueAtTime(4.8, now); // Sweet 4.8 Hz vintage Rhodes tremolo
      tremoloGain.gain.setValueAtTime(0.28, now); // Tremolo depth
      
      tremoloOsc.connect(tremoloGain);

      const rhodesPartials = [
        { mult: 1.0, detune: 0, amp: 0.32, dec: 1.0, type: "sine" as OscillatorType },
        { mult: 2.0, detune: -1.0, amp: 0.12, dec: 0.8, type: "sine" as OscillatorType },
        { mult: 3.0, detune: 1.0, amp: 0.08, dec: 0.65, type: "sine" as OscillatorType },
        { mult: 4.0, detune: 0, amp: 0.04, dec: 0.4, type: "sine" as OscillatorType },
        { mult: 9.2, detune: 5.0, amp: 0.14, dec: 0.15, type: "sine" as OscillatorType } // high chime tine
      ];

      rhodesPartials.forEach((part) => {
        const osc = ctx.createOscillator();
        const partGain = ctx.createGain();

        osc.type = part.type;
        osc.frequency.setValueAtTime(freq * part.mult, now);
        osc.detune.setValueAtTime(part.detune, now);

        partGain.gain.setValueAtTime(part.amp * velocity, now);
        partGain.gain.exponentialRampToValueAtTime(0.001, now + duration * part.dec);

        osc.connect(partGain);
        
        if (part.mult <= 2.0) {
          const tremoloMod = ctx.createGain();
          tremoloMod.gain.setValueAtTime(0.72, now);
          
          tremoloGain.connect(tremoloMod.gain);
          partGain.connect(tremoloMod);
          tremoloMod.connect(voiceMainGainNode);
        } else {
          partGain.connect(voiceMainGainNode);
        }

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      tremoloOsc.start(now);
      tremoloOsc.stop(now + duration + 0.1);

      // Saturation
      const waveshaper = ctx.createWaveShaper();
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const k = 10;
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      waveshaper.curve = curve;
      waveshaper.oversample = '4x';

      const rhodesFilter = ctx.createBiquadFilter();
      rhodesFilter.type = "peaking";
      rhodesFilter.frequency.setValueAtTime(280, now);
      rhodesFilter.gain.setValueAtTime(3.5, now);
      rhodesFilter.Q.setValueAtTime(1.0, now);

      voiceMainGainNode.connect(rhodesFilter);
      rhodesFilter.connect(voiceDampFilter);

      // Metal chime physical strike
      const metalTineBuffer = createNoiseBuffer(ctx, 0.022);
      const tineSource = ctx.createBufferSource();
      const tineGain = ctx.createGain();
      const tineFilter = ctx.createBiquadFilter();

      tineSource.buffer = metalTineBuffer;
      tineFilter.type = "bandpass";
      tineFilter.frequency.setValueAtTime(2600, now);
      tineFilter.Q.setValueAtTime(5.0, now);

      tineGain.gain.setValueAtTime(0.18 * velocity, now);
      tineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      tineSource.connect(tineFilter);
      tineFilter.connect(tineGain);
      tineGain.connect(voiceMainGainNode);
      tineSource.start(now);

    } else {
      // --- MODEL C: Celestial Hammer-strike Triple-String grand Piano ---
      // Replicates unison-detune triple strings, soft felt cushion knock, and soundboard sympathetic resonance

      voiceDampFilter.frequency.setValueAtTime(2800, now);
      voiceDampFilter.frequency.exponentialRampToValueAtTime(450, now + duration);

      // Acoustic pianos hit up to three strings in unison. Slight cents detuning
      // provides the classic warm chorus beating and spatial wideness!
      const partials = [
        { mult: 1.0, detune: -1.8, amp: 0.13, dec: 1.0 },      // String A (detuned left)
        { mult: 1.0, detune: 1.8, amp: 0.13, dec: 1.0 },       // String B (detuned right)
        { mult: 2.0, detune: -2.3, amp: 0.07, dec: 0.75 },     // Harmonics detuned
        { mult: 2.0, detune: 2.3, amp: 0.07, dec: 0.75 },
        { mult: 3.0, detune: -3.5, amp: 0.04, dec: 0.5 },
        { mult: 4.0, detune: 3.5, amp: 0.02, dec: 0.3 }
      ];

      partials.forEach((part) => {
        const osc = ctx.createOscillator();
        const partGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * part.mult, now);
        osc.detune.setValueAtTime(part.detune, now);

        partGain.gain.setValueAtTime(part.amp * velocity, now);
        partGain.gain.exponentialRampToValueAtTime(0.001, now + duration * part.dec);

        osc.connect(partGain);
        partGain.connect(voiceMainGainNode);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Soundboard sympathetic resonance delay feedback simulation
      const pianoResonanceDelay = ctx.createDelay();
      const pianoResonanceGain = ctx.createGain();
      pianoResonanceDelay.delayTime.setValueAtTime(0.015, now); // ~65Hz acoustic piano soundboard volume
      pianoResonanceGain.gain.setValueAtTime(0.20, now);

      voiceMainGainNode.connect(pianoResonanceDelay);
      pianoResonanceDelay.connect(pianoResonanceGain);
      pianoResonanceGain.connect(pianoResonanceDelay);
      pianoResonanceGain.connect(voiceDampFilter);

      // Felt Hammer strike knock transient (soft chime attack)
      const hammerOsc = ctx.createOscillator();
      const hammerGain = ctx.createGain();

      hammerOsc.type = "sine";
      hammerOsc.frequency.setValueAtTime(freq * 7.5, now); // very high attack chime knock
      hammerGain.gain.setValueAtTime(0.02 * velocity, now);
      hammerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      hammerOsc.connect(hammerGain);
      hammerGain.connect(voiceMainGainNode);

      hammerOsc.start(now);
      hammerOsc.stop(now + 0.1);
    }

    // Cozy slow volume ramp off at end of node duration
    voiceMainGainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  } catch (err) {
    console.warn("Audio Context blocked or physical modeling failed, graceful fallback:", err);
  }
}

// Woody/Stick Metronome Rim Click - Realistic percussion wood sound with strong first-beat accent option
export function playMetronomeTick(isAccent: boolean, isFirstBeatOfMeasure: boolean = false) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let pitch = 900;
    let filterFreq = 800;
    let gainVal = 0.28;

    if (isAccent) {
      if (isFirstBeatOfMeasure) {
        pitch = 1800;       // Clear chiming wood peak for Beat 1
        filterFreq = 1600;
        gainVal = 0.45;     // Extra strong volume punch!
      } else {
        pitch = 1400;       // Secondary accent
        filterFreq = 1200;
        gainVal = 0.35;
      }
    }

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, now);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.setValueAtTime(4.0, now); // tight resonance peak

    const volumeMultiplier = getSynthVolumeMultiplier();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gainVal * volumeMultiplier, now + 0.002);
    // Extends resonance decay slightly for the first beat
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isFirstBeatOfMeasure ? 0.05 : 0.03));

    osc.connect(filter);
    filter.connect(gainNode);
    connectToOutput(gainNode, ctx);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (err) {
    console.warn("Audio Context blocked or click generator failed:", err);
  }
}

// Elegant chords sweep playing helper
export function playChord(notes: { note: string; octave?: number }[], duration: number = 1.2) {
  notes.forEach((n, index) => {
    // Beautiful natural acoustic string sweep simulation (strum delay wanders between 16ms and 36ms organically)
    const humanStrumDelay = index * (18 + Math.random() * 15);
    const humanVelocity = 0.92 + Math.random() * 0.16;

    setTimeout(() => {
      playSynthNote(n.note, n.octave || 3, duration, humanVelocity);
    }, humanStrumDelay);
  });
}

// High-frequency bandpass-filtered noise burst simulating an egg shaker / percussion tick
export function playShakerTick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volumeMultiplier = getSynthVolumeMultiplier();
    
    // Create extremely short transient buffer source
    const noiseBuf = createNoiseBuffer(ctx, 0.015);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(7000, now); // super airy high frequency
    filter.Q.setValueAtTime(2.5, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.05 * volumeMultiplier, now); // subtle, not intrusive
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    source.connect(filter);
    filter.connect(gainNode);
    connectToOutput(gainNode, ctx);

    source.start(now);
  } catch (err) {
    // silent failure if blocked
  }
}

// High-Fidelity Music Looping Engine with Adaptive Strumming Profiles
export function playStrumPattern(
  notes: { note: string; octave?: number }[],
  step: number, // Representing eighth note step in the bar (usually 0-7 for 4/4, or 0-5 for 3/4 and 6/8)
  patternType: "pad" | "ballad" | "groove" | "arpeggio" | "jazz",
  bpm: number,
  timeSignature: "4/4" | "3/4" | "6/8" = "4/4",
  stepVelocity: number = 1.0,
  humanize: number = 20
) {
  if (notes.length === 0) return;
  function playSynthNote(noteName: string, octave: number = 3, duration: number = 0.8, velocity: number = 1.0) {
    // Elegant micro-humanization layer:
    // 1. Precise human finger-strike offset + custom humanize slider jitter (0 to humanize ms)
    const jitter = humanize > 0 ? Math.random() * humanize : 0;
    const humanDelay = (Math.random() * 6) + jitter;
    // 2. Muscle pressure fluctuation (flips velocity up or down, scaled slightly by humanize)
    const velJitterRange = 0.07 + (humanize / 100) * 0.15; // up to ±22% variation at max humanization (100)
    const humanVelocity = velocity * stepVelocity * ((1 - velJitterRange) + Math.random() * (velJitterRange * 2));

    setTimeout(() => {
      playSynthNoteInternal(noteName, octave, duration, humanVelocity);
    }, humanDelay);
  }

  const stepDuration = 60 / bpm / 2; // Duration of one eighth note in seconds

  const bassNote = notes[0]; // Fundamental/Root
  const chordNotes = notes.slice(1).length > 0 ? notes.slice(1) : notes; // Upper voices

  // 1. Specialized 3/4 (Waltz Time) Grooves
  if (timeSignature === "3/4") {
    switch (patternType) {
      case "ballad":
        // 3/4 Ballad strum (Waltz feel with 6 eighth-note steps)
        if (step === 0) {
          // Beat 1: Strong sweep
          notes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 3);
            }, idx * 28);
          });
        } else if (step === 2) {
          // Beat 2: down stroke
          chordNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 1.5);
            }, idx * 15);
          });
        } else if (step === 3) {
          // Beat 2.5: up stroke
          const reversedNotes = [...chordNotes].reverse();
          reversedNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 1.0);
            }, idx * 12);
          });
        } else if (step === 4) {
          // Beat 3: down stroke
          chordNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 1.5);
            }, idx * 15);
          });
        } else if (step === 5) {
          // Beat 3.5: light up stroke
          const reversedNotes = [...chordNotes].reverse();
          reversedNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 0.8);
            }, idx * 12);
          });
        }
        break;

      case "groove":
        // 3/4 Folk Waltz (Boom-Chick-Chick groove feel)
        if (step === 0) {
          // Strong bass note
          playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 2);
        } else if (step === 2) {
          // "Chick" chord downstrum (Beat 2)
          chordNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 1.5);
            }, idx * 15);
          });
        } else if (step === 3) {
          // Drum/metronome accent slap
          playMetronomeTick(false);
        } else if (step === 4) {
          // "Chick" chord downstrum (Beat 3)
          chordNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 1.5);
            }, idx * 15);
          });
        }
        break;

      case "arpeggio":
        // Waltzing Arpeggio (6 steps)
        {
          const arpeggioPattern = [
            { index: 0, octOffset: -1 }, // Root bass
            { index: 1, octOffset: 0 },  // 3rd
            { index: 2, octOffset: 0 },  // 5th
            { index: 0, octOffset: 0 },  // Root (high)
            { index: 2, octOffset: 0 },  // 5th
            { index: 1, octOffset: 0 }   // 3rd
          ];
          const config = arpeggioPattern[step];
          if (config) {
            const rawNote = notes[config.index % notes.length];
            const actualOctave = (rawNote.octave || 3) + config.octOffset;
            playSynthNote(rawNote.note, actualOctave, stepDuration * 3);
          }
        }
        break;

      case "jazz":
        // Jazz Waltz syncopations
        if (step === 0) {
          playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 2);
        } else if (step === 2) {
          // Syncopated stab on Beat 2
          chordNotes.forEach((n) => playSynthNote(n.note, n.octave || 3, stepDuration * 1));
        } else if (step === 3) {
          // Offbeat syncopation
          notes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 2);
            }, idx * 15);
          });
        } else if (step === 5) {
          // Light stab right before measure ends
          chordNotes.forEach((n) => playSynthNote(n.note, n.octave || 3, stepDuration * 0.8));
        }
        break;

      case "pad":
      default:
        if (step === 0) {
          notes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 5.5);
            }, idx * 35);
          });
        }
        break;
    }
    return;
  }

  // 2. Specialized 6/8 (Compound Duple Time) Grooves
  if (timeSignature === "6/8") {
    // 6/8 has 6 eighth beats, felt as: One (Strong) - two - three - Four (Medium) - five - six
    switch (patternType) {
      case "ballad":
        // Classic rolling 6/8 ballad
        if (step === 0) {
          // Pulse 1: Strong full chord down-strum
          notes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 2.8);
            }, idx * 25);
          });
        } else if (step === 2) {
          // Pulse 3: Light up-stroke
          const reversedNotes = [...chordNotes].reverse();
          reversedNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 1.0);
            }, idx * 10);
          });
        } else if (step === 3) {
          // Pulse 4: Medium down-stroke
          chordNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 2.5);
            }, idx * 15);
          });
        } else if (step === 5) {
          // Pulse 6: Soft up stroke
          const reversedNotes = [...chordNotes].reverse();
          reversedNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 0.8);
            }, idx * 10);
          });
        }
        break;

      case "groove":
        // 6/8 Syncopated groove
        if (step === 0) {
          // Bass Note on beat 1
          playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 3);
        } else if (step === 1) {
          // Lighter accompaniment feel
          chordNotes.forEach((n) => playSynthNote(n.note, n.octave || 3, stepDuration * 1));
        } else if (step === 3) {
          // Gentle slap + chord strike on beat 4
          playMetronomeTick(false);
          chordNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 2);
            }, idx * 15);
          });
        } else if (step === 5) {
          // Warm transition stroke
          const reversedNotes = [...chordNotes].reverse();
          reversedNotes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 0.8);
            }, idx * 12);
          });
        }
        break;

      case "arpeggio":
        // Classic rolling arpeggio (1-2-3-4-5-6)
        {
          const arp68 = [
            { index: 0, octOffset: -1 }, // Root bass
            { index: 1, octOffset: 0 },  // 3rd
            { index: 2, octOffset: 0 },  // 5th
            { index: 0, octOffset: 0 },  // Root (high)
            { index: 1, octOffset: 0 },  // 3rd
            { index: 2, octOffset: 0 }   // 5th
          ];
          const config = arp68[step];
          if (config) {
            const rawNote = notes[config.index % notes.length];
            const actualOctave = (rawNote.octave || 3) + config.octOffset;
            playSynthNote(rawNote.note, actualOctave, stepDuration * 2.8);
          }
        }
        break;

      case "jazz":
        // Syncopated modern Jazz 6/8 (Afro-Cuban influenced)
        if (step === 0) {
          playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 2);
        } else if (step === 2) {
          chordNotes.forEach((n) => playSynthNote(n.note, n.octave || 3, stepDuration * 1));
        } else if (step === 4) {
          notes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 1.8);
            }, idx * 15);
          });
        }
        break;

      case "pad":
      default:
        if (step === 0) {
          notes.forEach((n, idx) => {
            setTimeout(() => {
              playSynthNote(n.note, n.octave || 3, stepDuration * 5.5);
            }, idx * 35);
          });
        }
        break;
    }
    return;
  }

  // 3. Specialized 4/4 Timing Grooves (Original)
  switch (patternType) {
    case "ballad":
      // Classic Steady Ballad Strum (8-Step eighth-note flow)
      if (step === 0) {
        // Beat 1: Warm Organic sweeping down-strum
        notes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 3.5);
          }, idx * 28); // 28ms string strum offset
        });
      } else if (step === 1) {
        // Beat 1.5: Light bass ring
        playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 1.5);
      } else if (step === 2) {
        // Beat 2: Confident mid-voices down-strum
        chordNotes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 1.8);
          }, idx * 15);
        });
      } else if (step === 3) {
        // Beat 2.5: Fast up-strum (high notes only)
        const reversedNotes = [...chordNotes].reverse();
        reversedNotes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 1.2);
          }, idx * 10);
        });
      } else if (step === 4) {
        // Beat 3: Solid bass thumb pluck
        playSynthNote(bassNote.note, bassNote.octave || 3, stepDuration * 2);
      } else if (step === 5) {
        // Beat 3.5: Light chord fill
        chordNotes.forEach((n) => {
          playSynthNote(n.note, n.octave || 3, stepDuration * 1.5);
        });
      } else if (step === 6) {
        // Beat 4: Bold full down-strum
        notes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 1.6);
          }, idx * 25);
        });
      } else if (step === 7) {
        // Beat 4.5: Lighter up-bounce strum
        const reversedNotes = [...chordNotes].reverse();
        reversedNotes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 0.9);
          }, idx * 12);
        });
      }
      break;

    case "groove":
      // Chill Acoustic Slap/Percussion (Alternating percussion slaps and juicy sweeps)
      if (step === 0) {
        // Full lush chord sweep
        notes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 4);
          }, idx * 45); // highly premium slow arpeggiated sweep
        });
      } else if (step === 2) {
        // SLAP/PERCUSSION CLICK: hand lands on string bed
        playMetronomeTick(false);
      } else if (step === 4) {
        // Bass note pop + quick chord splash
        playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 2.5);
        setTimeout(() => {
          chordNotes.forEach((n, idx) => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 2);
          });
        }, 80);
      } else if (step === 6) {
        // SLAP/PERCUSSION CLICK
        playMetronomeTick(false);
      } else if (step === 7) {
        // Soft up-sweep before measure turns
        const reversedNotes = [...chordNotes].reverse();
        reversedNotes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 0.8);
          }, idx * 15);
        });
      }
      break;

    case "arpeggio":
      // Dreamy Classical Arpeggio flowing notes step-by-step
      {
        const arpeggioPattern = [
          { index: 0, octOffset: -1 }, // Root bass
          { index: 1, octOffset: 0 },  // 3rd
          { index: 2, octOffset: 0 },  // 5th
          { index: 1, octOffset: 0 },  // 3rd
          { index: 0, octOffset: 0 },  // Root octave up
          { index: 2, octOffset: 0 },  // 5th
          { index: 1, octOffset: 0 },  // 3rd
          { index: 2, octOffset: 1 }   // High chime
        ];
        const stepNoteConfig = arpeggioPattern[step];
        if (stepNoteConfig) {
          const rawNote = notes[stepNoteConfig.index % notes.length];
          const actualOctave = (rawNote.octave || 3) + stepNoteConfig.octOffset;
          playSynthNote(rawNote.note, actualOctave, stepDuration * 3.2);
        }
      }
      break;

    case "jazz":
      // Jazz Swing / Bossanova Syncopated feel (emphasizing offbeats)
      if (step === 0) {
        // Cool walking bass root
        playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 2);
      } else if (step === 2) {
        // Light syncopated chord stab
        chordNotes.forEach((n) => playSynthNote(n.note, n.octave || 3, stepDuration * 0.9));
      } else if (step === 3) {
        // Syncopated off-beat punch (laid-back feel)
        notes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 3);
          }, idx * 15);
        });
      } else if (step === 5) {
        // Soft responsive chord stab
        chordNotes.forEach((n) => playSynthNote(n.note, n.octave || 3, stepDuration * 1.4));
      } else if (step === 6) {
        // Walking bass fifth
        playSynthNote(bassNote.note, (bassNote.octave || 3) - 1, stepDuration * 1.5);
      }
      break;

    case "pad":
    default:
      // Regular Warm Pad Sweep - Plays on beat 1 for long lingering resonance
      if (step === 0) {
        notes.forEach((n, idx) => {
          setTimeout(() => {
            playSynthNote(n.note, n.octave || 3, stepDuration * 7.5);
          }, idx * 35);
        });
      }
      break;
  }
}

const SEMITONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SEMITONE_FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function getNoteWithOffset(root: string, octaveOffsetInput: number, semitoneOffset: number): { note: string; octave: number } {
  let isFlat = root.includes("b") || root === "F";
  const scale = isFlat ? SEMITONE_FLATS : SEMITONES;
  let idx = scale.indexOf(root);
  if (idx === -1) {
    idx = SEMITONES.indexOf(root);
    if (idx === -1) idx = SEMITONE_FLATS.indexOf(root);
    if (idx === -1) idx = 0;
  }
  
  let targetIdx = idx + semitoneOffset;
  let octaveCarry = Math.floor(targetIdx / 12);
  let finalIdx = ((targetIdx % 12) + 12) % 12;
  
  return {
    note: scale[finalIdx],
    octave: octaveOffsetInput + octaveCarry
  };
}

export function getChordVoicing(chordName: string, activeSound: SoundCharacteristic): { note: string; octave?: number }[] {
  const match = chordName.match(/^([A-G]#?|Bb|Db|Eb|Gb|Ab|[A-G]b?)/);
  if (!match) return [{ note: "A", octave: 3 }];
  
  let root = match[1];
  const isMinor = chordName.includes("m") && !chordName.includes("major") && !chordName.includes("maj");
  const is7th = chordName.includes("7");
  const isMaj7 = chordName.includes("maj7") || chordName.includes("Maj7");

  const semitone3rd = isMinor ? 3 : 4;
  const semitone5th = 7;
  const semitone7th = isMaj7 ? 11 : 10;
  
  const notes: { note: string; octave: number }[] = [];

  if (activeSound === "acoustic_piano") {
    // 1. Deep Bass Root
    notes.push(getNoteWithOffset(root, 2, 0));
    // 2. Tenor Fifth
    notes.push(getNoteWithOffset(root, 2, semitone5th));
    // 3. Right Hand Third
    notes.push(getNoteWithOffset(root, 3, semitone3rd));
    // 4. Right Hand Fifth
    notes.push(getNoteWithOffset(root, 3, semitone5th));
    // 5. Right Hand Octave Root
    notes.push(getNoteWithOffset(root, 4, 0));
    // 6. Right Hand 7th if 7th chord
    if (is7th) {
      notes.push(getNoteWithOffset(root, 4, semitone7th));
    }
  } else if (activeSound === "vintage_rhodes") {
    // 1. Warm Bass Root
    notes.push(getNoteWithOffset(root, 2, 0));
    // 2. Sweet Tenor Third
    notes.push(getNoteWithOffset(root, 3, semitone3rd));
    // 3. Mellow Fifth or 7th in middle
    notes.push(getNoteWithOffset(root, 3, is7th ? semitone7th : semitone5th));
    // 4. Creamy 9th (Rhodes signature tension)
    notes.push(getNoteWithOffset(root, 4, 2));
    // 5. High Sparkly Chime Tine (5th)
    notes.push(getNoteWithOffset(root, 4, semitone5th));
  } else {
    // STEEL GUITAR SIX-STRING STRUM
    const isLowRoot = ["E", "F", "F#", "G", "Ab", "A"].includes(root);
    const baseOctave = isLowRoot ? 2 : 3;

    notes.push(getNoteWithOffset(root, baseOctave, 0));
    notes.push(getNoteWithOffset(root, baseOctave, semitone5th));
    notes.push(getNoteWithOffset(root, baseOctave + 1, 0));
    notes.push(getNoteWithOffset(root, baseOctave + 1, semitone3rd));
    notes.push(getNoteWithOffset(root, baseOctave + 1, is7th ? semitone7th : semitone5th));
    notes.push(getNoteWithOffset(root, baseOctave + 2, 0));
  }

  return notes;
}
