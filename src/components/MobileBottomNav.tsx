import React from 'react';
import { ActiveTab } from '../types';
import { Gamepad2, Activity, FileText, BookOpen, Download, Smartphone } from 'lucide-react';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenStoreModal: () => void;
  isInstallAvailable?: boolean;
}

export const MobileBottomNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenStoreModal,
  isInstallAvailable,
}) => {
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBFBF9]/95 backdrop-blur-md border-t border-stone-900/10 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg transition-all print:hidden"
      aria-label="ניווט מובייל ראשי"
    >
      {/* Training Tab */}
      <button
        onClick={() => onTabChange('training')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl transition-all active:scale-95 ${
          activeTab === 'training'
            ? 'text-stone-950 font-medium bg-stone-200/70'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Gamepad2 className={`w-5 h-5 ${activeTab === 'training' ? 'stroke-[2.2] text-stone-900' : 'stroke-[1.5]'}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-editorial-sans">אימון 3D</span>
      </button>

      {/* Protocol Tab */}
      <button
        onClick={() => onTabChange('protocol')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl transition-all active:scale-95 ${
          activeTab === 'protocol'
            ? 'text-stone-950 font-medium bg-stone-200/70'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Activity className={`w-5 h-5 ${activeTab === 'protocol' ? 'stroke-[2.2] text-stone-900' : 'stroke-[1.5]'}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-editorial-sans">פרוטוקול</span>
      </button>

      {/* Report Tab */}
      <button
        onClick={() => onTabChange('report')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl transition-all active:scale-95 ${
          activeTab === 'report'
            ? 'text-stone-950 font-medium bg-stone-200/70'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <FileText className={`w-5 h-5 ${activeTab === 'report' ? 'stroke-[2.2] text-stone-900' : 'stroke-[1.5]'}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-editorial-sans">דוח OKF</span>
      </button>

      {/* Research Tab */}
      <button
        onClick={() => onTabChange('research')}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl transition-all active:scale-95 ${
          activeTab === 'research'
            ? 'text-stone-950 font-medium bg-stone-200/70'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <BookOpen className={`w-5 h-5 ${activeTab === 'research' ? 'stroke-[2.2] text-stone-900' : 'stroke-[1.5]'}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-editorial-sans">מחקר</span>
      </button>

      {/* App Store & Installation Modal Trigger */}
      <button
        onClick={onOpenStoreModal}
        className="flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl text-amber-900 bg-amber-50/90 border border-amber-300/60 transition-all active:scale-95 relative shadow-xs"
      >
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <Smartphone className="w-5 h-5 stroke-[2] text-amber-900" />
        <span className="text-[10px] font-bold tracking-tight mt-0.5 font-editorial-sans">התקנה</span>
      </button>
    </nav>
  );
};
