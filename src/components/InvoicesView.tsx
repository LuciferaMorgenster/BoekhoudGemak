import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Check, 
  Clock, 
  AlertCircle,
  FileCode,
  Trash2,
  Send,
  Building
} from 'lucide-react';
import { CompanySettings, Invoice, Language, LineItem, VatRate } from '../types';
import { translations } from '../translations';
import { exportInvoiceUBL } from '../utils/exporters';

interface InvoicesViewProps {
  language: Language;
  invoices: Invoice[];
  companySettings: CompanySettings;
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, status: 'paid' | 'open' | 'overdue') => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  language,
  invoices,
  companySettings,
  onAddInvoice,
  onUpdateInvoiceStatus,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'open' | 'overdue'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientKvk, setNewClientKvk] = useState('');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Consultancy & Strategisch Advies', amount: 1500, vatRate: 21, vatAmount: 315 },
  ]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  const addItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: '', amount: 0, vatRate: 21, vatAmount: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'amount' || field === 'vatRate') {
      const amt = Number(item.amount) || 0;
      const rate = Number(item.vatRate) || 0;
      item.vatAmount = Math.round(amt * (rate / 100) * 100) / 100;
    }
    updated[index] = item;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const vatTotal = items.reduce((sum, item) => sum + Number(item.vatAmount || 0), 0);
  const grandTotal = subtotal + vatTotal;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const invoiceNumber = `2026-${String(invoices.length + 41).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      clientName: newClientName,
      clientEmail: newClientEmail,
      clientKvk: newClientKvk,
      date: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      items,
      subtotal,
      vatTotal,
      total: grandTotal,
      status: 'open',
      type: 'outgoing',
    };

    onAddInvoice(newInvoice);
    setShowCreateModal(false);
    // Reset form
    setNewClientName('');
    setNewClientEmail('');
    setNewClientKvk('');
    setItems([{ id: '1', description: 'Web development diensten', amount: 1200, vatRate: 21, vatAmount: 252 }]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500" />
            {t.invoicesTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verkoopfacturen en e-facturatie conform UBL 2.1 & Peppol standaarden
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newInvoice}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek factuurnummer of klant..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Alles
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.statusPaid}
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'open'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.statusOpen}
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'overdue'
                  ? 'bg-white dark:bg-slate-900 text-red-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.statusOverdue}
            </button>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Nummer</th>
                <th className="py-2.5 px-3 font-semibold">Klant / Bedrijf</th>
                <th className="py-2.5 px-3 font-semibold">Factuurdatum</th>
                <th className="py-2.5 px-3 font-semibold">Vervaldatum</th>
                <th className="py-2.5 px-3 font-semibold text-right">Subtotaal</th>
                <th className="py-2.5 px-3 font-semibold text-right">BTW (21%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Totaal (incl)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                    <div>{inv.clientName}</div>
                    {inv.clientKvk && (
                      <div className="text-[10px] text-slate-400">KvK: {inv.clientKvk}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 tabular-nums">
                    {inv.date}
                  </td>
                  <td className="py-3 px-3 text-slate-500 tabular-nums">
                    {inv.dueDate}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                    € {inv.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-500">
                    € {inv.vatTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900 dark:text-white">
                    € {inv.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        const next = inv.status === 'paid' ? 'open' : 'paid';
                        onUpdateInvoiceStatus(inv.id, next);
                      }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : inv.status === 'overdue'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                      title="Klik om status te wijzigen"
                    >
                      {inv.status === 'paid' ? t.statusPaid : inv.status === 'overdue' ? t.statusOverdue : t.statusOpen}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => exportInvoiceUBL(inv, companySettings)}
                        title="Download UBL 2.1 Peppol XML"
                        className="p-1 text-slate-500 hover:text-emerald-600 rounded transition-colors text-[11px] font-mono flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-1.5"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>UBL</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                {t.createInvoiceTitle}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                Sluiten
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.customerName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="bijv. Jansen Media B.V."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Klant E-mailadres
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="facturatie@bedrijf.nl"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Vervaldatum
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              {/* Line items list */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Factuurregels</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Regel Toevoegen
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <input
                      type="text"
                      required
                      placeholder={t.itemDescription}
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="col-span-6 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Bedrag excl"
                      value={item.amount || ''}
                      onChange={(e) => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                      className="col-span-3 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
                    />
                    <select
                      value={item.vatRate}
                      onChange={(e) => updateItem(idx, 'vatRate', parseInt(e.target.value, 10))}
                      className="col-span-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value={21}>21%</option>
                      <option value={9}>9%</option>
                      <option value={0}>0%</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="col-span-1 p-1 text-slate-400 hover:text-red-500 transition-colors flex justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col items-end gap-1 text-xs">
                <div className="text-slate-500">
                  Subtotaal: <span className="font-semibold tabular-nums text-slate-900 dark:text-white">€ {subtotal.toFixed(2)}</span>
                </div>
                <div className="text-slate-500">
                  BTW (21%): <span className="font-semibold tabular-nums text-slate-900 dark:text-white">€ {vatTotal.toFixed(2)}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  Totaal incl. BTW: <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">€ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {t.saveInvoice}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
