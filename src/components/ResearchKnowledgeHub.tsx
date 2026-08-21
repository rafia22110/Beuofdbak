import React, { useState } from 'react';
import { BookOpen, Database, Brain, Cpu, ShieldAlert, Sparkles, ExternalLink, Network, Layers } from 'lucide-react';

export const ResearchKnowledgeHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'oculomics' | 'okf' | 'ecosystem' | 'closedloop'>('oculomics');

  return (
    <div className="w-full flex flex-col gap-6 font-editorial-sans text-stone-900">
      {/* Navigation Sub-Tabs */}
      <div className="w-full bg-white rounded-2xl border border-stone-900/10 p-2 flex flex-wrap gap-2 shadow-sm">
        <button
          onClick={() => setActiveSection('oculomics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
            activeSection === 'oculomics'
              ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Brain className="w-4 h-4 stroke-[1.5]" />
          <span>Oculomics & מדעי האישון מול EEG</span>
        </button>

        <button
          onClick={() => setActiveSection('okf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
            activeSection === 'okf'
              ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Network className="w-4 h-4 stroke-[1.5]" />
          <span>אנטולוגיית גרפים ו-Google OKF</span>
        </button>

        <button
          onClick={() => setActiveSection('closedloop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
            activeSection === 'closedloop'
              ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4 stroke-[1.5]" />
          <span>היררכיית תגמול בלופ סגור (Closed-Loop)</span>
        </button>

        <button
          onClick={() => setActiveSection('ecosystem')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
            activeSection === 'ecosystem'
              ? 'bg-stone-900 text-[#FBFBF9] border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-4 h-4 stroke-[1.5]" />
          <span>אקוסיסטם מחקר, שדרות & Akili</span>
        </button>
      </div>

      {/* Section 1: Oculomics vs EEG */}
      {activeSection === 'oculomics' && (
        <div className="flex flex-col gap-6 bg-white rounded-2xl border border-stone-900/10 p-7 shadow-sm">
          <div className="flex items-center gap-3.5 border-b border-stone-900/10 pb-4">
            <div className="w-10 h-10 rounded-full border border-stone-900/15 bg-[#F2F0EB] flex items-center justify-center text-stone-800 shadow-sm">
              <Brain className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-normal italic text-stone-900">
                פענוח תנודות אישון (Pupillometry) כתחליף ומשלים ל-EEG
              </h2>
              <p className="text-xs text-stone-600">
                העין היא שלוחה ישירה של מערכת העצבים המרכזית (CNS) ומערכת העצבים האוטונומית (ANS).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10">
              <h3 className="font-serif italic text-base text-stone-900 mb-2">1. קוטר אישון טוני (Tonic) מול פאזי (Phasic)</h3>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                קוטר האישון נשלט ע"י שני שרירים מנוגדים: שריר המרחיב (Dilator - סימפתטי) ושריר המכווץ (Sphincter - פאראסימפתטי).
                כאשר אדם נמצא בריכוז עמוק ועומס קוגניטיבי אופטימלי, האישון מתרחב במיקרונים בודדים באופן יציב. במצב עייפות ושיטוט מחשבות (Default Mode Network), מופיעים גלי תנודות איטיים (Pupillary Waves).
              </p>
            </div>

            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10">
              <h3 className="font-serif italic text-base text-stone-900 mb-2">2. מיקרו-סקאדות (Micro-Saccades) כאינדיקטור ל-ADHD</h3>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                מיקרו-תנועות חטופות של גלגל העין (קצב של מעל 40 בדקה) משקפות באופן ישיר פעילות מוגברת של תדרי Theta ב-EEG וחוסר יציבות של הקורטקס הפרונטלי.
                צמצום תדירות הסקאדות בעת משחק מעיד על שיפור ניכר בשליטה אימפולסיבית.
              </p>
            </div>
          </div>

          {/* Biomarker vs EEG Mapping Table */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-900/10 text-stone-500 font-editorial-sans uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">תדר EEG מקביל</th>
                  <th className="py-3 px-3">טווח (Hz)</th>
                  <th className="py-3 px-3">סמן אישון מקביל (Oculomic Biomarker)</th>
                  <th className="py-3 px-3">משמעות קלינית</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900/5">
                <tr>
                  <td className="py-3 px-3 font-serif italic text-stone-900 font-medium">Delta / Theta איטי</td>
                  <td className="py-3 px-3 font-mono text-stone-600">0.5 - 7 Hz</td>
                  <td className="py-3 px-3 text-stone-700">גלי תנודת אישון איטיים (Pupillary Waves 0.1-0.5Hz)</td>
                  <td className="py-3 px-3 text-stone-600">עייפות, חוסר ריכוז, חלום בהקיץ</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-serif italic text-stone-900 font-medium">Alpha רגוע</td>
                  <td className="py-3 px-3 font-mono text-stone-600">8 - 12 Hz</td>
                  <td className="py-3 px-3 text-stone-700">יציבות קיבוע גבוהה (Fixation &gt; 600ms)</td>
                  <td className="py-3 px-3 text-stone-600">רגיעה ערנית, שקט מנטלי, וויסות חרדה</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-serif italic text-stone-900 font-medium">SMR / Beta ממוקד</td>
                  <td className="py-3 px-3 font-mono text-stone-600">12 - 25 Hz</td>
                  <td className="py-3 px-3 text-stone-700">קוטר אישון טוני מוחזק + מיעוט סקאדות</td>
                  <td className="py-3 px-3 text-stone-600">פוקוס חד, עוררות משימתית (Flow State)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 2: OKF Graph Ontology */}
      {activeSection === 'okf' && (
        <div className="flex flex-col gap-6 bg-white rounded-2xl border border-stone-900/10 p-7 shadow-sm">
          <div className="flex items-center gap-3.5 border-b border-stone-900/10 pb-4">
            <div className="w-10 h-10 rounded-full border border-stone-900/15 bg-[#F2F0EB] flex items-center justify-center text-stone-800 shadow-sm">
              <Network className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-normal italic text-stone-900">
                אנטולוגיית גרפים ותקן Google OKF (Open Knowledge Format)
              </h2>
              <p className="text-xs text-stone-600">
                ייצוג נתונים היררכי המחבר בין מטופל, מדדים ביומטריים, תוצאות משחק ומאגרי מחקר רפואיים.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <span className="font-serif italic text-stone-900 text-sm">1. ישויות (Entities / Nodes)</span>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                הגדרת Patient, Session, ObservationState, BiomarkerMetric, ClinicalNormativeDataset.
              </p>
            </div>

            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <span className="font-serif italic text-stone-900 text-sm">2. יחסים (Edges / Properties)</span>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                קשרים כמו: demonstratesPupillaryStability, regulatesSympatheticState, matchedWithPubMedCohort.
              </p>
            </div>

            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <span className="font-serif italic text-stone-900 text-sm">3. פורמט JSON-LD תקני</span>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                תאימות מלאה ל-Schema.org ו-W3C Semantic Web, המאפשרת למנועי AI להסיק תובנות קליניות ללא הזיות.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Closed Loop Dynamic Feedback */}
      {activeSection === 'closedloop' && (
        <div className="flex flex-col gap-6 bg-white rounded-2xl border border-stone-900/10 p-7 shadow-sm">
          <div className="flex items-center gap-3.5 border-b border-stone-900/10 pb-4">
            <div className="w-10 h-10 rounded-full border border-stone-900/15 bg-[#F2F0EB] flex items-center justify-center text-stone-800 shadow-sm">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-normal italic text-stone-900">
                היררכיית התגמול הרב-שכבתית (Layered Dynamic Feedback)
              </h2>
              <p className="text-xs text-stone-600">
                איך לופ סגור מבוסס אישון מאלף את המוח ומייצר התניה אופרנטית (Operant Conditioning).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-serif italic text-stone-900 text-sm">שכבה 1: Micro-Feedback</span>
                <span className="text-[10px] text-stone-500 font-mono">&lt; 100ms</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                <strong>האצה וקצב:</strong> המרוץ מאיץ מיידית כשהאישון מראה פוקוס. נותן מענה לדחף המיידי של מוח עם ADHD.
              </p>
            </div>

            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-serif italic text-stone-900 text-sm">שכבה 2: Medium-Feedback</span>
                <span className="text-[10px] text-stone-500 font-mono">1 - 3 שניות</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                <strong>חדות וצלילות ויזואלית:</strong> הערפל נעלם, הקונטרסט עולה, תוך שמירה על בהירות קבועה כדי לא לעורר רפלקס אור.
              </p>
            </div>

            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-serif italic text-stone-900 text-sm">שכבה 3: Macro-Feedback</span>
                <span className="text-[10px] text-stone-500 font-mono">&gt; 20 שניות</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                <strong>בריאת עולם ויצירה:</strong> צמיחת גנים קסומים, מגדלי ניאון ועולמות חדשים המעוררים דופמין לאורך זמן.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Ecosystem & Benchmarks */}
      {activeSection === 'ecosystem' && (
        <div className="flex flex-col gap-6 bg-white rounded-2xl border border-stone-900/10 p-7 shadow-sm">
          <div className="flex items-center gap-3.5 border-b border-stone-900/10 pb-4">
            <div className="w-10 h-10 rounded-full border border-stone-900/15 bg-[#F2F0EB] flex items-center justify-center text-stone-800 shadow-sm">
              <Database className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-normal italic text-stone-900">
                אקוסיסטם המחקר: Akili, אקסלרטור שדרות ומאגר GazeBase
              </h2>
              <p className="text-xs text-stone-600">
                חיבור המיזם לתעשיית התרופות הדיגיטליות (DTx) והחוסן הלאומי בישראל ובעולם.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <span className="font-serif italic text-stone-900 text-sm">Akili Interactive (EndeavorRx)</span>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                המשחק הראשון שקיבל אישור FDA כתרופה ל-ADHD. הלקח העסקי: מעבר ממודל מרשמים מורכב למודל Wellness ישיר לצרכן.
              </p>
            </div>

            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <span className="font-serif italic text-stone-900 text-sm">אקסלרטור החוסן בשדרות & Living Lab</span>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                קידום טכנולוגיות טראומה וחוסן נפשי בישראל המנצלות חומרה זמינה וסנסורים פסיביים לטיפול נגיש.
              </p>
            </div>

            <div className="bg-[#FBFBF9] p-5 rounded-2xl border border-stone-900/10 flex flex-col gap-2">
              <span className="font-serif italic text-stone-900 text-sm">מאגר GazeBase 1000Hz</span>
              <p className="text-stone-700 leading-relaxed font-editorial-sans">
                מאגר המחקר האקדמי הגדול בעולם לקורלציות של תנועות עיניים, סקאדות ואישונים מול מדדי קשב.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
