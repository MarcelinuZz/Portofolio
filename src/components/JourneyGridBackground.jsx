import { useEffect, useRef } from 'react';

/**
 * JourneyGridBackground
 * 
 * An elevated architectural & celestial background crafted for the Journey section.
 * Features a refined diagonal 'X' coordinate lattice with modular major/minor line rhythm,
 * an atmospheric amber nebula depth, and focused laser illumination that concentrates
 * exclusively on the exact crossing diagonal lines pointed to by the cursor.
 * 
 * User Enhancements:
 * 1. Reduced number of illuminated lines: tightly focused on the primary intersecting
 *    pair of diagonal slashes (/ and \) currently under the cursor (laser-precision X).
 * 2. Fancy, high-end theme: layered obsidian depth, warm celestial amber flares,
 *    modular coordinate rhythm (major gold axes & minor bronze lines), and subtle stardust granules.
 * 
 * Antislop principles maintained:
 * - R-07 (Purpose-Gate): Texture serves as a coordinate lattice reflecting engineering progression.
 * - R-01 & R-29 (Color): Strictly uses the site's warm amber (#e5ad68) and deep charcoal palette.
 * - R-19 (Motion): Smooth lerp interpolation, gentle idle breathing, reduced-motion compliance.
 * - R-25 (Contrast): Solid background cards in Journey guarantee foreground readability.
 * - Resource Efficiency: Suspends animation via IntersectionObserver when off-screen.
 */
export default function JourneyGridBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Responsive grid parameters
    const getGridConfig = () => {
      const isSmall = window.innerWidth < 768;
      return {
        cellSize: isSmall ? 48 : 56,
        lerpFactor: prefersReducedMotion ? 1 : 0.14
      };
    };

    let config = getGridConfig();

    // Mouse coordinates: target and smoothed (lerped) values
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      targetIntensity: 0.35,
      currentIntensity: 0.35,
      isInside: false,
      hasInteracted: false
    };

    // Stardust embers: subtle floating ambient granules tying into the portfolio's About theme
    const emberCount = 22;
    let embers = [];

    const initEmbers = (w, h) => {
      embers = Array.from({ length: emberCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.4 + 0.7,
        speedY: Math.random() * 0.18 + 0.06,
        driftX: (Math.random() - 0.5) * 0.08,
        baseAlpha: Math.random() * 0.25 + 0.15,
        phase: Math.random() * Math.PI * 2
      }));
    };

    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      config = getGridConfig();
      initEmbers(width, height);

      if (!mouse.hasInteracted) {
        mouse.targetX = width / 2;
        mouse.targetY = height * 0.4;
        mouse.currentX = width / 2;
        mouse.currentY = height * 0.4;
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Track pointer globally so hovering over cards continues to smoothly cast light
    const updatePointerPosition = (clientX, clientY) => {
      if (!container || !isVisible) return;
      const rect = container.getBoundingClientRect();
      const inX = clientX >= rect.left && clientX <= rect.right;
      const inY = clientY >= rect.top && clientY <= rect.bottom;

      if (inX && inY) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        mouse.targetX = x;
        mouse.targetY = y;
        mouse.targetIntensity = 1;
        mouse.isInside = true;
        mouse.hasInteracted = true;
      } else {
        mouse.targetIntensity = 0.25;
        mouse.isInside = false;
      }
    };

    const handlePointerMove = (e) => {
      updatePointerPosition(e.clientX, e.clientY);
    };

    const handleDocumentLeave = () => {
      mouse.targetIntensity = 0.25;
      mouse.isInside = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      mouse.targetIntensity = 0.25;
      mouse.isInside = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleDocumentLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // IntersectionObserver to pause rendering loop when section is off-screen
    let lastTime = performance.now();
    let ambientTime = 0;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            lastTime = performance.now();
            animId = requestAnimationFrame(render);
          }
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Helpers to calculate boundary endpoints of diagonal lines
    // Family 1 (\): y - x = C => y = x + C
    const getBoundaryEndpointsFamily1 = (C, W, H) => {
      const pts = [];
      if (C >= 0 && C <= H) pts.push({ x: 0, y: C });
      const yAtW = W + C;
      if (yAtW >= 0 && yAtW <= H) pts.push({ x: W, y: yAtW });
      const xAt0 = -C;
      if (xAt0 >= 0 && xAt0 <= W) {
        if (!pts.some((p) => Math.abs(p.x - xAt0) < 0.1 && Math.abs(p.y - 0) < 0.1)) {
          pts.push({ x: xAt0, y: 0 });
        }
      }
      const xAtH = H - C;
      if (xAtH >= 0 && xAtH <= W) {
        if (!pts.some((p) => Math.abs(p.x - xAtH) < 0.1 && Math.abs(p.y - H) < 0.1)) {
          pts.push({ x: xAtH, y: H });
        }
      }
      return pts.length === 2 ? { A: pts[0], B: pts[1] } : null;
    };

    // Family 2 (/): x + y = C => y = C - x
    const getBoundaryEndpointsFamily2 = (C, W, H) => {
      const pts = [];
      if (C >= 0 && C <= H) pts.push({ x: 0, y: C });
      const yAtW = C - W;
      if (yAtW >= 0 && yAtW <= H) pts.push({ x: W, y: yAtW });
      const xAt0 = C;
      if (xAt0 >= 0 && xAt0 <= W) {
        if (!pts.some((p) => Math.abs(p.x - xAt0) < 0.1 && Math.abs(p.y - 0) < 0.1)) {
          pts.push({ x: xAt0, y: 0 });
        }
      }
      const xAtH = C - H;
      if (xAtH >= 0 && xAtH <= W) {
        if (!pts.some((p) => Math.abs(p.x - xAtH) < 0.1 && Math.abs(p.y - H) < 0.1)) {
          pts.push({ x: xAtH, y: H });
        }
      }
      return pts.length === 2 ? { A: pts[0], B: pts[1] } : null;
    };

    const render = (now) => {
      if (!isVisible) {
        animId = null;
        return;
      }

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      ambientTime += delta;

      // Frame-rate independent lerp using delta time for rock-solid 60/120fps smoothness
      const smoothFactor = prefersReducedMotion
        ? 1
        : 1 - Math.pow(Math.max(0, 1 - config.lerpFactor), delta * 60);

      mouse.currentX += (mouse.targetX - mouse.currentX) * smoothFactor;
      mouse.currentY += (mouse.targetY - mouse.currentY) * smoothFactor;
      mouse.currentIntensity +=
        (mouse.targetIntensity - mouse.currentIntensity) * (smoothFactor * 0.9);

      ctx.clearRect(0, 0, width, height);

      const { cellSize } = config;

      // Base grid setup
      const numCols = Math.ceil(width / cellSize) + 2;
      const numRows = Math.ceil(height / cellSize) + 2;
      const startX = ((width - (numCols - 2) * cellSize) / 2) % cellSize - cellSize;
      const startY = ((height - (numRows - 2) * cellSize) / 2) % cellSize - cellSize;

      const effectiveIntensity = Math.max(0, mouse.currentIntensity);
      const mx = mouse.currentX;
      const my = mouse.currentY;

      // Subtle ambient pulsation when idle
      const idleLineAlpha = prefersReducedMotion
        ? 0.30
        : 0.30 + Math.sin(ambientTime * 0.6) * 0.04;

      // -------------------------------------------------------------
      // Pass 0: CELESTIAL STARDUST PARTICLES (Under the grid)
      // Delicate ambient warmth that echoes the portfolio's About hero
      // -------------------------------------------------------------
      if (!prefersReducedMotion && embers.length > 0) {
        embers.forEach((emb) => {
          emb.y -= emb.speedY;
          emb.x += emb.driftX + Math.sin(ambientTime * 0.8 + emb.phase) * 0.08;

          if (emb.y < -10) {
            emb.y = height + 10;
            emb.x = Math.random() * width;
          }
          if (emb.x < -10) emb.x = width + 10;
          if (emb.x > width + 10) emb.x = -10;

          const alpha = emb.baseAlpha + Math.sin(ambientTime + emb.phase) * 0.08;
          ctx.beginPath();
          ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(235, 185, 110, ${Math.max(0.05, alpha)})`;
          ctx.fill();
        });
      }

      // -------------------------------------------------------------
      // Pass 1: BASE 'X' LATTICE WITH SOPHISTICATED MODULAR CADENCE
      // Minor lines: warm bronze-brown (0.95px)
      // Major lines (every 4th line): radiant antique gold (1.25px)
      // Creates an architectural coordinate rhythm across 100% of the canvas
      // -------------------------------------------------------------
      const c1Base = startY - startX;
      const minK1 = -numCols - 4;
      const maxK1 = numRows + 4;

      // 1A: Family 1 Lines (\)
      for (let k = minK1; k <= maxK1; k++) {
        const C = c1Base + k * cellSize;
        const endpoints = getBoundaryEndpointsFamily1(C, width, height);
        if (endpoints) {
          const isMajor = Math.abs(k) % 4 === 0;
          ctx.lineWidth = isMajor ? 1.25 : 0.95;
          ctx.strokeStyle = isMajor
            ? `rgba(215, 165, 85, ${idleLineAlpha * 1.35})`
            : `rgba(165, 120, 65, ${idleLineAlpha * 0.72})`;

          ctx.beginPath();
          ctx.moveTo(endpoints.A.x, endpoints.A.y);
          ctx.lineTo(endpoints.B.x, endpoints.B.y);
          ctx.stroke();
        }
      }

      // 1B: Family 2 Lines (/)
      const c2Base = startX + startY;
      const minK2 = -4;
      const maxK2 = numCols + numRows + 4;

      for (let k = minK2; k <= maxK2; k++) {
        const C = c2Base + k * cellSize;
        const endpoints = getBoundaryEndpointsFamily2(C, width, height);
        if (endpoints) {
          const isMajor = Math.abs(k) % 4 === 0;
          ctx.lineWidth = isMajor ? 1.25 : 0.95;
          ctx.strokeStyle = isMajor
            ? `rgba(215, 165, 85, ${idleLineAlpha * 1.35})`
            : `rgba(165, 120, 65, ${idleLineAlpha * 0.72})`;

          ctx.beginPath();
          ctx.moveTo(endpoints.A.x, endpoints.A.y);
          ctx.lineTo(endpoints.B.x, endpoints.B.y);
          ctx.stroke();
        }
      }

      // -------------------------------------------------------------
      // Pass 2: FOCUSED LASER ILLUMINATION (REDUCED NUMBER OF LINES)
      // Tightly targeted on the primary crossing pair of lines under cursor.
      // Light spreads intensely along the exact lines to the canvas edges.
      // GPU-accelerated multi-pass stroke rendering for 120fps fluid response.
      // -------------------------------------------------------------
      if (effectiveIntensity > 0.02) {
        // Tight influence distance: only the immediate line(s) catch light
        const maxInfluenceDist = cellSize * 0.78;

        // --- Active Family 1 Line (\: y - x = C) ---
        const c1Cursor = my - mx;
        const k1Nearest = Math.round((c1Cursor - c1Base) / cellSize);

        // Only evaluate the single nearest line and its immediate neighbors (-1, 0, 1)
        for (let offset = -1; offset <= 1; offset++) {
          const k = k1Nearest + offset;
          const C = c1Base + k * cellSize;
          const perpDist = Math.abs(c1Cursor - C) / Math.SQRT2;

          if (perpDist < maxInfluenceDist) {
            const endpoints = getBoundaryEndpointsFamily1(C, width, height);
            if (endpoints) {
              const { A, B } = endpoints;

              // Projection of cursor onto this line
              const px = (mx + my - C) / 2;
              const py = (mx + my + C) / 2;

              // Steep falloff: concentrates energy on the closest line
              let lineWeight = 1 - perpDist / maxInfluenceDist;
              lineWeight = Math.pow(lineWeight, 2.2) * effectiveIntensity;

              if (lineWeight > 0.03) {
                // Gradient P -> End A
                const distPA = Math.hypot(A.x - px, A.y - py);
                if (distPA > 1) {
                  const gradA = ctx.createLinearGradient(px, py, A.x, A.y);
                  gradA.addColorStop(0, `rgba(255, 252, 235, ${1.0 * lineWeight})`);
                  gradA.addColorStop(0.18, `rgba(255, 215, 125, ${0.92 * lineWeight})`);
                  gradA.addColorStop(0.48, `rgba(235, 160, 65, ${0.68 * lineWeight})`);
                  gradA.addColorStop(0.80, `rgba(205, 110, 30, ${0.30 * lineWeight})`);
                  gradA.addColorStop(1, 'rgba(185, 85, 20, 0)');

                  // Outer ambient bloom stroke
                  ctx.strokeStyle = gradA;
                  ctx.lineWidth = 4.2;
                  ctx.globalAlpha = 0.4;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(A.x, A.y);
                  ctx.stroke();

                  // Sharp radiant core stroke
                  ctx.lineWidth = 1.7;
                  ctx.globalAlpha = 1.0;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(A.x, A.y);
                  ctx.stroke();
                }

                // Gradient P -> End B
                const distPB = Math.hypot(B.x - px, B.y - py);
                if (distPB > 1) {
                  const gradB = ctx.createLinearGradient(px, py, B.x, B.y);
                  gradB.addColorStop(0, `rgba(255, 252, 235, ${1.0 * lineWeight})`);
                  gradB.addColorStop(0.18, `rgba(255, 215, 125, ${0.92 * lineWeight})`);
                  gradB.addColorStop(0.48, `rgba(235, 160, 65, ${0.68 * lineWeight})`);
                  gradB.addColorStop(0.80, `rgba(205, 110, 30, ${0.30 * lineWeight})`);
                  gradB.addColorStop(1, 'rgba(185, 85, 20, 0)');

                  // Outer ambient bloom stroke
                  ctx.strokeStyle = gradB;
                  ctx.lineWidth = 4.2;
                  ctx.globalAlpha = 0.4;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(B.x, B.y);
                  ctx.stroke();

                  // Sharp radiant core stroke
                  ctx.lineWidth = 1.7;
                  ctx.globalAlpha = 1.0;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(B.x, B.y);
                  ctx.stroke();
                }
              }
            }
          }
        }

        // --- Active Family 2 Line (/: x + y = C) ---
        const c2Cursor = mx + my;
        const k2Nearest = Math.round((c2Cursor - c2Base) / cellSize);

        // Only evaluate the single nearest line and its immediate neighbors (-1, 0, 1)
        for (let offset = -1; offset <= 1; offset++) {
          const k = k2Nearest + offset;
          const C = c2Base + k * cellSize;
          const perpDist = Math.abs(c2Cursor - C) / Math.SQRT2;

          if (perpDist < maxInfluenceDist) {
            const endpoints = getBoundaryEndpointsFamily2(C, width, height);
            if (endpoints) {
              const { A, B } = endpoints;

              // Projection of cursor onto this line
              const px = (mx - my + C) / 2;
              const py = (-mx + my + C) / 2;

              let lineWeight = 1 - perpDist / maxInfluenceDist;
              lineWeight = Math.pow(lineWeight, 2.2) * effectiveIntensity;

              if (lineWeight > 0.03) {
                // Gradient P -> End A
                const distPA = Math.hypot(A.x - px, A.y - py);
                if (distPA > 1) {
                  const gradA = ctx.createLinearGradient(px, py, A.x, A.y);
                  gradA.addColorStop(0, `rgba(255, 252, 235, ${1.0 * lineWeight})`);
                  gradA.addColorStop(0.18, `rgba(255, 215, 125, ${0.92 * lineWeight})`);
                  gradA.addColorStop(0.48, `rgba(235, 160, 65, ${0.68 * lineWeight})`);
                  gradA.addColorStop(0.80, `rgba(205, 110, 30, ${0.30 * lineWeight})`);
                  gradA.addColorStop(1, 'rgba(185, 85, 20, 0)');

                  // Outer ambient bloom stroke
                  ctx.strokeStyle = gradA;
                  ctx.lineWidth = 4.2;
                  ctx.globalAlpha = 0.4;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(A.x, A.y);
                  ctx.stroke();

                  // Sharp radiant core stroke
                  ctx.lineWidth = 1.7;
                  ctx.globalAlpha = 1.0;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(A.x, A.y);
                  ctx.stroke();
                }

                // Gradient P -> End B
                const distPB = Math.hypot(B.x - px, B.y - py);
                if (distPB > 1) {
                  const gradB = ctx.createLinearGradient(px, py, B.x, B.y);
                  gradB.addColorStop(0, `rgba(255, 252, 235, ${1.0 * lineWeight})`);
                  gradB.addColorStop(0.18, `rgba(255, 215, 125, ${0.92 * lineWeight})`);
                  gradB.addColorStop(0.48, `rgba(235, 160, 65, ${0.68 * lineWeight})`);
                  gradB.addColorStop(0.80, `rgba(205, 110, 30, ${0.30 * lineWeight})`);
                  gradB.addColorStop(1, 'rgba(185, 85, 20, 0)');

                  // Outer ambient bloom stroke
                  ctx.strokeStyle = gradB;
                  ctx.lineWidth = 4.2;
                  ctx.globalAlpha = 0.4;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(B.x, B.y);
                  ctx.stroke();

                  // Sharp radiant core stroke
                  ctx.lineWidth = 1.7;
                  ctx.globalAlpha = 1.0;
                  ctx.beginPath();
                  ctx.moveTo(px, py);
                  ctx.lineTo(B.x, B.y);
                  ctx.stroke();
                }
              }
            }
          }
        }
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleDocumentLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Deep obsidian base */}
      <div className="absolute inset-0 bg-[#06080d] pointer-events-none" />

      {/* Layer 2: Top celestial warm amber nebula glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(229, 173, 104, 0.16) 0%, rgba(185, 115, 45, 0.05) 50%, transparent 80%)',
          filter: 'blur(30px)'
        }}
      />

      {/* Layer 3: Bottom-right warm cosmic bronze aura */}
      <div
        className="absolute bottom-0 right-0 w-[700px] h-[450px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle 450px at 85% 85%, rgba(195, 135, 65, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Layer 4: Cinematic edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 50%, rgba(6, 8, 13, 0.65) 100%)'
        }}
      />

      {/* Dynamic Interactive 'X' Slash Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />

      {/* Seamless bottom gradient fade into the subsequent Projects section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0a0c10)'
        }}
      />
    </div>
  );
}
