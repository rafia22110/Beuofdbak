import React, { useState, useEffect, useRef } from 'react';
import { PupilTelemetry, ActiveTab, GameMode, ThreeWaySession, CalibrationProfile } from './types';
import { PupillometryEngine } from './utils/pupilTracker';
import { Header } from './components/Header';
import { CameraTrackerPanel } from './components/CameraTrackerPanel';
import { NeonRunnerGame } from './components/games/NeonRunnerGame';
import { ZenGardenGame } from './components/games/ZenGardenGame';
import { HarmonicSphereGame } from './components/games/HarmonicSphereGame';
import { ThreeWayProtocol } from './components/ThreeWayProtocol';
import { ClinicalReport } from './components/ClinicalReport';
import { ResearchKnowledgeHub } from './components/ResearchKnowledgeHub';
import { CalibrationModal } from './components/CalibrationModal';
import { AppStoreDistributionModal } from './components/AppStoreDistributionModal';
import { InstallPromptBanner } from './components/InstallPromptBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { buildOKFJsonLd } from './utils/okfExporter';
import { Zap, Sparkles, Gamepad2, Brain, Activity, ShieldCheck, Compass, Smartphone } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('training');
  const [gameMode, setGameMode] = useState<GameMode>('runner');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Catch PWA Install Prompt for Android & Chromium browsers
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Live Pupil Telemetry State
  const [telemetry, setTelemetry] = useState<PupilTelemetry>({
    timestamp: Date.now(),
    diameterMm: 3.42,
    tonicDiameter: 3.42,
    phasicResponse: 0.0,
    fixationStability: 0.85,
    saccadeCount: 0,
    saccadesPerMin: 14,
    focusScore: 78,
    flowState: true,
    pupilWaveFrequencyHz: 0.22,
    luminanceNorm: 0.5,
    isBlinking: false,
    gazeX: 0.5,
    gazeY: 0.5,
  });

  const [calibration, setCalibration] = useState<CalibrationProfile>({
    isCalibrated: true,
    restingMinMm: 2.8,
    restingMaxMm: 4.8,
    restingAvgMm: 3.4,
    stressTargetMm: 4.5,
    lightingLuxEstimate: 320,
    timestamp: Date.now(),
  });

  // Current or Benchmark ThreeWaySession
  const [currentSession, setCurrentSession] = useState<ThreeWaySession>(() => {
    const sampleStates = PupillometryEngine.generateSampleSession();
    const session: ThreeWaySession = {
      id: 'SESS-2026-OKF-894',
      createdAt: new Date().toISOString(),
      patientName: 'רפאל ארגמן',
      patientId: 'P-10294',
      condition: 'ADHD',
      protocol: 'Standard_3Way',
      stateA: sampleStates[0],
      stateB: sampleStates[1],
      stateC: sampleStates[2],
      cognitiveDynamicRangePct: 39.1,
      trainingEfficiencyPct: 86.4,
      autonomicRecoveryPct: 88.2,
      clinicalNotes:
        'המטופל הציג גיוס משאבים תקין במעבר למצב B (הרחבת אישון ב-+39.1%). באימון הלופ הסגור (מצב C), מנגנון הפידבק הוויזואלי השיג ייצוב אישון אופטימלי (SD 0.08) וכניסה ל-Flow State ב-86% ממשך הסשן.',
      recommendedNextSteps: 'מומלץ להמשיך בסדרת אימונים דו-שבועית של 5 דקות במשחק Neon Focus Runner.',
      okfGraphJson: '',
    };
    session.okfGraphJson = JSON.stringify(buildOKFJsonLd(session), null, 2);
    return session;
  });

  const engineRef = useRef<PupillometryEngine | null>(null);

  // Initialize pupillometry engine
  useEffect(() => {
    const engine = new PupillometryEngine();
    engineRef.current = engine;

    engine.setOnTelemetry((data) => {
      setTelemetry(data);
    });

    engine.start();

    return () => {
      engine.stop();
      engine.stopCamera();
    };
  }, []);

  const handleToggleCamera = async () => {
    if (!engineRef.current) return;
    if (isCameraActive) {
      engineRef.current.stopCamera();
      setIsCameraActive(false);
    } else {
      const success = await engineRef.current.startCamera();
      setIsCameraActive(success);
    }
  };

  const handleManualFocusShift = (val: number) => {
    if (engineRef.current) {
      engineRef.current.setUserIntentFocus(val);
    }
  };

  const handleSaveCalibration = (profile: CalibrationProfile) => {
    setCalibration(profile);
    if (engineRef.current) {
      engineRef.current.setCalibration(profile);
    }
  };

  const handleSessionComplete = (session: ThreeWaySession) => {
    setCurrentSession(session);
    setActiveTab('report');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#141413] font-editorial-sans flex flex-col selection:bg-stone-900 selection:text-[#FBFBF9]" dir="rtl">
      {/* Floating Mobile Install Prompt Banner */}
      <InstallPromptBanner
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        deferredPrompt={deferredPrompt}
      />

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCameraActive={isCameraActive}
        focusScore={telemetry.focusScore}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
      />

      {/* Main Container with safe-area padding for mobile navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8 animate-editorial-fade pb-28 sm:pb-8">
        {/* Tab 1: Closed-Loop Neuro-Training Games */}
        {activeTab === 'training' && (
          <div className="flex flex-col gap-8">
            {/* Live Pupillometry Hardware & Sensor Panel */}
            <CameraTrackerPanel
              telemetry={telemetry}
              isCameraActive={isCameraActive}
              onToggleCamera={handleToggleCamera}
              calibration={calibration}
              onOpenCalibration={() => setIsCalibrationOpen(true)}
              onManualFocusShift={handleManualFocusShift}
            />

            {/* Game Mode Selector */}
            <div className="w-full bg-white rounded-2xl border border-stone-900/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-editorial-sans text-[9px] uppercase tracking-[0.25em] text-stone-500">
                    Curated Clinical Regimens
                  </span>
                </div>
                <h3 className="font-serif text-lg font-normal italic text-stone-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-stone-700 stroke-[1.5]" />
                  <span>בחר מצב אימון נוירו-ביופידבק (Neuro-Regimen)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  כל מודול מכויל לפרופיל פיזיולוגי מותאם (ADHD, חרדה ו-PTSD, או וויסות חושי ואיזון שינה)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Neon Runner Button */}
                <button
                  onClick={() => setGameMode('runner')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-editorial-sans uppercase tracking-wider border transition-all ${
                    gameMode === 'runner'
                      ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm font-medium'
                      : 'bg-[#FBFBF9] border-stone-900/15 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Focus Runner 3D (ADHD)</span>
                </button>

                {/* Zen Garden Button */}
                <button
                  onClick={() => setGameMode('garden')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-editorial-sans uppercase tracking-wider border transition-all ${
                    gameMode === 'garden'
                      ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm font-medium'
                      : 'bg-[#FBFBF9] border-stone-900/15 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Zen Bio-Garden 3D (חרדה & PTSD)</span>
                </button>

                {/* Harmonic Sphere Button */}
                <button
                  onClick={() => setGameMode('harmonic')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-editorial-sans uppercase tracking-wider border transition-all ${
                    gameMode === 'harmonic'
                      ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm font-medium'
                      : 'bg-[#FBFBF9] border-stone-900/15 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Harmonic Sphere 3D (וויסות & שינה)</span>
                </button>
              </div>
            </div>

            {/* Active Game Display */}
            {gameMode === 'runner' && (
              <NeonRunnerGame
                telemetry={telemetry}
                onGoToReport={() => setActiveTab('report')}
              />
            )}
            {gameMode === 'garden' && (
              <ZenGardenGame
                telemetry={telemetry}
                onGoToReport={() => setActiveTab('report')}
              />
            )}
            {gameMode === 'harmonic' && (
              <HarmonicSphereGame
                telemetry={telemetry}
                onGoToReport={() => setActiveTab('report')}
              />
            )}
          </div>
        )}

        {/* Tab 2: 3-Way Comparative Protocol */}
        {activeTab === 'protocol' && (
          <ThreeWayProtocol
            telemetry={telemetry}
            onSessionComplete={handleSessionComplete}
            onCancel={() => setActiveTab('training')}
          />
        )}

        {/* Tab 3: Scientific & Clinical Report */}
        {activeTab === 'report' && (
          <ClinicalReport
            session={currentSession}
            onRunNewProtocol={() => setActiveTab('protocol')}
          />
        )}

        {/* Tab 4: Research Knowledge & Ecosystem Hub */}
        {activeTab === 'research' && <ResearchKnowledgeHub />}
      </main>

      {/* Mobile-Native Bottom Navigation Bar for Android / iPhone */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        isInstallAvailable={!!deferredPrompt}
      />

      {/* 10s Baseline Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        telemetry={telemetry}
        onSaveCalibration={handleSaveCalibration}
      />

      {/* Comprehensive App Store & Mobile Distribution Modal */}
      <AppStoreDistributionModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => {
          setDeferredPrompt(null);
          setIsStoreModalOpen(false);
        }}
      />

      {/* Editorial Footer */}
      <footer className="w-full border-t border-stone-900/10 bg-[#FBFBF9] py-6 px-8 text-xs text-stone-500 font-editorial-sans print:hidden mb-16 sm:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-serif italic text-stone-900 font-medium">OculoFlow Journal & Lab</span>
            <span className="h-3 w-[1px] bg-stone-900/15" />
            <span className="text-[10px] uppercase tracking-widest text-stone-400">
              Schema.org / OKF Medical Oculomics Specification
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStoreModalOpen(true)}
              className="text-stone-700 hover:text-stone-950 underline font-medium"
            >
              מדריך הפצה ל-Google Play & App Store
            </button>
            <span>•</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400">
              Open Knowledge Graph Standard — PWA Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

