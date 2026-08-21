import React from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Sparkles, Award, ArrowRight, Plus } from 'lucide-react';

interface Props {
  remainingSeconds: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  isCompleted: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onChangeDuration: (newDuration: number) => void;
  onExtendSession?: (extraSeconds: number) => void;
  onGoToReport?: () => void;
  sessionStats?: {
    score: number;
    flowOrZenSeconds: number;
    stabilityPct: number;
    avgPupilMm: number;
    gameTitle: string;
  };
}

export const SessionCountdownOverlay: React.FC<Props> = ({
  remainingSeconds,
  totalDurationSeconds,
  isPaused,
  isCompleted,
  onTogglePause,
  onReset,
  onChangeDuration,
  onExtendSession,
  onGoToReport,
  sessionStats,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = totalDurationSeconds > 0
    ? Math.max(0, Math.min(100, (remainingSeconds / totalDurationSeconds) * 100))
    : 0;

  const isLowTime = remainingSeconds <= 15 && remainingSeconds > 0;

  // Circular SVG ring calculation (radius 18, circumference = 2 * PI * 18 = 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <>
      {/* Floating Active Game Countdown HUD Badge */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto flex items-center gap-2 bg-stone-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-800/90 text-stone-100 shadow-xl select-none font-editorial-sans animate-editorial-fade">
        {/* Radial Circular Progress Timer */}
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-stone-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className={`transition-all duration-500 ease-linear ${
                isLowTime
                  ? 'text-rose-400'
                  : progressPct > 30
                  ? 'text-amber-300'
                  : 'text-stone-300'
              }`}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <Clock className={`w-3.5 h-3.5 absolute ${isLowTime ? 'text-rose-400 animate-pulse' : 'text-stone-300'}`} />
        </div>

        {/* Time display & label */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-stone-400">זמן סשן נותר</span>
            {isPaused && (
              <span className="px-1.5 py-0.2 rounded text-[8px] uppercase tracking-wider bg-amber-900/60 text-amber-200 border border-amber-500/30">
                מושהה
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-mono text-base font-bold tracking-tight ${
                isLowTime ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-[10px] text-stone-400">/ {formatTime(totalDurationSeconds)}</span>
          </div>
        </div>

        {/* Quick controls: Pause/Play, Reset, Duration selector */}
        <div className="flex items-center gap-1 mr-2 pl-1 border-r border-stone-800">
          <button
            onClick={onTogglePause}
            title={isPaused ? 'המשך סשן' : 'השהה סשן'}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onReset}
            title="איפוס טיימר סשן"
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Quick preset selector buttons */}
          <div className="hidden md:flex items-center gap-1 mr-1">
            {[60, 120, 180].map((duration) => (
              <button
                key={duration}
                onClick={() => onChangeDuration(duration)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all ${
                  totalDurationSeconds === duration
                    ? 'bg-[#FBFBF9] text-stone-900 font-bold'
                    : 'bg-stone-900/90 text-stone-400 hover:text-stone-200'
                }`}
              >
                {duration / 60}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Modal Overlay when timer reaches 0 */}
      {isCompleted && (
        <div className="absolute inset-0 z-30 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-editorial-fade text-stone-900 font-editorial-sans">
          <div className="w-full max-w-md bg-[#FBFBF9] rounded-2xl border border-stone-900/15 p-7 shadow-2xl flex flex-col gap-5 text-right relative">
            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-stone-900/10 pb-4">
              <div className="w-11 h-11 rounded-full border border-stone-900/15 bg-[#F2F0EB] flex items-center justify-center text-stone-900 shadow-sm shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[1.5] text-emerald-700" />
              </div>
              <div>
                <span className="text-[9px] font-editorial-sans uppercase tracking-[0.25em] text-stone-500">
                  Session Completed • {sessionStats?.gameTitle || 'Neurofeedback'}
                </span>
                <h3 className="font-serif text-xl font-normal italic text-stone-950">
                  סשן אימון נוירו-ביופידבק הושלם!
                </h3>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-stone-900/10 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-wider text-stone-500">ציון אימון סופי</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className="font-serif italic text-2xl font-light text-stone-950">
                    {sessionStats?.score ?? 0}
                  </span>
                  <span className="text-[10px] text-stone-400">pts</span>
                </div>
                <span className="text-[9px] text-stone-400">סנכרון ויזואלי-אופטי</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-900/10 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-wider text-stone-500">זמן בפוקוס עמוק (Flow)</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className="font-serif italic text-2xl font-light text-stone-950">
                    {sessionStats?.flowOrZenSeconds ?? 0}
                  </span>
                  <span className="text-[10px] text-stone-400">שניות</span>
                </div>
                <span className="text-[9px] text-stone-400">
                  {totalDurationSeconds > 0
                    ? `${Math.round(((sessionStats?.flowOrZenSeconds ?? 0) / totalDurationSeconds) * 100)}% ממשך הסשן`
                    : '100%'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-900/10 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-wider text-stone-500">יציבות קיבוע מבט</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className="font-serif italic text-2xl font-light text-stone-950">
                    {sessionStats ? Math.round(sessionStats.stabilityPct * 100) : 85}%
                  </span>
                </div>
                <span className="text-[9px] text-stone-400">וויסות קוגניטיבי מוטורי</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-900/10 flex flex-col justify-between">
                <span className="text-[9px] uppercase tracking-wider text-stone-500">קוטר אישון ממוצע</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className="font-serif italic text-2xl font-light text-stone-950">
                    {sessionStats?.avgPupilMm ?? 3.4}
                  </span>
                  <span className="text-[10px] text-stone-400">mm</span>
                </div>
                <span className="text-[9px] text-stone-400">בגבולות כיול תקינים</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={onReset}
                className="w-full py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-[#FBFBF9] text-xs font-editorial-sans uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>התחל סשן אימון חדש ({totalDurationSeconds / 60} דקות)</span>
              </button>

              <div className="flex items-center gap-2">
                {onExtendSession && (
                  <button
                    onClick={() => onExtendSession(60)}
                    className="flex-1 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-900/15 text-stone-800 text-xs font-editorial-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הארך בדקה נוספת</span>
                  </button>
                )}

                {onGoToReport && (
                  <button
                    onClick={onGoToReport}
                    className="flex-1 py-2 rounded-full bg-[#F2F0EB] hover:bg-stone-200/70 border border-stone-900/10 text-stone-900 text-xs font-editorial-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>צפה בדוח קליני</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
