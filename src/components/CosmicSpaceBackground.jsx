import { useEffect, useRef } from 'react';

function getScreenCoords(normX, normY, screenW, screenH) {
  const imgAspect = 923 / 521;
  const screenAspect = screenW / screenH;
  let drawW, drawH, startX, startY;

  if (screenAspect > imgAspect) {
    drawW = screenW;
    drawH = screenW / imgAspect;
    startX = 0;
    startY = (screenH - drawH) / 2;
  } else {
    drawH = screenH;
    drawW = screenH * imgAspect;
    startX = (screenW - drawW) / 2;
    startY = 0;
  }

  return {
    x: startX + normX * drawW,
    y: startY + normY * drawH,
    scale: drawW / 923
  };
}

function drawFacetedCompassRose(ctx, cx, cy, radius, rotAngle, options = {}) {
  const {
    hasRing = true,
    ringRatio = 1.15,
    hasPatch = true,
    ringRot = 0
  } = options;

  ctx.save();
  ctx.translate(cx, cy);

  if (hasPatch) {
    const patchR = radius * 1.35;
    const patchGrad = ctx.createRadialGradient(0, 0, radius * 0.35, 0, 0, patchR);
    patchGrad.addColorStop(0, 'rgba(225, 206, 175, 0.98)');
    patchGrad.addColorStop(0.72, 'rgba(224, 205, 174, 0.92)');
    patchGrad.addColorStop(0.88, 'rgba(222, 203, 172, 0.55)');
    patchGrad.addColorStop(1, 'rgba(220, 201, 170, 0)');

    ctx.fillStyle = patchGrad;
    ctx.beginPath();
    ctx.arc(0, 0, patchR, 0, Math.PI * 2);
    ctx.fill();
  }

  if (hasRing) {
    ctx.save();
    ctx.rotate(ringRot);
    const ringR = radius * ringRatio;

    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = '#4a2c11';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, ringR - 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(133, 86, 40, 0.7)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const dotX = Math.cos(a) * (ringR - 1.2);
      const dotY = Math.sin(a) * (ringR - 1.2);
      ctx.beginPath();
      ctx.arc(dotX, dotY, i % 2 === 0 ? 1.5 : 1.0, 0, Math.PI * 2);
      ctx.fillStyle = i % 4 === 0 ? '#381f0a' : '#6d451b';
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.rotate(rotAngle);

  const R_major = radius;
  const R_minor = radius * 0.62;
  const R_inner = radius * 0.22;

  for (let k = 0; k < 8; k++) {
    const tipAngle = (k * Math.PI) / 4;
    const isMajor = k % 2 === 0;
    const tipR = isMajor ? R_major : R_minor;
    const tipX = Math.cos(tipAngle) * tipR;
    const tipY = Math.sin(tipAngle) * tipR;

    const leftAngle = tipAngle - Math.PI / 8;
    const rightAngle = tipAngle + Math.PI / 8;

    const vLeftX = Math.cos(leftAngle) * R_inner;
    const vLeftY = Math.sin(leftAngle) * R_inner;

    const vRightX = Math.cos(rightAngle) * R_inner;
    const vRightY = Math.sin(rightAngle) * R_inner;

    const facetLight = 0.5 + 0.5 * Math.cos(tipAngle + rotAngle - Math.PI / 4);

    ctx.fillStyle = isMajor ? '#3e230c' : '#4a2c11';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(vLeftX, vLeftY);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#281406';
    ctx.lineWidth = 0.65;
    ctx.stroke();

    const goldR = Math.floor(195 + 25 * facetLight);
    const goldG = Math.floor(155 + 25 * facetLight);
    const goldB = Math.floor(80 + 20 * facetLight);
    ctx.fillStyle = `rgb(${goldR}, ${goldG}, ${goldB})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(vRightX, vRightY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#281406';
    ctx.lineWidth = 0.65;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = `rgba(255, 240, 205, ${0.7 + 0.3 * facetLight})`;
    ctx.lineWidth = isMajor ? 0.9 : 0.6;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, R_inner * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#b8862d';
  ctx.fill();
  ctx.strokeStyle = '#3d2008';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, R_inner * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#fffdf7';
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

export default function CosmicSpaceBackground({ className = '' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, currentX: 0.5, currentY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const updateDimensions = () => {
      if (!canvas) return;
      const rect = containerRef.current
        ? containerRef.current.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      width = canvas.width = Math.round(rect.width || window.innerWidth);
      height = canvas.height = Math.round(rect.height || window.innerHeight);
    };

    let width = window.innerWidth;
    let height = window.innerHeight;
    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const facetedStars = [
      { normX: 0.303, normY: 0.292, baseRadius: 23, rotSpeed: 0.45, hasRing: true, ringRatio: 1.14 },
      { normX: 0.195, normY: 0.413, baseRadius: 20, rotSpeed: -0.38, hasRing: true, ringRatio: 1.16 },
      { normX: 0.219, normY: 0.787, baseRadius: 32, rotSpeed: 0.32, hasRing: true, ringRatio: 1.25 },
      { normX: 0.783, normY: 0.150, baseRadius: 27, rotSpeed: -0.40, hasRing: true, ringRatio: 1.18 },
      { normX: 0.895, normY: 0.864, baseRadius: 21, rotSpeed: 0.42, hasRing: false, ringRatio: 1.15 }
    ];

    const constellationLinks = [
      { from: 0, to: 1 },
      { from: 0, to: 3 },
      { from: 1, to: 2 }
    ];

    const linkPulses = constellationLinks.map((link, i) => ({
      ...link,
      progress: (i * 0.33) % 1,
      speed: 0.0022 + Math.random() * 0.0018
    }));

    const emberCount = 65;
    const embers = Array.from({ length: emberCount }, () => ({
      t: Math.random(),
      spread: (Math.random() - 0.5) * 160,
      size: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.55 + 0.25,
      speed: Math.random() * 0.00045 + 0.0002,
      pulseSpeed: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
      orbitOffset: Math.random() * Math.PI * 2
    }));

    let comet = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      length: 0,
      alpha: 0,
      timer: 120
    };

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.016;

      mouseRef.current.currentX += (mouseRef.current.x - mouseRef.current.currentX) * 0.04;
      mouseRef.current.currentY += (mouseRef.current.y - mouseRef.current.currentY) * 0.04;
      const mouseOffsetX = (mouseRef.current.currentX - 0.5) * 16;
      const mouseOffsetY = (mouseRef.current.currentY - 0.5) * 12;

      for (let layer = 0; layer < 3; layer++) {
        const layerPhase = time * (0.4 + layer * 0.15);
        const layerAlpha = 0.07 + 0.04 * Math.sin(time * 0.6 + layer);

        ctx.beginPath();
        const startX = width * 0.14 + mouseOffsetX * 0.3;
        const startY = height * 0.88 + mouseOffsetY * 0.3;
        ctx.moveTo(startX, startY);

        const cp1X = width * (0.35 + 0.04 * Math.sin(layerPhase));
        const cp1Y = height * (0.75 + 0.03 * Math.cos(layerPhase));

        const cp2X = width * (0.55 + 0.05 * Math.cos(layerPhase * 0.8));
        const cp2Y = height * (0.45 + 0.04 * Math.sin(layerPhase * 0.9));

        const endX = width * 0.95 + mouseOffsetX * 0.5;
        const endY = height * 0.14 + mouseOffsetY * 0.5;

        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
        ctx.strokeStyle = `rgba(229, 173, 104, ${layerAlpha})`;
        ctx.lineWidth = 18 + layer * 16 + 6 * Math.sin(time * 0.7 + layer);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      linkPulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) pulse.progress = 0;

        const starA = facetedStars[pulse.from];
        const starB = facetedStars[pulse.to];
        if (!starA || !starB) return;

        const posA = getScreenCoords(starA.normX, starA.normY, width, height);
        const posB = getScreenCoords(starB.normX, starB.normY, width, height);

        const ax = posA.x + mouseOffsetX * 0.5;
        const ay = posA.y + mouseOffsetY * 0.5;
        const bx = posB.x + mouseOffsetX * 0.5;
        const by = posB.y + mouseOffsetY * 0.5;

        const px = ax + (bx - ax) * pulse.progress;
        const py = ay + (by - ay) * pulse.progress;
        const pulseAlpha = Math.sin(pulse.progress * Math.PI) * 0.65;

        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 238, 195, ${pulseAlpha})`;
        ctx.shadowColor = 'rgba(229, 173, 104, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      embers.forEach((ember) => {
        ember.t += ember.speed;
        if (ember.t > 1) ember.t = 0;

        const baseX = width * (0.16 + ember.t * 0.80) + mouseOffsetX * 0.4;
        const baseY = height * (0.86 - ember.t * 0.70 + Math.sin(ember.t * Math.PI * 2.8) * 0.07) + mouseOffsetY * 0.4;

        const curl = Math.sin(time * 1.5 + ember.orbitOffset) * 12;
        const x = baseX + Math.cos(ember.t * 4) * ember.spread + curl;
        const y = baseY + Math.sin(ember.t * 4) * ember.spread;

        const pulse = 0.45 + 0.55 * Math.sin(time * ember.pulseSpeed + ember.phase);
        const currentAlpha = ember.alpha * pulse;

        ctx.beginPath();
        ctx.arc(x, y, ember.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 195, 120, ${currentAlpha})`;
        ctx.shadowColor = 'rgba(229, 173, 104, 0.85)';
        ctx.shadowBlur = 5;
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      facetedStars.forEach((star) => {
        const coords = getScreenCoords(star.normX, star.normY, width, height);
        const cx = coords.x + mouseOffsetX * 0.5;
        const cy = coords.y + mouseOffsetY * 0.5;
        const scaledR = star.baseRadius * coords.scale;

        const rotAngle = time * star.rotSpeed;
        const ringRot = -time * (star.rotSpeed * 0.35);

        drawFacetedCompassRose(ctx, cx, cy, scaledR, rotAngle, {
          hasRing: star.hasRing,
          ringRatio: star.ringRatio,
          hasPatch: true,
          ringRot
        });
      });

      const planetCoords = getScreenCoords(0.764, 0.739, width, height);
      const planetX = planetCoords.x + mouseOffsetX * 0.5;
      const planetY = planetCoords.y + mouseOffsetY * 0.5;
      const planetPulse = 0.5 + 0.5 * Math.sin(time * 0.9);

      const planetGrad = ctx.createRadialGradient(planetX, planetY, 20, planetX, planetY, 110);
      planetGrad.addColorStop(0, `rgba(229, 173, 104, ${0.18 * planetPulse})`);
      planetGrad.addColorStop(0.55, `rgba(180, 115, 45, ${0.07 * planetPulse})`);
      planetGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(planetX, planetY, 110, 0, Math.PI * 2);
      ctx.fill();

      if (!comet.active) {
        comet.timer -= 1;
        if (comet.timer <= 0) {
          comet.active = true;
          comet.x = width * (0.15 + Math.random() * 0.35);
          comet.y = height * (0.05 + Math.random() * 0.25);
          comet.vx = 8 + Math.random() * 6;
          comet.vy = 4 + Math.random() * 3.5;
          comet.length = 75 + Math.random() * 50;
          comet.alpha = 1.0;
        }
      } else {
        comet.x += comet.vx;
        comet.y += comet.vy;
        comet.alpha -= 0.022;

        if (comet.alpha <= 0 || comet.x > width || comet.y > height) {
          comet.active = false;
          comet.timer = Math.floor(320 + Math.random() * 280);
        } else {
          const tailX = comet.x - (comet.vx / 10) * comet.length;
          const tailY = comet.y - (comet.vy / 10) * comet.length;

          const cometGrad = ctx.createLinearGradient(tailX, tailY, comet.x, comet.y);
          cometGrad.addColorStop(0, 'rgba(229, 173, 104, 0)');
          cometGrad.addColorStop(0.65, `rgba(245, 195, 120, ${0.45 * comet.alpha})`);
          cometGrad.addColorStop(1, `rgba(255, 250, 235, ${0.95 * comet.alpha})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(comet.x, comet.y);
          ctx.strokeStyle = cometGrad;
          ctx.lineWidth = 1.8;
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(comet.x, comet.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${comet.alpha})`;
          ctx.shadowColor = 'rgba(245, 195, 120, 0.9)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#0a0805] select-none pointer-events-none ${className}`}
    >
      <div className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] animate-celestial-drift will-change-transform">
        <img
          src="/images/historical-celestial-bg.jpg"
          alt="Historical Celestial Cartography Map"
          className="w-full h-full object-cover object-center pointer-events-none brightness-[0.92] contrast-[1.08]"
          loading="eager"
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 will-change-transform"
          aria-hidden="true"
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-40 animate-lantern-breathe z-12"
        style={{
          background:
            'radial-gradient(ellipse at 50% 48%, rgba(229, 173, 104, 0.55) 0%, rgba(180, 105, 30, 0.22) 50%, transparent 80%)'
        }}
      />

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/70 z-15" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/65 via-transparent to-black/65 z-15" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_160px_rgba(8,5,3,0.95)] z-20" />
    </div>
  );
}
