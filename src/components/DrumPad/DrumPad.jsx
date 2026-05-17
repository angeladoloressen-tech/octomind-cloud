import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import './DrumPad.css';

export function DrumPad() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activePad, setActivePad] = useState(null);
  const [drums, setDrums] = useState(null);

  const drumSounds = [
    { name: 'Kick', freq: 60, icon: '🥁', color: '#FF6B6B' },
    { name: 'Snare', freq: 200, icon: '🎯', color: '#4ECDC4' },
    { name: 'HiHat', freq: 8000, icon: '⚡', color: '#45B7D1' },
    { name: 'Tom', freq: 400, icon: '🎪', color: '#96CEB4' },
    { name: 'Clap', freq: 150, icon: '👏', color: '#FFEAA7' },
    { name: 'Cowbell', freq: 1200, icon: '🔔', color: '#DDA15E' },
  ];

  useEffect(() => {
    const init = async () => {
      await Tone.start();
      
      const drumKit = {
        kick: new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
        }).toDestination(),
        snare: new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05 },
        }).toDestination(),
        hihat: new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'square' },
          envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.02 },
        }).toDestination(),
        tom: new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.08 },
        }).toDestination(),
        clap: new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.08, sustain: 0, release: 0.04 },
        }).toDestination(),
        cowbell: new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.02, decay: 0.15, sustain: 0, release: 0.1 },
        }).toDestination(),
      };

      setDrums(drumKit);
      setIsInitialized(true);
    };

    init();
  }, []);

  const handlePadClick = (index) => {
    if (!isInitialized || !drums) return;

    const soundKey = Object.keys(drums)[index];
    const drum = drums[soundKey];
    const sound = drumSounds[index];

    drum.triggerAttackRelease(sound.freq, '16n');
    setActivePad(index);
    setTimeout(() => setActivePad(null), 100);
  };

  return (
    <div className="drum-container">
      <h2>🥁 Davul Pad</h2>
      <p>{isInitialized ? "Pad'lere tıkla!" : 'Yükleniyor...'}</p>

      <div className="drum-grid">
        {drumSounds.map((sound, index) => (
          <button
            key={index}
            className={`drum-pad ${activePad === index ? 'active' : ''}`}
            style={{ backgroundColor: sound.color }}
            onClick={() => handlePadClick(index)}
            title={sound.name}
          >
            <span className="pad-icon">{sound.icon}</span>
            <span className="pad-name">{sound.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
