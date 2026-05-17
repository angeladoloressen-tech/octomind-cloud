import * as Tone from 'tone';

class SynthEngine {
  constructor() {
    this.synth = null;
    this.initialized = false;
    this.currentInstrument = 'piano';
    this.masterVolume = -12;
  }

  async initialize() {
    if (this.initialized) return;
    
    await Tone.start();
    
    // Piano synth
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();
    
    this.synth.volume.value = this.masterVolume;
    this.initialized = true;
  }

  playNote(frequency, duration = '8n') {
    if (!this.initialized) return;
    this.synth.triggerAttackRelease(frequency, duration);
  }

  playNoteByName(noteName, duration = '8n') {
    if (!this.initialized) return;
    this.synth.triggerAttackRelease(noteName, duration);
  }

  playChord(noteNames, duration = '4n') {
    if (!this.initialized) return;
    this.synth.triggerAttackRelease(noteNames, duration);
  }

  setVolume(value) {
    this.masterVolume = value;
    if (this.synth) {
      this.synth.volume.value = value;
    }
  }

  dispose() {
    if (this.synth) {
      this.synth.dispose();
    }
  }
}

export const synthEngine = new SynthEngine();
