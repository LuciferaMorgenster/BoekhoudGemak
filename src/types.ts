export type Language = 'nl' | 'en';

export type TransactionType = 'income' | 'expense';

export type VatRate = 21 | 9 | 0;

export type VatCategory = 
  | '1a_hoog' 
  | '1b_laag' 
  | '1e_nul' 
  | '2a_verlegd' 
  | '4a_buiten_eu' 
  | 'voorbelasting';

export interface LineItem {
  id: string;
  description: string;
  amount: number;
  vatRate: VatRate;
  vatAmount: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  iban?: string;
  amount: number;
  type: TransactionType;
  category: string;
  vatRate: VatRate;
  vatAmount: number;
  vatCategory: VatCategory;
  isDeductibleIB: boolean;
  deductiblePercentage: number; // e.g. 80 for representation, 100 for business
  status: 'matched' | 'pending' | 'review';
  receiptUrl?: string;
  invoiceNumber?: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
  syncedWithBank?: boolean;
  bankName?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientKvk?: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  vatTotal: number;
  total: number;
  status: 'paid' | 'open' | 'overdue';
  type: 'outgoing' | 'incoming'; // outgoing = verkoopfactuur, incoming = inkoop/bon
  paymentDate?: string;
  notes?: string;
  pdfUrl?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankLogo: string;
  accountName: string;
  iban: string;
  balance: number;
  lastSynced: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
}

export interface BudgetLimit {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'warning' | 'info' | 'success' | 'deadline';
  read: boolean;
  actionUrl?: string;
  isDeadline?: boolean;
  deadlineDate?: string;
}

export interface EntrepreneurTask {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  category: 'daily' | 'vat' | 'invoice' | 'banking';
}

export interface CompanySettings {
  companyName: string;
  kvkNumber: string;
  btwNumber: string;
  iban: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  isKorApplied: boolean; // Kleineondernemersregeling (omzet < €20.000)
  taxYear: number;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  cloudSyncEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'manual';
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
}

export interface VatQuarterReport {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  periodText: string;
  deadline: string;
  status: 'draft' | 'calculated' | 'submitted';
  submissionDate?: string;
  transactionRef?: string;
  // Rubriek 1: Binnenland
  r1a_omzet: number;
  r1a_btw: number;
  r1b_omzet: number;
  r1b_btw: number;
  r1c_omzet: number;
  r1c_btw: number;
  r1d_omzet: number;
  r1d_btw: number;
  r1e_omzet: number;
  // Rubriek 2: Verlegd binnenland
  r2a_omzet: number;
  r2a_btw: number;
  // Rubriek 3: Naar buitenland
  r3a_omzet: number;
  r3b_omzet: number;
  // Rubriek 4: Vanuit buitenland
  r4a_omzet: number;
  r4a_btw: number;
  r4b_omzet: number;
  r4b_btw: number;
  // Rubriek 5: Eindberekening
  r5a_verschuldigd: number;
  r5b_voorbelasting: number;
  r5c_subtotaal: number;
  r5d_kor: number;
  r5e_totaal: number; // positive = te betalen, negative = terugvragen
}
