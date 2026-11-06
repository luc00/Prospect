import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  Sliders,
  Play,
  RotateCcw,
  Loader2,
  Calendar,
  Instagram,
  Linkedin,
  Globe,
  Twitter,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Lead, ChatMessage, Platform, LeadStage } from '../types';
import { calculateConversionScore, classifyObjection } from '../utils/conversionEngine';

interface ConversationsViewProps {
  leads: Lead[];
  conversations: Record<string, ChatMessage[]>;
  onSendMessage: (leadId: string, text: string, sender: 'bot' | 'user' | 'prospect', reasoning?: string) => void;
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => void;
  autoPilotEnabled: boolean;
  onToggleAutoPilot: () => void;
  botOffer: string;
}

export const ConversationsView: React.FC<ConversationsViewProps> = ({
  leads,
  conversations,
  onSendMessage,
  onUpdateLeadStage,
  autoPilotEnabled,
  onToggleAutoPilot,
  botOffer,
}) => {
  // Only leads that have started a conversation or received a broadcast
  const activeChatLeads = leads.filter(
    (l) => l.stage !== 'discovered' || conversations[l.id]?.length > 0
  );

  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    activeChatLeads[0]?.id || leads[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [customSimText, setCustomSimText] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || activeChatLeads[0] || leads[0];
  const currentMessages = (selectedLead ? conversations[selectedLead.id] : []) || [];

  const conversionScore = selectedLead
    ? calculateConversionScore(selectedLead, currentMessages)
    : 50;

  const lastProspectMsg = [...currentMessages].reverse().find((m) => m.sender === 'prospect');
  const detectedObjection = lastProspectMsg ? classifyObjection(lastProspectMsg.text) : null;

  // Trigger AI Auto-Reply for current lead
  const triggerAutoReply = async (lead: Lead, msgs: ChatMessage[]) => {
    setIsBotThinking(true);
    try {
      const res = await fetch('/api/chat/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          history: msgs,
          offer: botOffer,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        onSendMessage(lead.id, data.reply, 'bot', data.aiStrategyReasoning);
        if (data.nextSuggestedStage) {
          onUpdateLeadStage(lead.id, data.nextSuggestedStage as LeadStage);
        }
      }
    } catch (err) {
      console.error('Auto-reply error:', err);
    } finally {
      setIsBotThinking(false);
    }
  };

  // Simulate prospect message and optionally trigger auto-reply
  const handleSimulateProspectReply = async (text: string) => {
    if (!selectedLead) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'prospect',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMsgs = [...currentMessages, newMsg];
    onSendMessage(selectedLead.id, text, 'prospect');

    // If autoPilot is ON, the AI bot answers automatically!
    if (autoPilotEnabled) {
      setTimeout(() => {
        triggerAutoReply(selectedLead, updatedMsgs);
      }, 1000);
    }
  };

  // Manual send by the operator
  const handleManualSend = () => {
    if (!inputText.trim() || !selectedLead) return;
    onSendMessage(selectedLead.id, inputText.trim(), 'user');
    setInputText('');
  };

  const getPlatformIcon = (plt: Platform) => {
    switch (plt) {
      case 'instagram':
        return <Instagram className="h-3.5 w-3.5 text-pink-400" />;
      case 'linkedin':
        return <Linkedin className="h-3.5 w-3.5 text-blue-400" />;
      case 'web':
        return <Globe className="h-3.5 w-3.5 text-emerald-400" />;
      case 'twitter':
        return <Twitter className="h-3.5 w-3.5 text-sky-400" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Auto-Pilot Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-950 to-indigo-950 p-1 border border-cyan-500/30 shadow-md">
            <img
              src="/assets/aistudio/Robot_magnete_per_generare_contatti_50e9ce44.png"
              alt="Prospect Bot"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Gestione Risposte & Auto-Pilot Conversazionale
              </h3>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                GEMINI 3.8 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              L'AI risponde ai prospect in modo umano, risolve le obiezioni e guida la chat verso la conversione.
            </p>
          </div>
        </div>

        {/* Auto-Pilot Toggle Button */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs font-bold text-white">
              {autoPilotEnabled ? 'Auto-Pilot Attivo (100% Autonomo)' : 'Modalità Manuale / Bozza'}
            </span>
            <span className="text-[11px] text-slate-400">
              {autoPilotEnabled ? 'Il bot risponde in automatico' : 'Conferma ogni messaggio'}
            </span>
          </div>

          <button
            onClick={onToggleAutoPilot}
            className={`p-1.5 rounded-xl border transition-all ${
              autoPilotEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Attiva/Disattiva Risposte Automatiche AI"
          >
            {autoPilotEnabled ? (
              <ToggleRight className="h-7 w-7 text-emerald-400" />
            ) : (
              <ToggleLeft className="h-7 w-7 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column Split: Chat List (3 cols) | Live Chat Thread (6 cols) | AI Intelligence (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px]">
        {/* Column 1: Conversations List (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 backdrop-blur-md flex flex-col h-full overflow-hidden">
          <div className="pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Conversazioni Attive</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                {activeChatLeads.length}
              </span>
            </div>

            {/* Stage filter */}
            <div className="flex gap-1 overflow-x-auto text-[11px]">
              {['all', 'negotiating', 'converted'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStage(st)}
                  className={`rounded-lg px-2 py-1 whitespace-nowrap capitalize ${
                    filterStage === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st === 'all' ? 'Tutte' : st === 'negotiating' ? 'In Trattativa' : 'Convertiti'}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {activeChatLeads.map((lead) => {
              const msgs = conversations[lead.id] || [];
              const lastMsg = msgs[msgs.length - 1];
              const isSelected = lead.id === selectedLeadId;

              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                    isSelected
                      ? 'border-cyan-500/60 bg-slate-800/90 shadow-md'
                      : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      {getPlatformIcon(lead.platform)}
                      <span className="text-xs font-bold text-white truncate">{lead.name}</span>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-semibold uppercase ${
                        lead.stage === 'converted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : lead.stage === 'negotiating'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lead.stage === 'converted' ? 'Convertito' : lead.stage}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mb-1">
                    {lastMsg ? lastMsg.text : 'Nessun messaggio'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{lead.handle}</span>
                    <span className="font-semibold text-emerald-400">
                      {lead.potentialValue} €
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Chat Conversation Thread (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          {selectedLead ? (
            <div className="flex items-center justify-between border-b border-slate-800 p-3.5 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">{selectedLead.name}</h3>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                      {getPlatformIcon(selectedLead.platform)}
                      {selectedLead.handle}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-sm">
                    {selectedLead.niche} • {selectedLead.location}
                  </p>
                </div>
              </div>

              {/* Quick stage toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateLeadStage(selectedLead.id, 'converted')}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Segna Convertito</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-slate-400">Seleziona una chat</div>
          )}

          {/* Messages Timeline */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
            {currentMessages.map((msg) => {
              const isProspect = msg.sender === 'prospect';
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isProspect ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                    {isProspect ? (
                      <>
                        <User className="h-3 w-3 text-slate-400" />
                        <span>{selectedLead?.name}</span>
                      </>
                    ) : isBot ? (
                      <>
                        <img
                          src="/assets/aistudio/Robot_magnete_per_generare_contatti_50e9ce44.png"
                          alt="Prospect Bot"
                          className="h-3.5 w-3.5 object-contain"
                        />
                        <span className="text-cyan-400 font-semibold">Prospect AI Bot</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 text-indigo-400" />
                        <span>Operatore Manuale</span>
                      </>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      isProspect
                        ? 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60'
                        : isBot
                        ? 'bg-gradient-to-r from-cyan-900/60 to-indigo-900/60 text-slate-100 rounded-tr-xs border border-cyan-500/30'
                        : 'bg-indigo-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* AI Reasoning Tag if available */}
                  {msg.aiStrategyReasoning && (
                    <div className="mt-1 max-w-[85%] flex items-center gap-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 px-2 py-1 text-[10px] text-indigo-300">
                      <Sparkles className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span>{msg.aiStrategyReasoning}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {isBotThinking && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>L'AI sta analizzando il messaggio e formulando la risposta di conversione...</span>
              </div>
            )}
          </div>

          {/* Bottom Bar: Manual Input & AI Trigger */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
                placeholder="Scrivi messaggio o lascia rispondere l'AI..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => selectedLead && triggerAutoReply(selectedLead, currentMessages)}
                disabled={isBotThinking || !selectedLead}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                title="Genera risposta intelligente con l'AI ora"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Genera Risposta AI</span>
              </button>

              <button
                type="button"
                onClick={handleManualSend}
                disabled={!inputText.trim()}
                className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: AI Conversion Intelligence & Interactive Simulator (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md flex flex-col justify-between h-full overflow-y-auto space-y-4">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Flame className="h-4 w-4 text-amber-400" /> Analisi di Conversione AI
            </h3>

            {/* Conversion Probability Gauge */}
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Probabilità di Chiusura</span>
                <span className="text-sm font-bold text-emerald-400">{conversionScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${conversionScore}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                Calcolato in base a risposte, interesse e rimozione obiezioni.
              </p>
            </div>

            {/* Detected Objection Box */}
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Obiezione Rilevata
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>{detectedObjection || 'Nessuna obiezione critica'}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {detectedObjection === 'PRICE' && 'Focus su ROI e garanzia: sposta il discorso sul ritorno economico.'}
                {detectedObjection === 'SCHEDULE_CALL' && 'Lead caldo: inviare subito link Calendly o proposta di data/ora.'}
                {detectedObjection === 'NOT_INTERESTED' && 'Riaggancio morbido o cambio di angolazione su un pain point alternativo.'}
                {detectedObjection === 'SKEPTICISM_AI' && 'Conferma umanità con tono disinvolto e trasparente.'}
                {!detectedObjection && 'Il prospect è aperto al dialogo e pronto alla fase di qualifica.'}
              </p>
            </div>

            {/* Tactical Goal */}
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Obiettivo Tattico Bot
              </span>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                Fissare una call di 15 minuti su Meet mostrando i numeri concreti per {selectedLead?.name}.
              </p>
            </div>
          </div>

          {/* Interactive Prospect Simulator Section */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <Play className="h-3 w-3 text-cyan-400" /> Simula Risposta Prospect
              </span>
              <span className="text-[10px] text-slate-500">Test Bot Live</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Clicca un'opzione o digita per testare come il bot supera le obiezioni:
            </p>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleSimulateProspectReply('Interessante, ma quanto costa mediamente?')}
                className="w-full text-left rounded-lg bg-slate-950 p-2 text-[11px] text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all"
              >
                💰 "Quanto costa mediamente?"
              </button>

              <button
                type="button"
                onClick={() => handleSimulateProspectReply('Ma sei un bot o sto parlando con una persona reale?')}
                className="w-full text-left rounded-lg bg-slate-950 p-2 text-[11px] text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all"
              >
                🤖 "Sei un bot o una persona?"
              </button>

              <button
                type="button"
                onClick={() => handleSimulateProspectReply('Abbiamo già un’agenzia che ci segue il marketing.')}
                className="w-full text-left rounded-lg bg-slate-950 p-2 text-[11px] text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all"
              >
                🛡️ "Abbiamo già un'agenzia"
              </button>

              <button
                type="button"
                onClick={() => handleSimulateProspectReply('Perfetto, quando sei libero per una call su Meet?')}
                className="w-full text-left rounded-lg bg-emerald-950/40 p-2 text-[11px] text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/50 transition-all font-medium"
              >
                📅 "Quando sei libero per una call?"
              </button>
            </div>

            {/* Custom simulation input */}
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                value={customSimText}
                onChange={(e) => setCustomSimText(e.target.value)}
                placeholder="Oppure scrivi risposta..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-200"
              />
              <button
                type="button"
                onClick={() => {
                  if (customSimText.trim()) {
                    handleSimulateProspectReply(customSimText.trim());
                    setCustomSimText('');
                  }
                }}
                className="rounded-lg bg-cyan-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-cyan-500"
              >
                Testa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
