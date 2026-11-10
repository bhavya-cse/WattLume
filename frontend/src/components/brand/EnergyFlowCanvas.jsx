import React, { useEffect, useRef } from 'react';

export default function EnergyFlowCanvas({ className = "", intensity = 1.0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Energy nodes and particles
    const particleCount = Math.floor(28 * intensity);
    const particles = [];
    const colors = ['#42D9E8', '#24C78B', '#4169E1', '#B8F3D5'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.7 * intensity,
        vy: (Math.random() - 0.5) * 0.7 * intensity,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle flowing sine waveforms across background
      waveOffset += 0.015 * intensity;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(66, 217, 232, 0.08)';
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const y = height * 0.5 + Math.sin(x * 0.008 + waveOffset) * 45 + Math.cos(x * 0.003 - waveOffset) * 25;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(36, 199, 139, 0.06)';
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const y = height * 0.65 + Math.sin(x * 0.006 - waveOffset * 0.8) * 35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Update and draw particles and interconnected energy vectors
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw connections between nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(66, 217, 232, ${(1 - dist / 110) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw node with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
