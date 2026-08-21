import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PupilTelemetry } from '../../types';
import { Zap, Flame, ShieldAlert, Sparkles, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { SessionCountdownOverlay } from './SessionCountdownOverlay';

interface Props {
  telemetry: PupilTelemetry;
  onSessionScoreUpdate?: (score: number, flowTimeSec: number) => void;
  onGoToReport?: () => void;
}

interface ObstacleItem {
  mesh: THREE.Group;
  lane: number; // -1, 0, 1
  z: number;
  type: 'orb' | 'barrier';
  collected: boolean;
}

export const NeonRunnerGame: React.FC<Props> = ({ telemetry, onSessionScoreUpdate, onGoToReport }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [playerLane, setPlayerLane] = useState(0); // -1 (left), 0 (center), 1 (right)
  const [flowSeconds, setFlowSeconds] = useState(0);
  const [highScore, setHighScore] = useState(1420);

  // Neurofeedback Session Countdown Timer State
  const [sessionDuration, setSessionDuration] = useState(120); // default 2 minutes
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [isCompleted, setIsCompleted] = useState(false);

  // References for 3D engine
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const obstaclesRef = useRef<ObstacleItem[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const speedLinesRef = useRef<THREE.LineSegments | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Dynamic game state
  const stateRef = useRef({
    playerLane: 0,
    targetLane: 0,
    playerX: 0,
    playerY: 0.6,
    speed: 35,
    distanceTraveled: 0,
    score: 0,
    streak: 0,
    flowSeconds: 0,
    lastSpawnZ: 0,
    isPlaying: true,
    isPaused: false,
    isCompleted: false,
    telemetry: telemetry,
  });

  // Keep telemetry updated in ref for 60fps loop
  useEffect(() => {
    stateRef.current.telemetry = telemetry;
  }, [telemetry]);

  // Audio synthesizer for collect and streak
  const playSound = (type: 'collect' | 'streak' | 'barrier') => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'streak') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'barrier') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch {
      // Ignore audio context autoplay limitations
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
            onSessionScoreUpdate(stateRef.current.score, stateRef.current.flowSeconds);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, isCompleted, onSessionScoreUpdate]);

  // Gaze steering update
  useEffect(() => {
    if (telemetry.gazePosition) {
      const gx = telemetry.gazePosition.x;
      let newLane = 0;
      if (gx < 0.38) newLane = -1;
      else if (gx > 0.62) newLane = 1;
      else newLane = 0;

      if (newLane !== stateRef.current.targetLane) {
        stateRef.current.targetLane = newLane;
        setPlayerLane(newLane);
      }
    }
  }, [telemetry.gazePosition]);

  // Keyboard steering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        changeLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        changeLane(1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeLane = (dir: number) => {
    const cur = stateRef.current.targetLane;
    const next = Math.max(-1, Math.min(1, cur + dir));
    stateRef.current.targetLane = next;
    setPlayerLane(next);
  };

  const setLaneDirect = (lane: number) => {
    stateRef.current.targetLane = lane;
    setPlayerLane(lane);
  };

  // Initialize Three.js Full 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0B0E');
    scene.fog = new THREE.FogExp2('#0A0B0E', 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 300);
    camera.position.set(0, 3.2, 5.5);
    camera.lookAt(0, 0.8, -12);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#E0E7FF', 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#FBFBF9', 1.4);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const playerPointLight = new THREE.PointLight('#38BDF8', 3.5, 12);
    playerPointLight.position.set(0, 1.2, 0);
    scene.add(playerPointLight);

    // 5. 3D Track & Roadway
    const trackWidth = 10;
    const trackLength = 400;
    const trackGeo = new THREE.PlaneGeometry(trackWidth, trackLength, 20, 80);
    const trackMat = new THREE.MeshStandardMaterial({
      color: '#0F1219',
      roughness: 0.2,
      metalness: 0.8,
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(0, 0, -trackLength / 2 + 10);
    scene.add(track);

    // Track Border Neon Beams
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, trackLength, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
    
    const leftBeam = new THREE.Mesh(beamGeo, beamMat);
    leftBeam.rotation.x = Math.PI / 2;
    leftBeam.position.set(-trackWidth / 2, 0.1, -trackLength / 2 + 10);
    scene.add(leftBeam);

    const rightBeam = new THREE.Mesh(beamGeo, beamMat);
    rightBeam.rotation.x = Math.PI / 2;
    rightBeam.position.set(trackWidth / 2, 0.1, -trackLength / 2 + 10);
    scene.add(rightBeam);

    // Lane Dividers (Dashed stripes)
    const laneDivGeo = new THREE.PlaneGeometry(0.12, 4);
    const laneDivMat = new THREE.MeshBasicMaterial({ color: '#D4AF37' });
    const laneDividersGroup = new THREE.Group();
    for (let z = -trackLength + 20; z < 20; z += 8) {
      const leftDash = new THREE.Mesh(laneDivGeo, laneDivMat);
      leftDash.rotation.x = -Math.PI / 2;
      leftDash.position.set(-trackWidth / 6, 0.02, z);
      laneDividersGroup.add(leftDash);

      const rightDash = new THREE.Mesh(laneDivGeo, laneDivMat);
      rightDash.rotation.x = -Math.PI / 2;
      rightDash.position.set(trackWidth / 6, 0.02, z);
      laneDividersGroup.add(rightDash);
    }
    scene.add(laneDividersGroup);

    // 6. 3D Player Cyber-Craft
    const playerGroup = new THREE.Group();
    
    // Fuselage / Hull
    const hullGeo = new THREE.ConeGeometry(0.65, 2.2, 5);
    hullGeo.rotateX(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.15,
      metalness: 0.9,
      emissive: '#0C4A6E',
      emissiveIntensity: 0.4,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.scale.set(1, 0.35, 1);
    playerGroup.add(hull);

    // Wings
    const wingGeo = new THREE.BoxGeometry(2.4, 0.06, 0.9);
    const wingMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      metalness: 0.8,
      roughness: 0.2,
      emissive: '#0369A1',
      emissiveIntensity: 0.3,
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0.2);
    playerGroup.add(wings);

    // Cockpit Canopy (Glass with glow)
    const cockpitGeo = new THREE.SphereGeometry(0.35, 16, 12);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      roughness: 0.1,
      metalness: 0.2,
      emissive: '#0284C7',
      emissiveIntensity: 0.8,
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.scale.set(0.6, 0.4, 1.2);
    cockpit.position.set(0, 0.15, -0.1);
    playerGroup.add(cockpit);

    // Engine Thrusters (Twin Cyan Jets)
    const thrusterGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.4, 12);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
    
    const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    leftThruster.position.set(-0.4, 0, 0.9);
    playerGroup.add(leftThruster);

    const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    rightThruster.position.set(0.4, 0, 0.9);
    playerGroup.add(rightThruster);

    playerGroup.position.set(0, 0.6, 0);
    scene.add(playerGroup);
    playerGroupRef.current = playerGroup;

    // 7. Dynamic Warp Speed Particles & Starfield
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = Math.random() * 30 + 1;
      starPositions[i * 3 + 2] = -Math.random() * 250;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: '#E0F2FE',
      size: 0.35,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
    particlesRef.current = starField;

    // 8. Distant Cyber Grid City Skyline Silhouettes
    const cityGroup = new THREE.Group();
    const buildingGeo = new THREE.BoxGeometry(4, 30, 4);
    const buildingMat = new THREE.MeshBasicMaterial({
      color: '#0D1117',
      wireframe: true,
    });
    for (let i = -12; i <= 12; i++) {
      if (Math.abs(i) < 2) continue;
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      const bHeight = Math.random() * 20 + 10;
      building.scale.set(1, bHeight / 15, 1);
      building.position.set(i * 5 + (Math.random() - 0.5) * 2, bHeight / 2 - 2, -180 - Math.random() * 60);
      cityGroup.add(building);
    }
    scene.add(cityGroup);

    // Resize observer
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup initial obstacles
    obstaclesRef.current = [];

    // Helper: Spawn 3D Obstacle / Bio-Orb
    const laneWidth = trackWidth / 3;
    const spawn3DItem = (zPos: number) => {
      const laneIndex = (Math.floor(Math.random() * 3) - 1); // -1, 0, 1
      const isOrb = Math.random() > 0.38; // 62% orbs, 38% barriers
      const itemGroup = new THREE.Group();

      const xPos = laneIndex * (laneWidth * 0.82);

      if (isOrb) {
        // Golden Bio-Orb (Dodecahedron with outer spinning rings)
        const orbGeo = new THREE.DodecahedronGeometry(0.45, 1);
        const orbMat = new THREE.MeshStandardMaterial({
          color: '#FBBF24',
          emissive: '#F59E0B',
          emissiveIntensity: 0.9,
          metalness: 0.9,
          roughness: 0.1,
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        itemGroup.add(orb);

        const ringGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: '#FDE68A' });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.name = 'ring';
        itemGroup.add(ring);

        // Sub glow point light
        const orbLight = new THREE.PointLight('#FBBF24', 1.2, 4);
        itemGroup.add(orbLight);
      } else {
        // Red / Amber Barrier Arch
        const barGeo = new THREE.BoxGeometry(laneWidth * 0.75, 1.4, 0.4);
        const barMat = new THREE.MeshStandardMaterial({
          color: '#DC2626',
          emissive: '#EF4444',
          emissiveIntensity: 0.7,
          metalness: 0.8,
          roughness: 0.2,
          transparent: true,
          opacity: 0.9,
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(0, 0.7, 0);
        itemGroup.add(bar);

        // Warning Hazard Stripe Frame
        const hazardFrameGeo = new THREE.BoxGeometry(laneWidth * 0.8, 0.15, 0.45);
        const hazardFrameMat = new THREE.MeshBasicMaterial({ color: '#FBBF24' });
        const topFrame = new THREE.Mesh(hazardFrameGeo, hazardFrameMat);
        topFrame.position.set(0, 1.4, 0);
        itemGroup.add(topFrame);
      }

      itemGroup.position.set(xPos, isOrb ? 0.8 : 0, zPos);
      scene.add(itemGroup);

      obstaclesRef.current.push({
        mesh: itemGroup,
        lane: laneIndex,
        z: zPos,
        type: isOrb ? 'orb' : 'barrier',
        collected: false,
      });
    };

    // Pre-populate initial obstacles along the track
    for (let z = -30; z > -180; z -= 18) {
      spawn3DItem(z);
    }
    stateRef.current.lastSpawnZ = -180;

    // --- Main 60 FPS 3D Animation & Physics Loop ---
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const telem = state.telemetry;

      if (!state.isPlaying || state.isPaused || state.isCompleted) {
        renderer.render(scene, camera);
        return;
      }

      // 1. Calculate dynamic game speed boosted by focus & flow state
      const isFlow = telem.flowState || (telem.focusScore > 75 && telem.fixationStability > 0.75);
      const baseSpeed = 38 + (telem.focusScore / 100) * 22;
      const targetSpeed = isFlow ? baseSpeed * 1.3 : baseSpeed;
      state.speed += (targetSpeed - state.speed) * (dt * 3);

      if (isFlow) {
        state.flowSeconds += dt;
        setFlowSeconds(Math.round(state.flowSeconds));
      }

      // 2. Smoothly move player horizontally towards target lane with banking tilt
      const targetX = state.targetLane * (laneWidth * 0.82);
      state.playerX += (targetX - state.playerX) * (dt * 12);

      if (playerGroupRef.current) {
        playerGroupRef.current.position.x = state.playerX;
        
        // Gentle hover vertical bobbing
        playerGroupRef.current.position.y = 0.6 + Math.sin(currentTime * 0.006) * 0.08;

        // Banking roll on turn
        const rollAngle = (state.targetLane * (laneWidth * 0.82) - state.playerX) * -0.28;
        playerGroupRef.current.rotation.z += (rollAngle - playerGroupRef.current.rotation.z) * (dt * 15);
        playerGroupRef.current.rotation.y = rollAngle * 0.4;
      }

      // 3. Move and recycle track dividers
      laneDividersGroup.children.forEach((dash) => {
        dash.position.z += state.speed * dt;
        if (dash.position.z > 15) {
          dash.position.z -= trackLength - 30;
        }
      });

      // 4. Move stars / warp particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < starCount; i++) {
          positions[i * 3 + 2] += (state.speed * 1.5) * dt;
          if (positions[i * 3 + 2] > 10) {
            positions[i * 3 + 2] = -250;
            positions[i * 3] = (Math.random() - 0.5) * 80;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 5. Spawn new obstacles continuously
      state.lastSpawnZ += state.speed * dt;
      if (state.lastSpawnZ > -160) {
        spawn3DItem(-200);
        state.lastSpawnZ = -200;
      }

      // 6. Update, animate and collide obstacles
      const activeObstacles = obstaclesRef.current;
      for (let i = activeObstacles.length - 1; i >= 0; i--) {
        const item = activeObstacles[i];
        item.z += state.speed * dt;
        item.mesh.position.z = item.z;

        // Spin orbs and their rings
        if (item.type === 'orb' && !item.collected) {
          item.mesh.rotation.y += dt * 3;
          const ring = item.mesh.getObjectByName('ring');
          if (ring) {
            ring.rotation.x += dt * 4;
            ring.rotation.y += dt * 2;
          }
          item.mesh.position.y = 0.8 + Math.sin(currentTime * 0.005 + item.z * 0.1) * 0.15;
        }

        // Collision Check with Player (Player is at z=0, x=state.playerX)
        const distZ = Math.abs(item.z - 0);
        const distX = Math.abs(item.mesh.position.x - state.playerX);

        if (!item.collected && distZ < 1.4 && distX < 1.1) {
          item.collected = true;

          if (item.type === 'orb') {
            // Collected Bio-Orb
            const points = (isFlow ? 50 : 25) * (1 + Math.floor(state.streak / 5));
            state.score += points;
            state.streak += 1;
            setScore(state.score);
            setStreak(state.streak);
            setHighScore((prev) => Math.max(prev, state.score));
            playSound('collect');

            // Visual shrink & vanish animation
            item.mesh.scale.set(0.01, 0.01, 0.01);
            scene.remove(item.mesh);
          } else {
            // Hit Barrier
            state.streak = 0;
            state.score = Math.max(0, state.score - 40);
            setScore(state.score);
            setStreak(0);
            playSound('barrier');

            // Flash red on player
            playerPointLight.color.set('#EF4444');
            setTimeout(() => {
              playerPointLight.color.set('#38BDF8');
            }, 300);
          }
        }

        // Cleanup past obstacles
        if (item.z > 20) {
          scene.remove(item.mesh);
          activeObstacles.splice(i, 1);
        }
      }

      // 7. Dynamic Camera Sway and FOV Expansion in Flow State
      if (cameraRef.current) {
        const targetFov = isFlow ? 74 : 65;
        cameraRef.current.fov += (targetFov - cameraRef.current.fov) * (dt * 3);
        cameraRef.current.position.x = state.playerX * 0.35;
        cameraRef.current.updateProjectionMatrix();
        cameraRef.current.lookAt(state.playerX * 0.4, 0.8, -15);
      }

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
    stateRef.current.score = 0;
    stateRef.current.streak = 0;
    stateRef.current.flowSeconds = 0;
    stateRef.current.targetLane = 0;
    stateRef.current.playerX = 0;
    stateRef.current.isCompleted = false;
    stateRef.current.isPlaying = true;
    stateRef.current.isPaused = false;

    setScore(0);
    setStreak(0);
    setFlowSeconds(0);
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
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#0A0B0E] border border-stone-900/15 shadow-sm flex flex-col items-center select-none font-editorial-sans">
      {/* 3D HUD Top Bar */}
      <div className="w-full bg-[#FBFBF9] px-6 py-3.5 border-b border-stone-900/10 flex flex-wrap items-center justify-between gap-4 z-10 text-stone-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-900/10 text-stone-800 text-xs shadow-xs">
            <Zap className="w-3.5 h-3.5 text-stone-700 stroke-[1.5]" />
            <span>ציון סנכרון: <strong className="font-serif italic text-sm text-stone-950">{score}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-900/10 text-stone-800 text-xs shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-600 stroke-[1.5]" />
            <span>רצף מיקוד (Streak): <strong className="font-serif italic text-sm text-stone-950">{streak}x</strong></span>
          </div>

          {telemetry.flowState && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-[#FBFBF9] text-xs font-editorial-sans uppercase tracking-wider animate-pulse shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>מצב זרימה (Flow Mode 3D)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-600 font-editorial-sans">
            <span>שיא אימון:</span>
            <span className="font-serif italic text-stone-950 font-medium">{highScore} pts</span>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] max-h-[580px] bg-[#0A0B0E] overflow-hidden">
        <div ref={containerRef} className="w-full h-full cursor-pointer" />

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
            score,
            flowOrZenSeconds: flowSeconds,
            stabilityPct: telemetry.fixationStability,
            avgPupilMm: telemetry.diameterMm,
            gameTitle: 'Neon Focus Runner 3D (ADHD)',
          }}
        />

        {/* 3D On-Screen Touch / Click Lane Steer Controls */}
        <div className="absolute inset-0 grid grid-cols-3 z-0 pointer-events-auto">
          <button
            onClick={() => setLaneDirect(-1)}
            title="הסט שמאלה"
            className="w-full h-full opacity-0 hover:opacity-10 bg-cyan-500/20 active:opacity-20 transition-opacity flex items-center justify-start p-6"
          >
            <ArrowLeft className="w-10 h-10 text-cyan-300 drop-shadow-md" />
          </button>
          <button
            onClick={() => setLaneDirect(0)}
            title="מרכז מסלול"
            className="w-full h-full opacity-0 hover:opacity-10 bg-white/10 active:opacity-20 transition-opacity"
          />
          <button
            onClick={() => setLaneDirect(1)}
            title="הסט ימינה"
            className="w-full h-full opacity-0 hover:opacity-10 bg-cyan-500/20 active:opacity-20 transition-opacity flex items-center justify-end p-6"
          >
            <ArrowRight className="w-10 h-10 text-cyan-300 drop-shadow-md" />
          </button>
        </div>

        {/* 3D Movement Instructions HUD */}
        <div className="absolute bottom-4 left-4 pointer-events-none bg-stone-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-800 text-xs text-stone-200 shadow-md font-editorial-sans">
          <span>שליטה תלת-ממדית באמצעות מבט עיניים, מקשי חצים (A/D) או לחיצה על המסלולים</span>
        </div>
      </div>

      {/* Bottom Footer Info Bar */}
      <div className="w-full px-6 py-3 bg-[#FBFBF9] border-t border-stone-900/10 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-4">
          <span>קוטר אישון: <strong className="text-stone-900 font-mono">{telemetry.diameterMm} mm</strong></span>
          <span>עומס קוגניטיבי: <strong className="text-stone-900 font-mono">{(telemetry.cognitiveLoad * 100).toFixed(0)}%</strong></span>
          <span>מנוע תלת-ממד: <strong className="text-stone-900 font-mono">WebGL 60FPS</strong></span>
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
