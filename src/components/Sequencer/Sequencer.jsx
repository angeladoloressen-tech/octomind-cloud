import { useState, useEffect, useMemo } from 'react';
import { synthEngine } from '../../synth/synthEngine';
import './Sequencer.css';

export function Sequencer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [grid, setGrid] = useState(
    Array(16).fill(null).map(() => Array(8).fill(false))
  );
  const [currentStep, setCurrentStep] = useState(0);

  const notes = useMemo(() => ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], []);

  useEffect(() => {
    if (!isPlaying) return;

    const playStep = async () => {
      setCurrentStep((prev) => (prev + 1) % 16);
    };

    const intervalTime = (60 / tempo) * 1000;
    const interval = setInterval(playStep, intervalTime / 4);

    return () => clearInterval(interval);
  }, [isPlaying, tempo]);

  useEffect(() => {
    const playNote = async () => {
      if (!isPlaying) return;

      for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
        if (grid[currentStep][noteIndex]) {
          await synthEngine.initialize();
          synthEngine.playNoteByName(notes[noteIndex], '16n');
        }
      }
    };

    playNote();
  }, [currentStep, isPlaying, grid, notes]);

  const toggleCell = (stepIndex, noteIndex) => {
    const newGrid = grid.map((row) => [...row]);
    newGrid[stepIndex][noteIndex] = !newGrid[stepIndex][noteIndex];
    setGrid(newGrid);
  };

  const clearGrid = () => {
    setGrid(Array(16).fill(null).map(() => Array(8).fill(false)));
  };

  const playPattern = () => {
    setIsPlaying(true);
  };

  const stopPattern = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="sequencer-container">
      <h2>⏭️ Sekvenser</h2>

      <div className="sequencer-controls">
        <div className="control-group">
          <label>Tempo (BPM):</label>
          <input
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
          />
          <span>{tempo}</span>
        </div>

        <div className="button-group">
          <button
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={playPattern}
            disabled={isPlaying}
          >
            ▶ Çal
          </button>
          <button className="stop-btn" onClick={stopPattern} disabled={!isPlaying}>
            ⏹ Durdur
          </button>
          <button className="clear-btn" onClick={clearGrid}>
            🗑 Temizle
          </button>
        </div>
      </div>

      <div className="sequencer-grid">
        <div className="note-labels">
          {notes.map((note) => (
            <div key={note} className="note-label">
              {note}
            </div>
          ))}
        </div>

        <div className="grid-container">
          {grid.map((row, stepIndex) => (
            <div key={stepIndex} className={`step ${currentStep === stepIndex ? 'current' : ''}`}>
              {row.map((active, noteIndex) => (
                <button
                  key={`${stepIndex}-${noteIndex}`}
                  className={`grid-cell ${active ? 'active' : ''}`}
                  onClick={() => toggleCell(stepIndex, noteIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
