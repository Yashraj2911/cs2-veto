import { VetoPhase, type VetoStep } from './vetoFlow'

export type TeamSide = 'A' | 'B'

export const getOppositeTeam = (team: TeamSide): TeamSide =>
  team === 'A' ? 'B' : 'A'

export const getTeamForStep = (steps: VetoStep[], stepIndex: number): TeamSide => {
  const banPickIndex = steps
    .slice(0, stepIndex)
    .filter((step) => step.type === VetoPhase.Ban || step.type === VetoPhase.Pick)
    .length
  return banPickIndex % 2 === 0 ? 'A' : 'B'
}
