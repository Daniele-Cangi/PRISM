import { useEffect, useRef } from "react";


function createParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speedX: Math.random() * 0.5 - 0.25,
    speedY: Math.random() * 0.5 - 0.25,
    opacity: Math.random() * 0.5 + 0.2,
  };
}

function updateParticle(particle, canvas) {
  particle.x += particle.speedX;
  particle.y += particle.speedY;
  if (particle.x > canvas.width) particle.x = 0;
  if (particle.x < 0) particle.x = canvas.width;
  if (particle.y > canvas.height) particle.y = 0;
  if (particle.y < 0) particle.y = canvas.height;
}

function drawParticle(particle, context) {
  context.fillStyle =
    "rgba(99, 102, 241, " + particle.opacity + ")";
  context.beginPath();
  context.arc(
    particle.x,
    particle.y,
    particle.size,
    0,
    Math.PI * 2,
  );
  context.fill();
}

const CyberGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    let animationFrameId;
    const particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener(
      "resize",
      resizeCanvas,
    );
    for (let index = 0; index < 80; index += 1) {
      particles.push(createParticle(canvas));
    }

    const animate = () => {
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      context.strokeStyle =
        "rgba(99, 102, 241, 0.03)";
      context.lineWidth = 1;

      const gridSize = 50;
      for (
        let x = 0;
        x < canvas.width;
        x += gridSize
      ) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (
        let y = 0;
        y < canvas.height;
        y += gridSize
      ) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }

      particles.forEach((particle) => {
        updateParticle(particle, canvas);
        drawParticle(particle, context);
      });

      context.strokeStyle =
        "rgba(99, 102, 241, 0.1)";
      context.lineWidth = 0.5;
      for (
        let first = 0;
        first < particles.length;
        first += 1
      ) {
        for (
          let second = first + 1;
          second < particles.length;
          second += 1
        ) {
          const one = particles[first];
          const two = particles[second];
          const distance = Math.hypot(
            one.x - two.x,
            one.y - two.y,
          );
          if (distance < 150) {
            context.beginPath();
            context.moveTo(one.x, one.y);
            context.lineTo(two.x, two.y);
            context.stroke();
          }
        }
      }

      animationFrameId =
        requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas,
      );
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
};

export default CyberGrid;
