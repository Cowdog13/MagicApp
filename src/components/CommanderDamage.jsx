import { useRef, useCallback, useEffect } from 'react'
import './CommanderDamage.css'

function CommanderDamage({ player, playerIndex, allPlayers, onUpdateDamage, onClose }) {
  const buttonTimeouts = useRef({})
  const openedAt = useRef(Date.now())

  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

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

  const handleOverlayClick = (e) => {
    // Prevent closing if modal was just opened (within 200ms)
    if (Date.now() - openedAt.current < 200) {
      return
    }
    onClose()
  }

  return (
    <div className="commander-modal-overlay" onClick={handleOverlayClick}>
      <div className="commander-modal" onClick={(e) => e.stopPropagation()}>
        <div className="commander-header">
          <h2>Commander Damage</h2>
          <h3>{player.name || `P${playerIndex + 1}`}</h3>
        </div>

        <div className="commander-damage-list">
          {allPlayers.map((opponent, opponentIndex) => {
            if (opponentIndex === playerIndex) return null

            const damage = player.commanderDamage[opponentIndex]
            const isLethal = damage >= 21

            return (
              <div key={opponentIndex} className={`damage-row ${isLethal ? 'lethal' : ''}`}>
                <div className="opponent-name">
                  From {opponent.name || `P${opponentIndex + 1}`}
                </div>
                <div className="damage-controls">
                  <button
                    className="dmg-btn"
                    onPointerDown={handleButtonClick(() => onUpdateDamage(playerIndex, opponentIndex, -1), `cmdr-${opponentIndex}-1`)}
                  >
                    -
                  </button>
                  <div className="damage-value">
                    {damage}
                    {isLethal && <span className="lethal-tag">LETHAL</span>}
                  </div>
                  <button
                    className="dmg-btn"
                    onPointerDown={handleButtonClick(() => onUpdateDamage(playerIndex, opponentIndex, 1), `cmdr+${opponentIndex}+1`)}
                  >
                    +
                  </button>
                </div>
                <div className="quick-dmg-buttons">
                  <button onPointerDown={handleButtonClick(() => onUpdateDamage(playerIndex, opponentIndex, -5), `cmdr-${opponentIndex}-5`)}>-5</button>
                  <button onPointerDown={handleButtonClick(() => onUpdateDamage(playerIndex, opponentIndex, 5), `cmdr+${opponentIndex}+5`)}>+5</button>
                </div>
              </div>
            )
          })}
        </div>

        <button
          className="close-btn"
          onPointerDown={handleButtonClick(onClose, 'close')}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default CommanderDamage
