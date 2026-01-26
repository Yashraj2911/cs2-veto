import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { TeamSide } from '../utils/vetoEngine'
import { StartingSide } from '../utils/vetoFlow'
import {
  formatVetoSummaryText,
  getStartingSideLabel,
  type PickSummary,
} from '../utils/vetoSummary'

type SummaryScreenProps = {
  picks: PickSummary[]
  deciderMap: string | null
  teamAName: string
  teamBName: string
}

const teamLabel = (team: TeamSide, teamAName: string, teamBName: string) =>
  team === 'A' ? teamAName : teamBName

const SummaryScreen = ({ picks, deciderMap, teamAName, teamBName }: SummaryScreenProps) => {
  const [showToast, setShowToast] = useState(false)

  const handleCopy = async () => {
    const text = formatVetoSummaryText(picks, deciderMap, teamAName, teamBName)
    try {
      await navigator.clipboard.writeText(text)
      setShowToast(true)
      window.setTimeout(() => setShowToast(false), 1800)
    } catch {
      setShowToast(false)
    }
  }

  return (
    <motion.section
      className="summary-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>Veto complete</h2>
      <div className="summary-matchup">
        {teamAName} vs {teamBName}
      </div>
      <div className="summary-list">
        {picks.map((pick, index) => (
          <motion.div
            key={pick.mapId}
            className="summary-card summary-card--map"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            <div className="summary-header">
              <span className="summary-count">{index + 1}</span>
              <div>
              <span className="summary-map-name">{pick.mapName}</span>
                <span className="summary-muted">
                  Picked by {teamLabel(pick.pickedBy, teamAName, teamBName)}
                </span>
              </div>
              <span
                className={`summary-side summary-side--${pick.startingSide?.toLowerCase() ?? 'none'}`}
              >
                {pick.startingSide ?? '—'}
              </span>
            </div>
            <div className="summary-details">
              <span className="summary-line">
                Starting side:{' '}
                {getStartingSideLabel(
                  pick.startingSide,
                  pick.pickedBy,
                  teamAName,
                  teamBName
                )}
              </span>
              {pick.startingSide === StartingSide.CT && (
                <span className="summary-icon summary-icon--ct">CT</span>
              )}
              {pick.startingSide === StartingSide.T && (
                <span className="summary-icon summary-icon--t">T</span>
              )}
            </div>
          </motion.div>
        ))}

        <motion.div
          className="summary-card summary-card--decider"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: picks.length * 0.06 }}
        >
          <span className="summary-title">Decider map</span>
          <div className="summary-decider">{deciderMap ?? 'Pending'}</div>
          <span className="summary-muted">Side: Knife Round</span>
        </motion.div>
      </div>

      <motion.button
        type="button"
        className="copy-button"
        onClick={handleCopy}
        whileTap={{ scale: 0.97 }}
      >
        Copy Veto
      </motion.button>

      <AnimatePresence>
        {showToast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            Veto copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

export default SummaryScreen
