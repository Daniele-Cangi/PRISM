import React from 'react';
import { motion } from 'framer-motion';
import { getScoreBand, formatDate } from '../../../utils/formatAnalysis';
import ScoreIndicator from './ScoreIndicator';

const ArticleCard = ({ data, onClick }) => {
  const { title, meta } = data;
  const score = meta?.score || 0;
  const tone = meta?.tone || 'Unknown';
  const date = formatDate(new Date(), 'long');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="editorial-card relative cursor-pointer"
      onClick={onClick}
    >
      {/* Score Badge in corner */}
      <ScoreIndicator score={score} />

      {/* Article Content */}
      <div className="pr-24">
        {/* Byline */}
        <div className="editorial-meta mb-4">
          <span>Shadow Analyzer</span>
          <div className="editorial-meta-divider" />
          <span>{date}</span>
        </div>

        {/* Headline */}
        <h2 className="headline-secondary mb-3 hover:text-[#DC2626] transition-colors">
          {title}
        </h2>

        {/* Excerpt / Tone */}
        <p className="body-text-sans text-[#666666] mb-4">
          Analysis reveals a <strong>{tone.toLowerCase()}</strong> tone with {getScoreBand(score).toLowerCase()} bias indicators.
        </p>

        {/* Read More */}
        <div className="byline text-[#DC2626] hover:underline">
          Read Full Analysis →
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;
