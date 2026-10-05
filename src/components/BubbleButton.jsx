import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function BubbleButton({
  onClick,
  isActivating,
  imageSrc = '/images/Gedung.jpg'
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [proximity, setProximity] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = 680;
    const height = 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3); // Jarak ideal agar cincin leluasa vertikal dan tidak terpotong di batas atas

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Responsive Resize Observer agar selalu pas di semua ukuran layar
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const requiredZ = Math.max(4.3, (4.5 * h) / (w * 2 * halfTan));
      camera.position.z = requiredZ;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Group Utama Planet (Menyatukan gelembung, rim, dan cincin)
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // 2. Geometri Gelembung Planet dengan Pemetaan Frontal
    const bubbleGeo = new THREE.SphereGeometry(1.0, 64, 64);
    
    // Remap UV agar seluruh gambar tampil utuh di lingkaran depan gelembung
    const uvs = bubbleGeo.attributes.uv;
    const positions = bubbleGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const u = x * 0.5 + 0.5;
      const v = y * 0.5 + 0.5;
      uvs.setXY(i, u, v);
    }
    uvs.needsUpdate = true;

    // Simpan posisi awal vertex untuk efek getaran cairan
    const posAttr = bubbleGeo.attributes.position;
    const originalPositions = new Float32Array(posAttr.array.length);
    originalPositions.set(posAttr.array);

    const bubbleMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.20,              // Efek buram frosted glass lembut
      metalness: 0.05,
      clearcoat: 1.0,               // Lapisan kilap kaca luar
      clearcoatRoughness: 0.03,
      color: new THREE.Color('#fff4e0'), // Tint hangat keemasan
      specularColor: new THREE.Color('#ffffff'),
      specularIntensity: 1.3,
      iridescence: 0.85,            // Kilauan sabun tipis
      iridescenceIOR: 1.33,
      side: THREE.FrontSide
    });

    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    planetGroup.add(bubble);

    // 3. Texture Loader untuk Gambar dengan Auto-Fallback
    let currentTexture = null;
    const textureLoader = new THREE.TextureLoader();
    const applyTexture = (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      currentTexture = tex;
      bubbleMat.map = tex;
      bubbleMat.needsUpdate = true;
    };

    textureLoader.load(
      imageSrc,
      applyTexture,
      undefined,
      () => {
        const altSrc = imageSrc.endsWith('.jpg')
          ? imageSrc.replace('.jpg', '.png')
          : imageSrc.replace('.png', '.jpg');
        textureLoader.load(altSrc, applyTexture);
      }
    );

    // 4. Golden Rim Glow Shader (Lingkar emas sesuai gambar referensi)
    const rimGeo = new THREE.SphereGeometry(1.015, 64, 64);
    const rimMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
          fresnel = pow(fresnel, 2.5);
          
          vec3 bronze = vec3(0.55, 0.28, 0.06);
          vec3 gold = vec3(1.0, 0.80, 0.25);
          vec3 rimColor = mix(bronze, gold, fresnel);
          
          gl_FragColor = vec4(rimColor, fresnel * 0.95);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    planetGroup.add(rimMesh);

    // 5. CINCIN PLANET KOSMIK KEEMASAN (Planetary Ring ala Saturnus)
    const ringGeo = new THREE.RingGeometry(1.22, 1.85, 80);
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPos;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        varying vec2 vUv;
        void main() {
          float r = length(vPos.xy);
          float inner = 1.22;
          float outer = 1.85;
          if (r < inner || r > outer) discard;
          
          float t = (r - inner) / (outer - inner);
          
          // Garis-garis partikel cincin kosmik (concentric dust grooves)
          float grooves = sin(t * 38.0) * 0.18 + 0.82;
          
          // Celah pembagi cincin (Cassini division gap)
          float cassini = smoothstep(0.02, 0.07, abs(t - 0.52));
          
          // Gradasi transparansi dari tepi dalam ke tepi luar
          float edgeFade = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.82, 1.0, t));
          float alpha = edgeFade * grooves * cassini * 0.85;
          
          // Warna gradasi cincin emas kosmik: Bronze -> Amber -> Champagne Gold
          vec3 deepBronze = vec3(0.65, 0.35, 0.10);
          vec3 brightGold = vec3(1.0, 0.84, 0.40);
          vec3 ringColor = mix(deepBronze, brightGold, t);
          
          gl_FragColor = vec4(ringColor, alpha);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    // Kemiringan sinematik khas cincin planet (~68 derajat)
    ringMesh.rotation.x = Math.PI * 0.38;
    ringMesh.rotation.y = Math.PI * 0.06;
    planetGroup.add(ringMesh);

    // 6. Pencahayaan Studio
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 2.6);
    topLight.position.set(0, 2.8, 2.0);
    scene.add(topLight);

    const leftLight = new THREE.DirectionalLight(0xfff0dd, 2.0);
    leftLight.position.set(-2.5, 1.2, 1.8);
    scene.add(leftLight);

    const amberLight = new THREE.DirectionalLight(0xf59e0b, 2.2);
    amberLight.position.set(2.0, -1.8, 1.5);
    scene.add(amberLight);

    const bottomLight = new THREE.PointLight(0xffffff, 1.8, 10);
    bottomLight.position.set(0, -2.5, 1.2);
    scene.add(bottomLight);

    // 7. Deteksi Kursor & Rotasi 3D
    let targetRotX = 0;
    let targetRotY = 0;
    let targetShiftX = 0;
    let targetShiftY = 0;

    const handleWindowMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      const maxDistance = 450;
      const factor = Math.max(0, 1.0 - dist / maxDistance);
      setProximity(factor);

      // Rotasi 3D tenang dan proporsional
      const maxRotAngle = 0.28; // ~16 derajat (anggun & mencegah cincin terpotong di batas atas)
      targetRotY = (dx / (maxDistance * 0.85)) * maxRotAngle;
      targetRotX = (dy / (maxDistance * 0.85)) * maxRotAngle; // Inverted atas-bawah

      targetRotY = Math.max(-maxRotAngle, Math.min(maxRotAngle, targetRotY));
      targetRotX = Math.max(-maxRotAngle, Math.min(maxRotAngle, targetRotX));

      targetShiftX = (dx / maxDistance) * 0.025;
      targetShiftY = (dy / maxDistance) * 0.015; // Pergeseran vertikal halus agar cincin tetap berada di dalam viewport
    };

    window.addEventListener('mousemove', handleWindowMouseMove);

    // 8. Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Efek getaran cair gelembung yang sangat lembut & tenang
      const wobbleAmp = 0.005 + (targetRotX * targetRotX + targetRotY * targetRotY) * 0.004;
      const positions = posAttr.array;
      for (let i = 0; i < positions.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];
        const wave = Math.sin(time * 1.1 + ox * 2.8 + oy * 2.0) * wobbleAmp;
        positions[i] = ox * (1.0 + wave);
        positions[i + 1] = oy * (1.0 + wave);
        positions[i + 2] = oz * (1.0 + wave);
      }
      posAttr.needsUpdate = true;
      bubbleGeo.computeVertexNormals();

      // Gerakan mengapung alami yang sangat lambat (meditatif)
      const floatY = Math.sin(time * 0.85) * 0.024;

      // Rotasi 3D menoleh mengikuti kursor untuk seluruh planet (gelembung + cincin)
      planetGroup.rotation.x += (targetRotX - planetGroup.rotation.x) * 0.015;
      planetGroup.rotation.y += (targetRotY - planetGroup.rotation.y) * 0.015;

      // Putaran independen sangat lambat pada debu cincin planet
      ringMesh.rotation.z += 0.0012;

      // Posisi parallax melayang lembut
      planetGroup.position.x += (targetShiftX - planetGroup.position.x) * 0.015;
      planetGroup.position.y += (floatY + targetShiftY - planetGroup.position.y) * 0.015;

      renderer.render(scene, camera);
    };
    animate();

    // 9. Cleanup
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      if (currentTexture) currentTexture.dispose();
    };
  }, [imageSrc]);

  return (
    <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center select-none px-2 sm:px-4">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={isActivating}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.98 }}
        aria-label="Explore Journey via 3D Planet Bubble"
        className="group relative w-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5ad68] cursor-pointer disabled:cursor-default"
      >
        {/* Pendaran Cahaya Emas Luas di Belakang Komposisi */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[640px] md:w-[780px] lg:w-[940px] xl:w-[1080px] h-[300px] sm:h-[380px] md:h-[440px] lg:h-[500px] rounded-full bg-radial from-[#e5ad68]/35 via-[#d97706]/15 to-transparent blur-3xl transition-all duration-500 pointer-events-none -z-10"
          style={{
            transform: `translate(-50%, -50%) scale(${1.0 + proximity * 0.2 + (isHovered ? 0.1 : 0)})`,
            opacity: 0.45 + proximity * 0.35 + (isHovered ? 0.25 : 0)
          }}
        />

        {/* Pulsing Ripple Rings saat tombol diaktifkan */}
        {isActivating && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[480px] lg:h-[480px] rounded-full border-2 border-[#e5ad68] pointer-events-none"
            initial={{ scale: 0.7, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut', repeat: Infinity }}
          />
        )}

        {/* Horizontal Row: EXPLORE [kiri] --- 3D CANVAS PROPORSIONAL [tengah] --- JOURNEY [kanan] */}
        <div className="relative flex items-center justify-center w-full max-w-full">
          
          {/* SISI KIRI: EXPLORE (1 Baris) */}
          <motion.div
            animate={{
              x: isHovered ? -12 : 0,
              opacity: isActivating ? 0.45 : 1,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-w-0 flex items-center justify-end text-right pr-4 sm:pr-6 md:pr-8 lg:pr-10 pointer-events-none select-none z-10"
          >
            <span className="text-[clamp(1.5rem,4.6vw,5.75rem)] font-black tracking-tight sm:tracking-normal uppercase bg-gradient-to-r from-white via-slate-100 to-[#e5ad68] bg-clip-text text-transparent drop-shadow-[0_4px_28px_rgba(229,173,104,0.35)] group-hover:drop-shadow-[0_8px_45px_rgba(229,173,104,0.7)] transition-all duration-500 leading-none whitespace-nowrap">
              EXPLORE
            </span>
          </motion.div>

          {/* TENGAH: 3D Canvas Container (Proporsional & Seimbang) */}
          <motion.div
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex-shrink-0 flex items-center justify-center z-20 -mx-3 xs:-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12"
          >
            <div
              ref={containerRef}
              className="relative w-[180px] xs:w-[220px] sm:w-[280px] md:w-[350px] lg:w-[420px] xl:w-[480px] h-[170px] xs:h-[200px] sm:h-[260px] md:h-[320px] lg:h-[380px] xl:h-[430px] flex items-center justify-center drop-shadow-[0_24px_56px_rgba(217,119,6,0.55)] cursor-pointer"
            />
          </motion.div>

          {/* SISI KANAN: JOURNEY (1 Baris) */}
          <motion.div
            animate={{
              x: isHovered ? 12 : 0,
              opacity: isActivating ? 0.45 : 1,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-w-0 flex items-center justify-start text-left pl-4 sm:pl-6 md:pl-8 lg:pl-10 pointer-events-none select-none z-10"
          >
            <span className="text-[clamp(1.5rem,4.6vw,5.75rem)] font-black tracking-tight sm:tracking-normal uppercase bg-gradient-to-l from-white via-slate-100 to-[#e5ad68] bg-clip-text text-transparent drop-shadow-[0_4px_28px_rgba(229,173,104,0.35)] group-hover:drop-shadow-[0_8px_45px_rgba(229,173,104,0.7)] transition-all duration-500 leading-none whitespace-nowrap">
              JOURNEY
            </span>
          </motion.div>

        </div>

        {/* Indikator status mikro interaktif di bawah */}
        <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <span
            className={`text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase transition-all duration-300 ${
              isActivating
                ? 'text-[#e5ad68] opacity-100 animate-pulse'
                : isHovered
                ? 'text-slate-300 opacity-90'
                : 'text-slate-500 opacity-0'
            }`}
          >
            {isActivating ? 'Entering Journey...' : 'Click to Launch'}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
