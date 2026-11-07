import { CompanySettings, Invoice, Transaction, VatQuarterReport } from '../types';

/**
 * Exports transactions to standard CSV format compatible with Excel and Dutch accounting software
 */
export function exportTransactionsToCSV(transactions: Transaction[], filename = 'transacties_export.csv'): void {
  const headers = [
    'Transactie ID',
    'Datum',
    'Tegenpartij',
    'Omschrijving',
    'Type',
    'Bedrag (EUR)',
    'Categorie',
    'BTW Tarief (%)',
    'BTW Bedrag (EUR)',
    'Belastingdienst Rubriek',
    'Status',
    'IB Aftrekbaar %',
    'IBAN',
    'Bank'
  ];

  const rows = transactions.map(t => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${(t.counterparty || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${t.type === 'income' ? 'Bijschrijving' : 'Afschrijving'}"`,
    t.amount.toFixed(2).replace('.', ','),
    `"${t.category}"`,
    t.vatRate,
    t.vatAmount.toFixed(2).replace('.', ','),
    `"${t.vatCategory}"`,
    `"${t.status}"`,
    t.deductiblePercentage,
    `"${t.iban || ''}"`,
    `"${t.bankName || ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an official Dutch Financial Auditfile (XAF 3.2 XML) for accountants
 */
export function generateAuditfileXAF(
  settings: CompanySettings, 
  transactions: Transaction[], 
  vatReport: VatQuarterReport
): void {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<auditfile xmlns="http://www.auditfiles.nl/XAF/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <header>
    <fiscalYear>${settings.taxYear}</fiscalYear>
    <startDate>${settings.taxYear}-01-01</startDate>
    <endDate>${settings.taxYear}-12-31</endDate>
    <curCode>EUR</curCode>
    <dateCreated>${new Date().toISOString()}</dateCreated>
    <softwareDesc>BoekhoudGemak</softwareDesc>
    <softwareVersion>2.5</softwareVersion>
  </header>
  <company>
    <companyIdent>${settings.kvkNumber}</companyIdent>
    <companyName>${settings.companyName}</companyName>
    <taxRegIdent>${settings.btwNumber}</taxRegIdent>
    <streetAddress>${settings.address}</streetAddress>
  </company>
  <generalLedger>
    <taxonomy>Nederlandse Taxonomie Standard Business Reporting (SBR)</taxonomy>
    <vatDeclarationReference>${vatReport.transactionRef || 'PROV-2026'}</vatDeclarationReference>
    <totalVatPayable>${vatReport.r5e_totaal.toFixed(2)}</totalVatPayable>
  </generalLedger>
  <transactions count="${transactions.length}">
    ${transactions.map((t, idx) => `
    <transaction id="${t.id}" nr="${idx + 1}">
      <trDate>${t.date}</trDate>
      <desc>${t.description.replace(/[<>&'"]/g, '')}</desc>
      <counterparty>${t.counterparty.replace(/[<>&'"]/g, '')}</counterparty>
      <amount currency="EUR">${t.amount.toFixed(2)}</amount>
      <type>${t.type}</type>
      <vatCode>${t.vatCategory}</vatCode>
      <vatAmount>${t.vatAmount.toFixed(2)}</vatAmount>
    </transaction>`).join('')}
  </transactions>
</auditfile>`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Auditfile_${settings.companyName.replace(/\s+/g, '_')}_${settings.taxYear}.xaf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports an invoice to standard UBL 2.1 e-Invoice format (Peppol ready)
 */
export function exportInvoiceUBL(invoice: Invoice, settings: CompanySettings): void {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${invoice.date}</cbc:IssueDate>
  <cbc:DueDate>${invoice.dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${settings.companyName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${settings.btwNumber}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${invoice.clientName}</cbc:Name></cac:PartyName>
      <cac:Contact><cbc:ElectronicMail>${invoice.clientEmail || ''}</cbc:ElectronicMail></cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${invoice.vatTotal.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${invoice.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${invoice.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Factuur_${invoice.invoiceNumber}_UBL.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers a professional print preview formatted for direct PDF export
 */
export function printFinancialReport(
  settings: CompanySettings, 
  revenue: number, 
  expenses: number, 
  profit: number, 
  vatReport: VatQuarterReport
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Financieel Overzicht & BTW Aangifte - ${settings.companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 24px; font-weight: bold; margin: 0; color: #0f172a; }
    .meta { font-size: 13px; color: #64748b; line-height: 1.5; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
    .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #f8fafc; }
    .kpi-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    .kpi-card .value { font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 6px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 13px; color: #475569; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .num { text-align: right; font-family: monospace; }
    .total-row { font-weight: bold; border-top: 2px solid #0f172a; }
    .stamp { display: inline-block; padding: 6px 12px; border: 1px solid #10b981; color: #059669; font-size: 12px; font-weight: bold; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">${settings.companyName}</h1>
      <div class="meta" style="margin-top: 6px;">
        KvK: ${settings.kvkNumber} · BTW: ${settings.btwNumber}<br>
        IBAN: ${settings.iban}<br>
        Adres: ${settings.address}
      </div>
    </div>
    <div style="text-align: right;">
      <span class="stamp">OFFICIEEL BOEKHOUDDOCUMENT</span>
      <div class="meta" style="margin-top: 8px;">
        Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}<br>
        Boekjaar: ${settings.taxYear}
      </div>
    </div>
  </div>

  <h2>1. Winst- en Verliesoverzicht (P&L)</h2>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="label">Totale Omzet (excl. btw)</div>
      <div class="value">€ ${revenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Totale Bedrijfskosten</div>
      <div class="value">€ ${expenses.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Netto Resultaat</div>
      <div class="value" style="color: ${profit >= 0 ? '#059669' : '#dc2626'};">€ ${profit.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
    </div>
  </div>

  <h2>2. Specificatie Belastingdienst BTW Aangifte (${vatReport.periodText})</h2>
  <table>
    <thead>
      <tr>
        <th>Rubriek Belastingdienst</th>
        <th class="num">Omzet / Grondslag (€)</th>
        <th class="num">Omzetbelasting (€)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1a. Leveringen/diensten belast met hoog tarief (21%)</td>
        <td class="num">${vatReport.r1a_omzet.toFixed(2)}</td>
        <td class="num">${vatReport.r1a_btw.toFixed(2)}</td>
      </tr>
      <tr>
        <td>1b. Leveringen/diensten belast met laag tarief (9%)</td>
        <td class="num">${vatReport.r1b_omzet.toFixed(2)}</td>
        <td class="num">${vatReport.r1b_btw.toFixed(2)}</td>
      </tr>
      <tr>
        <td>4a. Leveringen/diensten uit landen buiten de EU</td>
        <td class="num">${vatReport.r4a_omzet.toFixed(2)}</td>
        <td class="num">${vatReport.r4a_btw.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td>5a. Totaal verschuldigde omzetbelasting</td>
        <td></td>
        <td class="num">${vatReport.r5a_verschuldigd.toFixed(2)}</td>
      </tr>
      <tr>
        <td>5b. Voorbelasting (aftrekbare btw op inkopen & bonnen)</td>
        <td></td>
        <td class="num">-${vatReport.r5b_voorbelasting.toFixed(2)}</td>
      </tr>
      <tr class="total-row" style="background:#f1f5f9;">
        <td><strong>5e. Totaal te betalen / te verrekenen</strong></td>
        <td></td>
        <td class="num"><strong>€ ${vatReport.r5e_totaal.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>

  <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px;">
    Document gegenereerd door BoekhoudGemak. Conform Algemene Verordening Gegevensbescherming (AVG).
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Creates Google Calendar link for a tax deadline
 */
export function getGoogleCalendarUrl(title: string, description: string, dueDate: string): string {
  const dateFormatted = dueDate.replace(/-/g, '');
  const start = `${dateFormatted}T090000Z`;
  const end = `${dateFormatted}T100000Z`;
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('details', description);
  url.searchParams.set('dates', `${start}/${end}`);
  return url.toString();
}
