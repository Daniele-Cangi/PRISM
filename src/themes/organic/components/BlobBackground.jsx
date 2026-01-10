import React from 'react';
import { motion } from 'framer-motion';

const BlobBackground = () => {
  const blobs = [
    { color: 'rgba(102, 126, 234, 0.4)', size: 400, delay: 0, duration: 20 },
    { color: 'rgba(247, 107, 182, 0.4)', size: 350, delay: 2, duration: 25 },
    { color: 'rgba(79, 172, 254, 0.4)', size: 450, delay: 4, duration: 22 }
  ];

  return (
    <div className="organic-background">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="organic-blob"
          style={{
            position: 'absolute',
            width: blob.size,
            height: blob.size,
            borderRadius: '50%',
            background: blob.color,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: blob.duration,
            delay: blob.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default BlobBackground;
