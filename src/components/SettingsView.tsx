import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bot,
  Zap,
  CheckCircle,
  Save,
  Instagram,
  Linkedin,
  Globe,
  Twitter,
  Sliders,
  Flame,
} from 'lucide-react';
import { BotSettings } from '../types';

interface SettingsViewProps {
  settings: BotSettings;
  onSaveSettings: (newSettings: BotSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<BotSettings>(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Configurazione & Strategia Bot AI
            <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              CONVERSION ENGINE SETTINGS
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Imposta la personalità del bot per la gestione autonoma delle risposte e i parametri di sicurezza.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-500 hover:to-indigo-500 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Salva Modifiche</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Configurazione aggiornata con successo! Il bot utilizzerà questi parametri per le prossime risposte.</span>
        </div>
      )}

      {/* 1. Conversational AI Persona */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Bot className="h-4 w-4 text-cyan-400" /> Personalità & Stile di Vendita dell'AI
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Persona / Tono del Bot
          </label>
          <input
            type="text"
            value={form.botPersona}
            onChange={(e) => setForm({ ...form, botPersona: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Definisce come l'AI formula le risposte, la naturalezza del linguaggio e l'empatia nel gestire i dubbi.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Obiettivo Finale di Conversione
          </label>
          <input
            type="text"
            value={form.conversionGoal}
            onChange={(e) => setForm({ ...form, conversionGoal: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            L'obiettivo verso cui l'AI guida ogni prospect (es: fissare call su Calendly, chiedere contatto WhatsApp, vendere direttamente).
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Offerta Aziendale Principale
          </label>
          <textarea
            rows={3}
            value={form.customOffer}
            onChange={(e) => setForm({ ...form, customOffer: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Anti-Ban Social Safeguards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="h-4 w-4 text-emerald-400" /> Protezione Anti-Ban & Rate Limits Social
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ritardo di Sicurezza tra Messaggi Broadcast (Secondi)
            </label>
            <input
              type="number"
              min={15}
              max={180}
              value={form.delayBetweenMessagesSeconds}
              onChange={(e) =>
                setForm({ ...form, delayBetweenMessagesSeconds: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Raccomandato: 45-60 secondi per emulare un comportamento umano e non insospettire gli algoritmi social.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Limite Massimo Broadcast Giornalieri
            </label>
            <input
              type="number"
              min={10}
              max={150}
              value={form.maxDailyDms}
              onChange={(e) => setForm({ ...form, maxDailyDms: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Massimo consigliato per profili riscaldati: 50 DM al giorno su Instagram, 60 su LinkedIn.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Channels Health Status */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
          Stato Connessione Piattaforme di Scouting
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <Instagram className="h-4 w-4 text-pink-400" />
              <span>Instagram Bridge & Scraper</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Attivo & Connesso
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <Linkedin className="h-4 w-4 text-blue-400" />
              <span>LinkedIn InMail Outbound</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Attivo & Connesso
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span>Web & Google Maps Crawler</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Attivo & Connesso
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <Twitter className="h-4 w-4 text-sky-400" />
              <span>X (Twitter) Direct Scanner</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Attivo & Connesso
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};
