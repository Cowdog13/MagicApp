import { useState } from 'react'
import GameSetup from './components/GameSetup'
import GameBoard from './components/GameBoard'
import './App.css'

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameConfig, setGameConfig] = useState(null)

  const startGame = (config) => {
    setGameConfig(config)
    setGameStarted(true)
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameConfig(null)
  }

  return (
    <div className="app">
      {!gameStarted ? (
        <GameSetup onStartGame={startGame} />
      ) : (
        <GameBoard config={gameConfig} onReset={resetGame} />
      )}
    </div>
  )
}

export default App
