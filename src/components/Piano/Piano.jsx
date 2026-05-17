import { useState, useEffect } from 'react';
import { synthEngine } from '../../synth/synthEngine';
import { NOTES } from '../../theory/musicTheory';
import './Piano.css';

export function Piano() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeNotes, setActiveNotes] = useState(new Set());

  useEffect(() => {
    const init = async () => {
      await synthEngine.initialize();
      setIsInitialized(true);
    };
    init();

    return () => {
      synthEngine.dispose();
    };
  }, []);

  const handleKeyDown = (noteName) => {
    if (isInitialized && !activeNotes.has(noteName)) {
      synthEngine.playNoteByName(noteName, '16n');
      setActiveNotes((prev) => new Set([...prev, noteName]));
    }
  };

  const handleKeyUp = (noteName) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(noteName);
      return next;
    });
  };

  const startOctave = 4;
  const octaveRange = 2;
  const pianoKeys = [];

  for (let octave = startOctave; octave < startOctave + octaveRange; octave++) {
    for (const note of NOTES) {
      const fullNoteName = note + octave;
      pianoKeys.push(fullNoteName);
    }
  }

  return (
    <div className="piano-container">
      <h2>🎹 OctoMusic Piano</h2>
      <p>{isInitialized ? 'Ready to play!' : 'Initializing audio...'}</p>
      
      <div className="piano-keyboard">
        {pianoKeys.map((noteName) => {
          const isSharp = noteName.includes('#');
          const isActive = activeNotes.has(noteName);
          
          return (
            <button
              key={noteName}
              className={`piano-key ${isSharp ? 'sharp' : 'white'} ${isActive ? 'active' : ''}`}
              onMouseDown={() => handleKeyDown(noteName)}
              onMouseUp={() => handleKeyUp(noteName)}
              onMouseLeave={() => handleKeyUp(noteName)}
              title={noteName}
            >
              <span className="key-label">{noteName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
