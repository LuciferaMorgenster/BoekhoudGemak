import React from 'react';
import { LayoutDashboard, FileText, ScanLine, Landmark, Calculator, MoreHorizontal } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  language: Language;
  onOpenScanModal: () => void;
  onOpenMoreMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  setCurrentView,
  language,
  onOpenScanModal,
  onOpenMoreMenu,
}) => {
  const t = translations[language];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors">
      <div className="grid grid-cols-5 h-14 items-center px-1">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors ${
            currentView === 'dashboard'
              ? 'text-emerald-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="truncate max-w-[56px]">{t.navDashboard}</span>
        </button>

        <button
          onClick={() => setCurrentView('invoices')}
          className={`flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors ${
            currentView === 'invoices'
              ? 'text-emerald-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="truncate max-w-[56px]">{t.navInvoices}</span>
        </button>

        {/* Center Scan CTA Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenScanModal}
            className="w-10 h-10 -mt-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            aria-label={t.navScan}
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentView('banking')}
          className={`flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors ${
            currentView === 'banking'
              ? 'text-emerald-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span className="truncate max-w-[56px]">{t.navBanking}</span>
        </button>

        <button
          onClick={() => setCurrentView('tax')}
          className={`flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors ${
            currentView === 'tax'
              ? 'text-emerald-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span className="truncate max-w-[56px]">{t.navTax}</span>
        </button>
      </div>
    </nav>
  );
};
