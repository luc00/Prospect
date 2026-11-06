import React, { useState } from 'react';
import {
  Kanban,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Search,
  Instagram,
  Linkedin,
  Globe,
  Twitter,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { Lead, LeadStage, Platform } from '../types';

interface PipelineViewProps {
  leads: Lead[];
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => void;
  onOpenChat: (leadId: string) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onUpdateLeadStage,
  onOpenChat,
}) => {
  const [selectedLeadModal, setSelectedLeadModal] = useState<Lead | null>(null);

  const stages: { id: LeadStage; title: string; color: string; badge: string }[] = [
    { id: 'discovered', title: '1. Scoperti (AI Scout)', color: 'border-slate-700', badge: 'bg-slate-800 text-slate-300' },
    { id: 'broadcast_sent', title: '2. Broadcast Inviati', color: 'border-indigo-500/40', badge: 'bg-indigo-950 text-indigo-300' },
    { id: 'replied', title: '3. Risposta Ricevuta', color: 'border-cyan-500/40', badge: 'bg-cyan-950 text-cyan-300' },
    { id: 'negotiating', title: '4. In Trattativa (AI Closer)', color: 'border-amber-500/40', badge: 'bg-amber-950 text-amber-300' },
    { id: 'converted', title: '5. Convertiti (Call / Chiuso)', color: 'border-emerald-500/40', badge: 'bg-emerald-950 text-emerald-300' },
  ];

  const getPlatformIcon = (plt: Platform) => {
    switch (plt) {
      case 'instagram':
        return <Instagram className="h-3 w-3 text-pink-400" />;
      case 'linkedin':
        return <Linkedin className="h-3 w-3 text-blue-400" />;
      case 'web':
        return <Globe className="h-3 w-3 text-emerald-400" />;
      case 'twitter':
        return <Twitter className="h-3 w-3 text-sky-400" />;
      default:
        return <Globe className="h-3 w-3 text-slate-400" />;
    }
  };

  const getNextStage = (curr: LeadStage): LeadStage | null => {
    switch (curr) {
      case 'discovered':
        return 'broadcast_sent';
      case 'broadcast_sent':
        return 'replied';
      case 'replied':
        return 'negotiating';
      case 'negotiating':
        return 'converted';
      default:
        return null;
    }
  };

  const getPrevStage = (curr: LeadStage): LeadStage | null => {
    switch (curr) {
      case 'converted':
        return 'negotiating';
      case 'negotiating':
        return 'replied';
      case 'replied':
        return 'broadcast_sent';
      case 'broadcast_sent':
        return 'discovered';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Pipeline di Conversione & CRM Outbound
            <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              LIVE DEALS TRACKER
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Traccia il ciclo di vita dei prospect da quando vengono scansionati fino alla conversione finale.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
          <span className="text-slate-400">Totale Convertiti:</span>
          <span className="font-bold text-emerald-400">
            {leads
              .filter((l) => l.stage === 'converted')
              .reduce((acc, l) => acc + (l.potentialValue || 0), 0)
              .toLocaleString('it-IT')}{' '}
            €
          </span>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto min-h-[580px] pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          const stageValue = stageLeads.reduce((acc, l) => acc + (l.potentialValue || 0), 0);

          return (
            <div
              key={stage.id}
              className={`flex flex-col rounded-2xl border bg-slate-900/60 p-3 backdrop-blur-md ${stage.color}`}
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-800 mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">{stage.title}</h3>
                  <span className="text-[10px] text-slate-400">
                    {stageValue.toLocaleString('it-IT')} € stima
                  </span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stage.badge}`}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                {stageLeads.map((lead) => {
                  const next = getNextStage(lead.stage);
                  const prev = getPrevStage(lead.stage);

                  return (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top handle and score */}
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="flex items-center gap-1 font-mono text-cyan-400 truncate max-w-[120px]">
                            {getPlatformIcon(lead.platform)}
                            {lead.handle}
                          </span>
                          <span className="rounded bg-cyan-950 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                            {lead.aiFitScore}% Fit
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white truncate mb-1">{lead.name}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mb-2 leading-tight">
                          {lead.painPoint}
                        </p>
                      </div>

                      {/* Footer Actions & Stage Transfer */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-xs font-bold text-emerald-400">
                          {lead.potentialValue} €
                        </span>

                        <div className="flex items-center gap-1">
                          {prev && (
                            <button
                              onClick={() => onUpdateLeadStage(lead.id, prev)}
                              className="rounded p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                              title="Sposta a colonna precedente"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => onOpenChat(lead.id)}
                            className="rounded p-1 text-cyan-400 hover:bg-slate-800"
                            title="Apri Chat"
                          >
                            <MessageSquare className="h-3 w-3" />
                          </button>
                          {next && (
                            <button
                              onClick={() => onUpdateLeadStage(lead.id, next)}
                              className="rounded p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
                              title="Avanza fase successiva"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="py-8 text-center text-[11px] text-slate-600">
                    Nessun prospect in questa fase
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
