export interface PupilTelemetry {
  timestamp: number;
  diameterMm: number; // Raw / processed pupil diameter in mm (e.g. 2.5 - 5.5mm)
  tonicDiameter: number; // Low-frequency sustained baseline
  phasicResponse: number; // Rapid stimulus-locked fluctuation
  fixationStability: number; // 0.0 - 1.0 (1.0 = locked fixation)
  saccadeCount: number;
  saccadesPerMin: number;
  focusScore: number; // 0 - 100%
  flowState: boolean;
  pupilWaveFrequencyHz: number; // 0.1 - 2.0 Hz
  luminanceNorm: number; // 0.0 - 1.0 scene illumination
  isBlinking: boolean;
  gazeX: number; // 0.0 - 1.0 relative
  gazeY: number; // 0.0 - 1.0 relative
}

export interface CalibrationProfile {
  isCalibrated: boolean;
  restingMinMm: number;
  restingMaxMm: number;
  restingAvgMm: number;
  stressTargetMm: number;
  lightingLuxEstimate: number;
  timestamp: number;
}

export type ProtocolStage = 'IDLE' | 'STATE_A_RESTING' | 'STATE_B_STRESS' | 'STATE_C_TRAINING' | 'COMPLETED';

export interface StateDataRecord {
  stateId: 'State_A_Resting' | 'State_B_CognitiveStress' | 'State_C_GameTraining';
  title: string;
  durationSeconds: number;
  avgTonicDiameterMm: number;
  pupillaryWavesSD: number;
  saccadesPerMin: number;
  avgFixationDurationMs: number;
  flowStatePct: number;
  timeline: { time: number; diameter: number; focus: number; saccade: boolean }[];
  fftSpectrum: { freqHz: number; power: number }[];
}

export interface ThreeWaySession {
  id: string;
  createdAt: string;
  patientName: string;
  patientId: string;
  age?: number;
  condition: 'ADHD' | 'PTSD_Anxiety' | 'Sleep_Sensory' | 'Peak_Performance' | 'General_Wellness';
  protocol: 'Standard_3Way' | 'Quick_Train';
  stateA: StateDataRecord;
  stateB: StateDataRecord;
  stateC: StateDataRecord;
  // Computed Clinical Indices
  cognitiveDynamicRangePct: number; // (B/A - 1) * 100
  trainingEfficiencyPct: number; // Regulation from B -> C
  autonomicRecoveryPct: number; // Return to equilibrium
  clinicalNotes: string;
  recommendedNextSteps: string;
  okfGraphJson: string;
}

export type ActiveTab = 'training' | 'protocol' | 'report' | 'research' | 'calibration';
export type GameMode = 'runner' | 'garden' | 'harmonic';
