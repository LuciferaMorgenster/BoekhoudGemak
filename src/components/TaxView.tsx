import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Calculator, 
  Send, 
  CheckCircle2, 
  Download, 
  Calendar, 
  Info, 
  Check, 
  AlertCircle,
  FileCheck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { CompanySettings, Language, VatQuarterReport } from '../types';
import { translations } from '../translations';
import { getGoogleCalendarUrl } from '../utils/exporters';

interface TaxViewProps {
  language: Language;
  companySettings: CompanySettings;
  vatReports: VatQuarterReport[];
  onUpdateVatReport: (updated: VatQuarterReport) => void;
  totalAnnualRevenue: number;
  totalAnnualProfit: number;
}

export const TaxView: React.FC<TaxViewProps> = ({
  language,
  companySettings,
  vatReports,
  onUpdateVatReport,
  totalAnnualRevenue,
  totalAnnualProfit,
}) => {
  const t = translations[language];
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const activeReport = vatReports.find(r => r.quarter === selectedQuarter) || vatReports[0];

  // Inkomstenbelasting Box 1 calculation
  const zelfstandigenaftrek = 3750;
  const startersaftrek = 2123; // if applicable
  const profitAfterZelfstandigen = Math.max(0, totalAnnualProfit - zelfstandigenaftrek);
  const mkbVrijstelling = profitAfterZelfstandigen * 0.127;
  const taxableProfitIB = Math.max(0, profitAfterZelfstandigen - mkbVrijstelling);
  // Box 1 tariff: 36.97% up to €75.518, 49.50% above
  const taxBracket1 = Math.min(taxableProfitIB, 75518) * 0.3697;
  const taxBracket2 = Math.max(0, taxableProfitIB - 75518) * 0.4950;
  const estimatedTotalIB = taxBracket1 + taxBracket2;

  const handleSubmitDigipoort = () => {
    setIsSubmitting(true);
    setSubmittedSuccess(false);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);

      const updated: VatQuarterReport = {
        ...activeReport,
        status: 'submitted',
        submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        transactionRef: `BD-2026-Q${selectedQuarter}-${Math.floor(100000 + Math.random() * 900000)}-NL`,
      };
      onUpdateVatReport(updated);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 1500);
  };

  const handleDownloadXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AangifteOmzetbelasting xmlns="http://xml.belastingdienst.nl/omzetbelasting/2026" versie="2.4">
  <AangifteHeader>
    <BtwNummer>${companySettings.btwNumber}</BtwNummer>
    <Tijdvak>2026-Q${selectedQuarter}</Tijdvak>
    <AanmaakDatum>${new Date().toISOString()}</AanmaakDatum>
    <TransactieKenmerk>${activeReport.transactionRef || 'DIGIPOORT-SUBMIT-2026'}</TransactieKenmerk>
  </AangifteHeader>
  <Rubrieken>
    <Rubriek1a Omzet="${activeReport.r1a_omzet.toFixed(2)}" Omzetbelasting="${activeReport.r1a_btw.toFixed(2)}" />
    <Rubriek1b Omzet="${activeReport.r1b_omzet.toFixed(2)}" Omzetbelasting="${activeReport.r1b_btw.toFixed(2)}" />
    <Rubriek1e Omzet="${activeReport.r1e_omzet.toFixed(2)}" />
    <Rubriek4a Omzet="${activeReport.r4a_omzet.toFixed(2)}" Omzetbelasting="${activeReport.r4a_btw.toFixed(2)}" />
    <Rubriek5a TotaalVerschuldigd="${activeReport.r5a_verschuldigd.toFixed(2)}" />
    <Rubriek5b Voorbelasting="${activeReport.r5b_voorbelasting.toFixed(2)}" />
    <Rubriek5e TeBetalenOfTerug="${activeReport.r5e_totaal.toFixed(2)}" />
  </Rubrieken>
</AangifteOmzetbelasting>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BTW_Aangifte_2026_Q${selectedQuarter}_Belastingdienst.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-500" />
            {t.taxTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.taxSubtitle}
          </p>
        </div>

        {/* Calendar Link */}
        <a
          href={getGoogleCalendarUrl(
            `BTW Aangifte Q${selectedQuarter} Deadline`,
            `Belastingdienst btw-aangifte indienen en betalen voor Q${selectedQuarter} 2026`,
            activeReport.deadline
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>{t.addToGoogleCalendar}</span>
        </a>
      </div>

      {/* Quarter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto text-xs">
        {[1, 2, 3, 4].map(q => {
          const rep = vatReports.find(r => r.quarter === q);
          const isSubmitted = rep?.status === 'submitted';

          return (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q as any)}
              className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-all text-center flex flex-col items-center gap-0.5 ${
                selectedQuarter === q
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>{t[`quarter${q}` as keyof typeof t] || `Q${q}`}</span>
              <span className={`text-[10px] ${isSubmitted ? 'text-emerald-500 font-semibold' : 'text-slate-400'}`}>
                {isSubmitted ? 'Ingediend bij Belastingdienst' : `Deadline: ${rep?.deadline || ''}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submission Status Alert */}
      {activeReport.status === 'submitted' ? (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                {t.submittedSuccess}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                {t.transactionRef}: {activeReport.transactionRef} · {activeReport.submissionDate}
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadXml}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg hover:bg-emerald-200 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadXml}</span>
          </button>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                Aangifte gereed voor verzending
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {t.deadline}: <strong>{activeReport.deadline}</strong>. Te voldoen saldo: <strong>€ {activeReport.r5e_totaal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmitDigipoort}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.submitting}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t.submitToBelastingdienst}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Official Belastingdienst Table Rubriek 1 t/m 5 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Specificatie Omzetbelasting {activeReport.periodText}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              BTW-identificatienummer: {companySettings.btwNumber}
            </div>
          </div>
          <button
            onClick={handleDownloadXml}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-500 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>XML</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Rubriek Belastingdienst</th>
                <th className="py-2.5 px-4 font-semibold text-right">Omzet / Grondslag (€)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Omzetbelasting (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
              {/* Rubriek 1 */}
              <tr className="bg-slate-50/40 dark:bg-slate-800/20 font-semibold text-slate-800 dark:text-slate-200">
                <td colSpan={3} className="py-2 px-4">
                  1. Prestaties binnenland
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 text-slate-700 dark:text-slate-300">
                  1a. Leveringen/diensten belast met hoog tarief (21%)
                </td>
                <td className="py-2 px-4 text-right tabular-nums">
                  € {activeReport.r1a_omzet.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right tabular-nums font-medium text-slate-900 dark:text-white">
                  € {activeReport.r1a_btw.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 text-slate-700 dark:text-slate-300">
                  1b. Leveringen/diensten belast met laag tarief (9%)
                </td>
                <td className="py-2 px-4 text-right tabular-nums">
                  € {activeReport.r1b_omzet.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right tabular-nums font-medium text-slate-900 dark:text-white">
                  € {activeReport.r1b_btw.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 text-slate-700 dark:text-slate-300">
                  1e. Leveringen/diensten belast met 0% of niet bij u belast
                </td>
                <td className="py-2 px-4 text-right tabular-nums">
                  € {activeReport.r1e_omzet.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right text-slate-400">
                  -
                </td>
              </tr>

              {/* Rubriek 2 */}
              <tr className="bg-slate-50/40 dark:bg-slate-800/20 font-semibold text-slate-800 dark:text-slate-200">
                <td colSpan={3} className="py-2 px-4">
                  2. Verleggingsregelingen binnenland
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 text-slate-700 dark:text-slate-300">
                  2a. Leveringen/diensten waarbij de btw naar u is verlegd
                </td>
                <td className="py-2 px-4 text-right tabular-nums">
                  € {activeReport.r2a_omzet.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right tabular-nums">
                  € {activeReport.r2a_btw.toFixed(2)}
                </td>
              </tr>

              {/* Rubriek 4 */}
              <tr className="bg-slate-50/40 dark:bg-slate-800/20 font-semibold text-slate-800 dark:text-slate-200">
                <td colSpan={3} className="py-2 px-4">
                  4. Prestaties vanuit het buitenland aan u verleend
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 text-slate-700 dark:text-slate-300">
                  4a. Leveringen/diensten uit landen buiten de EU
                </td>
                <td className="py-2 px-4 text-right tabular-nums">
                  € {activeReport.r4a_omzet.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right tabular-nums">
                  € {activeReport.r4a_btw.toFixed(2)}
                </td>
              </tr>

              {/* Rubriek 5: Eindberekening */}
              <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                <td colSpan={3} className="py-2 px-4">
                  5. Eindberekening
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                  5a. Verschuldigde omzetbelasting (subtotaal rubriek 1 t/m 4)
                </td>
                <td></td>
                <td className="py-2 px-4 text-right tabular-nums font-semibold">
                  € {activeReport.r5a_verschuldigd.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 font-medium text-emerald-600 dark:text-emerald-400">
                  5b. Voorbelasting (aftrekbare btw op inkopen, bonnen en bedrijfskosten)
                </td>
                <td></td>
                <td className="py-2 px-4 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                  - € {activeReport.r5b_voorbelasting.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-6 text-slate-600 dark:text-slate-400">
                  5d. Vermindering volgens de kleineondernemersregeling (KOR)
                </td>
                <td></td>
                <td className="py-2 px-4 text-right tabular-nums text-slate-400">
                  € {activeReport.r5d_kor.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 font-bold text-sm">
                <td className="py-3 px-4 pl-6">
                  5e. Totaal te betalen / te ontvangen over dit kwartaal
                </td>
                <td></td>
                <td className="py-3 px-4 text-right tabular-nums text-emerald-600 dark:text-emerald-400 text-base">
                  € {activeReport.r5e_totaal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Lower Row: Inkomstenbelasting Box 1 Estimator + KOR Check */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IB Estimator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-500" />
                {t.incomeTaxEstimator}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prognose voor de jaarlijkse aangifte inkomstenbelasting
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Wet IB 2026
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600 dark:text-slate-400">Winst uit onderneming (excl. btw)</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">€ {totalAnnualProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-emerald-600 dark:text-emerald-400">
              <span>{t.taxDeductionZelfstandigen} (urencriterium &ge; 1.225 uur)</span>
              <span className="tabular-nums">- € {zelfstandigenaftrek.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-emerald-600 dark:text-emerald-400">
              <span>{t.taxMkbVrijstelling}</span>
              <span className="tabular-nums">- € {mkbVrijstelling.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-semibold text-slate-900 dark:text-white">
              <span>{t.taxableIncome} (grondslag Box 1)</span>
              <span className="tabular-nums">€ {taxableProfitIB.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 px-2 rounded-lg mt-2">
              <span>{t.estimatedTaxOwed} (reserveringsadvies)</span>
              <span className="tabular-nums text-amber-500">€ {estimatedTotalIB.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* KOR Status Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              {t.korTitle}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Omzetgrens € 20.000 per kalenderjaar
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Huidige cumulatieve jaaromzet:</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">€ {totalAnnualRevenue.toFixed(2)}</span>
            </div>
            {/* Progress to €20.000 */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, (totalAnnualRevenue / 20000) * 100)}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {totalAnnualRevenue > 20000 
                ? 'Uw omzet overstijgt de KOR-drempel (€20.000). U bent regulier btw-plichtig en verstuurt per kwartaal aangifte omzetbelasting.'
                : t.korEligible}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
