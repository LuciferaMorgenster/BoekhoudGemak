import React from 'react';
import { Wifi, WifiOff, Eye, Type, AlertCircle } from 'lucide-react';
import { CompanySettings, Language } from '../types';
import { translations } from '../translations';

interface AccessibilityBarProps {
  isOffline: boolean;
  onToggleSimulateOffline: () => void;
  language: Language;
  settings: CompanySettings;
  onUpdateSettings: (s: CompanySettings) => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  isOffline,
  onToggleSimulateOffline,
  language,
  settings,
  onUpdateSettings,
}) => {
  const t = translations[language];

  const cycleFontSize = () => {
    const nextSize = 
      settings.fontSize === 'normal' ? 'large' : 
      settings.fontSize === 'large' ? 'extra-large' : 'normal';
    onUpdateSettings({ ...settings, fontSize: nextSize });
  };

  return (
    <>
      {/* Offline Alert Strip if offline */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t.offlineAlert}</span>
          </div>
          <button
            onClick={onToggleSimulateOffline}
            className="px-2 py-0.5 bg-slate-950 text-white rounded text-[11px] font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Verbinding Herstellen
          </button>
        </div>
      )}

      {/* Persistent Accessibility & Connection Utility Bar in desktop/footer */}
      <div className="hidden sm:flex items-center justify-between px-6 py-2 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <button
            onClick={onToggleSimulateOffline}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Klik om offline modus te testen"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-500 font-semibold">{t.offline} (Test Modus)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">{t.online} · Cloud Sync Actief</span>
              </>
            )}
          </button>

          <span>·</span>

          {/* Data Protection badge */}
          <span>AVG (GDPR) Versleuteld (AES-256)</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Font Size Adjuster */}
          <button
            onClick={cycleFontSize}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            title={t.fontSize}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Lettergrootte: <strong className="uppercase">{settings.fontSize}</strong></span>
          </button>

          <span>·</span>

          {/* High Contrast */}
          <button
            onClick={() => onUpdateSettings({ ...settings, highContrast: !settings.highContrast })}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hoog Contrast: {settings.highContrast ? 'Aan' : 'Uit'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
