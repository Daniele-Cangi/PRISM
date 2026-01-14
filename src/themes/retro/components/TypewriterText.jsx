import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, speed = 30, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className="retro-text">
      {displayText}
      {currentIndex < text.length && <span className="retro-cursor"></span>}
    </span>
  );
};

export default TypewriterText;
