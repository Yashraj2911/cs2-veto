import { motion } from 'framer-motion'
import type { VetoFormat } from '../utils/vetoFlow'

type FormatSelectorProps = {
  onSelect: (format: VetoFormat) => void
  isLoading: boolean
}

const formatCards: { format: VetoFormat; title: string; subtitle: string }[] = [
  {
    format: 'BO3',
    title: 'Best of 3',
    subtitle: '2 bans • 2 picks • decider',
  },
  {
    format: 'BO5',
    title: 'Best of 5',
    subtitle: '2 bans • 4 picks • decider',
  },
]

const FormatSelector = ({ onSelect, isLoading }: FormatSelectorProps) => {
  return (
    <section className="format-selector">
      <motion.div
        className="format-header"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Select match format</h2>
        <p>Choose the series length to begin the veto flow.</p>
      </motion.div>

      <div className="format-grid">
        {formatCards.map((card, index) => (
          <motion.button
            key={card.format}
            type="button"
            className="format-card"
            onClick={() => onSelect(card.format)}
            whileHover={{ y: -6, boxShadow: '0 18px 40px rgba(0,0,0,0.35)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.1 }}
            disabled={isLoading}
          >
            <div className="format-card__glow" aria-hidden="true" />
            <span className="format-card__title">{card.title}</span>
            <span className="format-card__subtitle">{card.subtitle}</span>
            <span className="format-card__cta">
              {isLoading ? 'Loading...' : 'Start veto'}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

export default FormatSelector
