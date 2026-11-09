import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  language?: Language;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language = 'nl',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone as an installed app, hide install trigger
  if (isInstalled) {
    return null;
  }

  const isNl = language === 'nl';
  const label = isNl ? 'Installeer App' : 'Install App';
  const iosLabel = isNl ? 'Zet op Beginscherm' : 'Add to Home';

  // Standard Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        title={label}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
          compact
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
            : 'text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 shadow-xs'
        }`}
      >
        <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{label}</span>
      </button>
    );
  }

  // iOS Safari flow (since Apple WebKit does not emit beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title={iosLabel}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            compact
              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
              : 'text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 shadow-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{iosLabel}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isNl ? 'Installeer op iPhone / iPad' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Stap 1:</strong> Tik op de <strong>Deel-knop</strong> onderaan in Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Stap 2:</strong> Scroll omlaag en tik op <strong>Zet op beginscherm</strong>.
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  {isNl
                    ? 'BoekhoudGemak werkt direct als zelfstandige app met offline ondersteuning en camera scanfunctie!'
                    : 'BoekhoudGemak operates as a standalone app with offline support and camera scanning!'}
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white transition-colors"
              >
                {isNl ? 'Begrepen' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't emit install prompt or when testing on desktop
  return (
    <button
      onClick={() => setShowIOSGuide(true)}
      title={label}
      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
        compact
          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
          : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
      }`}
    >
      <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>{label}</span>
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isNl ? 'Installeer BoekhoudGemak' : 'Install BoekhoudGemak'}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIOSGuide(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                {isNl
                  ? 'U kunt BoekhoudGemak installeren als native app op Chrome, Edge, Safari of Android.'
                  : 'You can install BoekhoudGemak as a native app on Chrome, Edge, Safari or Android.'}
              </p>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1 text-[11px]">
                <div>• <strong>Chrome / Edge (Desktop)</strong>: Klik op het installatie-icoon in de adresbalk.</div>
                <div>• <strong>Android</strong>: Tik op het menu (⋮) en kies 'App installeren'.</div>
                <div>• <strong>iPhone / iPad</strong>: Tik op 'Deel' en kies 'Zet op beginscherm'.</div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowIOSGuide(false);
              }}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white transition-colors"
            >
              {isNl ? 'Sluiten' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </button>
  );
};
