import { useState } from 'react'
import { Piano } from './components/Piano/Piano'
import { Guitar } from './components/Guitar/Guitar'
import { DrumPad } from './components/DrumPad/DrumPad'
import { Sequencer } from './components/Sequencer/Sequencer'
import { TheoryLesson } from './components/TheoryLesson/TheoryLesson'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('piano')

  const tabs = [
    { id: 'piano', label: '🎹 Piano', Component: Piano },
    { id: 'guitar', label: '🎸 Gitar', Component: Guitar },
    { id: 'drums', label: '🥁 Davul', Component: DrumPad },
    { id: 'sequencer', label: '⏭️ Sekvenser', Component: Sequencer },
    { id: 'theory', label: '🎼 Teori', Component: TheoryLesson },
  ]

  const activeTabObj = tabs.find(t => t.id === activeTab)
  const ActiveComponent = activeTabObj?.Component || Piano

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎵 OctoMusic - Intelligent Music AI</h1>
        <p>Müzik teorisi öğren ve her türlü enstrümanı çal</p>
      </header>

      <nav className="app-nav">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        <ActiveComponent />
      </main>

      <footer className="app-footer">
        <p>🎵 OctoMusic v1.0 - Hibrit Müzik Platformu | Ses kalitesi için Chrome/Firefox önerilir</p>
      </footer>
    </div>
  )
}

export default App
