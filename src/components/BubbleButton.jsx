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

    const width = 350;
    const height = 240;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.4); // Ditarik agar cincin planet muat utuh tanpa terpotong tepi canvas

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Responsive Resize Observer agar selalu pas di semua ukuran layar
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const requiredZ = Math.max(4.4, (4.5 * h) / (w * 2 * halfTan));
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

      // Rotasi 3D tenang
      const maxRotAngle = 0.36; // ~21 derajat
      targetRotY = (dx / (maxDistance * 0.85)) * maxRotAngle;
      targetRotX = (dy / (maxDistance * 0.85)) * maxRotAngle; // Inverted atas-bawah

      targetRotY = Math.max(-maxRotAngle, Math.min(maxRotAngle, targetRotY));
      targetRotX = Math.max(-maxRotAngle, Math.min(maxRotAngle, targetRotX));

      targetShiftX = (dx / maxDistance) * 0.035;
      targetShiftY = (dy / maxDistance) * 0.035; // Inverted atas-bawah
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
    <div className="flex flex-col items-center justify-center select-none">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={isActivating}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Explore Journey via 3D Planet Bubble"
        className="group relative flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5ad68] rounded-3xl cursor-pointer disabled:cursor-default"
      >
        {/* Pendaran Cahaya Emas Belakang yang merespons jarak kursor */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[220px] rounded-full bg-radial from-[#e5ad68]/35 via-[#d97706]/15 to-transparent blur-2xl transition-all duration-300 pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) scale(${1.0 + proximity * 0.3 + (isHovered ? 0.15 : 0)})`,
            opacity: 0.5 + proximity * 0.4 + (isHovered ? 0.2 : 0)
          }}
        />

        {/* Pulsing Ripple Rings on Activate */}
        {isActivating && (
          <motion.div
            className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full border-2 border-[#e5ad68]"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', repeat: Infinity }}
          />
        )}

        {/* 3D Canvas Container - Lebar leluasa agar cincin planet muat utuh */}
        <div
          ref={containerRef}
          className="relative w-[320px] sm:w-[350px] h-[220px] sm:h-[240px] flex items-center justify-center drop-shadow-[0_16px_36px_rgba(217,119,6,0.45)]"
        />

        {/* Interactive Text Label */}
        <div className="mt-1 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#161b26]/80 backdrop-blur-md border border-white/10 group-hover:border-[#e5ad68]/60 transition-all duration-300 shadow-lg">
          <span
            className={`text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap ${
              isActivating
                ? 'text-[#e5ad68]'
                : isHovered
                ? 'text-[#f6d198]'
                : 'text-slate-300'
            }`}
          >
            {isActivating ? 'Entering Journey...' : 'Explore Journey'}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
