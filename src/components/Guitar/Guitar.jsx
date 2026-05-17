import { useState } from 'react';
import { synthEngine } from '../../synth/synthEngine';
import './Guitar.css';

export function Guitar() {
  const [selectedFret, setSelectedFret] = useState(null);

  const guitarStrings = [
    { name: 'E', color: '#FF6B6B', notes: ['E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5'] },
    { name: 'B', color: '#4ECDC4', notes: ['B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4'] },
    { name: 'G', color: '#45B7D1', notes: ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4'] },
    { name: 'D', color: '#96CEB4', notes: ['D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4'] },
    { name: 'A', color: '#FFEAA7', notes: ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3'] },
    { name: 'E', color: '#DDA15E', notes: ['E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3'] },
  ];

  const handleFretClick = async (stringIndex, fretIndex) => {
    await synthEngine.initialize();
    const note = guitarStrings[stringIndex].notes[fretIndex];
    synthEngine.playNoteByName(note, '8n');
    setSelectedFret({ stringIndex, fretIndex });
    setTimeout(() => setSelectedFret(null), 200);
  };

  return (
    <div className="guitar-container">
      <h2>🎸 Gitar</h2>
      <p>Fret'e tıkla ve ses dinle</p>

      <div className="guitar">
        {guitarStrings.map((string, stringIndex) => (
          <div key={stringIndex} className="string-container">
            <div className="string-label">{string.name}</div>
            <div className="frets">
              {string.notes.map((note, fretIndex) => (
                <button
                  key={`${stringIndex}-${fretIndex}`}
                  className={`fret ${
                    selectedFret?.stringIndex === stringIndex && selectedFret?.fretIndex === fretIndex
                      ? 'active'
                      : ''
                  }`}
                  style={{
                    backgroundColor: string.color,
                    opacity:
                      selectedFret?.stringIndex === stringIndex && selectedFret?.fretIndex === fretIndex
                        ? 1
                        : 0.6,
                  }}
                  onClick={() => handleFretClick(stringIndex, fretIndex)}
                  title={note}
                >
                  {fretIndex}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
