import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PupilTelemetry } from '../../types';
import { Heart, Sparkles, Wind, RotateCcw, Trees, Droplets } from 'lucide-react';
import { SessionCountdownOverlay } from './SessionCountdownOverlay';

interface Props {
  telemetry: PupilTelemetry;
  onSessionScoreUpdate?: (score: number, flowTimeSec: number) => void;
  onGoToReport?: () => void;
}

interface LotusFlower3D {
  group: THREE.Group;
  petals: THREE.Mesh[];
  openProgress: number; // 0 to 1
  x: number;
  z: number;
}

export const ZenGardenGame: React.FC<Props> = ({ telemetry, onSessionScoreUpdate, onGoToReport }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [harmonyScore, setHarmonyScore] = useState(0);
  const [zenSeconds, setZenSeconds] = useState(0);
  const [plantsGrown, setPlantsGrown] = useState(0);

  // Neurofeedback Session Countdown Timer State
  const [sessionDuration, setSessionDuration] = useState(120);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [isCompleted, setIsCompleted] = useState(false);

  // 3D Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const petalsParticlesRef = useRef<THREE.Points | null>(null);
  const firefliesGroupRef = useRef<THREE.Group | null>(null);
  const lotusesRef = useRef<LotusFlower3D[]>([]);
  const waterPlaneRef = useRef<THREE.Mesh | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // State ref for 60fps loop
  const stateRef = useRef({
    harmonyScore: 0,
    zenSeconds: 0,
    plantsGrown: 0,
    isPlaying: true,
    isPaused: false,
    isCompleted: false,
    telemetry: telemetry,
    cameraAngle: 0,
    mouseX: 0,
    mouseY: 0,
  });

  useEffect(() => {
    stateRef.current.telemetry = telemetry;
  }, [telemetry]);

  // Audio synthesis for peaceful singing bowl / bell
  const playSingingBowl = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Harmonic chords (432Hz fundamental, 864Hz octave, 1296Hz harmonic)
      [432, 648, 864].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch {
      // Audio context policy safe
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!isPlaying || isPaused || isCompleted) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          setIsPlaying(false);
          stateRef.current.isCompleted = true;
          stateRef.current.isPlaying = false;
          if (onSessionScoreUpdate) {
            onSessionScoreUpdate(stateRef.current.harmonyScore, stateRef.current.zenSeconds);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, isCompleted, onSessionScoreUpdate]);

  // Mouse / Touch interaction for gentle 3D camera parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    stateRef.current.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    stateRef.current.mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  // Three.js Full 3D Zen Garden Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 520;

    // 1. Scene & Warm Atmospheric Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#141818');
    scene.fog = new THREE.FogExp2('#141818', 0.022);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    camera.position.set(0, 7.5, 14);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Atmospheric Lighting (Warm sunrise / twilight rays)
    const ambientLight = new THREE.AmbientLight('#EAE8E3', 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#FDE68A', 1.8);
    sunLight.position.set(12, 20, 10);
    scene.add(sunLight);

    const waterLight = new THREE.PointLight('#38BDF8', 2.0, 16);
    waterLight.position.set(0, 1.2, 0);
    scene.add(waterLight);

    // 5. 3D Terrain: Sand Garden Ground & Stone Borders
    const groundGeo = new THREE.PlaneGeometry(60, 60, 40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#2A2E2C',
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    // Raked Sand Concentric Rings (Torus rings around the pond)
    for (let r = 5.5; r <= 15; r += 1.8) {
      const ringGeo = new THREE.TorusGeometry(r, 0.06, 6, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: '#3A403D' });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.01;
      scene.add(ring);
    }

    // 6. Central 3D Reflective Water Pond
    const waterGeo = new THREE.CircleGeometry(5, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0E2433',
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.9,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.02;
    scene.add(water);
    waterPlaneRef.current = water;

    // Pond Stone Rim
    const stoneRimCount = 18;
    for (let i = 0; i < stoneRimCount; i++) {
      const angle = (i / stoneRimCount) * Math.PI * 2;
      const rx = Math.cos(angle) * 5.1;
      const rz = Math.sin(angle) * 5.1;
      const rockGeo = new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.2, 1);
      const rockMat = new THREE.MeshStandardMaterial({
        color: '#4B5550',
        roughness: 0.9,
        metalness: 0.1,
      });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(rx, 0.15, rz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(rock);
    }

    // 7. 3D Procedural Sakura Bonsai Trees
    const createSakuraTree = (x: number, z: number, scale: number, rotationY: number) => {
      const treeGroup = new THREE.Group();

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.45 * scale, 4 * scale, 8);
      const trunkMat = new THREE.MeshStandardMaterial({
        color: '#2B1810',
        roughness: 0.9,
        metalness: 0.1,
      });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2 * scale;
      trunk.rotation.z = 0.12;
      treeGroup.add(trunk);

      // Blossom Clusters (Pink Cloud Spheres)
      const blossomMat = new THREE.MeshStandardMaterial({
        color: '#F472B6',
        emissive: '#DB2777',
        emissiveIntensity: 0.25,
        roughness: 0.6,
      });

      const clusterOffsets = [
        [0, 3.8 * scale, 0, 1.4 * scale],
        [-1 * scale, 3.2 * scale, 0.6 * scale, 1.1 * scale],
        [1.2 * scale, 3.5 * scale, -0.4 * scale, 1.2 * scale],
        [0.4 * scale, 4.4 * scale, 0.5 * scale, 1.0 * scale],
      ];

      clusterOffsets.forEach(([cx, cy, cz, cr]) => {
        const clusterGeo = new THREE.DodecahedronGeometry(cr, 2);
        const cluster = new THREE.Mesh(clusterGeo, blossomMat);
        cluster.position.set(cx, cy, cz);
        treeGroup.add(cluster);
      });

      treeGroup.position.set(x, 0, z);
      treeGroup.rotation.y = rotationY;
      scene.add(treeGroup);
    };

    createSakuraTree(-8, -4, 1.3, 0.4);
    createSakuraTree(8, -5, 1.2, -0.6);
    createSakuraTree(-6, 7, 0.9, 1.2);
    createSakuraTree(9, 6, 1.0, -1.4);

    // 8. 3D Japanese Stone Lanterns (Toro) with internal warm flame
    const createStoneLantern = (x: number, z: number) => {
      const lanternGroup = new THREE.Group();
      
      const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.4, 6);
      const lanternMat = new THREE.MeshStandardMaterial({ color: '#575F5A', roughness: 0.8 });
      const base = new THREE.Mesh(baseGeo, lanternMat);
      base.position.y = 0.2;
      lanternGroup.add(base);

      const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 6);
      const post = new THREE.Mesh(postGeo, lanternMat);
      post.position.y = 0.9;
      lanternGroup.add(post);

      const fireBoxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const fireBox = new THREE.Mesh(fireBoxGeo, lanternMat);
      fireBox.position.y = 1.6;
      lanternGroup.add(fireBox);

      // Glowing light inside
      const flameLight = new THREE.PointLight('#FBBF24', 1.8, 6);
      flameLight.position.set(0, 1.6, 0);
      lanternGroup.add(flameLight);

      const roofGeo = new THREE.ConeGeometry(0.65, 0.4, 6);
      const roof = new THREE.Mesh(roofGeo, lanternMat);
      roof.position.y = 2.0;
      lanternGroup.add(roof);

      lanternGroup.position.set(x, 0, z);
      scene.add(lanternGroup);
    };

    createStoneLantern(-4.2, 3.8);
    createStoneLantern(4.5, 3.5);

    // 9. 3D Procedural Lotus Flowers in the pond
    const create3DLotus = (x: number, z: number): LotusFlower3D => {
      const lotusGroup = new THREE.Group();
      const petals: THREE.Mesh[] = [];

      // Lily Pad Base
      const padGeo = new THREE.CircleGeometry(0.55, 16);
      const padMat = new THREE.MeshStandardMaterial({
        color: '#15803D',
        roughness: 0.7,
        side: THREE.DoubleSide,
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.y = 0.03;
      lotusGroup.add(pad);

      // Lotus Flower Core (Golden Pistil)
      const coreGeo = new THREE.SphereGeometry(0.12, 12, 8);
      const coreMat = new THREE.MeshStandardMaterial({
        color: '#FBBF24',
        emissive: '#F59E0B',
        emissiveIntensity: 0.6,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 0.12;
      lotusGroup.add(core);

      // Lotus Petals (8 radial curved petals)
      const petalMat = new THREE.MeshStandardMaterial({
        color: '#FDF2F8',
        emissive: '#F472B6',
        emissiveIntensity: 0.35,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });

      const petalCount = 8;
      for (let i = 0; i < petalCount; i++) {
        const pAngle = (i / petalCount) * Math.PI * 2;
        const petalGeo = new THREE.ConeGeometry(0.1, 0.38, 5);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(Math.cos(pAngle) * 0.1, 0.18, Math.sin(pAngle) * 0.1);
        petal.rotation.z = Math.PI / 4;
        petal.rotation.y = pAngle;
        lotusGroup.add(petal);
        petals.push(petal);
      }

      lotusGroup.position.set(x, 0, z);
      scene.add(lotusGroup);

      return {
        group: lotusGroup,
        petals,
        openProgress: 0.2,
        x,
        z,
      };
    };

    lotusesRef.current = [
      create3DLotus(0, 0),
      create3DLotus(-1.8, -1.2),
      create3DLotus(1.6, 1.4),
      create3DLotus(-1.5, 1.8),
      create3DLotus(2.0, -1.5),
    ];

    // 10. Swirling 3D Falling Sakura Petals Particle Cloud
    const petalCount = 500;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalRotations = new Float32Array(petalCount);
    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 35;
      petalPositions[i * 3 + 1] = Math.random() * 12 + 0.5;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      petalRotations[i] = Math.random() * Math.PI * 2;
    }
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalParticlesMat = new THREE.PointsMaterial({
      color: '#FBCFE8',
      size: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const petalParticles = new THREE.Points(petalGeo, petalParticlesMat);
    scene.add(petalParticles);
    petalsParticlesRef.current = petalParticles;

    // 11. Ethereal 3D Floating Fireflies (Wisps)
    const firefliesGroup = new THREE.Group();
    const fireflyCount = 24;
    const fireflyMeshes: { mesh: THREE.Mesh; seed: number }[] = [];
    for (let i = 0; i < fireflyCount; i++) {
      const ffGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const ffMat = new THREE.MeshBasicMaterial({ color: '#A7F3D0' });
      const ff = new THREE.Mesh(ffGeo, ffMat);
      fireflyMeshes.push({ mesh: ff, seed: Math.random() * 100 });
      firefliesGroup.add(ff);
    }
    scene.add(firefliesGroup);
    firefliesGroupRef.current = firefliesGroup;

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- Main 60 FPS 3D Zen Animation Loop ---
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const telem = state.telemetry;

      // Pupillometry calm equilibrium detection
      // High fixation stability (> 0.60), balanced focus score (> 50), steady pupil
      const isCalmEquilibrium = telem.fixationStability > 0.6 && telem.focusScore >= 50;

      if (state.isPlaying && !state.isPaused && !state.isCompleted) {
        if (isCalmEquilibrium) {
          state.zenSeconds += dt;
          state.harmonyScore += Math.round(dt * 20);
          setZenSeconds(Math.round(state.zenSeconds));
          setHarmonyScore(state.harmonyScore);

          // Grow lotus blossoms smoothly
          lotusesRef.current.forEach((lotus, idx) => {
            if (lotus.openProgress < 1.0) {
              lotus.openProgress += dt * 0.15;
              if (lotus.openProgress >= 0.98 && lotus.openProgress - dt * 0.15 < 0.98) {
                state.plantsGrown += 1;
                setPlantsGrown(state.plantsGrown);
                playSingingBowl();
              }
            }
          });
        }

        // Animate 3D Lotus Petals Opening & Floating Bobbing
        lotusesRef.current.forEach((lotus, idx) => {
          const bob = Math.sin(currentTime * 0.003 + idx) * 0.03;
          lotus.group.position.y = bob;

          lotus.petals.forEach((petal, pIdx) => {
            const openAngle = (Math.PI / 6) + lotus.openProgress * (Math.PI / 3);
            petal.rotation.z = openAngle;
          });
        });

        // Animate Falling Sakura Petals with Wind Vectors
        if (petalsParticlesRef.current) {
          const positions = petalsParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < petalCount; i++) {
            // Sway downwards and drift with gentle wind
            positions[i * 3] += Math.sin(currentTime * 0.001 + i) * dt * 0.8;
            positions[i * 3 + 1] -= dt * 0.7; // Fall
            positions[i * 3 + 2] += Math.cos(currentTime * 0.001 + i) * dt * 0.8;

            if (positions[i * 3 + 1] < 0.1) {
              positions[i * 3 + 1] = 12;
              positions[i * 3] = (Math.random() - 0.5) * 35;
              positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
            }
          }
          petalsParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Animate Ethereal Fireflies / Spirit Wisps
        fireflyMeshes.forEach(({ mesh, seed }, i) => {
          const t = currentTime * 0.0015 + seed;
          const fx = Math.cos(t * 0.7) * (3.5 + Math.sin(t * 0.3) * 1.5);
          const fz = Math.sin(t * 0.7) * (3.5 + Math.sin(t * 0.3) * 1.5);
          const fy = 0.5 + Math.sin(t * 1.8) * 0.4;
          mesh.position.set(fx, fy, fz);
        });

        // Water surface subtle illumination pulse
        if (waterPlaneRef.current) {
          const waterMat = waterPlaneRef.current.material as THREE.MeshStandardMaterial;
          waterMat.opacity = 0.88 + Math.sin(currentTime * 0.002) * 0.06;
        }
      }

      // Smooth Gentle 3D Camera Orbit & Mouse Parallax
      state.cameraAngle += dt * 0.04;
      const baseCamX = Math.sin(state.cameraAngle) * 13 + state.mouseX * 2.5;
      const baseCamZ = Math.cos(state.cameraAngle) * 13 + state.mouseY * 2.5;
      camera.position.x += (baseCamX - camera.position.x) * (dt * 2);
      camera.position.z += (baseCamZ - camera.position.z) * (dt * 2);
      camera.position.y = 7.0 - state.mouseY * 1.5;
      camera.lookAt(0, 0.6, 0);

      renderer.render(scene, camera);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
    };
  }, []);

  const handleReset = () => {
    stateRef.current.harmonyScore = 0;
    stateRef.current.zenSeconds = 0;
    stateRef.current.plantsGrown = 0;
    stateRef.current.isCompleted = false;
    stateRef.current.isPlaying = true;
    stateRef.current.isPaused = false;

    lotusesRef.current.forEach((lotus) => {
      lotus.openProgress = 0.2;
    });

    setPlantsGrown(0);
    setHarmonyScore(0);
    setZenSeconds(0);
    setRemainingSeconds(sessionDuration);
    setIsCompleted(false);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      stateRef.current.isPaused = next;
      return next;
    });
  };

  const handleChangeDuration = (newSecs: number) => {
    setSessionDuration(newSecs);
    setRemainingSeconds(newSecs);
    setIsCompleted(false);
    setIsPlaying(true);
    setIsPaused(false);
    stateRef.current.isCompleted = false;
    stateRef.current.isPlaying = true;
    stateRef.current.isPaused = false;
  };

  const handleExtendSession = (extraSecs: number) => {
    setSessionDuration((prev) => prev + extraSecs);
    setRemainingSeconds((prev) => prev + extraSecs);
    setIsCompleted(false);
    setIsPlaying(true);
    setIsPaused(false);
    stateRef.current.isCompleted = false;
    stateRef.current.isPlaying = true;
    stateRef.current.isPaused = false;
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#141818] border border-stone-900/15 shadow-sm flex flex-col items-center select-none font-editorial-sans">
      {/* Top 3D Status Bar */}
      <div className="w-full bg-[#FBFBF9] px-6 py-3.5 border-b border-stone-900/10 flex flex-wrap items-center justify-between gap-4 z-10 text-stone-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-900/10 text-stone-800 text-xs shadow-xs">
            <Heart className="w-3.5 h-3.5 text-stone-700 stroke-[1.5]" />
            <span>הרמוניה ורגיעה: <strong className="font-serif italic text-sm text-stone-950">{harmonyScore}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-900/10 text-stone-800 text-xs shadow-xs">
            <Trees className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
            <span>פרחי לוטוס פורחים 3D: <strong className="font-serif italic text-sm text-stone-950">{plantsGrown}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-900/10 text-stone-800 text-xs shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-stone-700 stroke-[1.5]" />
            <span>זמן שלווה: <strong className="font-serif italic text-sm text-stone-950">{zenSeconds}s</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-600 font-editorial-sans">
            יעד אימון: <strong className="font-serif italic text-stone-950 font-normal">הפחתת עוררות יתר ודחק</strong>
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-[16/9] min-h-[460px] max-h-[580px] bg-[#141818] overflow-hidden"
      >
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Countdown Timer Overlay */}
        <SessionCountdownOverlay
          remainingSeconds={remainingSeconds}
          totalDurationSeconds={sessionDuration}
          isPaused={isPaused}
          isCompleted={isCompleted}
          onTogglePause={handleTogglePause}
          onReset={handleReset}
          onChangeDuration={handleChangeDuration}
          onExtendSession={handleExtendSession}
          onGoToReport={onGoToReport}
          sessionStats={{
            score: harmonyScore,
            flowOrZenSeconds: zenSeconds,
            stabilityPct: telemetry.fixationStability,
            avgPupilMm: telemetry.diameterMm,
            gameTitle: 'Zen Bio-Garden 3D (חרדה & PTSD)',
          }}
        />

        {/* Guided Breathing prompt */}
        <div className="absolute bottom-4 left-4 pointer-events-none bg-stone-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-stone-800 text-xs text-stone-200 flex items-center gap-2 shadow-md">
          <Wind className="w-4 h-4 text-stone-300 animate-spin" />
          <span className="text-[11px] text-stone-300 font-editorial-sans">
            שמירה על פוקוס יציב ללא תנודות מצמיחה ופותחת לוטוסים תלת-ממדיים במרחב
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full px-6 py-3 bg-[#FBFBF9] border-t border-stone-900/10 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-4">
          <span>קוטר אישון: <strong className="text-stone-900 font-mono">{telemetry.diameterMm} mm</strong></span>
          <span>יציבות מבט: <strong className="text-stone-900 font-mono">{(telemetry.fixationStability * 100).toFixed(0)}%</strong></span>
          <span>עומק הרפיה: <strong className="text-stone-900 font-mono">{(telemetry.calmScore ?? 78)}%</strong></span>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-900/15 hover:bg-stone-100 text-stone-800 text-xs transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>איפוס סשן 3D</span>
        </button>
      </div>
    </div>
  );
};
