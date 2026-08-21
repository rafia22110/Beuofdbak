import React from 'react';
import { ActiveTab } from '../types';
import { Eye, Gamepad2, Activity, FileText, BookOpen, Smartphone } from 'lucide-react';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCameraActive: boolean;
  focusScore: number;
  onOpenStoreModal?: () => void;
}

export const Header: React.FC<Props> = ({ activeTab, onTabChange, isCameraActive, focusScore, onOpenStoreModal }) => {
  return (
    <header className="w-full bg-[#FBFBF9] border-b border-stone-900/10 sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition-all print:hidden pt-[max(0.875rem,env(safe-area-inset-top))]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        {/* Editorial Masthead & Branding */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-stone-900/20 bg-[#F2F0EB] flex items-center justify-center text-stone-900 shadow-sm shrink-0">
              <Eye className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="font-editorial-sans text-[8.5px] sm:text-[9px] uppercase tracking-[0.25em] text-stone-900/50 font-medium">
                  Volume 26 — Medical Oculomics
                </span>
                <span className="hidden sm:inline-block h-2.5 w-[1px] bg-stone-900/15" />
                <span className="hidden sm:inline-block font-editorial-sans text-[9px] uppercase tracking-[0.2em] text-stone-900/60">
                  Google OKF Verified
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-normal italic tracking-tighter text-stone-900">
                  OculoFlow<span className="text-stone-400 not-italic font-light">.</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full border border-stone-900/15 bg-white text-[9px] sm:text-[10px] font-editorial-sans uppercase tracking-wider text-stone-700">
                  Closed-Loop Neurofeedback
                </span>
              </div>
            </div>
          </div>

          {/* Quick Mobile Store Trigger for smaller screens */}
          {onOpenStoreModal && (
            <button
              onClick={onOpenStoreModal}
              className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-900 text-white text-[11px] font-editorial-sans font-medium uppercase shadow-xs active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>התקנה</span>
            </button>
          )}
        </div>

        {/* Editorial Navigation Tabs & Mobile Store Action */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-[#F2F0EB] border border-stone-900/10 text-xs font-editorial-sans">
            <button
              onClick={() => onTabChange('training')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all ${
                activeTab === 'training'
                  ? 'bg-stone-900 text-[#FBFBF9] font-medium shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>אימון גיימינג</span>
            </button>

            <button
              onClick={() => onTabChange('protocol')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all ${
                activeTab === 'protocol'
                  ? 'bg-stone-900 text-[#FBFBF9] font-medium shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>פרוטוקול 3-Way</span>
            </button>

            <button
              onClick={() => onTabChange('report')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all ${
                activeTab === 'report'
                  ? 'bg-stone-900 text-[#FBFBF9] font-medium shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>דוח השוואתי & OKF</span>
            </button>

            <button
              onClick={() => onTabChange('research')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all ${
                activeTab === 'research'
                  ? 'bg-stone-900 text-[#FBFBF9] font-medium shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>מחקר ומדע</span>
            </button>
          </nav>

          {/* App Store & Mobile Install Pill */}
          {onOpenStoreModal && (
            <button
              onClick={onOpenStoreModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-900/15 bg-white hover:bg-stone-100 text-stone-800 text-xs font-editorial-sans uppercase tracking-wider transition-all shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-stone-700 stroke-[1.8]" />
              <span>הפצה לחנויות / מובייל</span>
            </button>
          )}

          {/* Biometric Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-900/15 bg-white text-xs font-editorial-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-stone-500">מדד עוררות:</span>
            <strong className="font-serif italic text-stone-900 text-sm">{focusScore}%</strong>
          </div>
        </div>
      </div>
    </header>
  );
};

