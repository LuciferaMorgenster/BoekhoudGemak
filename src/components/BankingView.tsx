import React, { useState } from 'react';
import { 
  Landmark, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Check, 
  Upload, 
  Download,
  Plus,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { BankAccount, Language, Transaction } from '../types';
import { translations } from '../translations';
import { exportTransactionsToCSV } from '../utils/exporters';

interface BankingViewProps {
  language: Language;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  onSyncBanks: () => void;
  isSyncing: boolean;
  onOpenScanModal: () => void;
  onAddTransaction: (tx: Transaction) => void;
}

export const BankingView: React.FC<BankingViewProps> = ({
  language,
  bankAccounts,
  transactions,
  onSyncBanks,
  isSyncing,
  onOpenScanModal,
  onAddTransaction,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'review'>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const filteredTransactions = transactions.filter(t => {
    // Search query matching
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      t.description.toLowerCase().includes(query) ||
      t.counterparty.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.amount.toString().includes(query);

    if (!matchesQuery) return false;

    if (filterType === 'income') return t.type === 'income';
    if (filterType === 'expense') return t.type === 'expense';
    if (filterType === 'review') return t.status === 'review' || t.isAnomaly;
    return true;
  });

  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  const handleSimulateBankImport = () => {
    setImportSuccess(true);
    // Add 2 mock imported bank transactions
    const newTx1: Transaction = {
      id: `tx-${Date.now()}-1`,
      date: new Date().toISOString().split('T')[0],
      counterparty: 'Ziggo Zakelijk Internet',
      description: 'Maandelijkse abonnementskosten Zakelijk Alles-in-1',
      amount: 68.50,
      type: 'expense',
      category: 'Telefoon & Internet',
      vatRate: 21,
      vatAmount: 11.89,
      vatCategory: 'voorbelasting',
      isDeductibleIB: true,
      deductiblePercentage: 100,
      status: 'matched',
      syncedWithBank: true,
      bankName: 'ING Zakelijk',
    };
    const newTx2: Transaction = {
      id: `tx-${Date.now()}-2`,
      date: new Date().toISOString().split('T')[0],
      counterparty: 'Gemeente Amsterdam',
      description: 'Parkeerkosten zakelijke afspraak centrum',
      amount: 19.50,
      type: 'expense',
      category: 'Brandstof & Vervoer',
      vatRate: 21,
      vatAmount: 3.38,
      vatCategory: 'voorbelasting',
      isDeductibleIB: true,
      deductiblePercentage: 100,
      status: 'matched',
      syncedWithBank: true,
      bankName: 'ING Zakelijk',
    };
    onAddTransaction(newTx1);
    onAddTransaction(newTx2);

    setTimeout(() => {
      setShowImportModal(false);
      setImportSuccess(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Title & PSD2 Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-500" />
            {t.bankingTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.bankingSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.importCamt}</span>
          </button>

          <button
            onClick={onSyncBanks}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchroniseren...' : t.syncAllBanks}</span>
          </button>
        </div>
      </div>

      {/* Connected Bank Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bankAccounts.map(account => (
          <div
            key={account.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl" role="img" aria-label={account.bankName}>
                  {account.bankLogo}
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {account.bankName}
                </span>
              </div>
              <span className="text-[10px] text-emerald-500 font-medium">
                {t.connected}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {account.iban}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.balance}
              </span>
              <span className={`text-sm font-bold tabular-nums ${
                account.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'
              }`}>
                € {account.balance.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Anomaly Detection Banner if present */}
      {transactions.some(t => t.isAnomaly) && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              {t.anomalyAlert}:
            </span>{' '}
            <span className="text-amber-700 dark:text-amber-400">
              Er zijn 2 transacties gemarkeerd door het Machine Learning model die extra controle vereisen (investering &gt; €450 of onbekende merchant).
            </span>
          </div>
        </div>
      )}

      {/* Transaction Feed Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.transactionFeed}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automatisch gecategoriseerd via Machine Learning met Nederlandse belastingregels
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTransactionsToCSV(transactions)}
              className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchTransactions}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Segmented Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'income'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filterIncome}
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filterExpense}
            </button>
            <button
              onClick={() => setFilterType('review')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'review'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filterUnmatched}
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Datum</th>
                <th className="py-2.5 px-3 font-semibold">Tegenpartij & Omschrijving</th>
                <th className="py-2.5 px-3 font-semibold">Categorie (ML)</th>
                <th className="py-2.5 px-3 font-semibold">BTW Tarief</th>
                <th className="py-2.5 px-3 font-semibold text-right">Bedrag</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {tx.isAnomaly && (
                        <span title={tx.anomalyReason}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        </span>
                      )}
                      <span>{tx.counterparty}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {tx.description}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 tabular-nums text-slate-600 dark:text-slate-400">
                    {tx.vatRate}% (€ {tx.vatAmount.toFixed(2)})
                  </td>
                  <td className={`py-3 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} € {tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {tx.status === 'matched' ? (
                      <span className="text-[11px] text-emerald-500 font-medium inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t.matched}
                      </span>
                    ) : (
                      <button
                        onClick={onOpenScanModal}
                        className="text-[11px] font-medium text-amber-500 hover:underline"
                      >
                        Koppel Bon &rarr;
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAMT.053 / MT940 / CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.importCamt}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload bankafschriften direct van ING, Rabobank, ABN AMRO, Bunq of Knab in CAMT.053 XML of MT940 formaat.
            </p>

            <div 
              onClick={() => setImportFileName('ING_CAMT053_20260414.xml')}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {importFileName ? `Geselecteerd: ${importFileName}` : 'Klik om voorbeeldbestand te laden'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                CAMT.053, MT940, CSV tot 10MB
              </div>
            </div>

            {importSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>2 mutaties succesvol geïmporteerd en gecategoriseerd!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSimulateBankImport}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
              >
                Bestand Verwerken
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
