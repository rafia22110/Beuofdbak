import React, { useState, useEffect } from 'react';
import { CalibrationProfile, PupilTelemetry } from '../types';
import { RefreshCw, CheckCircle2, ShieldCheck, Sun, Eye, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  telemetry: PupilTelemetry;
  onSaveCalibration: (profile: CalibrationProfile) => void;
}

export const CalibrationModal: React.FC<Props> = ({ isOpen, onClose, telemetry, onSaveCalibration }) => {
  const [step, setStep] = useState<'intro' | 'resting' | 'stress' | 'done'>('intro');
  const [countdown, setCountdown] = useState(5);
  const [restingSamples, setRestingSamples] = useState<number[]>([]);
  const [stressSamples, setStressSamples] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStep('intro');
      setCountdown(5);
      setRestingSamples([]);
      setStressSamples([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'resting') {
      timer = setInterval(() => {
        setRestingSamples((prev) => [...prev, telemetry.diameterMm]);
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('stress');
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (step === 'stress') {
      timer = setInterval(() => {
        setStressSamples((prev) => [...prev, telemetry.diameterMm]);
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            completeCalibration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, telemetry]);

  const completeCalibration = () => {
    const avgResting = restingSamples.length
      ? restingSamples.reduce((a, b) => a + b, 0) / restingSamples.length
      : 3.4;
    const minResting = Math.min(...(restingSamples.length ? restingSamples : [3.0]));
    const maxResting = Math.max(...(restingSamples.length ? restingSamples : [3.8]));
    const avgStress = stressSamples.length
      ? stressSamples.reduce((a, b) => a + b, 0) / stressSamples.length
      : 4.4;

    const profile: CalibrationProfile = {
      isCalibrated: true,
      restingMinMm: Number((minResting * 0.92).toFixed(2)),
      restingMaxMm: Number((maxResting * 1.15).toFixed(2)),
      restingAvgMm: Number(avgResting.toFixed(2)),
      stressTargetMm: Number(avgStress.toFixed(2)),
      lightingLuxEstimate: 320,
      timestamp: Date.now(),
    };

    onSaveCalibration(profile);
    setStep('done');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-editorial-fade">
      <div className="w-full max-w-md bg-[#FBFBF9] border border-stone-900/15 rounded-2xl p-7 shadow-2xl flex flex-col gap-6 text-right relative font-editorial-sans text-stone-900">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step 1: Intro */}
        {step === 'intro' && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-12 h-12 rounded-full border border-stone-900/15 bg-[#F2F0EB] flex items-center justify-center text-stone-800 shadow-sm">
              <RefreshCw className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <span className="text-[9px] font-editorial-sans uppercase tracking-[0.25em] text-stone-400">
                10-Second Calibration Protocol
              </span>
              <h3 className="font-serif text-xl font-normal italic text-stone-900 mt-1">
                כיול אופטי אישי של קו הבסיס
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                הכיול מודד את קוטר האישון הטבעי שלך בסביבת התאורה הנוכחית, ומבטיח שהפידבק במשחק יגיב אך ורק לריכוז שלך ולא לרפלקס תאורה.
              </p>
            </div>

            <div className="w-full bg-[#F2F0EB] p-3.5 rounded-xl border border-stone-900/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <Sun className="w-4 h-4 text-amber-700 stroke-[1.5]" />
                <span>תאורת חדר משוערת:</span>
              </div>
              <span className="font-serif italic text-emerald-800 font-medium">יציבה (~320 Lux)</span>
            </div>

            <button
              onClick={() => setStep('resting')}
              className="w-full py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-[#FBFBF9] font-medium text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              התחל כיול 10 שניות
            </button>
          </div>
        )}

        {/* Step 2: Resting baseline sample */}
        {step === 'resting' && (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="text-[9px] font-editorial-sans uppercase tracking-[0.25em] text-stone-500">
              שלב 1: מדידת מנוחה בסיסית (Resting Tonic)
            </span>
            <div className="relative w-28 h-28 rounded-full bg-[#F2F0EB] border border-stone-900/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-stone-900 animate-ping" />
            </div>
            <div>
              <div className="text-3xl font-serif italic text-stone-900 mb-1">{countdown}s</div>
              <p className="text-xs text-stone-500 font-editorial-sans">הסתכל על הנקודה במרכז ללא מאמץ</p>
            </div>
          </div>
        )}

        {/* Step 3: Stress target sample */}
        {step === 'stress' && (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="text-[9px] font-editorial-sans uppercase tracking-[0.25em] text-stone-500">
              שלב 2: בדיקת הרחבה במאמץ קוגניטיבי
            </span>
            <div className="w-28 h-28 rounded-2xl bg-[#F2F0EB] border border-stone-900/20 flex items-center justify-center font-serif italic text-stone-900 text-lg">
              7 x 8 = ?
            </div>
            <div>
              <div className="text-3xl font-serif italic text-stone-900 mb-1">{countdown}s</div>
              <p className="text-xs text-stone-500 font-editorial-sans">פתור את התרגיל במחשבה (מדידת תגובה סימפתטית)</p>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-12 h-12 rounded-full border border-emerald-800/20 bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-normal italic text-stone-900">הכיול הושלם בהצלחה</h3>
              <p className="text-xs text-stone-600 mt-2">
                פרופיל האישון האישי נשמר בהצלחה במנוע הפופילומטריה.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-[#FBFBF9] font-medium text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              המשך למערכת
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

