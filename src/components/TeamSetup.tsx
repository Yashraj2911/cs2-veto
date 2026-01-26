import { motion } from 'framer-motion'
import { useState } from 'react'

type TeamSetupProps = {
  defaultTeamA: string
  defaultTeamB: string
  onConfirm: (teamA: string, teamB: string) => void
}

const TeamSetup = ({ defaultTeamA, defaultTeamB, onConfirm }: TeamSetupProps) => {
  const [teamA, setTeamA] = useState(defaultTeamA)
  const [teamB, setTeamB] = useState(defaultTeamB)

  const handleSubmit = () => {
    onConfirm(teamA.trim() || defaultTeamA, teamB.trim() || defaultTeamB)
  }

  return (
    <section className="team-setup">
      <motion.div
        className="team-setup__header"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2>Set team names</h2>
        <p>Label both teams before the veto starts.</p>
      </motion.div>

      <div className="team-setup__form">
        <label className="input-field">
          <span>Team 1 name</span>
          <input
            type="text"
            value={teamA}
            onChange={(event) => setTeamA(event.target.value)}
            placeholder={defaultTeamA}
          />
        </label>
        <label className="input-field">
          <span>Team 2 name</span>
          <input
            type="text"
            value={teamB}
            onChange={(event) => setTeamB(event.target.value)}
            placeholder={defaultTeamB}
          />
        </label>
      </div>

      <motion.button
        type="button"
        className="primary-button"
        onClick={handleSubmit}
        whileTap={{ scale: 0.97 }}
      >
        Continue
      </motion.button>
    </section>
  )
}

export default TeamSetup
