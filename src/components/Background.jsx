import { useEffect, useRef } from 'react';
import { useParallax } from '../hooks/useParallax';
import aboutBg from '../assets/about-bg.jpg';

export default function Background() {
  const canvasRef = useRef(null);
  const parallax = useParallax(35);
  const parallaxRef = useRef(parallax);

  useEffect(() => {
    parallaxRef.current = parallax;
  }, [parallax]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const emberCount = Math.min(Math.floor((width * height) / 18000), 50);
    const embers = Array.from({ length: emberCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 1.1,
      speedY: Math.random() * 0.22 + 0.08,
      driftX: (Math.random() - 0.5) * 0.1,
      wobbleSpeed: Math.random() * 0.014 + 0.006,
      baseAlpha: Math.random() * 0.35 + 0.45,
      depth: Math.random() * 0.09 + 0.03,
      seed: Math.random() * Math.PI * 2
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.012;

      const pX = parallaxRef.current.x;
      const pY = parallaxRef.current.y;

      embers.forEach((e) => {
        e.y -= e.speedY;
        e.x += e.driftX + Math.sin(time * e.wobbleSpeed * 40 + e.seed) * 0.14;

        if (e.y < -20) {
          e.y = height + 20;
          e.x = Math.random() * width;
        }
        if (e.x < -20) e.x = width + 20;
        if (e.x > width + 20) e.x = -20;

        const renderX = e.x + pX * e.depth;
        const renderY = e.y + pY * e.depth;
        const alpha = Math.min(0.95, e.baseAlpha + Math.sin(time + e.seed) * 0.15);

        ctx.beginPath();
        ctx.arc(renderX, renderY, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 232, 175, ${alpha})`;
        ctx.shadowColor = 'rgba(240, 185, 95, 0.85)';
        ctx.shadowBlur = e.size > 2.0 ? 10 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute -inset-16 will-change-transform"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`
        }}
      >
        <img
          src={aboutBg}
          alt="Ambient cosmic nebula background"
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/35 via-transparent to-[#07090e]/25 pointer-events-none" />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
