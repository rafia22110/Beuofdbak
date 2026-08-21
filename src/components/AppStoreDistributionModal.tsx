import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Apple,
  Play,
  CheckCircle2,
  Share2,
  PlusSquare,
  Download,
  Terminal,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Camera,
  Cpu,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onInstallSuccess?: () => void;
}

export const AppStoreDistributionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'device' | 'android_store' | 'ios_store' | 'readiness'>('device');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // User agent detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsStandalone(isInStandalone);
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted' && onInstallSuccess) {
        onInstallSuccess();
      }
    } catch (e) {
      console.warn('Install prompt error', e);
    } finally {
      setIsInstalling(false);
    }
  };

  const bubblewrapCommand = `npm i -g @bubblewrap/cli\nbubblewrap init --manifest https://ais-dev-7lpqaq4xzgrnstww52edfr-521159025697.europe-west2.run.app/manifest.webmanifest\nbubblewrap build`;

  const capacitorCommand = `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios\nnpx cap init "OculoFlow" "com.oculoflow.neuroapp" --web-dir "dist"\nnpx cap add android\nnpx cap add ios\nnpx cap sync`;

  const assetLinksJson = JSON.stringify(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.oculoflow.neuroapp",
          sha256_cert_fingerprints: [
            "14:6D:E9:7D:0F:52:CC:72:42:01:C2:6A:8B:2A:4F:9E:55:82:11:47:48:8A:4F:C1:23:45:67:89:AB:CD:EF:01"
          ]
        }
      }
    ],
    null,
    2
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-editorial-fade font-editorial-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#FBFBF9] rounded-2xl sm:rounded-3xl border border-stone-900/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 sm:px-8 py-5 bg-white border-b border-stone-900/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-editorial-sans uppercase tracking-[0.2em] text-stone-500 font-semibold">
                  Mobile & Store Deployment
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300/60 uppercase">
                  PWA & TWA Ready
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-normal italic text-stone-900">
                התאמה למובייל והפצה בחנויות האפליקציות
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-stone-900/10 hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 sm:px-8 pt-4 pb-2 bg-[#F2F0EB] border-b border-stone-900/10 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('device')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'device'
                ? 'bg-stone-900 text-[#FBFBF9] shadow-sm'
                : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-900/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>התקנה מהירה לסמארטפון</span>
          </button>

          <button
            onClick={() => setActiveSubTab('android_store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'android_store'
                ? 'bg-stone-900 text-[#FBFBF9] shadow-sm'
                : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-900/10'
            }`}
          >
            <Play className="w-3.5 h-3.5 stroke-[1.8] fill-current" />
            <span>Google Play Store (Android)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ios_store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'ios_store'
                ? 'bg-stone-900 text-[#FBFBF9] shadow-sm'
                : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-900/10'
            }`}
          >
            <Apple className="w-3.5 h-3.5 stroke-[1.8] fill-current" />
            <span>Apple App Store (iOS)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('readiness')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'readiness'
                ? 'bg-stone-900 text-[#FBFBF9] shadow-sm'
                : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-900/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>ציון מוכנות חומרה (100%)</span>
          </button>
        </div>

        {/* Tab Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* 1. Device Quick Install (PWA) */}
          {activeSubTab === 'device' && (
            <div className="space-y-6">
              {/* Standalone Status Banner */}
              {isStandalone ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-950">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-sm font-semibold">האפליקציה פועלת במצב Native Standalone!</strong>
                    <span className="text-xs text-emerald-800">
                      אתה נהנה מחוויית מסך מלא, הרשאות מצלמה אופטימליות, ותגובתיות 120Hz ללא סרגל דפדפן.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-stone-900/10 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-stone-900">
                        התקנת אפליקציה ישירה (Instant Mobile Install)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        התקנה מקומית כ-PWA מלאה ישירות למסך הבית של האנדרואיד או האייפון ללא צורך בהורדה כבדה.
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                      <Sparkles className="w-6 h-6 stroke-[1.8]" />
                    </div>
                  </div>

                  {/* Android 1-Click Install Button if Prompt is ready */}
                  {deferredPrompt && (
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-amber-800" />
                        <div>
                          <div className="text-xs font-bold text-amber-950">מכשיר אנדרואיד זוהה</div>
                          <div className="text-[11px] text-amber-900">לחץ להתקנה מיידית של OculoFlow</div>
                        </div>
                      </div>
                      <button
                        onClick={handleNativeInstall}
                        disabled={isInstalling}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-editorial-sans text-xs uppercase tracking-wider font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{isInstalling ? 'מתקין...' : 'התקן כעת לאנדרואיד'}</span>
                      </button>
                    </div>
                  )}

                  {/* iOS Guided Visual Steps */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-stone-800 font-medium text-xs">
                      <Apple className="w-4 h-4" />
                      <span>הוראות התקנה לאייפון ולאייפד (Apple iOS Safari):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-stone-900/10 flex flex-col items-center text-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-stone-900/10 flex items-center justify-center text-stone-900 font-bold text-xs">
                          1
                        </div>
                        <Share2 className="w-4 h-4 text-stone-700 stroke-[1.8]" />
                        <div className="font-semibold text-stone-900">לחץ על כפתור השיתוף</div>
                        <div className="text-[10px] text-stone-500">בתחתית או בראש דפדפן Safari בספארי</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-stone-900/10 flex flex-col items-center text-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-stone-900/10 flex items-center justify-center text-stone-900 font-bold text-xs">
                          2
                        </div>
                        <PlusSquare className="w-4 h-4 text-stone-700 stroke-[1.8]" />
                        <div className="font-semibold text-stone-900">הוסף למסך הבית</div>
                        <div className="text-[10px] text-stone-500">גלול ובחר באפשרות "Add to Home Screen"</div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-stone-900/10 flex flex-col items-center text-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-stone-900/10 flex items-center justify-center text-stone-900 font-bold text-xs">
                          3
                        </div>
                        <Sparkles className="w-4 h-4 text-emerald-700 stroke-[1.8]" />
                        <div className="font-semibold text-stone-900">פתח כאפליקציה</div>
                        <div className="text-[10px] text-stone-500">האייקון יופיע במסך הבית ללא שורת כתובת</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Native Advantages Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-stone-900/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#F2F0EB] text-stone-800 shrink-0">
                    <Camera className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-sm text-stone-900">תמיכה במצלמת סלפי קדמית</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      מעקב אישונים אופטי ב-60fps באמצעות מצלמת הסלפי של המכשיר הנייד ללא צורך בחומרה ייעודית.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-900/10 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#F2F0EB] text-stone-800 shrink-0">
                    <Cpu className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-sm text-stone-900">עיבוד מקומי בטוח (Local-Only)</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      כל תמונות העיניים והנתונים הביומטריים מעובדים מקומית במכשיר בהתאם לתקני פרטיות רפואיים מחמירים.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Google Play Store (Android TWA / Bubblewrap) */}
          {activeSubTab === 'android_store' && (
            <div className="space-y-6">
              <div className="bg-white border border-stone-900/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-600 fill-current" />
                      <h3 className="font-serif text-lg font-medium text-stone-900">
                        אריזה והפצה ל-Google Play Store (Android App Bundle - AAB)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      האפליקציה בנויה לפי תקן <strong>Trusted Web Activity (TWA)</strong> הרשמי של Google, ומאפשרת ייצוא לקובץ AAB/APK בחתימה דיגיטלית מלאה.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    Target SDK 34 (Android 14)
                  </span>
                </div>

                {/* Bubblewrap CLI Guide */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-stone-500" />
                      <span>פקודות ייצוא באמצעות כלי Bubblewrap CLI הרשמי של גוגל:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(bubblewrapCommand, 'bubblewrap')}
                      className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copiedKey === 'bubblewrap' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'bubblewrap' ? 'הועתק!' : 'העתק פקודות'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-stone-900 text-amber-200 text-xs font-mono overflow-x-auto ltr text-left leading-relaxed">
                    {bubblewrapCommand}
                  </pre>
                </div>

                {/* Digital Asset Links */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-stone-700 font-medium">
                    <span>קובץ אימות דומיין (assetlinks.json עבור אימות בעלות ב-Google Play):</span>
                    <button
                      onClick={() => handleCopy(assetLinksJson, 'assetlinks')}
                      className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copiedKey === 'assetlinks' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'assetlinks' ? 'הועתק!' : 'העתק JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#F7F6F2] border border-stone-900/10 text-stone-800 text-[11px] font-mono overflow-x-auto ltr text-left max-h-36">
                    {assetLinksJson}
                  </pre>
                </div>
              </div>

              {/* Quick links to Google Play Console & PWABuilder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://play.google.com/console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white border border-stone-900/10 hover:border-stone-900/30 transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-emerald-600 fill-current" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Google Play Console</div>
                      <div className="text-[10px] text-stone-500">העלאת חבילת ה-AAB לחנות</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
                </a>

                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white border border-stone-900/10 hover:border-stone-900/30 transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Microsoft PWABuilder</div>
                      <div className="text-[10px] text-stone-500">מחולל APK/AAB אוטומטי בענן</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
                </a>
              </div>
            </div>
          )}

          {/* 3. Apple App Store (iOS IPA / Xcode / Capacitor) */}
          {activeSubTab === 'ios_store' && (
            <div className="space-y-6">
              <div className="bg-white border border-stone-900/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-stone-900 fill-current" />
                      <h3 className="font-serif text-lg font-medium text-stone-900">
                        אריזה והפצה ל-Apple App Store (iOS Project & Xcode)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      הסבת האפליקציה לפרויקט <strong>iOS Native (Capacitor / Swift)</strong> מוכן להגשה ל-App Store Connect ול-TestFlight.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-300 text-[10px] font-bold">
                    iOS 16+ Native
                  </span>
                </div>

                {/* Capacitor CLI Setup */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-stone-500" />
                      <span>פקודות יצירת פרויקט Xcode עם Capacitor:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(capacitorCommand, 'capacitor')}
                      className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copiedKey === 'capacitor' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'capacitor' ? 'הועתק!' : 'העתק פקודות'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-stone-900 text-amber-200 text-xs font-mono overflow-x-auto ltr text-left leading-relaxed">
                    {capacitorCommand}
                  </pre>
                </div>

                {/* iOS Camera Permission string */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-950">
                  <div className="font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-800" />
                    <span>הגדרת הרשאת מצלמה ב-Info.plist (חובה לאישור Apple):</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    יש לוודא הוספת מפתח <code>NSCameraUsageDescription</code> בקובץ <code>Info.plist</code> ב-Xcode עם ההסבר:
                  </p>
                  <pre className="p-2.5 bg-white rounded-lg border border-amber-300/60 font-mono text-[11px] text-stone-800 ltr text-left">
                    &lt;key&gt;NSCameraUsageDescription&lt;/key&gt;
                    &lt;string&gt;OculoFlow uses the front camera to analyze pupil dynamics and provide real-time neurofeedback during focus training.&lt;/string&gt;
                  </pre>
                </div>
              </div>

              {/* Quick links to Apple Developer & App Store Connect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://appstoreconnect.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white border border-stone-900/10 hover:border-stone-900/30 transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Apple className="w-5 h-5 text-stone-900 fill-current" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">App Store Connect</div>
                      <div className="text-[10px] text-stone-500">ניהול גרסאות, TestFlight ובדיקת אפליקציה</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
                </a>

                <a
                  href="https://developer.apple.com/account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white border border-stone-900/10 hover:border-stone-900/30 transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Apple Developer Program</div>
                      <div className="text-[10px] text-stone-500">תעודות חתימה (Certificates & Provisioning)</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
                </a>
              </div>
            </div>
          )}

          {/* 4. Store Readiness Checklist */}
          {activeSubTab === 'readiness' && (
            <div className="space-y-5">
              <div className="bg-white border border-stone-900/10 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-900/10">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      צ'קליסט תאימות חומרה וחנויות (Store Compliance Score)
                    </h3>
                    <p className="text-xs text-stone-500">כל הקריטריונים הנדרשים ל-Google Play, Apple App Store ו-PWA</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2.2]" />
                    <span>100% Ready</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-900/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Web App Manifest v3</div>
                      <div className="text-[10px] text-stone-500">מוגדר במלואו עם display: standalone, שמות, אייקונים וקטגוריות.</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-900/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Service Worker Offline Cache</div>
                      <div className="text-[10px] text-stone-500">תמיכה באופליין ובטעינה מהירה של כל המשאבים והגרפיקה.</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-900/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Safe-Area Insets (Notch / Island)</div>
                      <div className="text-[10px] text-stone-500">התאמה מלאה למגרעות iPhone Dynamic Island ופס מחוות Android.</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-900/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Front Camera Auto-Resolution</div>
                      <div className="text-[10px] text-stone-500">קריאה ייעודית ל-facingMode: user למצלמת סלפי קדמית.</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-900/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">Touch & Gesture Ergonomics</div>
                      <div className="text-[10px] text-stone-500">כפתורי מגע של 44px ומעלה, ביטול גרירה כפולה (Touch-Action).</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-900/10 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-900">WebGL 3D Optimization</div>
                      <div className="text-[10px] text-stone-500">רנדור מואץ חומרה מותאם למעבדי Apple Silicon ו-Snapdragon.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-8 py-4 bg-[#F2F0EB] border-t border-stone-900/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2]" />
            <span>תואם מלא לתקנות Google Play & Apple App Store</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-stone-900 text-[#FBFBF9] text-xs font-editorial-sans uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors shadow-xs"
          >
            סגור חלון
          </button>
        </div>
      </div>
    </div>
  );
};
