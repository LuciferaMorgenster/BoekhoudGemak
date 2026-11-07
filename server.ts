import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: AI-powered receipt scanning & OCR extraction
app.post('/api/scan-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Afbeelding ontbreekt' });
    }

    if (!ai) {
      // Intelligent fallback when API key is not yet configured
      return res.json({
        success: true,
        isFallback: true,
        data: {
          supplier: 'KantoorExpert BV',
          date: new Date().toISOString().split('T')[0],
          invoiceNumber: `FACT-${Math.floor(100000 + Math.random() * 900000)}`,
          netAmount: 82.64,
          vatRate: 21,
          vatAmount: 17.36,
          totalAmount: 100.00,
          category: 'Kantoorartikelen',
          description: 'Bureau-artikelen, printpapier en toners',
          paymentMethod: 'PIN',
          vatCategory: '1a_hoog',
          confidence: 0.95,
          items: [
            { description: 'Printpapier A4 80g (5 pakken)', amount: 28.50, vatRate: 21 },
            { description: 'Toner Cartridge Zwart', amount: 54.14, vatRate: 21 },
          ]
        }
      });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Je bent een ervaren Nederlandse registeraccountant en AI OCR specialist voor zzp- en mkb-boekhouding.
Analyseer deze factuur of dit bonnetje uiterst nauwkeurig en extraheer alle boekhoudkundige gegevens volgens de Nederlandse fiscale wetgeving (Belastingdienst).
Bepaal de juiste btw-rubriek:
- '1a_hoog' (21% standaard)
- '1b_laag' (9% voeding, boeken, medicijnen)
- '1e_nul' (0% of vrijgesteld)
- '2a_verlegd' (btw verlegd)
- '4a_buiten_eu' (import/export buiten EU)
- 'voorbelasting' (terug te vorderen btw rubriek 5b)

Als er onzekerheid is, geef een realistische schatting en ken een confidence score tussen 0 en 1 toe.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            supplier: { type: Type.STRING, description: 'Naam van de leverancier of winkel' },
            date: { type: Type.STRING, description: 'Datum van factuur of bon in YYYY-MM-DD' },
            invoiceNumber: { type: Type.STRING, description: 'Factuurnummer of bonnummer' },
            netAmount: { type: Type.NUMBER, description: 'Bedrag exclusief btw' },
            vatRate: { type: Type.NUMBER, description: 'Btw percentage (21, 9 of 0)' },
            vatAmount: { type: Type.NUMBER, description: 'Het berekende of vermelde btw bedrag' },
            totalAmount: { type: Type.NUMBER, description: 'Totaalbedrag inclusief btw' },
            category: { 
              type: Type.STRING, 
              description: 'Boekhoudkundige categorie: Brandstof & Vervoer, Kantoorartikelen, Software & IT, Eten & Representatie, Telefoon & Internet, Marketing & Verkoop, Inkoop goederen, Algemene kosten, Gereedschap & Inventaris' 
            },
            description: { type: Type.STRING, description: 'Korte samenvatting van de aankoop' },
            paymentMethod: { type: Type.STRING, description: 'Betaalwijze (bijv. PIN, Betaalpas, iDEAL, Contant, Creditcard)' },
            vatCategory: { type: Type.STRING, description: 'Belastingdienst rubriek: 1a_hoog, 1b_laag, 1e_nul, 2a_verlegd of voorbelasting' },
            confidence: { type: Type.NUMBER, description: 'Betrouwbaarheidsscore van de extractie tussen 0.0 en 1.0' },
          },
          required: ['supplier', 'date', 'totalAmount', 'vatRate', 'vatAmount', 'category'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ success: true, isFallback: false, data: parsedData });
  } catch (error: any) {
    console.error('Scan receipt error:', error);
    return res.status(500).json({ error: error.message || 'Fout bij verwerken van bon' });
  }
});

// API: Smart transaction categorization & fiscal anomaly detection
app.post('/api/categorize', async (req, res) => {
  try {
    const { description, amount, recipient } = req.body;

    if (!ai) {
      // Fallback rule-based categorization
      const descLower = (description + ' ' + (recipient || '')).toLowerCase();
      let category = 'Algemene kosten';
      let vatRate = 21;
      let deductiblePercentage = 100;
      let anomalyDetected = false;
      let anomalyReason = '';

      if (descLower.includes('shell') || descLower.includes('bp ') || descLower.includes('esso') || descLower.includes('total') || descLower.includes('tank')) {
        category = 'Brandstof & Vervoer';
        vatRate = 21;
      } else if (descLower.includes('ns ') || descLower.includes('ov-chipkaart') || descLower.includes('connexxion')) {
        category = 'Reiskosten OV';
        vatRate = 9;
      } else if (descLower.includes('albert heijn') || descLower.includes('jumbo') || descLower.includes('restaurant') || descLower.includes('lunch') || descLower.includes('café')) {
        category = 'Representatie & Zakelijke Maaltijden';
        vatRate = 9;
        deductiblePercentage = 80; // NL IB 80% aftrekbaar
      } else if (descLower.includes('adobe') || descLower.includes('google') || descLower.includes('microsoft') || descLower.includes('github') || descLower.includes('aws') || descLower.includes('hosting')) {
        category = 'Software & Cloud Diensten';
        vatRate = 21;
      } else if (descLower.includes('bol.com') || descLower.includes('coolblue') || descLower.includes('action') || descLower.includes('kantoor')) {
        category = 'Kantoorbenodigdheden';
        vatRate = 21;
      } else if (descLower.includes('kpn') || descLower.includes('vodafone') || descLower.includes('ziggo') || descLower.includes('odido')) {
        category = 'Telecommunicatie & Internet';
        vatRate = 21;
      }

      if (amount > 1500) {
        anomalyDetected = true;
        anomalyReason = 'Opvallend hoge uitgave (> € 1.500). Mogelijk investering die moet worden afgeschreven (KIA).';
      }

      return res.json({
        success: true,
        category,
        vatRate,
        deductiblePercentage,
        anomalyDetected,
        anomalyReason,
      });
    }

    const prompt = `Classificeer deze zakelijke banktransactie volgens de Nederlandse fiscale regels:
Omschrijving: "${description}", Tegenpartij: "${recipient || ''}", Bedrag: €${amount}.
Geef de standaard categorie, btw percentage, aftrekbaarheid voor Inkomstenbelasting (bijv. representatie 80%, kantoor 100%), en controleer of er sprake is van een ongebruikelijke uitgave (anomaly).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            vatRate: { type: Type.NUMBER },
            deductiblePercentage: { type: Type.NUMBER },
            anomalyDetected: { type: Type.BOOLEAN },
            anomalyReason: { type: Type.STRING },
          },
          required: ['category', 'vatRate', 'deductiblePercentage', 'anomalyDetected'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BoekhoudGemak server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
