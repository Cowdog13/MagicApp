import { useState, useEffect, useRef, useCallback } from 'react'
import PlayerPanel from './PlayerPanel'
import CommanderDamage from './CommanderDamage'
import './GameBoard.css'

function GameBoard({ config, onReset }) {
  const [players, setPlayers] = useState(
    config.players.map((player, index) => ({
      ...player,
      life: config.startingLife,
      timeRemaining: config.timerSeconds,
      commanderDamage: Array(config.playerCount).fill(0)
    }))
  )

  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [activePriorityPlayer, setActivePriorityPlayer] = useState(null)
  const [showCommanderDamage, setShowCommanderDamage] = useState(false)
  const [selectedPlayerForCmdr, setSelectedPlayerForCmdr] = useState(null)
  const [gamePhase, setGamePhase] = useState('selecting') // 'selecting' | 'playing'
  const [timerPaused, setTimerPaused] = useState(false)
  const timerRef = useRef(null)
  const buttonTimeouts = useRef({})

  const activeTimerPlayer = activePriorityPlayer !== null ? activePriorityPlayer : currentTurnIndex

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (gamePhase !== 'playing' || timerPaused) {
      return
    }

    timerRef.current = setInterval(() => {
      setPlayers(prev => {
        const updated = [...prev]
        if (updated[activeTimerPlayer] && updated[activeTimerPlayer].timeRemaining > 0) {
          updated[activeTimerPlayer].timeRemaining -= 1
        }
        return updated
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [activeTimerPlayer, gamePhase, timerPaused])

  const updateLife = (playerIndex, delta) => {
    setPlayers(prev => {
      const updated = [...prev]
      updated[playerIndex].life = Math.max(0, updated[playerIndex].life + delta)
      return updated
    })
  }

  const handleButtonClick = useCallback((callback, buttonId) => {
    return (e) => {
      e.preventDefault()
      e.stopPropagation()

      const now = Date.now()
      const lastClick = buttonTimeouts.current[buttonId]

      // Prevent double-trigger within 100ms
      if (lastClick && now - lastClick < 100) {
        return
      }

      // Record this click
      buttonTimeouts.current[buttonId] = now

      // Execute callback
      callback()
    }
  }, [])

  const selectFirstPlayer = (playerIndex) => {
    setCurrentTurnIndex(playerIndex)
    setGamePhase('playing')
  }

  const passTurn = () => {
    setActivePriorityPlayer(null)
    setCurrentTurnIndex((prev) => {
      let next = (prev + 1) % config.playerCount
      let attempts = 0
      // Skip dead players (life < 1), but don't infinite loop if all are dead
      while (players[next]?.life < 1 && attempts < config.playerCount) {
        next = (next + 1) % config.playerCount
        attempts++
      }
      return next
    })
  }

  const togglePriority = (playerIndex) => {
    if (activePriorityPlayer === playerIndex) {
      setActivePriorityPlayer(null)
    } else {
      setActivePriorityPlayer(playerIndex)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const openCommanderDamage = (playerIndex) => {
    setSelectedPlayerForCmdr(playerIndex)
    setShowCommanderDamage(true)
  }

  const updateCommanderDamage = (receivingPlayer, dealingPlayer, delta) => {
    setPlayers(prev => {
      const updated = [...prev]
      const oldDamage = updated[receivingPlayer].commanderDamage[dealingPlayer]
      const newDamage = Math.max(0, oldDamage + delta)
      const actualDelta = newDamage - oldDamage

      // Update commander damage
      updated[receivingPlayer].commanderDamage[dealingPlayer] = newDamage

      // Also reduce life by the same amount
      updated[receivingPlayer].life = Math.max(0, updated[receivingPlayer].life - actualDelta)

      return updated
    })
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the game?')) {
      onReset()
    }
  }

  return (
    <div className="game-board">
      <div className={`players-grid players-${config.playerCount}`}>
        {players.map((player, index) => (
          <div key={index} className={`player-container ${index < 2 ? 'rotated' : ''}`}>
            <PlayerPanel
              player={player}
              playerIndex={index}
              isCurrentTurn={currentTurnIndex === index}
              hasActivePriority={activePriorityPlayer === index}
              isDead={player.life < 1}
              onLifeChange={(delta) => updateLife(index, delta)}
              onTogglePriority={() => togglePriority(index)}
              onOpenCommanderDamage={() => openCommanderDamage(index)}
              onPassTurn={passTurn}
              formatTime={formatTime}
              allPlayers={players}
            />
          </div>
        ))}
      </div>

      <div className="game-controls">
        <button
          className={`pause-btn ${timerPaused ? 'paused' : ''}`}
          onPointerDown={handleButtonClick(() => setTimerPaused(p => !p), 'pause')}
        >
          {timerPaused ? 'Resume Timer' : 'Pause Timer'}
        </button>
        <button
          className="reset-btn"
          onPointerDown={handleButtonClick(handleReset, 'reset')}
        >
          Reset Game
        </button>
      </div>

      {gamePhase === 'selecting' && (
        <div className="first-player-overlay">
          <div className="first-player-modal">
            <h2>Who goes first?</h2>
            <div className="first-player-buttons">
              {players.map((player, index) => (
                <button
                  key={index}
                  className="first-player-btn"
                  onPointerDown={() => selectFirstPlayer(index)}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCommanderDamage && (
        <CommanderDamage
          player={players[selectedPlayerForCmdr]}
          playerIndex={selectedPlayerForCmdr}
          allPlayers={players}
          onUpdateDamage={updateCommanderDamage}
          onClose={() => setShowCommanderDamage(false)}
        />
      )}
    </div>
  )
}

export default GameBoard
