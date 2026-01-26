import { motion } from 'framer-motion'
import type { VetoStep } from '../utils/vetoFlow'

type ProgressBarProps = {
  steps: VetoStep[]
  currentStepIndex: number
  isComplete: boolean
}

const ProgressBar = ({ steps, currentStepIndex, isComplete }: ProgressBarProps) => {
  return (
    <div className="progress-bar">
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex && !isComplete
        const isDone = index < currentStepIndex || isComplete
        return (
          <div
            key={`${step.type}-${index}`}
            className={`progress-step ${isActive ? 'is-active' : ''} ${
              isDone ? 'is-done' : ''
            }`}
          >
            <motion.div
              className={`progress-dot ${isDone ? 'is-done' : ''} ${
                isActive ? 'is-active' : ''
              }`}
              layout
              transition={{ duration: 0.3 }}
            />
            <span className="progress-label">{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default ProgressBar
