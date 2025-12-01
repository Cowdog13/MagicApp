import { useState } from 'react'
import './GameSetup.css'

function GameSetup({ onStartGame }) {
  const [playerCount, setPlayerCount] = useState(2)
  const [startingLife, setStartingLife] = useState(40)
  const [timerMinutes, setTimerMinutes] = useState(20)
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4'])
  const [turnOrder, setTurnOrder] = useState([0, 1, 2, 3])

  const handlePlayerNameChange = (index, name) => {
    const newNames = [...playerNames]
    newNames[index] = name || `Player ${index + 1}`
    setPlayerNames(newNames)
  }

  const handleStartGame = () => {
    const config = {
      playerCount,
      startingLife,
      timerSeconds: timerMinutes * 60,
      players: turnOrder.slice(0, playerCount).map(orderIndex => ({
        name: playerNames[orderIndex],
        originalIndex: orderIndex
      }))
    }
    onStartGame(config)
  }

  const moveTurnOrder = (index, direction) => {
    if (index + direction < 0 || index + direction >= playerCount) return
    const newOrder = [...turnOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + direction]
    newOrder[index + direction] = temp
    setTurnOrder(newOrder)
  }

  return (
    <div className="game-setup">
      <h1>MTG Life Counter</h1>

      <div className="setup-section">
        <label>Number of Players</label>
        <div className="button-group">
          {[2, 3, 4].map(count => (
            <button
              key={count}
              className={playerCount === count ? 'active' : ''}
              onClick={() => setPlayerCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="setup-section">
        <label>Starting Life</label>
        <input
          type="number"
          value={startingLife}
          onChange={(e) => setStartingLife(Number(e.target.value))}
          min="1"
        />
      </div>

      <div className="setup-section">
        <label>Timer Per Player (minutes)</label>
        <input
          type="number"
          value={timerMinutes}
          onChange={(e) => setTimerMinutes(Number(e.target.value))}
          min="1"
        />
      </div>

      <div className="setup-section">
        <label>Turn Order (top = first player)</label>
        <div className="turn-order-list">
          {turnOrder.slice(0, playerCount).map((playerIndex, orderIndex) => (
            <div key={orderIndex} className="turn-order-item">
              <div className="order-controls">
                <button
                  onClick={() => moveTurnOrder(orderIndex, -1)}
                  disabled={orderIndex === 0}
                  className="order-btn"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveTurnOrder(orderIndex, 1)}
                  disabled={orderIndex === playerCount - 1}
                  className="order-btn"
                >
                  ▼
                </button>
              </div>
              <span className="order-number">{orderIndex + 1}.</span>
              <input
                type="text"
                value={playerNames[playerIndex]}
                onChange={(e) => handlePlayerNameChange(playerIndex, e.target.value)}
                placeholder={`Player ${playerIndex + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="start-button" onClick={handleStartGame}>
        Start Game
      </button>
    </div>
  )
}

export default GameSetup
