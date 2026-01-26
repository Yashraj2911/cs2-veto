import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { MapPoolEntry } from '../services/mapPoolManager'
import { StartingSide } from '../utils/vetoFlow'
import type { TeamSide } from '../utils/vetoEngine'

export type MapStatus = 'available' | 'banned' | 'picked' | 'decider'

type MapCardProps = {
  map: MapPoolEntry
  status: MapStatus
  statusLabel?: string
  side?: StartingSide | null
  sideLabel?: string
  pickedBy?: TeamSide
  isSelectable: boolean
  onSelect: (map: MapPoolEntry) => void
}

const FALLBACK_IMAGE = '/images/maps/fallback.svg'

const MapCard = ({
  map,
  status,
  statusLabel,
  side,
  sideLabel,
  pickedBy,
  isSelectable,
  onSelect,
}: MapCardProps) => {
  const [imageUrl, setImageUrl] = useState(map.thumbnail)

  useEffect(() => {
    setImageUrl(map.thumbnail)
  }, [map.thumbnail])

  return (
    <motion.button
      type="button"
      className={`map-card map-card--${status} ${
        pickedBy ? `map-card--picked-${pickedBy.toLowerCase()}` : ''
      }`}
      onClick={() => onSelect(map)}
      disabled={!isSelectable}
      layout
      animate={{ scale: status === 'picked' ? 1.02 : 1 }}
      whileHover={isSelectable ? { y: -6, scale: 1.01 } : undefined}
      whileTap={isSelectable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    >
      <div className="map-card__image">
        <img
          src={imageUrl}
          alt={map.mapName}
          onError={() => setImageUrl(FALLBACK_IMAGE)}
        />
        <div className="map-card__image-overlay" aria-hidden="true" />
      </div>
      <div className="map-card__body">
        <span className="map-card__name">{map.mapName}</span>
        <span className="map-card__id">#{map.mapId}</span>
      </div>
      <AnimatePresence>
        {side && (
          <motion.div
            className={`map-card__side map-card__side--${side.toLowerCase()}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.25 }}
          >
            <span>{side}</span>
            <span className="map-card__side-label">{sideLabel}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {status !== 'available' && (
          <motion.div
            className="map-card__status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>{statusLabel}</span>
            {status === 'banned' && (
              <div className="map-card__strike" aria-hidden="true" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default MapCard
