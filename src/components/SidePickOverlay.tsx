import { AnimatePresence, motion } from 'framer-motion'
import { StartingSide } from '../utils/vetoFlow'

type SidePickOverlayProps = {
  isOpen: boolean
  mapName: string
  chooserTeam: string
  onSelect: (side: StartingSide) => void
}

const SidePickOverlay = ({
  isOpen,
  mapName,
  chooserTeam,
  onSelect,
}: SidePickOverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="overlay-card"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <span className="eyebrow">Side Selection</span>
            <h2>{mapName}</h2>
            <p>
              {chooserTeam} chooses the starting side.
            </p>
            <div className="side-grid">
              <motion.button
                type="button"
                className="side-button side-button--ct"
                onClick={() => onSelect(StartingSide.CT)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="side-label">CT</span>
                <span className="side-subtitle">Counter-Terrorists</span>
              </motion.button>
              <motion.button
                type="button"
                className="side-button side-button--t"
                onClick={() => onSelect(StartingSide.T)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="side-label">T</span>
                <span className="side-subtitle">Terrorists</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SidePickOverlay
