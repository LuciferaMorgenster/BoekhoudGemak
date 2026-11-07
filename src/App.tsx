import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { InvoicesView } from './components/InvoicesView';
import { BankingView } from './components/BankingView';
import { TaxView } from './components/TaxView';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { AccountantExportModal } from './components/AccountantExportModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { TwoFactorModal } from './components/TwoFactorModal';
import { GdprModal } from './components/GdprModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AccessibilityBar } from './components/AccessibilityBar';

import { 
  BankAccount, 
  BudgetLimit, 
  CompanySettings, 
  EntrepreneurTask, 
  Invoice, 
  Language, 
  NotificationItem, 
  Transaction, 
  VatQuarterReport 
} from './types';

import {
  loadSettings,
  saveSettings,
  loadTransactions,
  saveTransactions,
  loadInvoices,
  saveInvoices,
  loadBankAccounts,
  saveBankAccounts,
  loadBudgets,
  saveBudgets,
  loadVatReports,
  saveVatReports,
  loadNotifications,
  saveNotifications,
  loadTasks,
  saveTasks,
} from './utils/storage';

export default function App() {
  // App navigation state
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices' | 'banking' | 'tax'>('dashboard');
  const [language, setLanguage] = useState<Language>('nl');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncingBanks, setIsSyncingBanks] = useState<boolean>(false);

  // Persistent Domain State
  const [settings, setSettings] = useState<CompanySettings>(() => loadSettings());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadBankAccounts());
  const [budgets, setBudgets] = useState<BudgetLimit[]>(() => loadBudgets());
  const [vatReports, setVatReports] = useState<VatQuarterReport[]>(() => loadVatReports());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadNotifications());
  const [tasks, setTasks] = useState<EntrepreneurTask[]>(() => loadTasks());

  // Modal Dialogs State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Network offline detector
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to storage
  const handleUpdateSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);

    // Update active VAT report if expense has vat
    if (newTx.vatAmount > 0) {
      const q2 = vatReports.find(r => r.quarter === 2);
      if (q2) {
        const updatedQ2: VatQuarterReport = {
          ...q2,
          r5b_voorbelasting: q2.r5b_voorbelasting + newTx.vatAmount,
          r5e_totaal: q2.r5a_verschuldigd - (q2.r5b_voorbelasting + newTx.vatAmount),
        };
        handleUpdateVatReport(updatedQ2);
      }
    }

    // Update budget category spent
    const matchingBudget = budgets.find(b => b.category === newTx.category);
    if (matchingBudget) {
      const updatedBudgets = budgets.map(b => 
        b.id === matchingBudget.id ? { ...b, currentSpent: b.currentSpent + newTx.amount } : b
      );
      setBudgets(updatedBudgets);
      saveBudgets(updatedBudgets);
    }
  };

  const handleSaveScannedReceipt = (txData: Partial<Transaction>) => {
    const fullTx: Transaction = {
      id: txData.id || `tx-${Date.now()}`,
      date: txData.date || new Date().toISOString().split('T')[0],
      counterparty: txData.counterparty || 'Onbekende leverancier',
      description: txData.description || 'Gescande bon',
      amount: txData.amount || 0,
      type: 'expense',
      category: txData.category || 'Algemene kosten',
      vatRate: txData.vatRate || 21,
      vatAmount: txData.vatAmount || 0,
      vatCategory: txData.vatCategory || 'voorbelasting',
      isDeductibleIB: true,
      deductiblePercentage: txData.deductiblePercentage || 100,
      status: 'matched',
      receiptUrl: txData.receiptUrl,
      invoiceNumber: txData.invoiceNumber,
      syncedWithBank: true,
      bankName: 'ING Zakelijk',
    };
    handleAddTransaction(fullTx);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    const updatedInvoices = [newInv, ...invoices];
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);

    // Create matching transaction
    const newTx: Transaction = {
      id: `tx-inv-${newInv.id}`,
      date: newInv.date,
      counterparty: newInv.clientName,
      description: `Verkoopfactuur ${newInv.invoiceNumber}`,
      amount: newInv.total,
      type: 'income',
      category: 'Omzet Dienstverlening',
      vatRate: 21,
      vatAmount: newInv.vatTotal,
      vatCategory: '1a_hoog',
      isDeductibleIB: false,
      deductiblePercentage: 0,
      status: 'matched',
      invoiceNumber: newInv.invoiceNumber,
      syncedWithBank: true,
      bankName: 'ING Zakelijk',
    };
    handleAddTransaction(newTx);
  };

  const handleUpdateInvoiceStatus = (id: string, status: 'paid' | 'open' | 'overdue') => {
    const updated = invoices.map(i => i.id === id ? { ...i, status } : i);
    setInvoices(updated);
    saveInvoices(updated);
  };

  const handleUpdateVatReport = (updatedReport: VatQuarterReport) => {
    const updated = vatReports.map(r => r.quarter === updatedReport.quarter ? updatedReport : r);
    setVatReports(updated);
    saveVatReports(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleSyncBanks = () => {
    setIsSyncingBanks(true);
    setTimeout(() => {
      setIsSyncingBanks(false);
      const updatedBanks = bankAccounts.map(b => ({
        ...b,
        lastSynced: 'Zojuist gesynchroniseerd',
      }));
      setBankAccounts(updatedBanks);
      saveBankAccounts(updatedBanks);
    }, 1200);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleReloadAfterRestore = () => {
    setSettings(loadSettings());
    setTransactions(loadTransactions());
    setInvoices(loadInvoices());
    setBankAccounts(loadBankAccounts());
    setBudgets(loadBudgets());
    setVatReports(loadVatReports());
    setNotifications(loadNotifications());
    setTasks(loadTasks());
  };

  // Aggregated financials
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount - (t.vatAmount || 0)), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount - (t.vatAmount || 0)), 0);

  const netProfit = totalRevenue - totalExpenses;
  const activeVatReport = vatReports.find(r => r.quarter === 2) || vatReports[0];
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Font size class mapping for visual accessibility
  const fontSizeClass = 
    settings.fontSize === 'large' ? 'text-[17px]' : 
    settings.fontSize === 'extra-large' ? 'text-[19px]' : '';

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${fontSizeClass} ${settings.highContrast ? 'contrast-125' : ''}`}>
      {/* Top Bar (adheres to Top Bar Contract) */}
      <Header
        currentView={currentView}
        setCurrentView={(v) => setCurrentView(v as any)}
        language={language}
        setLanguage={setLanguage}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        highContrast={settings.highContrast}
        setHighContrast={(hc) => handleUpdateSettings({ ...settings, highContrast: hc })}
        unreadCount={unreadNotifsCount}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenGdprModal={() => setIsGdprModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20 lg:pb-10">
        {currentView === 'dashboard' && (
          <DashboardView
            language={language}
            transactions={transactions}
            invoices={invoices}
            budgets={budgets}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            vatReport={activeVatReport}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onNavigate={(v) => setCurrentView(v as any)}
            onOpenExport={() => setIsExportModalOpen(true)}
          />
        )}

        {currentView === 'invoices' && (
          <InvoicesView
            language={language}
            invoices={invoices}
            companySettings={settings}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          />
        )}

        {currentView === 'banking' && (
          <BankingView
            language={language}
            bankAccounts={bankAccounts}
            transactions={transactions}
            onSyncBanks={handleSyncBanks}
            isSyncing={isSyncingBanks}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {currentView === 'tax' && (
          <TaxView
            language={language}
            companySettings={settings}
            vatReports={vatReports}
            onUpdateVatReport={handleUpdateVatReport}
            totalAnnualRevenue={totalRevenue}
            totalAnnualProfit={netProfit}
          />
        )}
      </main>

      {/* Accessibility, Connection status & Privacy Bar */}
      <AccessibilityBar
        isOffline={isOffline}
        onToggleSimulateOffline={() => setIsOffline(!isOffline)}
        language={language}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        setCurrentView={(v) => setCurrentView(v as any)}
        language={language}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenMoreMenu={() => setIsExportModalOpen(true)}
      />

      {/* Modals */}
      <ReceiptScannerModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        language={language}
        onSaveTransaction={handleSaveScannedReceipt}
      />

      <AccountantExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        language={language}
        companySettings={settings}
        transactions={transactions}
        vatReport={activeVatReport}
        revenue={totalRevenue}
        expenses={totalExpenses}
        profit={netProfit}
      />

      <CloudBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        language={language}
        onDataRestored={handleReloadAfterRestore}
      />

      <TwoFactorModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        language={language}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <GdprModal
        isOpen={isGdprModalOpen}
        onClose={() => setIsGdprModalOpen(false)}
        language={language}
        onDataWiped={handleReloadAfterRestore}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        language={language}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onNavigate={(v) => {
          setCurrentView(v as any);
          setIsNotificationsModalOpen(false);
        }}
      />
    </div>
  );
}
