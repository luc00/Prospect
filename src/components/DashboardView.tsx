import React from 'react';
import {
  Users,
  Send,
  MessageSquare,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Sparkles,
  Instagram,
  Linkedin,
  Globe,
  Twitter,
  Radio,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Lead, EngineLog } from '../types';
import { calculatePipelineStats } from '../utils/conversionEngine';

interface DashboardViewProps {
  leads: Lead[];
  logs: EngineLog[];
  botActive: boolean;
  onNavigate: (tab: string) => void;
  onTriggerQuickScout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  logs,
  botActive,
  onNavigate,
  onTriggerQuickScout,
}) => {
  const stats = calculatePipelineStats(leads);

  // Platform count
  const platformCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.platform] = (acc[l.platform] || 0) + 1;
    return acc;
  }, {});

  const total = leads.length || 1;

  return (
    <div className="space-y-6">
      {/* Bot Live Status Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl p-5 border transition-all ${
          botActive
            ? 'border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 shadow-lg shadow-cyan-950/20'
            : 'border-slate-800 bg-slate-900/60'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border p-1 ${
                botActive
                  ? 'border-cyan-500/40 bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 shadow-lg shadow-cyan-500/25'
                  : 'border-slate-700 bg-slate-800'
              }`}
            >
              <img
                src="/assets/aistudio/Robot_magnete_per_generare_contatti_50e9ce44.png"
                alt="Prospect Bot"
                className="h-full w-full object-contain filter drop-shadow"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                  botActive ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-500/30' : 'bg-amber-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {botActive ? 'Prospect AI: Magnete Clienti Attivo & In Ascolto' : 'Prospect AI in Pausa'}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    botActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      botActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                    }`}
                  />
                  {botActive ? 'AUTONOMOUS ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                Il bot scansiona continuamente il web e i social, genera broadcast ultra-personalizzati con Gemini 3.8 Flash e mantiene vive le conversazioni gestendo in automatico ogni obiezione per chiudere vendite o appuntamenti.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onTriggerQuickScout}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-indigo-500 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Trova Nuovi Clienti Ora</span>
            </button>
            <button
              onClick={() => onNavigate('conversations')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <span>Vedi Chat Attive</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Leads */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Prospect Trovati</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.totalLeads}</span>
            <span className="text-[11px] text-emerald-400 font-medium">Scansionati AI</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Target profilati nel web e social</p>
        </div>

        {/* Broadcasts Sent */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Broadcast Inviati</span>
            <Send className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.broadcastSent}</span>
            <span className="text-[11px] text-indigo-400 font-medium">Outbound DM</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Ganci personalizzati distribuiti</p>
        </div>

        {/* Response Rate */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tasso Risposta</span>
            <MessageSquare className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{stats.responseRate}%</span>
            <span className="text-[11px] text-slate-400">({stats.repliesReceived} risposte)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">+18% rispetto a outreach freddo</p>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Conversione a Cliente</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{stats.conversionRate}%</span>
            <span className="text-[11px] text-slate-400">({stats.converted} chiusi)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Call fissate o accordi conclusi</p>
        </div>

        {/* Pipeline Value */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-indigo-950/40 p-4 backdrop-blur-sm border-indigo-500/20">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Valore in Pipeline</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats.totalPipelineValue.toLocaleString('it-IT')} €
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400">
            {stats.closedValue.toLocaleString('it-IT')} € già convertiti
          </p>
        </div>
      </div>

      {/* Main Grid: Live Terminal Logs + Conversion Funnel & Social Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Bot Terminal / Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md flex flex-col h-[460px]">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 border border-slate-700">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Live Activity Feed & Bot Engine</h3>
                <p className="text-[11px] text-slate-400">Eventi di scansione, invio broadcast e risposte automatiche</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] text-slate-400 font-mono">STREAMING</span>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs text-slate-300">
            {logs.map((log) => {
              let badgeColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
              if (log.level === 'success') badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
              if (log.level === 'warning') badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
              if (log.level === 'ai') badgeColor = 'text-indigo-400 bg-indigo-950/60 border-indigo-800';

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60 hover:border-slate-700 transition-all"
                >
                  <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold border ${badgeColor} uppercase`}>
                    {log.platform}
                  </span>
                  <p className="flex-1 leading-relaxed text-slate-200">
                    {log.message}
                    {log.leadHandle && (
                      <span className="ml-1 text-cyan-400 font-semibold">{log.leadHandle}</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Terminal Footer with Safety status */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Protezione Anti-Ban & Rate Limit: <strong>100% Sicuro</strong></span>
            </div>
            <span className="text-[11px] text-slate-500">Gemini 3.8 Flash Autonomous Agent</span>
          </div>
        </div>

        {/* Channels Breakdown & Funnel (1 Col) */}
        <div className="space-y-6">
          {/* Social Channels Covered */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white mb-1">Copertura Canali di Ricerca</h3>
            <p className="text-xs text-slate-400 mb-4">Dove il bot sta trovando e contattando clienti</p>

            <div className="space-y-3.5">
              {/* Instagram */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Instagram className="h-3.5 w-3.5 text-pink-400" />
                    <span>Instagram DM & Bio Scraper</span>
                  </div>
                  <span className="font-semibold text-slate-300">
                    {platformCounts['instagram'] || 0} prospect
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.round(((platformCounts['instagram'] || 0) / total) * 100)}%` }}
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                    <span>LinkedIn InMail & Founder Search</span>
                  </div>
                  <span className="font-semibold text-slate-300">
                    {platformCounts['linkedin'] || 0} prospect
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.round(((platformCounts['linkedin'] || 0) / total) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Web / Google Maps */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Web Scanner & Google Maps Business</span>
                  </div>
                  <span className="font-semibold text-slate-300">
                    {platformCounts['web'] || 0} prospect
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.round(((platformCounts['web'] || 0) / total) * 100)}%` }}
                  />
                </div>
              </div>

              {/* X / Twitter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Twitter className="h-3.5 w-3.5 text-sky-400" />
                    <span>X (Twitter) DM & Niche Keywords</span>
                  </div>
                  <span className="font-semibold text-slate-300">
                    {platformCounts['twitter'] || 0} prospect
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${Math.round(((platformCounts['twitter'] || 0) / total) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Conversion Funnel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white mb-1">Funnel di Conversione Bot</h3>
            <p className="text-xs text-slate-400 mb-3">Progresso dall'identificazione alla vendita</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2 border border-slate-700/50">
                <span className="text-slate-300">1. Clienti Trovati & Profilati</span>
                <span className="font-bold text-white">{stats.totalLeads}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2 border border-slate-700/50">
                <span className="text-slate-300">2. Broadcast Spediti</span>
                <span className="font-bold text-indigo-300">{stats.broadcastSent}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2 border border-slate-700/50">
                <span className="text-slate-300">3. Conversazioni Attive</span>
                <span className="font-bold text-cyan-300">{stats.repliesReceived}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 p-2 border border-emerald-800/60">
                <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 4. Accordi / Call Fissate
                </span>
                <span className="font-bold text-emerald-400">{stats.converted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
