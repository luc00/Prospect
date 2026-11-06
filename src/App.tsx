import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProspectHunterView } from './components/ProspectHunterView';
import { BroadcastStudioView } from './components/BroadcastStudioView';
import { ConversationsView } from './components/ConversationsView';
import { PipelineView } from './components/PipelineView';
import { SettingsView } from './components/SettingsView';
import {
  INITIAL_LEADS,
  INITIAL_CONVERSATIONS,
  INITIAL_TEMPLATES,
  INITIAL_CAMPAIGNS,
  INITIAL_BOT_SETTINGS,
  INITIAL_LOGS,
} from './data/initialData';
import { Lead, ChatMessage, BroadcastTemplate, BroadcastCampaign, BotSettings, EngineLog, LeadStage } from './types';
import { formatBroadcastMessage } from './utils/conversionEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [botActive, setBotActive] = useState<boolean>(true);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(INITIAL_CONVERSATIONS);
  const [templates, setTemplates] = useState<BroadcastTemplate[]>(INITIAL_TEMPLATES);
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>(INITIAL_CAMPAIGNS);
  const [botSettings, setBotSettings] = useState<BotSettings>(INITIAL_BOT_SETTINGS);
  const [logs, setLogs] = useState<EngineLog[]>(INITIAL_LOGS);

  // Background activity simulation for the live engine log when bot is active
  useEffect(() => {
    if (!botActive) return;

    const interval = setInterval(() => {
      const handles = leads.map((l) => l.handle);
      const randomHandle = handles[Math.floor(Math.random() * handles.length)] || '@lead_target';
      const events = [
        {
          level: 'ai' as const,
          platform: 'instagram' as const,
          message: `Scanner social in esecuzione: verifica attività recente su ${randomHandle} (Stato: online)`,
          leadHandle: randomHandle,
        },
        {
          level: 'info' as const,
          platform: 'system' as const,
          message: 'Monitoraggio inbound attivo: zero obiezioni bloccate, tempo medio di risposta bot 2.4s',
        },
        {
          level: 'success' as const,
          platform: 'web' as const,
          message: 'Web Crawler Google Maps: indicizzato nuovo business locale con punteggio affinità 87%',
        },
      ];

      const chosen = events[Math.floor(Math.random() * events.length)];
      const newLog: EngineLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...chosen,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 40)]);
    }, 28000);

    return () => clearInterval(interval);
  }, [botActive, leads]);

  // Handler to add newly scouted leads
  const handleAddLeads = (newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
    const log: EngineLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level: 'ai',
      platform: newLeads[0]?.platform || 'system',
      message: `Scout AI completato: aggiunti ${newLeads.length} nuovi prospect profilati nel database.`,
    };
    setLogs((prev) => [log, ...prev]);
  };

  // Launch broadcast campaign to selected leads
  const handleLaunchBroadcast = (templateText: string, targetLeadIds: string[]) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLeads((prev) =>
      prev.map((l) => {
        if (targetLeadIds.includes(l.id)) {
          return {
            ...l,
            stage: 'broadcast_sent',
            broadcastSentAt: `Oggi ${now}`,
          };
        }
        return l;
      })
    );

    // Create initial messages in conversation
    setConversations((prev) => {
      const updated = { ...prev };
      targetLeadIds.forEach((id) => {
        const lead = leads.find((l) => l.id === id);
        if (lead) {
          const personalized = formatBroadcastMessage(templateText, lead);
          const initialMsg: ChatMessage = {
            id: `msg-bcast-${Date.now()}-${id}`,
            sender: 'bot',
            text: personalized,
            timestamp: now,
            aiStrategyReasoning: 'Messaggio iniziale di broadcast generato dall’AI interna.',
          };
          updated[id] = [initialMsg, ...(updated[id] || [])];
        }
      });
      return updated;
    });

    const log: EngineLog = {
      id: `log-${Date.now()}`,
      timestamp: now,
      level: 'success',
      platform: 'system',
      message: `Broadcast completato: inviati ${targetLeadIds.length} messaggi personalizzati con intervallo di sicurezza.`,
    };
    setLogs((prev) => [log, ...prev]);
    setActiveTab('conversations');
  };

  // Direct broadcast to a single lead
  const handleSendDirectBroadcast = (lead: Lead) => {
    const template = templates[0]?.message || 'Ciao {{nome}}, complimenti per il tuo lavoro su {{handle}}!';
    handleLaunchBroadcast(template, [lead.id]);
  };

  // Send message in conversation (from user, bot, or prospect)
  const handleSendMessage = (
    leadId: string,
    text: string,
    sender: 'bot' | 'user' | 'prospect',
    reasoning?: string
  ) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: now,
      aiStrategyReasoning: reasoning,
    };

    setConversations((prev) => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), newMsg],
    }));

    // If prospect replied, advance stage to replied
    if (sender === 'prospect') {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId && l.stage === 'broadcast_sent'
            ? { ...l, stage: 'replied' as LeadStage }
            : l
        )
      );

      const target = leads.find((l) => l.id === leadId);
      const log: EngineLog = {
        id: `log-${Date.now()}`,
        timestamp: now,
        level: 'info',
        platform: target?.platform || 'system',
        message: `Nuova risposta ricevuta da ${target?.name || leadId}: "${text.slice(0, 45)}..."`,
        leadHandle: target?.handle,
      };
      setLogs((prev) => [log, ...prev]);
    } else if (sender === 'bot') {
      const target = leads.find((l) => l.id === leadId);
      const log: EngineLog = {
        id: `log-${Date.now()}`,
        timestamp: now,
        level: 'ai',
        platform: target?.platform || 'system',
        message: `AI Auto-Pilot ha risposto a ${target?.handle || leadId}: "${text.slice(0, 45)}..."`,
        leadHandle: target?.handle,
      };
      setLogs((prev) => [log, ...prev]);
    }
  };

  // Update lead stage in CRM
  const handleUpdateLeadStage = (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );

    const target = leads.find((l) => l.id === leadId);
    const log: EngineLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: newStage === 'converted' ? 'success' : 'info',
      platform: target?.platform || 'system',
      message: `Lead ${target?.handle || leadId} spostato nella fase: [${newStage.toUpperCase()}]`,
      leadHandle: target?.handle,
    };
    setLogs((prev) => [log, ...prev]);
  };

  const handleOpenChat = (leadId: string) => {
    setActiveTab('conversations');
  };

  // Unread messages count
  const unreadCount = leads.filter((l) => l.stage === 'replied').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        botActive={botActive}
        setBotActive={setBotActive}
        unreadCount={unreadCount}
        totalLeadsCount={leads.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            leads={leads}
            logs={logs}
            botActive={botActive}
            onNavigate={setActiveTab}
            onTriggerQuickScout={() => setActiveTab('hunter')}
          />
        )}

        {activeTab === 'hunter' && (
          <ProspectHunterView
            leads={leads}
            onAddLeads={handleAddLeads}
            onSendDirectBroadcast={handleSendDirectBroadcast}
            onOpenChat={handleOpenChat}
            defaultOffer={botSettings.customOffer}
          />
        )}

        {activeTab === 'broadcast' && (
          <BroadcastStudioView
            leads={leads}
            templates={templates}
            campaigns={campaigns}
            onLaunchBroadcast={handleLaunchBroadcast}
            defaultOffer={botSettings.customOffer}
          />
        )}

        {activeTab === 'conversations' && (
          <ConversationsView
            leads={leads}
            conversations={conversations}
            onSendMessage={handleSendMessage}
            onUpdateLeadStage={handleUpdateLeadStage}
            autoPilotEnabled={botSettings.autoPilotEnabled}
            onToggleAutoPilot={() =>
              setBotSettings((s) => ({ ...s, autoPilotEnabled: !s.autoPilotEnabled }))
            }
            botOffer={botSettings.customOffer}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            leads={leads}
            onUpdateLeadStage={handleUpdateLeadStage}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={botSettings}
            onSaveSettings={setBotSettings}
          />
        )}
      </main>

      {/* Sub-footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-2">
          <img
            src="/assets/aistudio/Robot_magnete_per_generare_contatti_50e9ce44.png"
            alt="Prospect Logo"
            className="h-4 w-4 object-contain inline"
          />
          <span>Prospect AI • Motore Magnete Clienti & Broadcast Outbound con Gemini 3.8 Flash</span>
        </p>
      </footer>
    </div>
  );
}
