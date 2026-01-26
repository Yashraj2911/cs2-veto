import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { MapPoolEntry } from '../services/mapPoolManager'
import {
  getVetoSteps,
  StartingSide,
  VetoPhase,
  type VetoFormat,
} from '../utils/vetoFlow'
import {
  getOppositeTeam,
  getTeamForStep,
  type TeamSide,
} from '../utils/vetoEngine'
import MapCard, { type MapStatus } from './MapCard'
import ProgressBar from './ProgressBar'
import SummaryScreen from './SummaryScreen'
import SidePickOverlay from './SidePickOverlay'
import TossOverlay from './TossOverlay'

type VetoActionLog = {
  action: VetoPhase
  mapId: string
  mapName: string
  team?: TeamSide
}

type SideSelection = {
  mapId: string
  mapName: string
  pickedBy: TeamSide
  startingSide: StartingSide | null
}

type VetoBoardProps = {
  format: VetoFormat
  maps: MapPoolEntry[]
  isLoading: boolean
  teamAName: string
  teamBName: string
  onChangeFormat: () => void
  onChangeTeams: () => void
}

const VetoBoard = ({
  format,
  maps,
  isLoading,
  teamAName,
  teamBName,
  onChangeFormat,
  onChangeTeams,
}: VetoBoardProps) => {
  const teamLabels: Record<TeamSide, string> = {
    A: teamAName,
    B: teamBName,
  }
  const steps = useMemo(() => getVetoSteps(format), [format])
  const [stepIndex, setStepIndex] = useState(0)
  const [history, setHistory] = useState<VetoActionLog[]>([])
  const [mapStates, setMapStates] = useState<Record<string, MapStatus>>({})
  const [sideSelections, setSideSelections] = useState<Record<string, SideSelection>>({})
  const [pendingSidePick, setPendingSidePick] = useState<SideSelection | null>(null)
  const [pickSummary, setPickSummary] = useState<SideSelection[]>([])
  const [deciderMap, setDeciderMap] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showToss, setShowToss] = useState(false)
  const [tossWinner, setTossWinner] = useState<TeamSide | null>(null)

  const currentStep = steps[stepIndex]
  const currentTeam = getTeamForStep(steps, stepIndex)
  const isDeciderStep = currentStep?.type === VetoPhase.Decider
  const isSidePickStep = currentStep?.type === VetoPhase.SidePick
  const isComplete = history.some((entry) => entry.action === VetoPhase.Decider)

  useEffect(() => {
    const initialState = maps.reduce<Record<string, MapStatus>>((acc, map) => {
      acc[map.mapId] = 'available'
      return acc
    }, {})
    setMapStates(initialState)
    setHistory([])
    setSideSelections({})
    setPendingSidePick(null)
    setPickSummary([])
    setDeciderMap(null)
    setStepIndex(0)
    setShowResetConfirm(false)
    setShowToss(false)
    setTossWinner(null)
  }, [maps, format])

  useEffect(() => {
    if (!isDeciderStep || isComplete) {
      return
    }
    const remaining = maps.filter((map) => mapStates[map.mapId] === 'available')
    if (remaining.length === 1) {
      const [map] = remaining
      setMapStates((prev) => ({ ...prev, [map.mapId]: 'decider' }))
      setHistory((prev) => [
        ...prev,
        {
          action: VetoPhase.Decider,
          mapId: map.mapId,
          mapName: map.mapName,
        },
      ])
      setDeciderMap(map.mapName)
      setStepIndex((prev) => Math.min(prev + 1, steps.length))
    }
  }, [isDeciderStep, isComplete, maps, mapStates, steps.length])

  const handleMapSelect = (map: MapPoolEntry) => {
    if (!currentStep || isComplete) {
      return
    }
    if (mapStates[map.mapId] !== 'available') {
      return
    }

    const nextStatus: MapStatus =
      currentStep.type === VetoPhase.Ban
        ? 'banned'
        : currentStep.type === VetoPhase.Pick
        ? 'picked'
        : 'decider'

    setMapStates((prev) => ({ ...prev, [map.mapId]: nextStatus }))
    setHistory((prev) => [
      ...prev,
      {
        action: currentStep.type,
        mapId: map.mapId,
        mapName: map.mapName,
        team: currentStep.type === VetoPhase.Decider ? undefined : currentTeam,
      },
    ])

    if (currentStep.type === VetoPhase.Pick) {
      const sideSelection: SideSelection = {
        mapId: map.mapId,
        mapName: map.mapName,
        pickedBy: currentTeam,
        startingSide: null,
      }
      setSideSelections((prev) => ({ ...prev, [map.mapId]: sideSelection }))
      setPendingSidePick(sideSelection)
      setPickSummary((prev) => [...prev, sideSelection])
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length))
  }

  const handleSidePick = (side: StartingSide) => {
    if (!pendingSidePick) {
      return
    }
    const chooserTeam = getOppositeTeam(pendingSidePick.pickedBy)
    setSideSelections((prev) => ({
      ...prev,
      [pendingSidePick.mapId]: {
        ...pendingSidePick,
        startingSide: side,
      },
    }))
    setPickSummary((prev) =>
      prev.map((entry) =>
        entry.mapId === pendingSidePick.mapId
          ? { ...entry, startingSide: side }
          : entry
      )
    )
    setHistory((prev) => [
      ...prev,
      {
        action: VetoPhase.SidePick,
        mapId: pendingSidePick.mapId,
        mapName: pendingSidePick.mapName,
        team: chooserTeam,
      },
    ])
    setPendingSidePick(null)
    setStepIndex((prev) => Math.min(prev + 1, steps.length))
  }

  const resetVeto = () => {
    const resetState = maps.reduce<Record<string, MapStatus>>((acc, map) => {
      acc[map.mapId] = 'available'
      return acc
    }, {})
    setMapStates(resetState)
    setHistory([])
    setSideSelections({})
    setPendingSidePick(null)
    setPickSummary([])
    setDeciderMap(null)
    setStepIndex(0)
    setShowResetConfirm(false)
    setTossWinner(null)
  }

  const remainingMaps = maps.filter(
    (map) => mapStates[map.mapId] === 'available'
  ).length

  const sidePickerTeam: TeamSide | null = pendingSidePick
    ? getOppositeTeam(pendingSidePick.pickedBy)
    : null

  return (
    <section className="veto-board">
      <header className="veto-header">
        <div>
          <span className="eyebrow">{format} Series</span>
          <h2>Map Veto Control</h2>
          <p>
            Ban and pick maps in alternating order. Remaining maps:{' '}
            <strong>{remainingMaps}</strong>
          </p>
        </div>
        <div className="veto-actions">
          <button className="ghost-button" type="button" onClick={() => setShowToss(true)}>
            Toss
          </button>
          <button className="ghost-button" type="button" onClick={onChangeTeams}>
            Edit teams
          </button>
          <button className="ghost-button" type="button" onClick={onChangeFormat}>
            Change format
          </button>
          <div className="reset-group">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setShowResetConfirm((prev) => !prev)}
              disabled={isLoading}
            >
              Reset veto
            </button>
            <AnimatePresence>
              {showResetConfirm && (
                <motion.button
                  type="button"
                  className="confirm-button"
                  onClick={resetVeto}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  Confirm reset
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="turn-row">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentStep?.type ?? 'complete'}-${stepIndex}`}
            className="turn-indicator"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {isComplete ? (
              <span className="turn-complete">Veto complete</span>
            ) : isDeciderStep ? (
              <span className="turn-decider">Select decider map</span>
            ) : isSidePickStep && pendingSidePick && sidePickerTeam ? (
              <>
                <span
                  className={`team-pill team-pill--${sidePickerTeam.toLowerCase()}`}
                >
                  {teamLabels[sidePickerTeam]}
                </span>
                <span className="turn-action">
                  Choose starting side for {pendingSidePick.mapName}
                </span>
              </>
            ) : (
              <>
                <span
                  className={`team-pill team-pill--${currentTeam.toLowerCase()}`}
                >
                  {teamLabels[currentTeam]}
                </span>
                <span className="turn-action">{currentStep?.label} now</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="turn-phase">
          Phase {Math.min(stepIndex + 1, steps.length)} / {steps.length}
        </div>
      </div>

      {tossWinner && (
        <div className="toss-banner">
          <span className="toss-banner__label">Toss winner</span>
          <span className="toss-banner__team">{teamLabels[tossWinner]}</span>
          <span className="toss-banner__hint">
            Decide first ban, first pick, or side choice.
          </span>
        </div>
      )}

      <div className="phase-tracker">
        <ProgressBar
          steps={steps}
          currentStepIndex={Math.min(stepIndex, steps.length - 1)}
          isComplete={isComplete}
        />
      </div>

      <div className="board-grid">
        <div className="map-grid">
          {maps.map((map) => {
            const status = mapStates[map.mapId] ?? 'available'
            const entry = history.find((item) => item.mapId === map.mapId)
            const sideSelection = sideSelections[map.mapId]
            const pickedBy =
              entry?.action === VetoPhase.Pick ? entry.team : undefined
            const statusLabel =
              status === 'available'
                ? undefined
                : status === 'decider'
                ? 'DECIDER • KNIFE ROUND'
                : `${entry?.action?.toUpperCase()} • ${
                    entry?.team ? teamLabels[entry.team] : 'LOCKED'
                  }`
            const isSelectable =
              !isLoading &&
              !isComplete &&
              status === 'available' &&
              Boolean(currentStep) &&
              !isSidePickStep

            return (
              <MapCard
                key={map.mapId}
                map={map}
                status={status}
                statusLabel={statusLabel}
                side={sideSelection?.startingSide ?? null}
                sideLabel={
                  sideSelection?.startingSide
                    ? `Chosen by ${teamLabels[getOppositeTeam(sideSelection.pickedBy)]}`
                    : undefined
                }
                pickedBy={pickedBy}
                isSelectable={isSelectable}
                onSelect={handleMapSelect}
              />
            )
          })}
        </div>

        <aside className="history-panel">
          <h3>Veto history</h3>
          <div className="history-list">
            {history.length ? (
              history.map((entry, index) => (
                <motion.div
                  key={`${entry.mapId}-${entry.action}-${index}`}
                  className="history-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={`history-badge history-badge--${entry.action}`}>
                    {entry.action.replace('_', ' ').toUpperCase()}
                  </span>
                  <div>
                    <div className="history-map">{entry.mapName}</div>
                    <div className="history-team">
                      {entry.team ? teamLabels[entry.team] : 'Decider'}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="history-empty">Awaiting first action.</div>
            )}
          </div>
        </aside>
      </div>

      {isComplete && (
        <SummaryScreen
          picks={pickSummary}
          deciderMap={deciderMap}
          teamAName={teamAName}
          teamBName={teamBName}
        />
      )}

      <SidePickOverlay
        isOpen={Boolean(isSidePickStep && pendingSidePick)}
        mapName={pendingSidePick?.mapName ?? ''}
        chooserTeam={sidePickerTeam ? teamLabels[sidePickerTeam] : ''}
        onSelect={handleSidePick}
      />

      <TossOverlay
        isOpen={showToss}
        onClose={() => setShowToss(false)}
        teamAName={teamAName}
        teamBName={teamBName}
        onResult={(winner) => setTossWinner(winner)}
      />

      <AnimatePresence>
        {!isComplete && currentStep && (
          <motion.div
            className={`turn-bar ${
              currentStep.type === VetoPhase.Ban
                ? 'turn-bar--ban'
                : currentStep.type === VetoPhase.Pick
                ? `turn-bar--pick-${currentTeam.toLowerCase()}`
                : currentStep.type === VetoPhase.SidePick
                ? `turn-bar--side-${sidePickerTeam?.toLowerCase() ?? 'neutral'}`
                : 'turn-bar--decider'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="turn-bar__content"
              key={`${currentStep.type}-${stepIndex}-${sidePickerTeam ?? currentTeam}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="turn-bar__icon" aria-hidden="true" />
              <span className="turn-bar__text">
                {currentStep.type === VetoPhase.SidePick && sidePickerTeam
                  ? `${teamLabels[sidePickerTeam]} — CHOOSE SIDE`
                  : `${teamLabels[currentTeam]} — ${currentStep.label.toUpperCase()}`}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default VetoBoard
