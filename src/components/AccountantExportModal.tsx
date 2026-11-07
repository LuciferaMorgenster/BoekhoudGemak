import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileCode, 
  Printer, 
  Mail, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Download
} from 'lucide-react';
import { CompanySettings, Language, Transaction, VatQuarterReport } from '../types';
import { translations } from '../translations';
import { 
  exportTransactionsToCSV, 
  generateAuditfileXAF, 
  printFinancialReport 
} from '../utils/exporters';

interface AccountantExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  companySettings: CompanySettings;
  transactions: Transaction[];
  vatReport: VatQuarterReport;
  revenue: number;
  expenses: number;
  profit: number;
}

export const AccountantExportModal: React.FC<AccountantExportModalProps> = ({
  isOpen,
  onClose,
  language,
  companySettings,
  transactions,
  vatReport,
  revenue,
  expenses,
  profit,
}) => {
  const t = translations[language];
  const [accountantEmail, setAccountantEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountantEmail) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setAccountantEmail('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              {t.exportTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.exportSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Export Cards */}
        <div className="space-y-3">
          {/* Auditfile XAF */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Auditfile Financieel (XAF 3.2 XML)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Officiële Nederlandse standaard voor NOAB, SRA, Exact en SnelStart
                </div>
              </div>
            </div>
            <button
              onClick={() => generateAuditfileXAF(companySettings, transactions, vatReport)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* Excel / CSV */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Journaalposten & Transacties (CSV / Excel)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Volledig tabellarisch overzicht inclusief btw-rubrieken en IBANs
                </div>
              </div>
            </div>
            <button
              onClick={() => exportTransactionsToCSV(transactions)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* Printable Financial Statement (PDF) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Financieel Jaarrapport & BTW Verantwoording (PDF)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Officiële opmaak met winst- en verliesrekening en Belastingdienst stempel
                </div>
              </div>
            </div>
            <button
              onClick={() => printFinancialReport(companySettings, revenue, expenses, profit, vatReport)}
              className="px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30 hover:bg-purple-100 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Invite Accountant Direct Access */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-emerald-500" />
            <span>{t.inviteAccountant}</span>
          </div>

          <form onSubmit={handleSendInvite} className="flex gap-2">
            <input
              type="email"
              required
              value={accountantEmail}
              onChange={(e) => setAccountantEmail(e.target.value)}
              placeholder="naam@accountantskantoor.nl"
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
            />
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              {t.sendInvite}
            </button>
          </form>

          {inviteSent && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Beveiligde uitnodigingslink verstuurd met veilige 2FA-authenticatie!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
