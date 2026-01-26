import { StartingSide } from './vetoFlow'
import type { TeamSide } from './vetoEngine'

export type PickSummary = {
  mapId: string
  mapName: string
  pickedBy: TeamSide
  startingSide: StartingSide | null
}

const teamLabel = (team: TeamSide, teamA: string, teamB: string) =>
  team === 'A' ? teamA : teamB

export const getStartingSideLabel = (
  startingSide: StartingSide | null,
  picker: TeamSide,
  teamAName: string,
  teamBName: string
) => {
  if (!startingSide) {
    return 'Pending'
  }
  const chooser = picker === 'A' ? teamBName : teamAName
  return `${chooser} (${startingSide})`
}

export const formatVetoSummaryText = (
  picks: PickSummary[],
  deciderMap: string | null,
  teamA = 'Team A',
  teamB = 'Team B'
) => {
  const lines: string[] = []
  lines.push('VETO SUMMARY')
  lines.push(`${teamA} vs ${teamB}`)
  lines.push('')

  picks.forEach((pick, index) => {
    lines.push(`${index + 1}) ${pick.mapName}`)
    lines.push(`   Picked by: ${teamLabel(pick.pickedBy, teamA, teamB)}`)
    lines.push(
      `   Starting side: ${getStartingSideLabel(
        pick.startingSide,
        pick.pickedBy,
        teamA,
        teamB
      )}`
    )
    lines.push('')
  })

  if (deciderMap) {
    lines.push(`Decider: ${deciderMap}`)
    lines.push('Side: Knife Round')
  }

  return lines.join('\n')
}
