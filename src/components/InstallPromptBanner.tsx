import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, ChevronLeft } from 'lucide-react';

interface Props {
  onOpenStoreModal: () => void;
  deferredPrompt?: any;
}

export const InstallPromptBanner: React.FC<Props> = ({ onOpenStoreModal, deferredPrompt }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('oculo_install_banner_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Check if already in standalone display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // Show after 3 seconds of usage on mobile/tablet or when install prompt exists
    const timer = setTimeout(() => {
      const isMobile = window.innerWidth < 768 || /iphone|ipad|ipod|android/.test(navigator.userAgent.toLowerCase());
      if (isMobile || deferredPrompt) {
        setIsVisible(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('oculo_install_banner_dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-editorial-fade font-editorial-sans print:hidden">
      <div className="bg-[#181816]/95 text-[#FBFBF9] backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-stone-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Smartphone className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-widest text-amber-300 font-bold">התקנה מהירה</span>
              <span className="text-[9px] text-stone-400">• Android & iOS</span>
            </div>
            <div className="font-serif text-sm font-medium text-white">
              התקן את OculoFlow בסמארטפון
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleDismiss();
              onOpenStoreModal();
            }}
            className="px-3.5 py-1.5 rounded-full bg-amber-300 text-stone-950 hover:bg-amber-200 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm shrink-0"
          >
            <span>התקן</span>
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors shrink-0"
            aria-label="סגור הודעה"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
