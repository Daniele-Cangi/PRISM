import React, { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';

const ParticleField = ({ score = 0 }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationRef = useRef(null);
  const noise2D = useRef(createNoise2D());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const count = Math.min(200, Math.floor((canvas.width * canvas.height) / 10000));
      particles.current = [];

      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          hue: 0
        });
      }
    };

    const updateParticles = (time) => {
      particles.current.forEach(p => {
        // Apply noise-based movement
        const noiseVal = noise2D.current(p.x * 0.002, p.y * 0.002 + time * 0.0001);
        p.vx += noiseVal * 0.05;
        p.vy += noiseVal * 0.05;

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;

        // Friction
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Color based on score (green to red via HSL)
        p.hue = 120 - (score * 1.2);
      });
    };

    const drawParticles = () => {
      particles.current.forEach(p => {
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, 0.6)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.8)`;
      });

      // Reset shadow
      ctx.shadowBlur = 0;
    };

    const drawConnections = () => {
      const maxDist = 100;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1 = particles.current[i];
          const p2 = particles.current[j];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = (time) => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      updateParticles(time);
      drawConnections();
      drawParticles();

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score]);

  return (
    <canvas
      ref={canvasRef}
      className="gen-canvas"
      style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)' }}
    />
  );
};

export default ParticleField;
