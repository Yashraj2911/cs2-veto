export type VetoFormat = 'BO3' | 'BO5'

export const VetoPhase = {
  Ban: 'ban',
  Pick: 'pick',
  SidePick: 'side_pick',
  Decider: 'decider',
} as const

export type VetoPhase = (typeof VetoPhase)[keyof typeof VetoPhase]

export const StartingSide = {
  CT: 'CT',
  T: 'T',
} as const

export type StartingSide = (typeof StartingSide)[keyof typeof StartingSide]

export type VetoStep = {
  type: VetoPhase
  label: string
}

const createSteps = (actions: VetoPhase[]): VetoStep[] =>
  actions.map((action) => ({
    type: action,
    label:
      action === VetoPhase.Ban
        ? 'Ban'
        : action === VetoPhase.Pick
        ? 'Pick'
        : action === VetoPhase.SidePick
        ? 'Side pick'
        : 'Decider',
  }))

const BO3_STEPS: VetoStep[] = createSteps([
  VetoPhase.Ban,
  VetoPhase.Ban,
  VetoPhase.Pick,
  VetoPhase.SidePick,
  VetoPhase.Pick,
  VetoPhase.SidePick,
  VetoPhase.Ban,
  VetoPhase.Ban,
  VetoPhase.Decider,
])

const BO5_STEPS: VetoStep[] = createSteps([
  VetoPhase.Ban,
  VetoPhase.Ban,
  VetoPhase.Pick,
  VetoPhase.SidePick,
  VetoPhase.Pick,
  VetoPhase.SidePick,
  VetoPhase.Pick,
  VetoPhase.SidePick,
  VetoPhase.Pick,
  VetoPhase.SidePick,
  VetoPhase.Decider,
])

export const getVetoSteps = (format: VetoFormat): VetoStep[] =>
  format === 'BO5' ? BO5_STEPS : BO3_STEPS
