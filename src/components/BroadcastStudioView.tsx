import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
  Play,
  RotateCcw,
  Zap,
  Info,
  Loader2,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { Lead, Platform, BroadcastTemplate, BroadcastCampaign } from '../types';
import { formatBroadcastMessage } from '../utils/conversionEngine';

interface BroadcastStudioViewProps {
  leads: Lead[];
  templates: BroadcastTemplate[];
  campaigns: BroadcastCampaign[];
  onLaunchBroadcast: (templateText: string, targetLeadIds: string[]) => void;
  defaultOffer: string;
}

export const BroadcastStudioView: React.FC<BroadcastStudioViewProps> = ({
  leads,
  templates: initialTemplates,
  campaigns,
  onLaunchBroadcast,
  defaultOffer,
}) => {
  const [offer, setOffer] = useState(defaultOffer);
  const [targetAudience, setTargetAudience] = useState('Personal Trainer, Coach e Professionisti');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [tone, setTone] = useState<'consultative' | 'closer' | 'friendly' | 'challenger'>('consultative');
  const [templates, setTemplates] = useState<BroadcastTemplate[]>(initialTemplates);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customMessage, setCustomMessage] = useState(
    initialTemplates[0]?.message || ''
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [previewLeadId, setPreviewLeadId] = useState<string>(leads[0]?.id || '');
  const [targetFilter, setTargetFilter] = useState<'all_discovered' | 'instagram' | 'linkedin'>('all_discovered');

  const previewLead = leads.find((l) => l.id === previewLeadId) || leads[0];

  const handleGenerateTemplates = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/broadcast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer,
          targetAudience,
          platform,
          tone,
        }),
      });
      const data = await res.json();
      if (data.templates && Array.isArray(data.templates)) {
        const mapped = data.templates.map((t: any, i: number) => ({
          id: `gen-${Date.now()}-${i}`,
          title: t.title,
          type: t.type,
          message: t.message,
          estimatedConversionRate: t.estimatedConversionRate,
        }));
        setTemplates(mapped);
        setSelectedTemplateIndex(0);
        setCustomMessage(mapped[0].message);
      }
    } catch (err) {
      console.error('Error generating templates:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplateIndex(idx);
    setCustomMessage(templates[idx].message);
  };

  const insertTag = (tag: string) => {
    setCustomMessage((prev) => prev + ` {{${tag}}}`);
  };

  // Determine recipients
  const targetLeads = leads.filter((l) => {
    if (targetFilter === 'instagram') return l.platform === 'instagram' && l.stage === 'discovered';
    if (targetFilter === 'linkedin') return l.platform === 'linkedin' && l.stage === 'discovered';
    return l.stage === 'discovered';
  });

  const handleStartBroadcast = () => {
    if (targetLeads.length === 0) return;
    setIsDispatching(true);
    setDispatchProgress(10);

    const interval = setInterval(() => {
      setDispatchProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsDispatching(false);
          onLaunchBroadcast(
            customMessage,
            targetLeads.map((l) => l.id)
          );
          return 100;
        }
        return p + 25;
      });
    }, 600);
  };

  const renderedPreview = previewLead
    ? formatBroadcastMessage(customMessage, previewLead)
    : customMessage;

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Studio Broadcast & Outbound Campaigns
            <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              AI COPYWRITING ENGINE
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Definisci cosa vuoi proporre: l'AI interna genererà varianti ad altissima conversione con tag di personalizzazione automatica.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Algoritmo Umano Anti-Ban Attivo</span>
        </div>
      </div>

      {/* Main Grid: Generator Controls + Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Template Selection (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Offer & Strategy Settings Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-cyan-400" /> 1. La Tua Proposta di Valore (Cosa vuoi vendere)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cosa promuovere in questo broadcast
                </label>
                <textarea
                  rows={2}
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="Es: Sistema automatico di lead generation che garantisce 15 nuovi clienti al mese..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Pubblico Target
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Piattaforma Destinazione
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="instagram">Instagram Direct Message (DM)</option>
                    <option value="linkedin">LinkedIn InMail / Messaggio</option>
                    <option value="web">Web & Email Form</option>
                    <option value="twitter">X (Twitter Direct)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Tono di Voce AI
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="consultative">Consulenziale & Valore (Consigliato)</option>
                    <option value="closer">Diretto al Risultato (High-Ticket)</option>
                    <option value="friendly">Amichevole & Informale</option>
                    <option value="challenger">Challenger (Leva sul Problema)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateTemplates}
                  disabled={isGenerating}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Generazione Varianti con Gemini 3.8 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                      <span>Rigenera Varianti con AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Generated Hooks / Templates Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>2. Seleziona Angolo di Conversione (A/B Test)</span>
              <span className="text-[11px] text-slate-400 font-normal lowercase">4 strategie generate</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {templates.map((tpl, idx) => {
                const isSelected = selectedTemplateIndex === idx;
                return (
                  <button
                    key={tpl.id || idx}
                    type="button"
                    onClick={() => handleSelectTemplate(idx)}
                    className={`text-left rounded-xl p-3 border transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{tpl.title}</span>
                      <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {tpl.estimatedConversionRate} conv.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {tpl.message}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Message Editor */}
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Modifica e Personalizza il Messaggio di Broadcast
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 mr-1">Inserisci Tag:</span>
                  {['nome', 'handle', 'nicchia', 'location', 'pain_point'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-cyan-300 hover:bg-slate-700 font-mono"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Launch Broadcast Controller */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 to-indigo-950/50 p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Pronto per il Broadcast Automatico</h4>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {targetLeads.length} Destinatari Nuovi
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                L’AI invierà i messaggi con intervalli casuali (35-65s) per garantire l’assoluta sicurezza dell’account.
              </p>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleStartBroadcast}
                disabled={isDispatching || targetLeads.length === 0}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all ${
                  isDispatching || targetLeads.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-indigo-500/25 cursor-pointer hover:scale-[1.02]'
                }`}
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Spedizione in Corso ({dispatchProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Lancia Broadcast a {targetLeads.length} Lead</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile / Instagram DM Mockup (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-pink-400" /> Anteprima Live DM
              </h3>
              {leads.length > 0 && (
                <select
                  value={previewLeadId}
                  onChange={(e) => setPreviewLeadId(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.platform})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Simulated Phone Shell */}
            <div className="relative mx-auto max-w-[300px] rounded-[32px] border-4 border-slate-700 bg-slate-950 p-3 shadow-2xl">
              {/* Phone Speaker Notch */}
              <div className="mx-auto mb-3 h-3 w-20 rounded-full bg-slate-800" />

              {/* DM Header */}
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5 mb-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {previewLead?.name ? previewLead.name.charAt(0) : 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{previewLead?.name || 'Prospect'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{previewLead?.handle || '@handle'}</p>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="space-y-2.5 min-h-[220px] flex flex-col justify-end">
                <div className="max-w-[90%] self-end rounded-2xl rounded-br-xs bg-gradient-to-r from-indigo-600 to-cyan-600 p-3 text-white text-[11px] leading-relaxed shadow-md">
                  {renderedPreview}
                </div>
                <span className="self-end text-[9px] text-slate-500">Inviato adesso • Consegna garantita</span>
              </div>

              {/* Fake Input */}
              <div className="mt-4 pt-2 border-t border-slate-800 flex items-center gap-2">
                <div className="flex-1 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] text-slate-500">
                  Invia un messaggio...
                </div>
                <Send className="h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] text-slate-400">
              I tag dinamici vengono sostituiti in automatico per ciascun prospect prima dell'invio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
