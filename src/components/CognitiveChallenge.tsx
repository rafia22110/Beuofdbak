import React, { useState, useEffect, useRef } from 'react';
import { PupilTelemetry } from '../types';
import { Zap, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface Props {
  telemetry: PupilTelemetry;
  durationSeconds: number;
  onComplete: (scoreData: { correct: number; total: number; avgReactionTimeMs: number }) => void;
  onTick?: (elapsed: number) => void;
}

interface StroopTask {
  text: string;
  colorName: string;
  colorHex: string;
  isMatch: boolean; // Text equals ink color
}

export const CognitiveChallenge: React.FC<Props> = ({ durationSeconds, onComplete, onTick }) => {
  const [currentTask, setCurrentTask] = useState<StroopTask>({
    text: 'כחול',
    colorName: 'אדום',
    colorHex: '#C92A2A',
    isMatch: false,
  });

  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

  const taskStartTimeRef = useRef(performance.now());
  const reactionTimesRef = useRef<number[]>([]);

  const colors = [
    { name: 'אדום', hex: '#C92A2A' },
    { name: 'כחול', hex: '#1E40AF' },
    { name: 'ירוק', hex: '#166534' },
    { name: 'צהוב', hex: '#B45309' },
    { name: 'סגול', hex: '#6B21A8' },
  ];

  const generateTask = () => {
    const isMatch = Math.random() > 0.5;
    const textIdx = Math.floor(Math.random() * colors.length);
    const textItem = colors[textIdx];
    let colorItem = textItem;

    if (!isMatch) {
      let otherIdx = Math.floor(Math.random() * colors.length);
      while (otherIdx === textIdx) {
        otherIdx = Math.floor(Math.random() * colors.length);
      }
      colorItem = colors[otherIdx];
    }

    setCurrentTask({
      text: textItem.name,
      colorName: colorItem.name,
      colorHex: colorItem.hex,
      isMatch,
    });
    taskStartTimeRef.current = performance.now();
  };

  useEffect(() => {
    generateTask();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (onTick) onTick(durationSeconds - next);
        if (next <= 0) {
          clearInterval(interval);
          const avgReaction =
            reactionTimesRef.current.length > 0
              ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length
              : 650;
          onComplete({
            correct: correctCount,
            total: totalCount,
            avgReactionTimeMs: Math.round(avgReaction),
          });
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResponse = (userClaimMatch: boolean) => {
    const reaction = performance.now() - taskStartTimeRef.current;
    reactionTimesRef.current.push(reaction);

    const isCorrect = userClaimMatch === currentTask.isMatch;
    setTotalCount((p) => p + 1);
    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      setFeedback('CORRECT');
    } else {
      setFeedback('WRONG');
    }

    setTimeout(() => {
      setFeedback(null);
      generateTask();
    }, 250);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-stone-900/10 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-6 font-editorial-sans text-stone-900">
      {/* Top Header info */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-stone-900/10">
        <div>
          <span className="text-[9px] font-editorial-sans uppercase tracking-[0.25em] text-stone-500">
            Plate II — Cognitive Incongruency Test
          </span>
          <h4 className="font-serif text-base italic text-stone-900">מבחן Stroop לקביעת עומס קוגניטיבי (SSRT)</h4>
        </div>
        <div className="px-3 py-1 rounded-full border border-stone-900/15 bg-[#F2F0EB] font-serif italic text-stone-900 font-medium text-sm">
          {timeLeft}s
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-stone-600 text-center max-w-sm leading-relaxed">
        האם <strong>צבע הדיו</strong> תואם ל<strong>משמעות המילה</strong> הכתובה? ענה במהירות המרבית.
      </p>

      {/* Main Stroop Word Plate */}
      <div className="relative w-full py-12 rounded-xl bg-[#F7F6F2] border border-stone-900/10 flex items-center justify-center shadow-inner overflow-hidden">
        <span
          className="text-5xl sm:text-6xl font-serif font-bold tracking-tight transition-transform duration-150 select-none"
          style={{ color: currentTask.colorHex }}
        >
          {currentTask.text}
        </span>

        {/* Transient Feedback overlay */}
        {feedback === 'CORRECT' && (
          <div className="absolute inset-0 bg-emerald-950/10 backdrop-blur-[1px] flex items-center justify-center text-emerald-800 font-editorial-sans text-xs uppercase tracking-widest gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            <span>תשובה נכונה</span>
          </div>
        )}
        {feedback === 'WRONG' && (
          <div className="absolute inset-0 bg-red-950/10 backdrop-blur-[1px] flex items-center justify-center text-red-800 font-editorial-sans text-xs uppercase tracking-widest gap-2 font-medium">
            <XCircle className="w-4 h-4 stroke-[2]" />
            <span>שגיאה</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => handleResponse(true)}
          className="py-3.5 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-[#FBFBF9] font-medium text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
          <span>תואם (כן)</span>
        </button>

        <button
          onClick={() => handleResponse(false)}
          className="py-3.5 px-4 rounded-full bg-[#F2F0EB] hover:bg-stone-200/80 border border-stone-900/15 text-stone-900 font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4 stroke-[1.5]" />
          <span>לא תואם (שונה)</span>
        </button>
      </div>

      {/* Running Score Bar */}
      <div className="w-full flex items-center justify-between text-xs pt-3 border-t border-stone-900/10 text-stone-500 font-editorial-sans">
        <span>
          דיוק:{' '}
          <strong className="font-serif italic text-stone-900 text-sm">
            {totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(0) : 100}%
          </strong>
        </span>
        <span>
          תשובות שנענו:{' '}
          <strong className="font-serif italic text-stone-900 text-sm">{totalCount}</strong>
        </span>
      </div>
    </div>
  );
};

