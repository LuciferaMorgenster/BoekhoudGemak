import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  Trash2, 
  FileText, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { exportFullBackup, wipeAllLocalData } from '../utils/storage';

interface GdprModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onDataWiped: () => void;
}

export const GdprModal: React.FC<GdprModalProps> = ({
  isOpen,
  onClose,
  language,
  onDataWiped,
}) => {
  const t = translations[language];
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);

  if (!isOpen) return null;

  const handleWipe = () => {
    wipeAllLocalData();
    setShowConfirmWipe(false);
    onDataWiped();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              {t.gdprTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.gdprSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AVG Guarantees */}
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                {t.dataProcessingAgreement}
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                Dataopslag conform EU Data Protection Regulation (EU) 2016/679. Servers in EU.
              </div>
            </div>
          </div>

          {/* Right to Access / Portability */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                {t.rightToAccess}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Download een gestructureerd machine-leesbaar archief van al uw data
              </div>
            </div>
            <button
              onClick={exportFullBackup}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Right to be forgotten */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                {t.rightToBeForgotten}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Wis alle lokale records, gecachte facturen en cookies permanent
              </div>
            </div>
            <button
              onClick={() => setShowConfirmWipe(true)}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-500/30 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Gegevens Wissen</span>
            </button>
          </div>
        </div>

        {/* Confirmation prompt */}
        {showConfirmWipe && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-500/40 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Weet u zeker dat u alle gegevens wilt wissen?</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Dit verwijdert alle lokale data en zet de administratie terug naar de fabrieksinstellingen. Zorg dat u eerst een export downloadt!
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmWipe(false)}
                className="px-3 py-1 text-xs text-slate-600 dark:text-slate-300"
              >
                Annuleren
              </button>
              <button
                onClick={handleWipe}
                className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-xs"
              >
                Ja, Alles Permanent Wissen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
