import React from 'react';
import { 
  Bell, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Cloud, 
  FileSpreadsheet, 
  Lock, 
  Eye, 
  ScanLine,
  SlidersHorizontal
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  highContrast: boolean;
  setHighContrast: (hc: boolean) => void;
  unreadCount: number;
  onOpenScanModal: () => void;
  onOpenNotifications: () => void;
  onOpenExportModal: () => void;
  onOpenBackupModal: () => void;
  onOpenSecurityModal: () => void;
  onOpenGdprModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  isDarkMode,
  setIsDarkMode,
  highContrast,
  setHighContrast,
  unreadCount,
  onOpenScanModal,
  onOpenNotifications,
  onOpenExportModal,
  onOpenBackupModal,
  onOpenSecurityModal,
  onOpenGdprModal,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-left group flex items-center gap-2.5 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-emerald-500 transition-colors">
            B
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Boekhoud<span className="text-emerald-500">Gemak</span>
          </span>
        </button>
      </div>

      {/* Zone 2: 4–5 single-line clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white py-1 relative ${
            currentView === 'dashboard' 
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500' 
              : ''
          }`}
        >
          {t.navDashboard}
        </button>

        <button
          onClick={() => setCurrentView('invoices')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white py-1 relative ${
            currentView === 'invoices' 
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500' 
              : ''
          }`}
        >
          {t.navInvoices}
        </button>

        <button
          onClick={() => setCurrentView('banking')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white py-1 relative ${
            currentView === 'banking' 
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500' 
              : ''
          }`}
        >
          {t.navBanking}
        </button>

        <button
          onClick={() => setCurrentView('tax')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white py-1 relative ${
            currentView === 'tax' 
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500' 
              : ''
          }`}
        >
          {t.navTax}
        </button>
      </nav>

      {/* Zone 3: 1 primary action + utility buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language switcher */}
        <button
          onClick={() => setLanguage(language === 'nl' ? 'en' : 'nl')}
          title="Taal wisselen / Switch Language"
          className="px-2 py-1 text-xs font-semibold rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase"
        >
          {language}
        </button>

        {/* High contrast toggle */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          title={t.highContrast}
          className={`p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            highContrast ? 'text-emerald-500 ring-1 ring-emerald-500' : ''
          }`}
          aria-label={t.highContrast}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={t.toggleTheme}
          className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={t.toggleTheme}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          title={t.notifications}
          className="relative p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={t.notifications}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          )}
        </button>

        {/* Secondary utility dropdown / buttons for desktop */}
        <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
          <button
            onClick={onOpenExportModal}
            title={t.exportAccountant}
            className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenBackupModal}
            title={t.cloudBackup}
            className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Cloud className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSecurityModal}
            title={t.security2FA}
            className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenGdprModal}
            title={t.gdprAvg}
            className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>

        {/* In-App PWA Install Button */}
        <PWAInstallButton language={language} compact />

        {/* Primary CTA Button: Scan Bon */}
        <button
          onClick={onOpenScanModal}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <ScanLine className="w-4 h-4" />
          <span>{t.navScan}</span>
        </button>
      </div>
    </header>
  );
};
