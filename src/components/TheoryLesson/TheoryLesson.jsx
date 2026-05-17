import { useState } from 'react';
import { synthEngine } from '../../synth/synthEngine';
import { getScaleNotes, getChordNotes } from '../../theory/musicTheory';
import './TheoryLesson.css';

export function TheoryLesson() {
  const [selectedScale, setSelectedScale] = useState('major');
  const [selectedChord, setSelectedChord] = useState('major');
  const [rootNote, setRootNote] = useState('C');

  const scaleTypes = {
    major: 'Major (Majör)',
    minor: 'Minor (Minör)',
    pentatonic_major: 'Pentatonic Major',
    pentatonic_minor: 'Pentatonic Minor',
    blues: 'Blues',
  };

  const chordTypes = {
    major: 'Major (Maj)',
    minor: 'Minor (min)',
    dim: 'Diminished (dim)',
    aug: 'Augmented (aug)',
    maj7: 'Major 7 (maj7)',
    min7: 'Minor 7 (min7)',
    dom7: 'Dominant 7 (7)',
  };

  const handlePlayScale = async () => {
    await synthEngine.initialize();
    const notes = getScaleNotes(rootNote, selectedScale, 1);
    
    for (const note of notes) {
      synthEngine.playNoteByName(note.name, '8n');
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  const handlePlayChord = async () => {
    await synthEngine.initialize();
    const notes = getChordNotes(rootNote, selectedChord, 4);
    synthEngine.playChord(notes, '2n');
  };

  return (
    <div className="theory-container">
      <h2>🎼 Müzik Teorisi</h2>

      <div className="lesson-section">
        <h3>Skalalar (Scales)</h3>
        <div className="controls">
          <div className="control-group">
            <label>Root Note:</label>
            <select value={rootNote} onChange={(e) => setRootNote(e.target.value)}>
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Scale Type:</label>
            <select value={selectedScale} onChange={(e) => setSelectedScale(e.target.value)}>
              {Object.entries(scaleTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button className="play-btn" onClick={handlePlayScale}>
            ▶ Play Scale
          </button>
        </div>
        <p className="info">
          <strong>{rootNote} {scaleTypes[selectedScale]}</strong> skalasını dinle.
        </p>
      </div>

      <div className="lesson-section">
        <h3>Akorlar (Chords)</h3>
        <div className="controls">
          <div className="control-group">
            <label>Chord Type:</label>
            <select value={selectedChord} onChange={(e) => setSelectedChord(e.target.value)}>
              {Object.entries(chordTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button className="play-btn" onClick={handlePlayChord}>
            ▶ Play Chord
          </button>
        </div>
        <p className="info">
          <strong>{rootNote} {chordTypes[selectedChord]}</strong> akordunu dinle.
        </p>
      </div>
    </div>
  );
}
