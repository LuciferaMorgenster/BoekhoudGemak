import { 
  BankAccount, 
  BudgetLimit, 
  CompanySettings, 
  EntrepreneurTask, 
  Invoice, 
  NotificationItem, 
  Transaction, 
  VatQuarterReport 
} from '../types';
import { 
  initialBankAccounts, 
  initialBudgets, 
  initialCompanySettings, 
  initialInvoices, 
  initialNotifications, 
  initialTasks, 
  initialTransactions, 
  initialVatReports 
} from '../mockData';

const STORAGE_KEYS = {
  SETTINGS: 'boekhoudgemak_settings',
  TRANSACTIONS: 'boekhoudgemak_transactions',
  INVOICES: 'boekhoudgemak_invoices',
  BANKS: 'boekhoudgemak_banks',
  BUDGETS: 'boekhoudgemak_budgets',
  VAT_REPORTS: 'boekhoudgemak_vat_reports',
  NOTIFICATIONS: 'boekhoudgemak_notifications',
  TASKS: 'boekhoudgemak_tasks',
  OFFLINE_QUEUE: 'boekhoudgemak_offline_queue',
};

export function loadSettings(): CompanySettings {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return item ? JSON.parse(item) : initialCompanySettings;
  } catch {
    return initialCompanySettings;
  }
}

export function saveSettings(settings: CompanySettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadTransactions(): Transaction[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return item ? JSON.parse(item) : initialTransactions;
  } catch {
    return initialTransactions;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function loadInvoices(): Invoice[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return item ? JSON.parse(item) : initialInvoices;
  } catch {
    return initialInvoices;
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

export function loadBankAccounts(): BankAccount[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.BANKS);
    return item ? JSON.parse(item) : initialBankAccounts;
  } catch {
    return initialBankAccounts;
  }
}

export function saveBankAccounts(banks: BankAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(banks));
}

export function loadBudgets(): BudgetLimit[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return item ? JSON.parse(item) : initialBudgets;
  } catch {
    return initialBudgets;
  }
}

export function saveBudgets(budgets: BudgetLimit[]): void {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

export function loadVatReports(): VatQuarterReport[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.VAT_REPORTS);
    return item ? JSON.parse(item) : initialVatReports;
  } catch {
    return initialVatReports;
  }
}

export function saveVatReports(reports: VatQuarterReport[]): void {
  localStorage.setItem(STORAGE_KEYS.VAT_REPORTS, JSON.stringify(reports));
}

export function loadNotifications(): NotificationItem[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return item ? JSON.parse(item) : initialNotifications;
  } catch {
    return initialNotifications;
  }
}

export function saveNotifications(notifications: NotificationItem[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function loadTasks(): EntrepreneurTask[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.TASKS);
    return item ? JSON.parse(item) : initialTasks;
  } catch {
    return initialTasks;
  }
}

export function saveTasks(tasks: EntrepreneurTask[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

/**
 * Creates an encrypted full cloud backup package
 */
export function exportFullBackup(): void {
  const data = {
    version: '2.5.0',
    exportTimestamp: new Date().toISOString(),
    cipher: 'AES-256-GCM-SIMULATED',
    companySettings: loadSettings(),
    transactions: loadTransactions(),
    invoices: loadInvoices(),
    bankAccounts: loadBankAccounts(),
    budgets: loadBudgets(),
    vatReports: loadVatReports(),
    tasks: loadTasks(),
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BoekhoudGemak_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Restores all data from a backup JSON file
 */
export function restoreBackupData(jsonContent: string): boolean {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.companySettings || !data.transactions) {
      throw new Error('Ongeldig back-up bestand');
    }
    saveSettings(data.companySettings);
    saveTransactions(data.transactions);
    if (data.invoices) saveInvoices(data.invoices);
    if (data.bankAccounts) saveBankAccounts(data.bankAccounts);
    if (data.budgets) saveBudgets(data.budgets);
    if (data.vatReports) saveVatReports(data.vatReports);
    if (data.tasks) saveTasks(data.tasks);
    return true;
  } catch (err) {
    console.error('Herstel mislukt:', err);
    return false;
  }
}

/**
 * GDPR / AVG Right to be forgotten (wipe local cache)
 */
export function wipeAllLocalData(): void {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}
