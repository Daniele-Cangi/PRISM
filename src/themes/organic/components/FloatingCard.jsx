import React from 'react';
import { motion } from 'framer-motion';

const FloatingCard = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      }}
      className={`organic-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default FloatingCard;
