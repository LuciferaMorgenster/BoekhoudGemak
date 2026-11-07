import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  FileCheck, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert,
  Wallet,
  Clock,
  Sparkles,
  PieChart,
  BarChart2
} from 'lucide-react';
import { 
  BudgetLimit, 
  EntrepreneurTask, 
  Invoice, 
  Language, 
  Transaction, 
  VatQuarterReport 
} from '../types';
import { translations } from '../translations';

interface DashboardViewProps {
  language: Language;
  transactions: Transaction[];
  invoices: Invoice[];
  budgets: BudgetLimit[];
  tasks: EntrepreneurTask[];
  onToggleTask: (taskId: string) => void;
  vatReport: VatQuarterReport;
  onOpenScanModal: () => void;
  onNavigate: (view: string) => void;
  onOpenExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  transactions,
  invoices,
  budgets,
  tasks,
  onToggleTask,
  vatReport,
  onOpenScanModal,
  onNavigate,
  onOpenExport,
}) => {
  const t = translations[language];
  const [selectedChartPeriod, setSelectedChartPeriod] = useState<'year' | 'q1' | 'q2'>('year');

  // Calculate real-time financial metrics from transactions
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount - (t.vatAmount || 0)), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount - (t.vatAmount || 0)), 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Fiscal calculation for Dutch Income Tax (Box 1)
  // Zelfstandigenaftrek 2026: €3.750, MKB-winstvrijstelling: 12.7%
  const zelfstandigenaftrek = 3750;
  const taxableBeforeMkb = Math.max(0, netProfit - zelfstandigenaftrek);
  const mkbVrijstelling = taxableBeforeMkb * 0.127;
  const fiscalTaxableIncome = Math.max(0, taxableBeforeMkb - mkbVrijstelling);
  // Box 1 tariff ~36.97%
  const estimatedIncomeTax = fiscalTaxableIncome * 0.3697;

  // Monthly aggregated data for trajectory chart (Jan to Jun 2026)
  const monthlyData = [
    { month: 'Jan', omzet: 8400, kosten: 3200, winst: 5200 },
    { month: 'Feb', omzet: 7900, kosten: 2800, winst: 5100 },
    { month: 'Mrt', omzet: 9200, kosten: 3800, winst: 5400 },
    { month: 'Apr', omzet: 14500, kosten: 4200, winst: 10300 },
    { month: 'Mei (Est)', omzet: 11000, kosten: 3400, winst: 7600 },
    { month: 'Jun (Est)', omzet: 12500, kosten: 3600, winst: 8900 },
  ];

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.omzet, d.kosten)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner / Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.overviewTitle}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{t.overviewPeriod}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-500 font-medium">{t.realtimeUpdate}</span>
          </div>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('invoices')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            {t.newInvoice}
          </button>
          <button
            onClick={onOpenScanModal}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.navScan}
          </button>
        </div>
      </div>

      {/* 4 Core Financial KPI Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Omzet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{t.kpiRevenue}</span>
            <span className="text-emerald-500 flex items-center text-[11px] font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            € {totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Exclusief € {(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.vatAmount, 0)).toFixed(2)} btw
          </div>
        </div>

        {/* KPI 2: Bedrijfskosten */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{t.kpiExpenses}</span>
            <span className="text-slate-500 text-[11px] font-medium">
              8 categorien
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            € {totalExpenses.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Voorbelasting: € {vatReport.r5b_voorbelasting.toFixed(2)} aftrekbaar
          </div>
        </div>

        {/* KPI 3: Netto Winst & Marge */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{t.kpiNetProfit}</span>
            <span className="text-emerald-500 font-semibold text-[11px]">
              {profitMargin.toFixed(1)}% marge
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            € {netProfit.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Winst vóór inkomstenbelasting
          </div>
        </div>

        {/* KPI 4: Belastingreservering */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{t.kpiIncomeTaxReserve}</span>
            <span className="text-amber-500 text-[11px] font-medium">
              Box 1 IB + BTW
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            € {(estimatedIncomeTax + vatReport.r5e_totaal).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            IB: € {estimatedIncomeTax.toFixed(0)} · BTW: € {vatReport.r5e_totaal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive P&L Trajectory Chart + Cashflow Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trajectory Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                {t.chartTitle}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vergelijking van gerealiseerde omzet vs bedrijfskosten
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setSelectedChartPeriod('year')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedChartPeriod === 'year'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                2026
              </button>
              <button
                onClick={() => setSelectedChartPeriod('q1')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedChartPeriod === 'q1'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Q1
              </button>
              <button
                onClick={() => setSelectedChartPeriod('q2')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedChartPeriod === 'q2'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Q2 (Actueel)
              </button>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-56 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {monthlyData.map((item, idx) => {
              const omzetHeight = Math.max(12, (item.omzet / maxVal) * 160);
              const kostenHeight = Math.max(8, (item.kosten / maxVal) * 160);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 z-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity">
                    {item.month}: €{item.omzet} omzet / €{item.winst} winst
                  </div>

                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-44">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${omzetHeight}px` }}
                      className="w-1/2 max-w-[24px] bg-emerald-500 rounded-t transition-all group-hover:brightness-110"
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${kostenHeight}px` }}
                      className="w-1/2 max-w-[24px] bg-slate-300 dark:bg-slate-700 rounded-t transition-all group-hover:brightness-110"
                    />
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[48px]">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                {t.chartRevenue}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-600 rounded-sm" />
                {t.chartExpenses}
              </span>
            </div>
            <button
              onClick={onOpenExport}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Exporteer naar Accountant &rarr;
            </button>
          </div>
        </div>

        {/* Right 1 Col: Cashflow 90-days Forecast & Open Invoices */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              {t.cashflowTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.cashflowDesc}
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Verwacht Netto Saldo (30 dagen)
            </div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
              + € 31.420,15
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              Gedekt door € 8.833 aan openstaande debiteuren
            </div>
          </div>

          {/* Quick list of pending invoices */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Openstaande Debiteuren:
            </div>
            {invoices.filter(i => i.status !== 'paid').map(inv => (
              <div 
                key={inv.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">{inv.clientName}</div>
                  <div className="text-[11px] text-slate-500">Vervalt {inv.dueDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    € {inv.total.toFixed(2)}
                  </div>
                  <span className={`text-[10px] font-medium ${inv.status === 'overdue' ? 'text-red-500' : 'text-amber-500'}`}>
                    {inv.status === 'overdue' ? t.statusOverdue : t.statusOpen}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('invoices')}
            className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-center"
          >
            Bekijk Alle Facturen &rarr;
          </button>
        </div>
      </div>

      {/* Lower Row: Budget Control & Limieten + Daily Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Control */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                {t.budgetLimitsTitle}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatische detectie van budgetoverschrijdingen
              </div>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Maandelijks budget
            </span>
          </div>

          <div className="space-y-3.5">
            {budgets.map(b => {
              const pct = Math.min(100, Math.round((b.currentSpent / b.monthlyLimit) * 100));
              const isOver = b.currentSpent >= b.monthlyLimit;
              const isNear = pct >= 80 && !isOver;

              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      {isOver && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      {b.category}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      € {b.currentSpent.toFixed(2)} / € {b.monthlyLimit.toFixed(2)} ({pct}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all ${
                        isOver 
                          ? 'bg-red-500' 
                          : isNear 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Tasks for Small Business Owner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                {t.tasksTitle}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Organiseer uw administratieve to-do's voor maximale productiviteit
              </div>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {tasks.filter(t => t.completed).length}/{tasks.length} voltooid
            </span>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {task.completed && <FileCheck className="w-3 h-3" />}
                  </div>
                  <span>{task.title}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                  {task.deadline}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              BTW-aangifte Q2 deadline: <strong>31 juli 2026</strong>
            </span>
            <button
              onClick={() => onNavigate('tax')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Ga naar BTW Aangifte &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
