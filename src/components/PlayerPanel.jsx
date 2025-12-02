import { useRef, useCallback } from 'react'
import './PlayerPanel.css'

function PlayerPanel({
  player,
  playerIndex,
  isCurrentTurn,
  hasActivePriority,
  onLifeChange,
  onTogglePriority,
  onOpenCommanderDamage,
  onPassTurn,
  formatTime,
  allPlayers
}) {
  const isActiveTimer = isCurrentTurn || hasActivePriority
  const buttonTimeouts = useRef({})

  const handleButtonClick = useCallback((callback, buttonId) => {
    return (e) => {
      e.preventDefault()
      e.stopPropagation()

      const now = Date.now()
      const lastClick = buttonTimeouts.current[buttonId]

      // Prevent double-trigger within 100ms (handles both touch->mouse and rapid clicks)
      if (lastClick && now - lastClick < 100) {
        return
      }

      // Record this click
      buttonTimeouts.current[buttonId] = now

      // Execute callback
      callback()
    }
  }, [])

  const playerPositionClass = `player-${playerIndex + 1}`

  return (
    <div className={`player-panel ${isActiveTimer ? 'active' : ''} ${playerPositionClass}`}>
      <div className="life-section">
        <div className="player-header">
          <h2>{player.name || `P${playerIndex + 1}`}</h2>
          <div className="header-right">
            {isCurrentTurn && !hasActivePriority && (
              <span className="turn-indicator">• Turn</span>
            )}
            {hasActivePriority && (
              <span className="priority-indicator">• Priority</span>
            )}
          </div>
        </div>

        <div className="timer-display" style={{ color: player.timeRemaining < 60 ? '#ff4444' : '#ffd700' }}>
          {formatTime(player.timeRemaining)}
        </div>

        <div className="life-counter">
          <button
            className="life-btn decrease"
            onPointerDown={handleButtonClick(() => onLifeChange(-1), 'life-1')}
          >
            -
          </button>
          <div className="life-display">
            <div className="life-value">{player.life}</div>
            <div className="life-label">Life</div>
          </div>
          <button
            className="life-btn increase"
            onPointerDown={handleButtonClick(() => onLifeChange(1), 'life+1')}
          >
            +
          </button>
        </div>

        <div className="commander-damage-display">
          {allPlayers.map((opponent, opponentIndex) => {
            if (opponentIndex === playerIndex) return <div key={opponentIndex} className="cmdr-dmg-spacer"></div>
            const damage = player.commanderDamage[opponentIndex]
            if (damage === 0) return <div key={opponentIndex} className="cmdr-dmg-spacer"></div>
            return (
              <div key={opponentIndex} className={`cmdr-dmg-item ${damage >= 21 ? 'lethal' : ''}`}>
                <span className="cmdr-player-label">P{opponentIndex + 1}</span>
                <span className="cmdr-dmg-value">{damage}</span>
              </div>
            )
          })}
        </div>

        <div className="player-actions">
          <button
            className="commander-btn"
            onPointerDown={handleButtonClick(onOpenCommanderDamage, 'cmdr')}
          >
            Commander Damage
          </button>
        </div>
      </div>

      <div className="button-section">
        <div className="turn-control-buttons">
          <button
            className={`priority-btn-side ${hasActivePriority ? 'active' : ''}`}
            onPointerDown={handleButtonClick(onTogglePriority, 'priority')}
          >
            {hasActivePriority ? 'Release Priority' : 'Take Priority'}
          </button>

          <button
            className={`pass-turn-btn-side ${!isCurrentTurn ? 'disabled' : ''}`}
            onPointerDown={handleButtonClick(isCurrentTurn ? onPassTurn : () => {}, 'passturn')}
            disabled={!isCurrentTurn}
          >
            Pass Turn ➜
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerPanel
