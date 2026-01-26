import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { getSecureRandomInt } from '../utils/toss'
import type { TeamSide } from '../utils/vetoEngine'

type TossOverlayProps = {
  isOpen: boolean
  onClose: () => void
  onResult: (winner: TeamSide) => void
  teamAName: string
  teamBName: string
}

const TossOverlay = ({
  isOpen,
  onClose,
  onResult,
  teamAName,
  teamBName,
}: TossOverlayProps) => {
  const [result, setResult] = useState<TeamSide | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const winner = useMemo<TeamSide>(() => {
    return getSecureRandomInt(2) === 0 ? 'A' : 'B'
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setResult(null)
    setIsFlipping(true)
    const timeout = window.setTimeout(() => {
      setResult(winner)
      setIsFlipping(false)
      onResult(winner)
    }, 1400)

    return () => window.clearTimeout(timeout)
  }, [isOpen, onResult, winner])

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
            className="overlay-card overlay-card--toss"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <span className="eyebrow">Secure coin toss</span>
            <h2>Randomized pick order</h2>
            <p>Powered by cryptographic randomness.</p>

            <motion.div
              className={`toss-coin ${result ? 'toss-coin--settled' : ''}`}
              animate={
                isFlipping
                  ? {
                      rotateY: [0, 360, 720, 1080],
                      scale: [1, 1.1, 1],
                      filter: ['blur(0px)', 'blur(3px)', 'blur(0px)'],
                    }
                  : { rotateY: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={{ duration: 1.3, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <span>CS2</span>
            </motion.div>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  className="toss-result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="toss-winner">
                    {(result === 'A' ? teamAName : teamBName) ?? 'Winner'} wins
                  </span>
                  <span className="toss-hint">
                    Use this to decide first ban, first pick, or side choice.
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="flipping"
                  className="toss-result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="toss-winner">Flipping...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="button" className="ghost-button" onClick={onClose}>
              Close toss
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TossOverlay
