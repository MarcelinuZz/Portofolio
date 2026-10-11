import { useEffect, useRef } from 'react';
import * as THREE from 'three';



function createAtmosphereMaterial(colorHex, intensity = 2.2, power = 3.6) {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(colorHex) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec3 normal = normalize(vNormal);
        float dotNV = max(dot(normal, vViewDir), 0.0);
        float rim = pow(1.0 - dotNV, ${power.toFixed(1)});
        gl_FragColor = vec4(glowColor, rim * ${intensity.toFixed(2)});
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false
  });
}

function createSharedOrbitGroup(orbitRadius) {
  const group = new THREE.Group();

  const segs = 180;
  const curvePoints1 = [];
  for (let i = 0; i <= segs; i++) {
    const phi = (i / segs) * Math.PI * 2;
    curvePoints1.push(new THREE.Vector3(orbitRadius * Math.cos(phi), 0, orbitRadius * Math.sin(phi)));
  }
  const railCurve1 = new THREE.CatmullRomCurve3(curvePoints1, true);
  const railGeo1 = new THREE.TubeGeometry(railCurve1, 180, 0.026, 8, true);
  const railMat1 = new THREE.MeshBasicMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const railMesh1 = new THREE.Mesh(railGeo1, railMat1);
  group.add(railMesh1);

  const curvePoints2 = [];
  const outerR = orbitRadius + 0.38;
  for (let i = 0; i <= segs; i++) {
    const phi = (i / segs) * Math.PI * 2;
    curvePoints2.push(new THREE.Vector3(outerR * Math.cos(phi), 0, outerR * Math.sin(phi)));
  }
  const railCurve2 = new THREE.CatmullRomCurve3(curvePoints2, true);
  const railGeo2 = new THREE.TubeGeometry(railCurve2, 180, 0.014, 8, true);
  const railMat2 = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const railMesh2 = new THREE.Mesh(railGeo2, railMat2);
  group.add(railMesh2);

  const particleCount = 750;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = orbitRadius + (Math.random() - 0.4) * 0.9;
    const phi = Math.random() * Math.PI * 2;
    positions[i * 3] = r * Math.cos(phi);
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
    positions[i * 3 + 2] = r * Math.sin(phi);
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    size: 0.038,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ringParticles = new THREE.Points(particleGeo, particleMat);
  group.add(ringParticles);

  return group;
}

export default function JourneyPlanetOrbitCanvas({
  activeStep,
  setActiveStep,
  className = ''
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    activeStep: 0,
    currentProgress: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isDragging: false,
    dragStartY: 0,
    dragDeltaY: 0
  });

  useEffect(() => {
    stateRef.current.activeStep = activeStep;
  }, [activeStep]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 800;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    container.appendChild(renderer.domElement);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 3.4);
    sunLight.position.set(5.5, 3.5, 4.5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0e1626, 0.48);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-4.5, -1.0, -2.5);
    scene.add(rimLight);

    const orbitTilt = new THREE.Euler(0.46, 0.08, -0.22, 'XYZ');
    const tiltMatrix = new THREE.Matrix4().makeRotationFromEuler(orbitTilt);

    const R_ORBIT = 8.5;
    const DELTA_THETA = 0.95;
    const colossalRadius = 2.45;

    const spotlightWorld = new THREE.Vector3(2.85, 0.05, 0.0);
    const thetaSpotlight = 0.45;

    const localSpotlightPos = new THREE.Vector3(
      R_ORBIT * Math.cos(thetaSpotlight),
      0,
      R_ORBIT * Math.sin(thetaSpotlight)
    ).applyMatrix4(tiltMatrix);
    const orbitCenter = new THREE.Vector3().subVectors(spotlightWorld, localSpotlightPos);

    function getOrbitWorldPosition(theta) {
      const local = new THREE.Vector3(
        R_ORBIT * Math.cos(theta),
        0,
        R_ORBIT * Math.sin(theta)
      ).applyMatrix4(tiltMatrix);
      return local.add(orbitCenter);
    }

    const sharedOrbitGroup = createSharedOrbitGroup(R_ORBIT);
    sharedOrbitGroup.position.copy(orbitCenter);
    sharedOrbitGroup.rotation.copy(orbitTilt);
    scene.add(sharedOrbitGroup);

    const textureLoader = new THREE.TextureLoader();

    const mercuryTex = textureLoader.load('/images/planets/mercury.jpg');
    mercuryTex.colorSpace = THREE.SRGBColorSpace;

    const venusTex = textureLoader.load('/images/planets/venus.jpg');
    venusTex.colorSpace = THREE.SRGBColorSpace;

    const earthTex = textureLoader.load('/images/planets/earth.jpg');
    earthTex.colorSpace = THREE.SRGBColorSpace;

    const earthCloudsTex = textureLoader.load('/images/planets/earth_clouds.png');
    earthCloudsTex.colorSpace = THREE.SRGBColorSpace;

    const mercuryGroup = new THREE.Group();
    scene.add(mercuryGroup);

    const mercuryGeo = new THREE.SphereGeometry(colossalRadius, 64, 64);
    const mercuryMat = new THREE.MeshStandardMaterial({
      map: mercuryTex,
      roughness: 0.90,
      metalness: 0.05
    });
    const mercuryMesh = new THREE.Mesh(mercuryGeo, mercuryMat);
    mercuryGroup.add(mercuryMesh);

    const venusGroup = new THREE.Group();
    scene.add(venusGroup);

    const venusGeo = new THREE.SphereGeometry(colossalRadius, 64, 64);
    const venusMat = new THREE.MeshStandardMaterial({
      map: venusTex,
      roughness: 0.65,
      metalness: 0.05
    });
    const venusMesh = new THREE.Mesh(venusGeo, venusMat);
    venusGroup.add(venusMesh);

    const venusAtmosphereMat = createAtmosphereMaterial('#f59e0b', 1.6, 3.8);
    const venusAtmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(colossalRadius * 1.015, 64, 64),
      venusAtmosphereMat
    );
    venusGroup.add(venusAtmosphereMesh);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earthGeo = new THREE.SphereGeometry(colossalRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.55,
      metalness: 0.08
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    const earthCloudsMat = new THREE.MeshStandardMaterial({
      map: earthCloudsTex,
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    const earthCloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(colossalRadius * 1.012, 64, 64),
      earthCloudsMat
    );
    earthGroup.add(earthCloudsMesh);

    const earthAtmosphereMat = createAtmosphereMaterial('#38bdf8', 2.0, 3.8);
    const earthAtmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(colossalRadius * 1.018, 64, 64),
      earthAtmosphereMat
    );
    earthGroup.add(earthAtmosphereMesh);

    const planetStates = [
      {
        index: 0,
        group: mercuryGroup,
        mesh: mercuryMesh,
        rotationSpeed: 0.12
      },
      {
        index: 1,
        group: venusGroup,
        mesh: venusMesh,
        rotationSpeed: 0.10
      },
      {
        index: 2,
        group: earthGroup,
        mesh: earthMesh,
        clouds: earthCloudsMesh,
        rotationSpeed: 0.16
      }
    ];

    const setGroupOpacity = (grp, alpha) => {
      grp.traverse((child) => {
        if ((child.isMesh || child.isPoints) && child.material) {
          if (child.userData.baseOpacity === undefined) {
            child.userData.baseOpacity = child.material.opacity !== undefined ? child.material.opacity : 1.0;
          }
          child.material.transparent = true;
          child.material.opacity = Math.max(0, Math.min(1, alpha * child.userData.baseOpacity));
        }
      });
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      if (w === 0 || h === 0) return;
      width = w;
      height = h;
      camera.aspect = w / h;

      if (w < 600) {
        camera.position.z = 6.8;
      } else {
        camera.position.z = 6.2;
      }

      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.mouse.targetX = nx * 0.45;
      stateRef.current.mouse.targetY = ny * 0.35;
    };

    const handlePointerDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartY = e.clientY;
      stateRef.current.dragDeltaY = 0;
    };

    const handlePointerUp = () => {
      if (!stateRef.current.isDragging) return;
      stateRef.current.isDragging = false;
      const dy = stateRef.current.dragDeltaY;

      if (dy > 45 && stateRef.current.activeStep < 2) {
        setActiveStep?.((prev) => Math.min(prev + 1, 2));
      } else if (dy < -45 && stateRef.current.activeStep > 0) {
        setActiveStep?.((prev) => Math.max(prev - 1, 0));
      }
    };

    const handleGlobalPointerMove = (e) => {
      if (stateRef.current.isDragging) {
        stateRef.current.dragDeltaY = stateRef.current.dragStartY - e.clientY;
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handleGlobalPointerMove);

    let animationFrameId;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const delta = Math.min(clock.getDelta(), 0.1);

      const m = stateRef.current.mouse;
      m.x += (m.targetX - m.x) * (delta * 3.5);
      m.y += (m.targetY - m.y) * (delta * 3.5);
      camera.position.x = m.x * 0.3;
      camera.position.y = 0.05 + m.y * 0.2;
      camera.lookAt(0.5, 0.05, 0);

      const targetStep = stateRef.current.activeStep;

      const diff = targetStep - stateRef.current.currentProgress;
      stateRef.current.currentProgress += diff * Math.min(delta * 6.5, 0.36);
      const currentProgress = stateRef.current.currentProgress;

      planetStates.forEach((state) => {
        const angle = thetaSpotlight + (currentProgress - state.index) * DELTA_THETA;
        const worldPos = getOrbitWorldPosition(angle);
        state.group.position.copy(worldPos);

        if (state.mesh) {
          state.mesh.rotation.y += delta * state.rotationSpeed;
        }
        if (state.clouds) {
          state.clouds.rotation.y += delta * (state.rotationSpeed + 0.08);
        }

        const dist = Math.abs(currentProgress - state.index);

        const scale = Math.max(0.35, 1.0 - dist * 0.22);
        state.group.scale.setScalar(scale);

        const alpha = Math.max(0, 1.0 - Math.pow(Math.max(0, dist - 0.25) / 1.15, 2.0));
        setGroupOpacity(state.group, alpha);
        state.group.visible = alpha > 0.005;
      });

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handleGlobalPointerMove);

      sharedOrbitGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });

      [mercuryGeo, venusGeo, earthGeo].forEach((g) => g.dispose());
      [mercuryTex, venusTex, earthTex, earthCloudsTex].forEach((t) => t.dispose());
      [mercuryMat, venusMat, earthMat, earthCloudsMat].forEach((m) => m.dispose());

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [setActiveStep]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center relative z-10"
        aria-label="3D Interactive Planetary Orbit Canvas"
      />
    </div>
  );
}
