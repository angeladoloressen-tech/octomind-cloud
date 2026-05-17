// Müzik notaları
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_TO_MIDI = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11
};

export const MIDI_TO_NOTE = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
  6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B'
};

// Skalalar
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

// Akorlar (3 nota kombinasyonları)
export const CHORD_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  minmaj7: [0, 3, 7, 11],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

// Skala sesleri al (root nota ve oktav ile)
export function getScaleNotes(rootNote, scaleType = 'major', octaves = 1) {
  const rootIndex = NOTE_TO_MIDI[rootNote] || 0;
  const scalePattern = SCALES[scaleType] || SCALES.major;
  const notes = [];

  for (let o = 0; o < octaves; o++) {
    for (const interval of scalePattern) {
      const midiNote = rootIndex + interval + (o * 12);
      const noteName = MIDI_TO_NOTE[interval] + (4 + o);
      notes.push({ name: noteName, midi: midiNote });
    }
  }

  return notes;
}

// Akord sesleri al
export function getChordNotes(rootNote, chordType = 'major', octave = 4) {
  const rootIndex = NOTE_TO_MIDI[rootNote] || 0;
  const intervals = CHORD_INTERVALS[chordType] || CHORD_INTERVALS.major;

  return intervals.map((interval) => {
    const midiNote = rootIndex + interval;
    const noteName = MIDI_TO_NOTE[midiNote % 12] + octave;
    return noteName;
  });
}

// MIDI numarasından nota adı
export function midiToNoteName(midiNumber) {
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  return MIDI_TO_NOTE[noteIndex] + octave;
}

// Nota adından frekans (Hz)
export function noteNameToFrequency(noteName) {
  const A4 = 440;
  const notePattern = /^([A-G]#?)(\d+)$/;
  const match = noteName.match(notePattern);
  
  if (!match) return 440;
  
  const [, note, octave] = match;
  const noteIndex = NOTE_TO_MIDI[note];
  const midiNumber = (parseInt(octave) + 1) * 12 + noteIndex;
  const semitones = midiNumber - 69;
  
  return A4 * Math.pow(2, semitones / 12);
}
