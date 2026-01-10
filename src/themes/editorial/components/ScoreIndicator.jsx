import React from 'react';
import { motion } from 'framer-motion';
import { getScoreBand } from '../../../utils/formatAnalysis';

const ScoreIndicator = ({ score }) => {
  const band = getScoreBand(score);
  const bandClass = band.toLowerCase();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className={`editorial-score-badge ${bandClass}`}
    >
      <span className="score-number">{score}</span>
      <span className="score-label">Risk</span>
    </motion.div>
  );
};

export default ScoreIndicator;
