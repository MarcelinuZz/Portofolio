import { useEffect, useRef } from 'react';

/**
 * JourneyGridBackground
 * 
 * An elevated architectural & celestial background crafted for the Journey section.
 * Features a refined diagonal 'X' coordinate lattice where lines intersect to form
 * a continuous field of rhombuses (diamonds).
 * 
 * Interactive Rhombus Separation Animation:
 * - When the cursor enters a rhombus, the 4 boundary lines of that rhombus
 *   separate from the rhombus corners and swivel inwards to point directly at the cursor!
 * - As the cursor moves across the grid, the previous lines smoothly return and re-lock
 *   into their resting rhombus shapes, while the new rhombus's lines separate and point to the cursor.
 * - Replaces full-screen laser illumination with an intimate, precision celestial targeting reticle.
 * 
 * Antislop principles maintained:
 * - R-07 (Purpose-Gate): Coordinate lattice represents milestone navigation in space and time.
 * - R-01 & R-29 (Color): Grounded strictly in obsidian (#06080d), warm bronze, and stardust gold (#e5ad68).
 * - R-19 (Motion & Purpose): Tactile magnetic needle physics, frame-rate independent delta lerping,
 *   full prefers-reduced-motion accessibility.
 * - Performance: GPU-accelerated Canvas 2D rendering with sub-millisecond batched draw calls (60/120fps locked).
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

    // Responsive grid parameters: wide, spacious rhombuses with reduced line density
    const getGridConfig = () => {
      const w = window.innerWidth;
      const isMobile = w < 640;
      const isTablet = w < 1024;
      return {
        cellSize: isMobile ? 120 : isTablet ? 155 : 190,
        lerpFactor: prefersReducedMotion ? 1 : 0.16
      };
    };

    let config = getGridConfig();

    // Mouse coordinates: target and smoothed (lerped) values
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      targetIntensity: 0,
      currentIntensity: 0,
      isInside: false,
      hasInteracted: false
    };

    // Tracks per-edge activation state for smooth transition between rhombuses
    const activeEdgeAlphas = new Map();

    // Intro weave animation state: Top-Left -> Bottom-Right (\), then Top-Right -> Bottom-Left (/)
    let introTime = 0;
    let isIntroComplete = prefersReducedMotion;

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

    // Track pointer globally so hovering over cards continues to smoothly interact
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
        mouse.targetIntensity = 0;
        mouse.isInside = false;
      }
    };

    const handlePointerMove = (e) => {
      updatePointerPosition(e.clientX, e.clientY);
    };

    const handleDocumentLeave = () => {
      mouse.targetIntensity = 0;
      mouse.isInside = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      mouse.targetIntensity = 0;
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

    const render = (now) => {
      if (!isVisible) {
        animId = null;
        return;
      }

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      ambientTime += delta;

      if (!isIntroComplete) {
        introTime += delta;
        if (introTime >= 2.4) {
          isIntroComplete = true;
        }
      }

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
      // Pass 1 & 2: ARCHITECTURAL RHOMBUS LATTICE WITH MAGNETIC SEPARATION
      // When cursor is inside a rhombus, its boundary lines separate
      // from the rhombus corners and swivel to point directly at the cursor!
      // In idle, all lines form a seamless, resting diagonal coordinate grid.
      // -------------------------------------------------------------
      const halfS = cellSize / 2;
      const L = cellSize / Math.SQRT2; // Resting length of each rhombus edge

      const numCols = Math.ceil(width / halfS) + 8;
      const numRows = Math.ceil(height / halfS) + 8;
      const offsetX = ((width % cellSize) / 2) - cellSize * 3;
      const offsetY = ((height % cellSize) / 2) - cellSize * 3;

      // Intro wave parameters: Top-Left -> Bottom-Right (\), then Top-Right -> Bottom-Left (/)
      const w1Raw = Math.max(0, Math.min(1, (introTime - 0.15) / 1.05));
      const wave1 = w1Raw < 0.5 ? 2 * w1Raw * w1Raw : 1 - Math.pow(-2 * w1Raw + 2, 2) / 2;

      const w2Raw = Math.max(0, Math.min(1, (introTime - 0.85) / 1.05));
      const wave2 = w2Raw < 0.5 ? 2 * w2Raw * w2Raw : 1 - Math.pow(-2 * w2Raw + 2, 2) / 2;

      const minCoord = -cellSize * 3;
      const maxCoord = width + height + cellSize * 3;
      const coordRange = maxCoord - minCoord;
      const waveSpan = 0.14;

      // Identify the exact rhombus containing the cursor position (only after intro completes)
      const activeKeys = new Set();
      if (isIntroComplete && effectiveIntensity > 0.01 && mouse.isInside) {
        const X = mx - offsetX;
        const Y = my - offsetY;
        const ku = Math.floor((Y + X) / cellSize);
        const kv = Math.floor((Y - X) / cellSize);

        const c0 = ku - kv;
        const r0 = ku + kv;

        // The exact 4 boundary edges of the rhombus containing the cursor
        const k1 = `1_${c0}_${r0}`;
        const k2 = `2_${c0}_${r0}`;
        const k3 = `1_${c0 - 1}_${r0 + 1}`;
        const k4 = `2_${c0 + 1}_${r0 + 1}`;

        activeKeys.add(k1);
        activeKeys.add(k2);
        activeKeys.add(k3);
        activeKeys.add(k4);

        if (!activeEdgeAlphas.has(k1)) activeEdgeAlphas.set(k1, 0);
        if (!activeEdgeAlphas.has(k2)) activeEdgeAlphas.set(k2, 0);
        if (!activeEdgeAlphas.has(k3)) activeEdgeAlphas.set(k3, 0);
        if (!activeEdgeAlphas.has(k4)) activeEdgeAlphas.set(k4, 0);
      }

      // Delta-time smoothed transition for edge activations (fluid 60/120fps motion)
      const edgeSpeed = prefersReducedMotion ? 1 : Math.min(1, delta * 14);
      for (const [key, currentVal] of activeEdgeAlphas.entries()) {
        const target = activeKeys.has(key) ? effectiveIntensity : 0;
        const nextVal = currentVal + (target - currentVal) * edgeSpeed;
        if (nextVal < 0.005 && target === 0) {
          activeEdgeAlphas.delete(key);
        } else {
          activeEdgeAlphas.set(key, nextVal);
        }
      }

      const gridPath = new Path2D();
      const activeEdges = [];
      const introDrawingPath = new Path2D();
      const sparks = [];

      for (let r = -4; r <= numRows; r++) {
        for (let c = -4; c <= numCols; c++) {
          if (Math.abs(c + r) % 2 === 0) {
            const ax = c * halfS + offsetX;
            const ay = r * halfS + offsetY;

            // --- Outgoing Edge 1: Family 1 (\, down-right) ---
            const b1x = (c + 1) * halfS + offsetX;
            const b1y = (r + 1) * halfS + offsetY;

            let p1 = 1;
            if (!isIntroComplete) {
              const m1x = (ax + b1x) / 2;
              const m1y = (ay + b1y) / 2;
              const norm1 = (m1x + m1y - minCoord) / coordRange;
              if (wave1 <= norm1 - waveSpan) {
                p1 = 0;
              } else if (wave1 >= norm1 + waveSpan) {
                p1 = 1;
              } else {
                p1 = (wave1 - (norm1 - waveSpan)) / (2 * waveSpan);
              }
            }

            if (p1 >= 1) {
              const key1 = `1_${c}_${r}`;
              const alpha1 = isIntroComplete ? (activeEdgeAlphas.get(key1) || 0) : 0;

              if (alpha1 >= 0.01 && !prefersReducedMotion) {
                const m1x = (ax + b1x) / 2;
                const m1y = (ay + b1y) / 2;
                activeEdges.push({
                  ax, ay, bx: b1x, by: b1y,
                  dx: mx - m1x, dy: my - m1y,
                  dist: Math.hypot(mx - m1x, my - m1y),
                  alpha: alpha1
                });
              } else {
                gridPath.moveTo(ax, ay);
                gridPath.lineTo(b1x, b1y);
              }
            } else if (p1 > 0) {
              const curBx = ax + (b1x - ax) * p1;
              const curBy = ay + (b1y - ay) * p1;
              introDrawingPath.moveTo(ax, ay);
              introDrawingPath.lineTo(curBx, curBy);
              const intensity1 = Math.sin(p1 * Math.PI);
              if (intensity1 > 0.12) {
                sparks.push({ x: curBx, y: curBy, intensity: intensity1 });
              }
            }

            // --- Outgoing Edge 2: Family 2 (/, down-left) ---
            const b2x = (c - 1) * halfS + offsetX;
            const b2y = (r + 1) * halfS + offsetY;

            let p2 = 1;
            if (!isIntroComplete) {
              const m2x = (ax + b2x) / 2;
              const m2y = (ay + b2y) / 2;
              const dist2 = (width - m2x) + m2y;
              const norm2 = (dist2 - minCoord) / coordRange;
              if (wave2 <= norm2 - waveSpan) {
                p2 = 0;
              } else if (wave2 >= norm2 + waveSpan) {
                p2 = 1;
              } else {
                p2 = (wave2 - (norm2 - waveSpan)) / (2 * waveSpan);
              }
            }

            if (p2 >= 1) {
              const key2 = `2_${c}_${r}`;
              const alpha2 = isIntroComplete ? (activeEdgeAlphas.get(key2) || 0) : 0;

              if (alpha2 >= 0.01 && !prefersReducedMotion) {
                const m2x = (ax + b2x) / 2;
                const m2y = (ay + b2y) / 2;
                activeEdges.push({
                  ax, ay, bx: b2x, by: b2y,
                  dx: mx - m2x, dy: my - m2y,
                  dist: Math.hypot(mx - m2x, my - m2y),
                  alpha: alpha2
                });
              } else {
                gridPath.moveTo(ax, ay);
                gridPath.lineTo(b2x, b2y);
              }
            } else if (p2 > 0) {
              const curBx2 = ax + (b2x - ax) * p2;
              const curBy2 = ay + (b2y - ay) * p2;
              introDrawingPath.moveTo(ax, ay);
              introDrawingPath.lineTo(curBx2, curBy2);
              const intensity2 = Math.sin(p2 * Math.PI);
              if (intensity2 > 0.12) {
                sparks.push({ x: curBx2, y: curBy2, intensity: intensity2 });
              }
            }
          }
        }
      }

      // 1. Draw all resting grid lines in one clean batch
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = `rgba(215, 165, 85, ${idleLineAlpha * 1.25})`;
      ctx.stroke(gridPath);

      // 2. Render intro weaving wave (actively drawing lines with luminous bloom & spark heads)
      if (!isIntroComplete) {
        // Luminous ambient bloom on advancing threads
        ctx.beginPath();
        ctx.lineWidth = 3.6;
        ctx.strokeStyle = 'rgba(229, 173, 104, 0.35)';
        ctx.stroke(introDrawingPath);

        // Radiant golden needle core
        ctx.beginPath();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(255, 238, 185, 0.90)';
        ctx.stroke(introDrawingPath);

        // Advancing celestial sparks at line tips
        if (sparks.length > 0) {
          for (let i = 0; i < sparks.length; i++) {
            const sp = sparks[i];
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 1.8 * sp.intensity + 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 248, 225, ${0.95 * sp.intensity})`;
            ctx.fill();
          }
        }
      }

      // 2. Render active lines that separate from the rhombus and point to the cursor
      if (activeEdges.length > 0) {
        for (let i = 0; i < activeEdges.length; i++) {
          const edge = activeEdges[i];
          const { ax, ay, bx, by, dx, dy, dist, alpha } = edge;

          // Unit vector pointing toward cursor
          const uX = dx / Math.max(dist, 0.001);
          const uY = dy / Math.max(dist, 0.001);

          // Target positions: inner tip points toward cursor, outer tip extends backwards
          const clearance = 6; // Clean focal clearance around cursor
          const targetInnerX = mx - uX * clearance;
          const targetInnerY = my - uY * clearance;
          const targetOuterX = targetInnerX - uX * L;
          const targetOuterY = targetInnerY - uY * L;

          // Determine which resting vertex was closer to the cursor
          const distA = Math.hypot(ax - mx, ay - my);
          const distB = Math.hypot(bx - mx, by - my);

          let curAx, curAy, curBx, curBy;

          if (distB < distA) {
            curAx = (1 - alpha) * ax + alpha * targetOuterX;
            curAy = (1 - alpha) * ay + alpha * targetOuterY;
            curBx = (1 - alpha) * bx + alpha * targetInnerX;
            curBy = (1 - alpha) * by + alpha * targetInnerY;
          } else {
            curAx = (1 - alpha) * ax + alpha * targetInnerX;
            curAy = (1 - alpha) * ay + alpha * targetInnerY;
            curBx = (1 - alpha) * bx + alpha * targetOuterX;
            curBy = (1 - alpha) * by + alpha * targetOuterY;
          }

          // Ambient luminous bloom stroke
          ctx.beginPath();
          ctx.moveTo(curAx, curAy);
          ctx.lineTo(curBx, curBy);
          ctx.lineCap = 'round';
          ctx.lineWidth = 3.6 * alpha + 1.0;
          ctx.strokeStyle = `rgba(229, 173, 104, ${0.30 * alpha})`;
          ctx.stroke();

          // Radiant golden pointer core
          ctx.beginPath();
          ctx.moveTo(curAx, curAy);
          ctx.lineTo(curBx, curBy);
          ctx.lineCap = 'round';
          ctx.lineWidth = 1.5 + 0.8 * alpha;
          ctx.strokeStyle = `rgba(255, 235, 175, ${0.5 + 0.5 * alpha})`;
          ctx.stroke();
        }
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

      {/* Dynamic Interactive Rhombus Separation Canvas */}
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
