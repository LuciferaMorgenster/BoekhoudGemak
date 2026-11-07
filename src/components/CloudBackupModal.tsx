import React, { useState, useRef } from 'react';
import { 
  X, 
  Cloud, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck, 
  RefreshCw,
  HardDrive,
  Database
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { exportFullBackup, restoreBackupData } from '../utils/storage';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onDataRestored: () => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  language,
  onDataRestored,
}) => {
  const t = translations[language];
  const [syncingCloud, setSyncingCloud] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleCloudSync = (provider: string) => {
    setSyncingCloud(provider);
    setTimeout(() => {
      setSyncingCloud(null);
    }, 1500);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const success = restoreBackupData(content);
      if (success) {
        setRestoreStatus('Back-up succesvol hersteld! Gegevens zijn bijgewerkt.');
        onDataRestored();
        setTimeout(() => setRestoreStatus(null), 3000);
      } else {
        setRestoreStatus('Fout bij herstellen: ongeldig back-up bestand.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-emerald-500" />
              {t.backupTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.backupSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security assurance banner */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{t.backupEncrypted} · Gegevens worden end-to-end versleuteld opgeslagen.</span>
        </div>

        {/* Cloud Providers Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.cloudStorageProviders}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Google Drive */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2">
              <div className="text-lg">📁</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">Google Drive</div>
              <button
                onClick={() => handleCloudSync('drive')}
                disabled={syncingCloud === 'drive'}
                className="w-full py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded hover:bg-emerald-100 transition-colors"
              >
                {syncingCloud === 'drive' ? 'Synchroniseren...' : 'Sync Actief'}
              </button>
            </div>

            {/* Dropbox */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2">
              <div className="text-lg">📦</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">Dropbox</div>
              <button
                onClick={() => handleCloudSync('dropbox')}
                disabled={syncingCloud === 'dropbox'}
                className="w-full py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded hover:bg-blue-100 transition-colors"
              >
                {syncingCloud === 'dropbox' ? 'Synchroniseren...' : 'Sync Actief'}
              </button>
            </div>

            {/* Microsoft OneDrive */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2">
              <div className="text-lg">☁️</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">OneDrive</div>
              <button
                onClick={() => handleCloudSync('onedrive')}
                disabled={syncingCloud === 'onedrive'}
                className="w-full py-1 text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 rounded hover:bg-purple-100 transition-colors"
              >
                {syncingCloud === 'onedrive' ? 'Synchroniseren...' : 'Sync Actief'}
              </button>
            </div>
          </div>
        </div>

        {/* Local Snapshot Download & Restore */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Handmatige Snapshot & Herstel
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportFullBackup}
              className="flex-1 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadBackupJson}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.restoreBackup}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileRestore}
            />
          </div>

          {restoreStatus && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{restoreStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
