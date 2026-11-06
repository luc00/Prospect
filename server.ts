import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent header as required
const apiKeyRaw = process.env.GEMINI_API_KEY || '';
const apiKey = apiKeyRaw && apiKeyRaw !== 'MY_GEMINI_API_KEY' && apiKeyRaw.trim().length > 10 ? apiKeyRaw.trim() : '';
const ai = new GoogleGenAI({
  apiKey: apiKey || 'dummy-key-for-init',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for fallback data when API key is missing or quota limited
const DEFAULT_LEADS = [
  {
    id: 'lead-ig-1',
    name: 'Andrea Moretti',
    handle: '@andrea_fitcoach',
    platform: 'instagram',
    niche: 'Fitness & Nutrizione Online',
    location: 'Milano, Italia',
    followers: '18.4K',
    bio: 'Personal Trainer certificato | Aiuto professionisti a perdere peso senza diete estreme | +120 clienti seguiti',
    painPoint: 'Perde ore a gestire i DM manualmente e ha difficoltà a convertire i follower in clienti ad alto ticket',
    aiFitScore: 94,
    stage: 'replied',
    potentialValue: 1500,
    broadcastSentAt: 'Oggi, 09:15',
    lastActiveAt: '5 min fa',
  },
  {
    id: 'lead-in-2',
    name: 'Elena Rostagno',
    handle: 'elena-rostagno-design',
    platform: 'linkedin',
    niche: 'Agenzia UI/UX & Web',
    location: 'Torino, Italia',
    followers: '5.2K collegamenti',
    website: 'https://rostagnostudio.it',
    bio: 'Founder @ Rostagno Studio | Creiamo interfacce digitali che convertono per startup SaaS e B2B',
    painPoint: 'Pipeline commerciale incostante: mesi pieni di progetti alternati a mesi di vuoto',
    aiFitScore: 89,
    stage: 'negotiating',
    potentialValue: 3200,
    broadcastSentAt: 'Ieri, 16:30',
    lastActiveAt: '12 min fa',
  },
  {
    id: 'lead-web-3',
    name: 'Ristorante La pergola antica',
    handle: 'lapergolaantica.it',
    platform: 'web',
    niche: 'Ristorazione & Hospitality',
    location: 'Firenze, Italia',
    followers: '4.8 stelle (210 recensioni Google)',
    website: 'https://lapergolaantica.it',
    bio: 'Cucina tipica toscana dal 1984. Centro storico di Firenze. Menu stagionale e vini selezionati.',
    painPoint: 'Zero sistema di prenotazione automatica o retargeting sui clienti passati nei giorni feriali',
    aiFitScore: 82,
    stage: 'discovered',
    potentialValue: 1800,
    broadcastSentAt: undefined,
    lastActiveAt: '1 ora fa',
  },
  {
    id: 'lead-ig-4',
    name: 'Silvia Barbieri',
    handle: '@silviab_jewelry',
    platform: 'instagram',
    niche: 'E-commerce Gioielli Artigianali',
    location: 'Bologna, Italia',
    followers: '32.1K',
    bio: 'Creazioni fatte a mano in argento 925 e pietre naturali. Spedizioni in tutta Europa.',
    painPoint: 'Costo delle sponsorizzate Meta in aumento e tasso di carrelli abbandonati elevato',
    aiFitScore: 91,
    stage: 'converted',
    potentialValue: 2400,
    broadcastSentAt: '2 giorni fa',
    lastActiveAt: 'Ieri, 18:20',
  },
  {
    id: 'lead-tw-5',
    name: 'Matteo Colombo',
    handle: '@colombo_saas',
    platform: 'twitter',
    niche: 'SaaS Founder & No-Code',
    location: 'Roma, Italia',
    followers: '9.8K follower',
    bio: 'Building micro-SaaS tools for creators. Bootstrapped to $8k MRR. Tech & Automation geek.',
    painPoint: 'Ha bisogno di outbound automatizzato per validare nuove feature B2B velocemente',
    aiFitScore: 88,
    stage: 'broadcast_sent',
    potentialValue: 2900,
    broadcastSentAt: 'Oggi, 10:45',
    lastActiveAt: '30 min fa',
  },
];

// 1. API: SCOUT / FIND LEADS
app.post('/api/leads/scout', async (req: Request, res: Response) => {
  try {
    const {
      niche = 'Imprenditori e Professionisti',
      platform = 'instagram',
      location = 'Italia',
      offer = 'Servizio di acquisizione clienti e marketing automatizzato',
      count = 4,
    } = req.body;

    if (!apiKey) {
      // Return realistic mock enriched leads if no API key
      const randomized = DEFAULT_LEADS.map((l, i) => ({
        ...l,
        id: `scout-${Date.now()}-${i}`,
        niche: `${niche} (${l.niche})`,
        platform: platform || l.platform,
        location: location || l.location,
        stage: 'discovered' as const,
        aiFitScore: Math.floor(Math.random() * 15) + 84,
      }));
      return res.json({ leads: randomized, source: 'smart_scanner' });
    }

    const prompt = `Sei un motore di lead generation AI specializzato nel trovare clienti perfetti nel web e sui social.
Trova e profila ${count} potenziali clienti / prospect ideali per la seguente nicchia e offerta:
- Nicchia: "${niche}"
- Piattaforma principale: "${platform}" (instagram, linkedin, web, twitter o whatsapp)
- Posizione geografica: "${location}"
- Offerta dell'utente da vendere: "${offer}"

Genera prospect ultra-realistici con handle plausibili, bio credibili, il loro specifico pain point (problema da risolvere che la nostra offerta risolve), un punteggio di affinità AI (80-98) e un valore potenziale stimato del cliente in EUR (da 800 a 4000).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nome persona o brand' },
              handle: { type: Type.STRING, description: 'Username o URL/handle social es: @mario_rossi' },
              niche: { type: Type.STRING, description: 'Sotto-nicchia specifica' },
              location: { type: Type.STRING, description: 'Città o regione' },
              followers: { type: Type.STRING, description: 'Follower o dimensione stima es: 14.2K' },
              bio: { type: Type.STRING, description: 'Bio del profilo reale' },
              painPoint: { type: Type.STRING, description: 'Il problema principale che rende il cliente perfetto per noi' },
              aiFitScore: { type: Type.INTEGER, description: 'Punteggio affinità 0-100' },
              potentialValue: { type: Type.INTEGER, description: 'Valore potenziale stimato in EUR' },
            },
            required: ['name', 'handle', 'niche', 'location', 'bio', 'painPoint', 'aiFitScore', 'potentialValue'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    const enrichedLeads = parsed.map((item: any, idx: number) => ({
      id: `ai-lead-${Date.now()}-${idx}`,
      name: item.name,
      handle: item.handle,
      platform: platform,
      niche: item.niche,
      location: item.location,
      followers: item.followers || '10K+',
      bio: item.bio,
      painPoint: item.painPoint,
      aiFitScore: item.aiFitScore || 88,
      stage: 'discovered',
      potentialValue: item.potentialValue || 1500,
      lastActiveAt: 'Pochi minuti fa',
    }));

    return res.json({ leads: enrichedLeads, source: 'gemini_ai' });
  } catch (error: any) {
    console.error('Error scouting leads:', error);
    // Graceful fallback to default leads
    return res.json({ leads: DEFAULT_LEADS, source: 'fallback_error', error: error?.message });
  }
});

// 2. API: GENERATE BROADCAST CAMPAIGN TEMPLATES
app.post('/api/broadcast/generate', async (req: Request, res: Response) => {
  try {
    const {
      offer = 'Consulenza e software di acquisizione clienti automatizzata',
      targetAudience = 'Personal Trainer e Coach',
      platform = 'instagram',
      tone = 'consultative', // consultative, closer, friendly, challenger
    } = req.body;

    if (!apiKey) {
      return res.json({
        templates: [
          {
            title: 'Gancio Diretto & Risultato',
            type: 'direct_result',
            message:
              'Ciao {{nome}}, complimenti per il tuo profilo {{handle}}! Notavo che come {{nicchia}} a {{location}} spesso il collo di bottiglia principale è {{pain_point}}. Abbiamo sviluppato un sistema che genera 15-20 clienti al mese su pilota automatico. Sei aperto a dare un’occhiata a un caso studio di 2 minuti?',
            estimatedConversionRate: '28%',
          },
          {
            title: 'Valore Gratuito / Audit',
            type: 'free_value',
            message:
              'Ehi {{nome}}, stavo analizzando i profili di {{nicchia}} su {{piattaforma}}. Ho notato una cosa veloce sul tuo posizionamento che potrebbe farti evitare {{pain_point}}. Ho preparato un mini-audit video gratuito di 90 secondi per te. Te lo invio qui in DM?',
            estimatedConversionRate: '34%',
          },
          {
            title: 'Leva sul Problema (Pain-Point Story)',
            type: 'pain_point',
            message:
              'Ciao {{nome}}! Domanda sincera tra professionisti: capita anche a te di risentire di {{pain_point}}? Stiamo aiutando altri colleghi nella nicchia {{nicchia}} a risolvere esattamente questo garantendo clienti paganti ogni settimana. Ti andrebbe di scambiare due idee veloci?',
            estimatedConversionRate: '25%',
          },
          {
            title: 'Curiosità & No-Pitch Casual',
            type: 'casual_curiosity',
            message:
              'Ciao {{nome}}, ti seguo da un po’ su {{piattaforma}}! Una curiosità veloce: sei tu a gestire direttamente i contatti per la tua attività di {{nicchia}} o hai un team? Avrei una proposta interessante ma volevo essere sicuro di parlare con la persona giusta.',
            estimatedConversionRate: '31%',
          },
        ],
      });
    }

    const prompt = `Sei un copywriter d'élite per outbound DM e cold outreach su ${platform}.
Genera 4 varianti di messaggi di broadcast personalizzati e irresistibili per convertire prospect in clienti.
- Cosa offriamo / Valore: "${offer}"
- Pubblico target: "${targetAudience}"
- Piattaforma: "${platform}" (Instagram DM, LinkedIn InMail, Web/Email, X, etc.)
- Tono richiesto: "${tone}"

Ogni variante deve usare i tag di personalizzazione dinamici dove appropriato:
{{nome}}, {{handle}}, {{nicchia}}, {{location}}, {{pain_point}}, {{piattaforma}}.

I messaggi devono sembrare 100% scritti da un umano autentico, senza spam, senza testi chilometrici, con una Call To Action a basso attrito per massimizzare le risposte.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Titolo o angolo strategico (es: Gancio Diretto, Audit Gratuito)' },
              type: { type: Type.STRING, description: 'Identificatore del gancio' },
              message: { type: Type.STRING, description: 'Testo del messaggio con tag dinamici {{nome}}, {{pain_point}} etc.' },
              estimatedConversionRate: { type: Type.STRING, description: 'Percentuale stimata di conversione es: 32%' },
            },
            required: ['title', 'type', 'message', 'estimatedConversionRate'],
          },
        },
      },
    });

    const templates = JSON.parse(response.text || '[]');
    return res.json({ templates });
  } catch (error: any) {
    console.error('Error generating broadcast templates:', error);
    return res.status(500).json({ error: error?.message });
  }
});

// 3. API: AUTONOMOUS CONVERSATIONAL AGENT (AUTO-REPLY TO PROSPECTS)
app.post('/api/chat/auto-reply', async (req: Request, res: Response) => {
  try {
    const {
      lead,
      history,
      offer = 'Soluzione di lead generation e automazione vendite',
      botPersona = 'Consulente esperto, empatico, persuasivo e focalizzato sul valore',
      conversionGoal = 'Fissare una call conoscitiva di 15 minuti su Google Meet o Calendly',
    } = req.body;

    if (!lead || !history || history.length === 0) {
      return res.status(400).json({ error: 'lead e history sono obbligatori' });
    }

    const lastMessage = history[history.length - 1];

    const generateSmartFallback = () => {
      const text = lastMessage.text.toLowerCase();
      let reply = `Capisco perfettamente, ${lead.name}. L'obiettivo non è stravolgere il tuo modo di lavorare, ma farti risparmiare tempo e portare clienti già pronti all'acquisto. Se ti fa piacere, possiamo fare una chiacchierata informale di 10 minuti su Meet così ti mostro i numeri concreti senza impegno. Che giorno sei più libero questa settimana?`;
      let reason = 'Gestione cordiale dell’obiezione e invito morbido alla call con zero pressione.';
      let stage = 'negotiating';
      let prob = 78;

      if (text.includes('costa') || text.includes('prezzo') || text.includes('budget') || text.includes('quanto')) {
        reply = `Ottima domanda, ${lead.name}! Il nostro investimento si ripaga solitamente già con i primi 1-2 clienti generati nel primo mese. Prima di parlare di cifre esatte vogliamo assicurarci che sia davvero il modello giusto per la tua attività di ${lead.niche}. Ti andrebbe di dare un’occhiata rapida a come funziona su Meet giovedì o venerdì?`;
        reason = 'Risposta all’obiezione prezzo: ancora il valore sul ROI (ritorno sull’investimento) prima di dare la tariffa fissa, e spinge per la qualifica in call.';
        stage = 'negotiating';
        prob = 84;
      } else if (text.includes('call') || text.includes('sentirci') || text.includes('volentieri') || text.includes('liber') || text.includes('link') || text.includes('orario')) {
        reply = `Fantastico ${lead.name}! Ecco il link diretto per scegliere l'orario migliore per te: https://calendly.com/leadpulse/discovery-15min . Fammi sapere appena hai prenotato così preparo già un'analisi dedicata per la tua nicchia (${lead.niche})!`;
        reason = 'Lead caldo pronto all’azione: invio immediato del link di prenotazione con conferma e benvenuto.';
        stage = 'converted';
        prob = 98;
      } else if (text.includes('bot') || text.includes('automatico') || text.includes('persona')) {
        reply = `Haha, ottima osservazione ${lead.name}! Usiamo l'AI per identificare i profili migliori come il tuo, ma dietro la strategia ci siamo noi in carne ed ossa. Volevo essere sicuro di entrare in contatto con un professionista che apprezza l'efficienza. Sei aperto a un confronto veloce?`;
        reason = 'Gestione dello scetticismo AI con ironia, trasparenza e riaggancio al valore.';
        stage = 'negotiating';
        prob = 82;
      } else if (text.includes('agenzia') || text.includes('già')) {
        reply = `Molto bene che abbiate già un supporto, ${lead.name}! Spesso non sostituiamo chi già lavora con te, ma andiamo a integrare un flusso outbound proprietario che le normali agenzie non gestiscono. Un piccolo test di 15 giorni vi permetterebbe di raddoppiare i lead. Che ne dici?`;
        reason = 'Superamento obiezione "ho già un fornitore": posizionamento come acceleratore complementare ad alto rendimento.';
        stage = 'negotiating';
        prob = 79;
      }

      return {
        reply,
        aiStrategyReasoning: reason,
        sentiment: 'engaged',
        nextSuggestedStage: stage,
        updatedScore: prob,
      };
    };

    if (!apiKey) {
      return res.json(generateSmartFallback());
    }

    try {
      const conversationTranscript = history
        .map((m: any) => `${m.sender === 'prospect' ? lead.name : 'Bot'}: ${m.text}`)
        .join('\n');

      const prompt = `Sei il cervello AI di un bot conversazionale avanzato di vendite e closing outbound.
Il tuo obiettivo assoluto è dialogare in modo naturale, umano, empatico e professionale per superare ogni dubbio/obiezione del prospect e guidarlo verso l'obiettivo di conversione: "${conversionGoal}".

DATI PROSPECT:
- Nome: ${lead.name} (${lead.handle})
- Nicchia: ${lead.niche}
- Luogo: ${lead.location}
- Problema principale (pain point): ${lead.painPoint}
- Bio / Contesto: ${lead.bio}

OFFERTA AZIENDALE DA PROMUOVERE:
${offer}

STILE E PERSONA DEL BOT:
${botPersona}

CRONOLOGIA DELLA CHAT:
${conversationTranscript}

REGOLE CRUCIALI PER LA RISPOSTA:
1. Rispondi come se fossi il fondatore o un consulente umano senior. Mai sembrare un risponditore robotico.
2. Rispondi SEMPRE in italiano impeccabile, moderno e naturale.
3. Riconosci ciò che il prospect ha appena detto. Se ha posto una domanda o un'obiezione (prezzo, tempo, dubbi, ha già un fornitore, scetticismo AI), gestiscila con intelligenza psicologica.
4. Non fare monologhi troppo lunghi: 2-4 frasi concise e incisive sono perfette per DM social (Instagram, LinkedIn).
5. Termina sempre con una domanda aperta o un chiaro e semplice "call to action" a basso attrito per farlo rispondere.
6. Fornisci la motivazione strategica (aiStrategyReasoning) spiegando perché hai scelto questo angolo.`;

      const apiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: 'Il messaggio esatto da inviare al prospect' },
              aiStrategyReasoning: { type: Type.STRING, description: 'La logica psicologica e tattica usata per convertire' },
              sentiment: {
                type: Type.STRING,
                description: 'Stato emotivo del prospect: positive, neutral, skeptical, price_resistance, converted',
              },
              nextSuggestedStage: {
                type: Type.STRING,
                description: 'Fase consigliata nel CRM: replied, negotiating, converted, lost',
              },
              updatedScore: { type: Type.INTEGER, description: 'Nuova probabilità di chiusura da 0 a 100' },
            },
            required: ['reply', 'aiStrategyReasoning', 'sentiment', 'nextSuggestedStage', 'updatedScore'],
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
      );

      const response: any = await Promise.race([apiPromise, timeoutPromise]);
      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (apiErr: any) {
      console.warn('Gemini API call failed or timed out, using intelligent fallback:', apiErr?.message);
      return res.json(generateSmartFallback());
    }
  } catch (error: any) {
    console.error('Error generating auto-reply:', error);
    return res.status(500).json({ error: error?.message });
  }
});

// 4. API: SIMULATE PROSPECT RESPONSE (For live testing the bot in real-time)
app.post('/api/chat/simulate-prospect', async (req: Request, res: Response) => {
  try {
    const { lead, history, promptType = 'curious' } = req.body;

    if (!apiKey) {
      const canned = [
        'Interessante, ma quanto costa mediamente una cosa del genere?',
        'In realtà abbiamo già un ragazzo che ci segue i social, cosa fareste di diverso?',
        'Come funziona nel pratico? Quanto tempo richiede da parte mia?',
        'Mi sembra interessante, avete qualche caso studio da mostrarmi?',
        'Volentieri! Mandami il link per fissare una call in settimana.',
      ];
      return res.json({
        simulatedText: canned[Math.floor(Math.random() * canned.length)],
      });
    }

    const conversationTranscript = (history || [])
      .map((m: any) => `${m.sender === 'prospect' ? lead.name : 'Bot'}: ${m.text}`)
      .join('\n');

    const prompt = `Sei l'utente ${lead.name}, titolare di ${lead.niche} (${lead.bio}).
Hai appena ricevuto un messaggio da un bot/consulente commerciale.
Simula una risposta realistica e spontanea da parte tua nel tipo di reazione: "${promptType}" (es: curioso, scettico sul prezzo, chiede una call, chiede maggiori dettagli, dice che ha già qualcuno).
Chat finora:
${conversationTranscript}

Scrivi SOLO il messaggio breve del prospect come scriverebbe su Instagram DM o LinkedIn (1-2 frasi, naturale).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ simulatedText: (response.text || '').trim().replace(/^["']|["']$/g, '') });
  } catch (error: any) {
    console.error('Error simulating prospect response:', error);
    return res.json({ simulatedText: 'Interessante, puoi spiegarmi meglio come funziona?' });
  }
});

// Start Express server and mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Prospect AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
