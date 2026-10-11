import { useEffect, useRef } from 'react';

// Normalized astronomical constellation templates [0..1, 0..1]
const CONSTELLATIONS = [
  {
    // Orion (Sang Pemburu)
    stars: [
      { x: 0.22, y: 0.18, size: 2.8, color: '#f59e0b', flare: true }, // Betelgeuse
      { x: 0.78, y: 0.20, size: 2.4, color: '#e0f2fe', flare: true }, // Bellatrix
      { x: 0.38, y: 0.48, size: 1.9, color: '#ffffff', flare: false }, // Alnitak
      { x: 0.50, y: 0.50, size: 1.9, color: '#ffffff', flare: false }, // Alnilam
      { x: 0.62, y: 0.52, size: 1.9, color: '#ffffff', flare: false }, // Mintaka
      { x: 0.28, y: 0.85, size: 2.2, color: '#e2e8f0', flare: false }, // Saiph
      { x: 0.82, y: 0.82, size: 3.0, color: '#bae6fd', flare: true }, // Rigel
      { x: 0.50, y: 0.08, size: 1.6, color: '#e2e8f0', flare: false }  // Meissa
    ],
    edges: [
      [7, 0], [7, 1], [0, 2], [1, 4],
      [2, 3], [3, 4], [2, 5], [4, 6], [5, 6]
    ]
  },
  {
    // Ursa Major (Bintang Biduk)
    stars: [
      { x: 0.05, y: 0.45, size: 2.3, color: '#ffffff', flare: false },
      { x: 0.20, y: 0.38, size: 2.1, color: '#ffffff', flare: false },
      { x: 0.35, y: 0.35, size: 1.9, color: '#fef3c7', flare: false },
      { x: 0.50, y: 0.30, size: 1.8, color: '#e2e8f0', flare: false },
      { x: 0.52, y: 0.56, size: 2.2, color: '#ffffff', flare: false },
      { x: 0.74, y: 0.52, size: 2.5, color: '#e0f2fe', flare: true },
      { x: 0.78, y: 0.26, size: 2.6, color: '#fef08a', flare: true }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3],
      [3, 4], [4, 5], [5, 6], [6, 3]
    ]
  },
  {
    // Cassiopeia ('W')
    stars: [
      { x: 0.08, y: 0.40, size: 2.2, color: '#e2e8f0', flare: false },
      { x: 0.28, y: 0.70, size: 2.6, color: '#fef08a', flare: true },
      { x: 0.50, y: 0.32, size: 2.7, color: '#e0f2fe', flare: true },
      { x: 0.72, y: 0.65, size: 2.1, color: '#e2e8f0', flare: false },
      { x: 0.92, y: 0.28, size: 2.0, color: '#ffffff', flare: false }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ]
  },
  {
    // Cygnus (Salib Utara / Angsa)
    stars: [
      { x: 0.50, y: 0.10, size: 2.9, color: '#e0f2fe', flare: true }, // Deneb
      { x: 0.50, y: 0.46, size: 2.4, color: '#fef08a', flare: true }, // Sadr
      { x: 0.50, y: 0.90, size: 2.2, color: '#f59e0b', flare: false }, // Albireo
      { x: 0.15, y: 0.42, size: 2.1, color: '#ffffff', flare: false },
      { x: 0.85, y: 0.42, size: 2.1, color: '#e0f2fe', flare: false }
    ],
    edges: [
      [0, 1], [1, 2], [3, 1], [1, 4]
    ]
  },
  {
    // Crux (Salib Selatan / Pari)
    stars: [
      { x: 0.50, y: 0.12, size: 2.4, color: '#fef08a', flare: false },
      { x: 0.50, y: 0.88, size: 2.9, color: '#bae6fd', flare: true }, // Acrux
      { x: 0.18, y: 0.48, size: 2.6, color: '#e0f2fe', flare: true }, // Mimosa
      { x: 0.82, y: 0.46, size: 2.1, color: '#ffffff', flare: false },
      { x: 0.65, y: 0.62, size: 1.5, color: '#e2e8f0', flare: false }
    ],
    edges: [
      [0, 1], [2, 3], [1, 4]
    ]
  },
  {
    // Lyra (Vega)
    stars: [
      { x: 0.35, y: 0.10, size: 3.2, color: '#e0f2fe', flare: true }, // Vega
      { x: 0.62, y: 0.22, size: 1.8, color: '#ffffff', flare: false },
      { x: 0.44, y: 0.48, size: 1.9, color: '#e2e8f0', flare: false },
      { x: 0.32, y: 0.85, size: 2.1, color: '#fef3c7', flare: false },
      { x: 0.68, y: 0.88, size: 2.2, color: '#ffffff', flare: false },
      { x: 0.78, y: 0.50, size: 1.8, color: '#e2e8f0', flare: false }
    ],
    edges: [
      [0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [5, 2]
    ]
  },
  {
    // Canis Major (Sirius - Bintang paling terang di langit malam)
    stars: [
      { x: 0.35, y: 0.25, size: 3.5, color: '#bae6fd', flare: true }, // Sirius
      { x: 0.12, y: 0.35, size: 2.3, color: '#e0f2fe', flare: false },
      { x: 0.48, y: 0.15, size: 1.7, color: '#ffffff', flare: false },
      { x: 0.62, y: 0.62, size: 2.5, color: '#fef08a', flare: true },
      { x: 0.45, y: 0.85, size: 2.7, color: '#e0f2fe', flare: true },
      { x: 0.85, y: 0.80, size: 2.1, color: '#ffffff', flare: false }
    ],
    edges: [
      [1, 0], [0, 2], [0, 3], [3, 4], [3, 5]
    ]
  },
  {
    // Taurus (Aldebaran)
    stars: [
      { x: 0.35, y: 0.55, size: 3.1, color: '#f59e0b', flare: true }, // Aldebaran
      { x: 0.85, y: 0.15, size: 2.5, color: '#e0f2fe', flare: true },
      { x: 0.88, y: 0.60, size: 2.2, color: '#ffffff', flare: false },
      { x: 0.28, y: 0.40, size: 2.0, color: '#fef3c7', flare: false },
      { x: 0.18, y: 0.65, size: 1.8, color: '#e2e8f0', flare: false }
    ],
    edges: [
      [4, 0], [0, 3], [3, 1], [0, 2]
    ]
  },
  {
    // Pleiades (Bintang Kartika cluster)
    stars: [
      { x: 0.50, y: 0.45, size: 2.7, color: '#bae6fd', flare: true },
      { x: 0.72, y: 0.62, size: 2.3, color: '#e0f2fe', flare: false },
      { x: 0.28, y: 0.35, size: 2.4, color: '#e0f2fe', flare: false },
      { x: 0.38, y: 0.22, size: 2.1, color: '#ffffff', flare: false },
      { x: 0.35, y: 0.60, size: 2.0, color: '#bae6fd', flare: false },
      { x: 0.20, y: 0.18, size: 1.9, color: '#ffffff', flare: false },
      { x: 0.76, y: 0.52, size: 1.8, color: '#e0f2fe', flare: false }
    ],
    edges: [
      [1, 6], [6, 0], [0, 4], [0, 3], [3, 5], [3, 2], [2, 4]
    ]
  },
  {
    // Gemini (Castor & Pollux)
    stars: [
      { x: 0.30, y: 0.12, size: 2.8, color: '#ffffff', flare: true }, // Castor
      { x: 0.55, y: 0.15, size: 3.0, color: '#f59e0b', flare: true }, // Pollux
      { x: 0.42, y: 0.48, size: 2.1, color: '#fef08a', flare: false },
      { x: 0.20, y: 0.52, size: 2.0, color: '#ffffff', flare: false },
      { x: 0.25, y: 0.78, size: 1.9, color: '#e2e8f0', flare: false },
      { x: 0.58, y: 0.85, size: 2.6, color: '#e0f2fe', flare: true }
    ],
    edges: [
      [0, 1], [0, 3], [1, 2], [3, 4], [2, 5]
    ]
  },
  {
    // Scorpius (Antares)
    stars: [
      { x: 0.45, y: 0.35, size: 3.2, color: '#ef4444', flare: true }, // Antares
      { x: 0.22, y: 0.15, size: 2.2, color: '#ffffff', flare: false },
      { x: 0.32, y: 0.20, size: 2.4, color: '#e0f2fe', flare: false },
      { x: 0.20, y: 0.30, size: 1.9, color: '#ffffff', flare: false },
      { x: 0.55, y: 0.68, size: 2.4, color: '#fef08a', flare: false },
      { x: 0.85, y: 0.82, size: 2.8, color: '#bae6fd', flare: true }, // Shaula
      { x: 0.80, y: 0.74, size: 2.1, color: '#ffffff', flare: false }
    ],
    edges: [
      [1, 2], [2, 3], [2, 0], [0, 4], [4, 6], [6, 5]
    ]
  },
  {
    // Aquila (Altair)
    stars: [
      { x: 0.50, y: 0.45, size: 3.1, color: '#ffffff', flare: true }, // Altair
      { x: 0.42, y: 0.25, size: 2.3, color: '#f59e0b', flare: false },
      { x: 0.58, y: 0.65, size: 2.1, color: '#fef3c7', flare: false },
      { x: 0.20, y: 0.50, size: 2.0, color: '#e0f2fe', flare: false },
      { x: 0.80, y: 0.48, size: 2.0, color: '#ffffff', flare: false }
    ],
    edges: [
      [1, 0], [0, 2], [3, 0], [0, 4]
    ]
  },
  {
    // Leo (Regulus)
    stars: [
      { x: 0.25, y: 0.75, size: 3.1, color: '#bae6fd', flare: true }, // Regulus
      { x: 0.40, y: 0.40, size: 2.5, color: '#fef08a', flare: true },
      { x: 0.48, y: 0.25, size: 2.0, color: '#ffffff', flare: false },
      { x: 0.32, y: 0.15, size: 1.8, color: '#e2e8f0', flare: false },
      { x: 0.75, y: 0.35, size: 2.3, color: '#ffffff', flare: false },
      { x: 0.70, y: 0.65, size: 2.1, color: '#e2e8f0', flare: false },
      { x: 0.92, y: 0.45, size: 2.7, color: '#e0f2fe', flare: true }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 0], [4, 6]
    ]
  },
  {
    // Pegasus (The Great Square)
    stars: [
      { x: 0.20, y: 0.75, size: 2.4, color: '#ffffff', flare: false },
      { x: 0.22, y: 0.22, size: 2.6, color: '#f59e0b', flare: true },
      { x: 0.80, y: 0.20, size: 2.7, color: '#bae6fd', flare: true },
      { x: 0.78, y: 0.72, size: 2.3, color: '#e0f2fe', flare: false },
      { x: 0.05, y: 0.90, size: 2.4, color: '#fef08a', flare: false }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0], [0, 4]
    ]
  },
  {
    // Corona Borealis (Mahkota)
    stars: [
      { x: 0.50, y: 0.65, size: 2.8, color: '#ffffff', flare: true }, // Alphecca
      { x: 0.30, y: 0.55, size: 2.1, color: '#fef08a', flare: false },
      { x: 0.18, y: 0.35, size: 1.9, color: '#e0f2fe', flare: false },
      { x: 0.70, y: 0.55, size: 2.0, color: '#ffffff', flare: false },
      { x: 0.82, y: 0.35, size: 1.8, color: '#e2e8f0', flare: false }
    ],
    edges: [
      [2, 1], [1, 0], [0, 3], [3, 4]
    ]
  },
  {
    // Bootes (Arcturus)
    stars: [
      { x: 0.45, y: 0.85, size: 3.4, color: '#f59e0b', flare: true }, // Arcturus
      { x: 0.20, y: 0.78, size: 2.2, color: '#ffffff', flare: false },
      { x: 0.58, y: 0.52, size: 2.4, color: '#fef08a', flare: true },
      { x: 0.30, y: 0.25, size: 2.1, color: '#e0f2fe', flare: false },
      { x: 0.65, y: 0.15, size: 2.0, color: '#fef3c7', flare: false }
    ],
    edges: [
      [1, 0], [0, 2], [2, 3], [3, 4], [4, 2]
    ]
  },
  {
    // Centaurus (Alpha Centauri)
    stars: [
      { x: 0.20, y: 0.75, size: 3.3, color: '#fef08a', flare: true }, // Rigil Kent
      { x: 0.45, y: 0.72, size: 3.0, color: '#bae6fd', flare: true }, // Hadar
      { x: 0.50, y: 0.20, size: 2.3, color: '#f59e0b', flare: false },
      { x: 0.75, y: 0.45, size: 2.1, color: '#ffffff', flare: false }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3]
    ]
  }
];

export default function JourneyGridBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = {
      targetX: -9999,
      targetY: -9999,
      currentX: -9999,
      currentY: -9999,
      targetIntensity: 0,
      currentIntensity: 0,
      isInside: false
    };

    const emberCount = 30;
    let embers = [];

    const initEmbers = (w, h) => {
      embers = Array.from({ length: emberCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.3 + 0.7,
        speedY: Math.random() * 0.18 + 0.06,
        driftX: (Math.random() - 0.5) * 0.08,
        baseAlpha: Math.random() * 0.25 + 0.12,
        phase: Math.random() * Math.PI * 2
      }));
    };

    let activeConstellations = [];
    let fieldStars = [];

    const setupStarMap = (w, h) => {
      const isMobile = w < 640;
      const isTablet = w < 1024;

      let layoutSpecs;

      if (isMobile) {
        layoutSpecs = [
          { tIdx: 2,  cx: 0.26, cy: 0.05, rot: -0.45, scale: 0.90 }, // Cassiopeia
          { tIdx: 5,  cx: 0.74, cy: 0.12, rot: 0.35,  scale: 0.85 }, // Lyra
          { tIdx: 8,  cx: 0.38, cy: 0.22, rot: -0.25, scale: 0.80 }, // Pleiades
          { tIdx: 3,  cx: 0.78, cy: 0.33, rot: 0.52,  scale: 0.95 }, // Cygnus
          { tIdx: 1,  cx: 0.24, cy: 0.44, rot: 0.38,  scale: 1.00 }, // Ursa Major
          { tIdx: 0,  cx: 0.70, cy: 0.57, rot: -0.32, scale: 1.05 }, // Orion
          { tIdx: 7,  cx: 0.28, cy: 0.69, rot: 0.48,  scale: 0.92 }, // Taurus
          { tIdx: 9,  cx: 0.76, cy: 0.81, rot: -0.40, scale: 0.95 }, // Gemini
          { tIdx: 4,  cx: 0.35, cy: 0.92, rot: 0.28,  scale: 0.88 }  // Crux
        ];
      } else if (isTablet) {
        layoutSpecs = [
          { tIdx: 2,  cx: 0.18, cy: 0.09, rot: -0.52, scale: 0.95 }, // Cassiopeia
          { tIdx: 14, cx: 0.48, cy: 0.06, rot: 0.25,  scale: 0.80 }, // Corona Borealis
          { tIdx: 3,  cx: 0.82, cy: 0.11, rot: 0.48,  scale: 1.00 }, // Cygnus
          { tIdx: 8,  cx: 0.34, cy: 0.24, rot: -0.22, scale: 0.85 }, // Pleiades
          { tIdx: 1,  cx: 0.12, cy: 0.36, rot: 0.42,  scale: 1.05 }, // Ursa Major
          { tIdx: 9,  cx: 0.84, cy: 0.32, rot: -0.38, scale: 1.00 }, // Gemini
          { tIdx: 0,  cx: 0.64, cy: 0.48, rot: -0.26, scale: 1.15 }, // Orion
          { tIdx: 7,  cx: 0.16, cy: 0.58, rot: 0.34,  scale: 0.95 }, // Taurus
          { tIdx: 12, cx: 0.38, cy: 0.72, rot: -0.42, scale: 1.00 }, // Leo
          { tIdx: 10, cx: 0.82, cy: 0.75, rot: 0.45,  scale: 1.10 }, // Scorpius
          { tIdx: 4,  cx: 0.24, cy: 0.88, rot: 0.22,  scale: 0.90 }  // Crux
        ];
      } else {
        layoutSpecs = [
          { tIdx: 2,  cx: 0.21, cy: 0.08, rot: -0.62, scale: 0.95 }, // Cassiopeia
          { tIdx: 14, cx: 0.46, cy: 0.05, rot: -0.22, scale: 0.80 }, // Corona Borealis
          { tIdx: 5,  cx: 0.66, cy: 0.11, rot: -0.45, scale: 0.92 }, // Lyra / Vega
          { tIdx: 3,  cx: 0.86, cy: 0.13, rot: 0.58,  scale: 1.05 }, // Cygnus

          { tIdx: 8,  cx: 0.36, cy: 0.21, rot: 0.28,  scale: 0.85 }, // Pleiades cluster
          { tIdx: 1,  cx: 0.14, cy: 0.30, rot: 0.36,  scale: 1.10 }, // Ursa Major / Biduk
          { tIdx: 9,  cx: 0.79, cy: 0.33, rot: -0.50, scale: 1.05 }, // Gemini

          { tIdx: 7,  cx: 0.09, cy: 0.51, rot: -0.32, scale: 0.98 }, // Taurus
          { tIdx: 12, cx: 0.32, cy: 0.44, rot: 0.42,  scale: 1.05 }, // Leo
          { tIdx: 0,  cx: 0.58, cy: 0.48, rot: -0.24, scale: 1.20 }, // Orion
          { tIdx: 11, cx: 0.91, cy: 0.52, rot: -0.65, scale: 0.95 }, // Aquila / Altair

          { tIdx: 6,  cx: 0.11, cy: 0.73, rot: 0.62,  scale: 1.10 }, // Canis Major / Sirius
          { tIdx: 4,  cx: 0.34, cy: 0.82, rot: 0.30,  scale: 0.90 }, // Crux
          { tIdx: 15, cx: 0.56, cy: 0.80, rot: -0.38, scale: 1.05 }, // Bootes / Arcturus
          { tIdx: 10, cx: 0.83, cy: 0.76, rot: 0.46,  scale: 1.15 }  // Scorpius / Antares
        ];
      }

      const baseW = Math.min(w * 0.22, 240);
      const baseH = Math.min(h * 0.22, 190);

      activeConstellations = layoutSpecs.map((spec, cIdx) => {
        const template = CONSTELLATIONS[spec.tIdx];
        const cos = Math.cos(spec.rot);
        const sin = Math.sin(spec.rot);
        const centerX = spec.cx * w;
        const centerY = spec.cy * h;

        const stars = template.stars.map((s, sIdx) => {
          const dx = (s.x - 0.5) * baseW * spec.scale;
          const dy = (s.y - 0.5) * baseH * spec.scale;

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          return {
            id: `c_${cIdx}_${sIdx}`,
            x: centerX + rx,
            y: centerY + ry,
            radius: s.size * (0.85 + spec.scale * 0.15),
            color: s.color,
            flare: s.flare,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 1.8 + 1.2
          };
        });

        return {
          stars,
          edges: template.edges
        };
      });

      const fieldCount = isMobile ? 65 : 130;
      fieldStars = Array.from({ length: fieldCount }, (_, i) => ({
        id: `f_${i}`,
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.3 + 0.6,
        color:
          Math.random() > 0.45
            ? '#ffffff'
            : Math.random() > 0.5
            ? '#fef3c7'
            : '#bae6fd',
        flare: Math.random() < 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2.2 + 0.8
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

      initEmbers(width, height);
      setupStarMap(width, height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    const updatePointerPosition = (clientX, clientY) => {
      if (!container || !isVisible) return;
      const rect = container.getBoundingClientRect();
      const inX = clientX >= rect.left && clientX <= rect.right;
      const inY = clientY >= rect.top && clientY <= rect.bottom;

      if (inX && inY) {
        mouse.targetX = clientX - rect.left;
        mouse.targetY = clientY - rect.top;
        mouse.targetIntensity = 1;
        mouse.isInside = true;
      } else {
        mouse.targetIntensity = 0;
        mouse.isInside = false;
      }
    };

    const handlePointerMove = (e) => updatePointerPosition(e.clientX, e.clientY);
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

    let lastTime = performance.now();
    let time = 0;
    let introProgress = prefersReducedMotion ? 1 : 0;

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
      time += delta;

      if (introProgress < 1) {
        introProgress = Math.min(1, introProgress + delta * 0.9);
      }

      const lerpFactor = prefersReducedMotion ? 1 : Math.min(1, delta * 8.5);
      if (mouse.targetX > -9000) {
        if (mouse.currentX < -9000) {
          mouse.currentX = mouse.targetX;
          mouse.currentY = mouse.targetY;
        } else {
          mouse.currentX += (mouse.targetX - mouse.currentX) * lerpFactor;
          mouse.currentY += (mouse.targetY - mouse.currentY) * lerpFactor;
        }
      }
      mouse.currentIntensity +=
        (mouse.targetIntensity - mouse.currentIntensity) * lerpFactor;

      ctx.clearRect(0, 0, width, height);

      const mx = mouse.currentX;
      const my = mouse.currentY;
      const mIntensity = Math.max(0, mouse.currentIntensity);

      if (!prefersReducedMotion && embers.length > 0) {
        embers.forEach((emb) => {
          emb.y -= emb.speedY;
          emb.x += emb.driftX + Math.sin(time * 0.8 + emb.phase) * 0.1;

          if (emb.y < -10) {
            emb.y = height + 10;
            emb.x = Math.random() * width;
          }
          if (emb.x < -10) emb.x = width + 10;
          if (emb.x > width + 10) emb.x = -10;

          const alpha = emb.baseAlpha + Math.sin(time + emb.phase) * 0.06;
          ctx.beginPath();
          ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(235, 185, 110, ${Math.max(0.04, alpha)})`;
          ctx.fill();
        });
      }

      activeConstellations.forEach((c) => {
        const { stars, edges } = c;

        edges.forEach(([i1, i2]) => {
          const s1 = stars[i1];
          const s2 = stars[i2];
          if (!s1 || !s2) return;

          const midX = (s1.x + s2.x) / 2;
          const midY = (s1.y + s2.y) / 2;
          const distToCursor = Math.hypot(mx - midX, my - midY);
          const cursorGlow =
            mIntensity > 0.05
              ? Math.max(0, 1 - distToCursor / 160) * mIntensity
              : 0;

          const lineAlpha = (0.32 + cursorGlow * 0.48) * introProgress;
          const bloomAlpha = (0.09 + cursorGlow * 0.24) * introProgress;

          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.lineWidth = 2.4 + cursorGlow * 1.6;
          ctx.strokeStyle = `rgba(229, 173, 104, ${bloomAlpha})`;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.lineWidth = 0.9 + cursorGlow * 0.5;
          ctx.strokeStyle = `rgba(255, 238, 190, ${lineAlpha})`;
          ctx.stroke();
        });
      });

      const allStarsToRender = [
        ...fieldStars,
        ...activeConstellations.flatMap((c) => c.stars)
      ];

      allStarsToRender.forEach((s) => {
        const twinkle = prefersReducedMotion
          ? 1
          : 0.85 + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.15;

        const distToCursor = Math.hypot(mx - s.x, my - s.y);
        const cursorBoost =
          mIntensity > 0.05
            ? Math.max(0, 1 - distToCursor / 150) * 0.45 * mIntensity
            : 0;

        const effectiveAlpha = Math.min(1, (twinkle + cursorBoost) * introProgress);
        const effectiveRadius = s.radius * (1 + cursorBoost * 0.3);

        if (s.flare && effectiveAlpha > 0.35) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, effectiveRadius * 3.0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(229, 173, 104, ${0.12 * effectiveAlpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(s.x, s.y, effectiveRadius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 245, 215, ${0.22 * effectiveAlpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, effectiveRadius * 2.0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(229, 173, 104, ${0.14 * effectiveAlpha})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = effectiveAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (mIntensity > 0.01 && mouse.isInside && mx > 0 && my > 0) {
        ctx.beginPath();
        ctx.arc(mx, my, 18, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 173, 104, ${0.04 * mIntensity})`;
        ctx.fill();
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
      <div className="absolute inset-0 bg-[#06080d] pointer-events-none" />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(229, 173, 104, 0.15) 0%, rgba(185, 115, 45, 0.05) 50%, transparent 80%)',
          filter: 'blur(34px)'
        }}
      />

      <div
        className="absolute bottom-0 right-0 w-[700px] h-[450px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle 450px at 85% 85%, rgba(195, 135, 65, 0.08) 0%, transparent 70%)',
          filter: 'blur(44px)'
        }}
      />

      <div
        className="absolute top-1/4 left-0 w-[500px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle 350px at 15% 30%, rgba(45, 60, 110, 0.10) 0%, transparent 70%)',
          filter: 'blur(48px)'
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 50%, rgba(6, 8, 13, 0.65) 100%)'
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0a0c10)'
        }}
      />
    </div>
  );
}
