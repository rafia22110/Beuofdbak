import React, { useRef, useEffect, useState } from 'react';
import { PupilTelemetry, CalibrationProfile } from '../types';
import { Camera, CameraOff, Eye, Sliders, ShieldCheck, RefreshCw, Sun, Zap, Info, AlertTriangle, AlertCircle } from 'lucide-react';

interface Props {
  telemetry: PupilTelemetry;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  calibration: CalibrationProfile;
  onOpenCalibration: () => void;
  onManualFocusShift?: (val: number) => void;
}

export const CameraTrackerPanel: React.FC<Props> = ({
  telemetry,
  isCameraActive,
  onToggleCamera,
  calibration,
  onOpenCalibration,
  onManualFocusShift,
}) => {
  const [manualEffort, setManualEffort] = useState(0.7);
  const eyeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calibration bounds threshold calculations
  const minBound = calibration?.restingMinMm ?? 2.8;
  const maxBound = calibration?.restingMaxMm ?? 4.8;
  const isBelowMin = telemetry.diameterMm < minBound;
  const isAboveMax = telemetry.diameterMm > maxBound;
  const isThresholdBreach = (isBelowMin || isAboveMax) && !telemetry.isBlinking;

  // Render eye HUD animation
  useEffect(() => {
    const canvas = eyeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Warm dark slate/obsidian canvas plate
    ctx.fillStyle = '#1A1A18';
    ctx.fillRect(0, 0, w, h);

    // Grid guide lines
    ctx.strokeStyle = isThresholdBreach ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 251, 249, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.stroke();

    // Eye outline
    ctx.strokeStyle = isThresholdBreach ? '#7F1D1D' : '#44443E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(14, cy);
    ctx.quadraticCurveTo(cx, 20, w - 14, cy);
    ctx.quadraticCurveTo(cx, h - 20, 14, cy);
    ctx.stroke();

    // Iris (Gaze tracked)
    const irisX = cx + (telemetry.gazeX - 0.5) * 36;
    const irisY = cy + (telemetry.gazeY - 0.5) * 28;
    const irisR = 36;

    const irisGrad = ctx.createRadialGradient(irisX, irisY, 4, irisX, irisY, irisR);
    if (isThresholdBreach) {
      irisGrad.addColorStop(0, '#7A3535');
      irisGrad.addColorStop(0.7, '#4B1F1F');
      irisGrad.addColorStop(1, '#200D0D');
    } else {
      irisGrad.addColorStop(0, '#5A6B7C');
      irisGrad.addColorStop(0.7, '#2F3E4D');
      irisGrad.addColorStop(1, '#18222C');
    }

    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
    ctx.fill();

    // Pupil (Direct real-time diameter in mm)
    const pupilR = Math.max(8, telemetry.diameterMm * 7.0);

    ctx.fillStyle = telemetry.isBlinking ? '#1A1A18' : '#0B0C0E';
    ctx.beginPath();
    ctx.arc(irisX, irisY, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Stroke reflects threshold status: Red when breached, gold for flow state, subtle white otherwise
    ctx.strokeStyle = isThresholdBreach
      ? '#EF4444'
      : telemetry.flowState
      ? '#D4AF37'
      : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = isThresholdBreach || telemetry.flowState ? 2 : 1;
    ctx.stroke();

    // Specular Corneal Reflection (Glint point)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(irisX - pupilR * 0.38, irisY - pupilR * 0.38, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Reticle Crosshair
    ctx.strokeStyle = isThresholdBreach ? 'rgba(239, 68, 68, 0.6)' : 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
    ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [telemetry, isThresholdBreach]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setManualEffort(v);
    if (onManualFocusShift) {
      onManualFocusShift(v);
    }
  };

  return (
    <div
      className={`w-full rounded-2xl p-6 shadow-sm flex flex-col gap-5 transition-all duration-300 ${
        isThresholdBreach
          ? 'bg-[#FFFDFD] border-2 border-red-300/90 shadow-red-100 ring-2 ring-red-200/50'
          : 'bg-white border border-stone-900/10'
      }`}
    >
      {/* Top Title & Hardware status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-900/10">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
              isThresholdBreach
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-stone-900/15 bg-[#F2F0EB] text-stone-800'
            }`}
          >
            {isThresholdBreach ? (
              <AlertTriangle className="w-4 h-4 stroke-[2]" />
            ) : (
              <Eye className="w-4 h-4 stroke-[1.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial-sans text-[9px] uppercase tracking-[0.25em] text-stone-500">
                Plate 01 — Optical Acquisition
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-editorial-sans uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-900/10">
                60 Hz Calibrated
              </span>
              {isThresholdBreach && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-editorial-sans font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  חריגת סף כיול
                </span>
              )}
            </div>
            <h3 className="font-serif text-lg font-normal italic text-stone-900">
              חיישן פופילומטריה ואוקולומיקס בזמן אמת
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-editorial-sans uppercase tracking-wider border transition-all ${
              isCameraActive
                ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm'
                : 'bg-white hover:bg-stone-50 border-stone-900/20 text-stone-800'
            }`}
          >
            {isCameraActive ? (
              <>
                <Camera className="w-3.5 h-3.5 animate-pulse text-amber-300 stroke-[1.5]" />
                <span>מצלמה פעילה</span>
              </>
            ) : (
              <>
                <CameraOff className="w-3.5 h-3.5 text-stone-500 stroke-[1.5]" />
                <span>הפעלת חיישן מצלמה</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Threshold Breach Alert Banner */}
      {isThresholdBreach && (
        <div className="w-full bg-red-50/90 border border-red-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-950 animate-editorial-fade shadow-xs font-editorial-sans">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-red-100 text-red-700 shrink-0 mt-0.5 border border-red-200">
              <AlertTriangle className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-serif italic text-sm font-medium text-red-950">
                <span>התרעת חריגת סף כיול ביומטרי (Biometric Threshold Breach)</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-red-200/80 text-red-900 border border-red-300">
                  {isBelowMin ? 'מתחת לסף מינימום' : 'מעל לסף מקסימום'}
                </span>
              </div>
              <p className="text-xs text-red-900/90 mt-1 leading-relaxed">
                קוטר האישון הנמדד (<strong>{telemetry.diameterMm} mm</strong>) חורג מגבולות הכיול הפיזיולוגיים שנקבעו (טווח מכויל: <strong>{minBound.toFixed(2)} — {maxBound.toFixed(2)} mm</strong>).
                {isBelowMin
                  ? ' כיווץ אישון יתר מעיד על צניחה חדה בעוררות (עייפות/רפיון), הסחת דעת פאראסימפתטית או שינוי בתאורת החלל.'
                  : ' הרחבת אישון יתר מעידה על עומס קוגניטיבי מוגבר (Cognitive Overload), דחק רגשי או חריגת עוררות סימפתטית.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCalibration}
            className="px-3.5 py-1.5 rounded-full bg-red-900 hover:bg-red-800 text-white text-xs font-editorial-sans uppercase tracking-wider shrink-0 transition-all shadow-xs"
          >
            כיול מחדש (10s)
          </button>
        </div>
      )}

      {/* Grid: Eye HUD visualizer + Real-time Biometrics metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Eye Optical HUD */}
        <div
          className={`md:col-span-4 flex flex-col items-center rounded-xl p-4 border transition-colors ${
            isThresholdBreach
              ? 'bg-red-50/40 border-red-200/80'
              : 'bg-[#F7F6F2] border-stone-900/10'
          }`}
        >
          <div className="relative w-full max-w-[200px] aspect-[4/3] rounded-lg overflow-hidden border border-stone-900/20 bg-[#1A1A18] flex items-center justify-center shadow-inner">
            <canvas ref={eyeCanvasRef} width={200} height={150} className="w-full h-full object-cover" />
            <div
              className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-editorial-sans uppercase tracking-widest border ${
                isThresholdBreach
                  ? 'bg-red-950/80 text-red-200 border-red-500/40'
                  : 'bg-black/70 text-[#FBFBF9] border-white/10'
              }`}
            >
              {isThresholdBreach ? 'BREACH DETECTED' : 'ROI: LEFT_IRIS'}
            </div>
            <div
              className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-serif italic border ${
                isThresholdBreach
                  ? 'bg-red-950/80 text-red-300 border-red-500/40 font-bold'
                  : 'bg-black/70 text-amber-200 border-white/10'
              }`}
            >
              {telemetry.diameterMm} mm
            </div>
          </div>
          <div className="w-full flex items-center justify-between mt-3 px-1 text-[10px] font-editorial-sans uppercase tracking-wider text-stone-500">
            <span>מיקום מבט (Gaze):</span>
            <span className="font-mono text-stone-800 font-medium">
              X: {telemetry.gazeX.toFixed(2)} | Y: {telemetry.gazeY.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right: Live Biometric Metrics Matrix */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tonic Pupil Diameter - Highlights red on breach */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
              isThresholdBreach
                ? 'bg-red-50 border-red-300 ring-1 ring-red-200 shadow-xs'
                : 'bg-[#FBFBF9] border-stone-900/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-editorial-sans text-[9px] uppercase tracking-[0.15em] text-stone-500">קוטר אישון טוני</span>
              {isThresholdBreach && (
                <span className="text-[9px] font-bold text-red-700 uppercase">חריגת סף</span>
              )}
            </div>
            <div className="my-1 flex items-baseline gap-1">
              <span
                className={`font-serif italic text-2xl ${
                  isThresholdBreach ? 'text-red-700 font-medium' : 'text-stone-950 font-light'
                }`}
              >
                {telemetry.diameterMm}
              </span>
              <span className="text-[10px] font-editorial-sans uppercase text-stone-400">mm</span>
            </div>
            <span className="text-[9px] font-editorial-sans text-stone-400">
              טווח כיול: {minBound} — {maxBound}mm
            </span>
          </div>

          {/* Micro-Saccades Frequency */}
          <div className="bg-[#FBFBF9] p-3.5 rounded-xl border border-stone-900/10 flex flex-col justify-between">
            <span className="font-editorial-sans text-[9px] uppercase tracking-[0.15em] text-stone-500">מיקרו-סקאדות</span>
            <div className="my-1 flex items-baseline gap-1">
              <span className="font-serif italic text-2xl font-light text-stone-950">{telemetry.saccadesPerMin}</span>
              <span className="text-[10px] font-editorial-sans uppercase text-stone-400">/דק׳</span>
            </div>
            <span className="text-[9px] font-editorial-sans text-stone-400">מדד מוסחות קוגניטיבי</span>
          </div>

          {/* Fixation Stability */}
          <div className="bg-[#FBFBF9] p-3.5 rounded-xl border border-stone-900/10 flex flex-col justify-between">
            <span className="font-editorial-sans text-[9px] uppercase tracking-[0.15em] text-stone-500">יציבות קיבוע</span>
            <div className="my-1 flex items-baseline gap-1">
              <span className="font-serif italic text-2xl font-light text-stone-950">
                {(telemetry.fixationStability * 100).toFixed(0)}%
              </span>
            </div>
            <span className="text-[9px] font-editorial-sans text-stone-400">סנכרון ויזואלי-מוטורי</span>
          </div>

          {/* Pupillary Waves Frequency */}
          <div className="bg-[#FBFBF9] p-3.5 rounded-xl border border-stone-900/10 flex flex-col justify-between">
            <span className="font-editorial-sans text-[9px] uppercase tracking-[0.15em] text-stone-500">תדרי עייפות</span>
            <div className="my-1 flex items-baseline gap-1">
              <span className="font-serif italic text-2xl font-light text-stone-950">{telemetry.pupilWaveFrequencyHz}</span>
              <span className="text-[10px] font-editorial-sans uppercase text-stone-400">Hz</span>
            </div>
            <span className="text-[9px] font-editorial-sans text-stone-400">תנודות אוטונומיות</span>
          </div>

          {/* Room Luminance Shield Indicator */}
          <div className="col-span-2 bg-[#F2F0EB] p-3.5 rounded-xl border border-stone-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-700 stroke-[1.5]" />
              <div>
                <div className="font-serif text-xs font-medium text-stone-900">הגנת תאורה (Luminance Safety Shield)</div>
                <div className="text-[10px] text-stone-500">בדיקת יציבות תאורה לנטרול רפלקס אור שקרי</div>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-stone-900/10 text-[10px] font-editorial-sans uppercase tracking-wider text-stone-800">
              <ShieldCheck className="w-3 h-3 text-emerald-600 stroke-[2]" />
              <span>יציב (~320 Lux)</span>
            </div>
          </div>

          {/* Calibration Button */}
          <div className="col-span-2 bg-[#F2F0EB] p-3.5 rounded-xl border border-stone-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-stone-700 stroke-[1.5]" />
              <div>
                <div className="font-serif text-xs font-medium text-stone-900">כיול קו בסיס (10s Baseline)</div>
                <div className="text-[10px] text-stone-500">מיפוי אישי המבטיח דיוק פיזיולוגי</div>
              </div>
            </div>
            <button
              onClick={onOpenCalibration}
              className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-[#FBFBF9] text-[11px] font-editorial-sans uppercase tracking-wider transition-all shadow-sm"
            >
              בצע כיול
            </button>
          </div>
        </div>
      </div>

      {/* Manual Focus & Autonomic Effort Modulation */}
      <div className="bg-[#F7F6F2] px-5 py-3 rounded-xl border border-stone-900/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-stone-600">
          <Sliders className="w-3.5 h-3.5 text-stone-800 stroke-[1.5]" />
          <span className="font-editorial-sans text-[11px] uppercase tracking-wider text-stone-700 font-medium">
            סימולטור מאמץ קוגניטיבי מנטלי:
          </span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <span className="text-[10px] font-editorial-sans uppercase text-stone-400">רגיעה (אישון קטן)</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={manualEffort}
            onChange={handleSliderChange}
            className="flex-1 h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-stone-900"
          />
          <span className="text-[10px] font-editorial-sans uppercase text-stone-900 font-medium">עוררות (אישון רחב)</span>
        </div>
        <span className="font-serif italic text-stone-900 text-xs font-medium">
          {(manualEffort * 100).toFixed(0)}% מאמץ סימפתטי
        </span>
      </div>
    </div>
  );
};


