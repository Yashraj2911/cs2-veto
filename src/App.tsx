import { useEffect, useState } from 'react'
import './App.css'
import FormatSelector from './components/FormatSelector'
import TeamSetup from './components/TeamSetup'
import VetoBoard from './components/VetoBoard'
import {
  type MapPoolEntry,
  MapPoolManager,
} from './services/mapPoolManager'
import type { VetoFormat } from './utils/vetoFlow'

function App() {
  const [format, setFormat] = useState<VetoFormat | null>(null)
  const [mapPool, setMapPool] = useState<MapPoolEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [teamAName, setTeamAName] = useState('Team A')
  const [teamBName, setTeamBName] = useState('Team B')
  const [isTeamsSet, setIsTeamsSet] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadPool = async () => {
      try {
        setIsLoading(true)
        const activePool = await MapPoolManager.getActivePool()
        if (isMounted) {
          setMapPool(activePool)
          setLoadError(null)
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load map pool.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPool()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="app-shell">
      <div className="app-glow" aria-hidden="true" />
      <header className="app-topbar">
        <div>
          <span className="eyebrow">Premier Interface</span>
          <h1>CS2 Veto</h1>
        </div>
        <div className="status-chip">
          {isLoading ? 'Loading map pool...' : `${mapPool.length} maps active`}
        </div>
      </header>

      {loadError ? (
        <div className="error-panel">
          <h2>Map Pool Offline</h2>
          <p>{loadError}</p>
        </div>
      ) : !isTeamsSet ? (
        <TeamSetup
          defaultTeamA="Team A"
          defaultTeamB="Team B"
          onConfirm={(teamA, teamB) => {
            setTeamAName(teamA)
            setTeamBName(teamB)
            setIsTeamsSet(true)
          }}
        />
      ) : !format ? (
        <FormatSelector onSelect={setFormat} isLoading={isLoading} />
      ) : (
        <VetoBoard
          format={format}
          maps={mapPool}
          isLoading={isLoading}
          teamAName={teamAName}
          teamBName={teamBName}
          onChangeFormat={() => setFormat(null)}
          onChangeTeams={() => {
            setFormat(null)
            setIsTeamsSet(false)
          }}
        />
      )}
    </div>
  )
}

export default App
