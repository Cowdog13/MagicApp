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

      // Prevent double-trigger within 300ms (handles both touch->mouse and rapid clicks)
      if (lastClick && now - lastClick < 300) {
        return
      }

      // Record this click
      buttonTimeouts.current[buttonId] = now

      // Execute callback
      callback()
    }
  }, [])

  const totalCommanderDamage = player.commanderDamage.reduce((sum, damage) => sum + damage, 0)

  return (
    <div className={`player-panel ${isActiveTimer ? 'active' : ''}`}>
      <div className="life-section">
        <div className="player-header">
          <h2>{player.name}</h2>
          <div className="header-right">
            {totalCommanderDamage > 0 && (
              <span className="cmdr-total">⚔{totalCommanderDamage}</span>
            )}
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
