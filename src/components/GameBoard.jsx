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
  const timerRef = useRef(null)
  const buttonTimeouts = useRef({})

  const activeTimerPlayer = activePriorityPlayer !== null ? activePriorityPlayer : currentTurnIndex

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Create new timer
    timerRef.current = setInterval(() => {
      setPlayers(prev => {
        const updated = [...prev]
        if (updated[activeTimerPlayer] && updated[activeTimerPlayer].timeRemaining > 0) {
          updated[activeTimerPlayer].timeRemaining -= 1
        }
        return updated
      })
    }, 1000)

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [activeTimerPlayer])

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

      // Prevent double-trigger within 300ms
      if (lastClick && now - lastClick < 300) {
        return
      }

      // Record this click
      buttonTimeouts.current[buttonId] = now

      // Execute callback
      callback()
    }
  }, [])

  const passTurn = () => {
    setActivePriorityPlayer(null)
    setCurrentTurnIndex((prev) => (prev + 1) % config.playerCount)
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
          className="reset-btn"
          onPointerDown={handleButtonClick(handleReset, 'reset')}
        >
          Reset Game
        </button>
      </div>

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
