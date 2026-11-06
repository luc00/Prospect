import React, { useState } from 'react';
import {
  Radar,
  Sparkles,
  Instagram,
  Linkedin,
  Globe,
  Twitter,
  MapPin,
  CheckCircle,
  Plus,
  Send,
  SlidersHorizontal,
  Flame,
  Search,
  ExternalLink,
  Loader2,
  Users,
} from 'lucide-react';
import { Lead, Platform } from '../types';

interface ProspectHunterViewProps {
  leads: Lead[];
  onAddLeads: (newLeads: Lead[]) => void;
  onSendDirectBroadcast: (lead: Lead) => void;
  onOpenChat: (leadId: string) => void;
  defaultOffer: string;
}

export const ProspectHunterView: React.FC<ProspectHunterViewProps> = ({
  leads,
  onAddLeads,
  onSendDirectBroadcast,
  onOpenChat,
  defaultOffer,
}) => {
  const [niche, setNiche] = useState('Personal Trainer e Fitness Coach');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [location, setLocation] = useState('Milano, Italia');
  const [offer, setOffer] = useState(defaultOffer);
  const [count, setCount] = useState(4);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeFilterPlatform, setActiveFilterPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/leads/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          platform,
          location,
          offer,
          count,
        }),
      });
      const data = await res.json();
      if (data.leads && Array.isArray(data.leads)) {
        onAddLeads(data.leads);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const getPlatformIcon = (plt: Platform) => {
    switch (plt) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-400" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-blue-400" />;
      case 'web':
        return <Globe className="h-4 w-4 text-emerald-400" />;
      case 'twitter':
        return <Twitter className="h-4 w-4 text-sky-400" />;
      default:
        return <Globe className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesPlat = activeFilterPlatform === 'all' || l.platform === activeFilterPlatform;
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlat && matchesSearch;
  });

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Scanner Form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
              <Radar className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Scanner & AI Prospect Hunter
                <span className="rounded bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  WEB & SOCIAL CRAWLER
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                L’AI scansiona profili Instagram, LinkedIn, siti web e Google Maps per trovare lead caldi su misura per la tua offerta.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>Algoritmo di matching: <strong>Affinità & Pain-Point Detection</strong></span>
          </div>
        </div>

        {/* Scan Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Niche */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nicchia / Professione Target
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="es: Personal Trainer, Ristoranti, Agenzie..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Canale di Ricerca
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'instagram', label: 'Instagram', icon: Instagram },
                { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                { id: 'web', label: 'Web/Maps', icon: Globe },
                { id: 'twitter', label: 'X (Twitter)', icon: Twitter },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as Platform)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2 text-[10px] font-medium border transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200 shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Città / Area Geografica
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="es: Milano, Roma, Italia..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Quantity to scan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quantità da Scansionare
            </label>
            <div className="flex items-center gap-2">
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value={3}>3 Prospect mirati</option>
                <option value={4}>4 Prospect ideali</option>
                <option value={6}>6 Prospect ad alto punteggio</option>
                <option value={8}>8 Prospect (Deep Scan)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Offer Context */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Cosa vendi / Proposta di Valore (usata dall'AI per calcolare il Fit Score)</span>
            <span className="text-[11px] text-slate-500">Istruisce l'algoritmo sui criteri di conversione</span>
          </label>
          <input
            type="text"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder="Descrivi la tua offerta, prodotto o servizio..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Scan Trigger Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition-all ${
              isScanning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-cyan-500/25 cursor-pointer hover:scale-[1.01]'
            }`}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                <span>Scansione e Profilazione AI in Corso...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>Avvia Scansione Clienti con Gemini 3.8 Flash</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prospect List & Filters */}
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filtra:
            </span>
            {[
              { id: 'all', label: `Tutti (${leads.length})` },
              { id: 'instagram', label: 'Instagram' },
              { id: 'linkedin', label: 'LinkedIn' },
              { id: 'web', label: 'Web' },
              { id: 'twitter', label: 'Twitter' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilterPlatform(f.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activeFilterPlatform === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca nome, bio o nicchia..."
                className="rounded-xl border border-slate-700 bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={selectAll}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              {selectedLeadIds.length === filteredLeads.length ? 'Deseleziona' : 'Seleziona Tutti'}
            </button>
          </div>
        </div>

        {/* Selected Leads Action Banner */}
        {selectedLeadIds.length > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 p-3 border border-indigo-500/40 shadow-lg">
            <span className="text-xs font-medium text-indigo-200">
              {selectedLeadIds.length} prospect selezionati
            </span>
            <button
              onClick={() => {
                const target = leads.find((l) => selectedLeadIds.includes(l.id));
                if (target) onSendDirectBroadcast(target);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Invia Broadcast ai Selezionati</span>
            </button>
          </div>
        )}

        {/* Prospects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);

            return (
              <div
                key={lead.id}
                className={`relative rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500/60 bg-slate-900/90 shadow-md shadow-cyan-950/30'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar: Platform & Fit Score */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200 border border-slate-700/60">
                        {getPlatformIcon(lead.platform)}
                        <span className="capitalize">{lead.platform}</span>
                      </span>
                    </div>

                    {/* AI Score Badge */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-indigo-950 px-2 py-0.5 border border-cyan-800/80">
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                      <span className="text-[11px] font-bold text-cyan-300">
                        {lead.aiFitScore}% Fit
                      </span>
                    </div>
                  </div>

                  {/* Name & Handle */}
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {lead.name}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400 mb-1">{lead.handle}</p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2.5">
                    <span className="truncate">{lead.niche}</span>
                    <span>•</span>
                    <span className="truncate">{lead.location}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-300 line-clamp-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 mb-3 leading-relaxed">
                    "{lead.bio}"
                  </p>

                  {/* AI Identified Pain Point */}
                  <div className="rounded-xl bg-amber-950/30 border border-amber-800/40 p-2.5 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                      <Flame className="h-3 w-3" /> Pain Point Rilevato dall'AI:
                    </div>
                    <p className="text-amber-200/90 text-[11px] leading-snug">
                      {lead.painPoint}
                    </p>
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Valore Stimato</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {lead.potentialValue ? `${lead.potentialValue.toLocaleString('it-IT')} €` : 'N/D'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {lead.stage === 'discovered' ? (
                      <button
                        onClick={() => onSendDirectBroadcast(lead)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-sm"
                        title="Invia messaggio di broadcast personalizzato"
                      >
                        <Send className="h-3 w-3" />
                        <span>Invia Broadcast</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenChat(lead.id)}
                        className="flex items-center gap-1 rounded-lg bg-cyan-600/30 border border-cyan-500/40 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-600/50 transition-all cursor-pointer"
                        title="Visualizza conversazione"
                      >
                        <span>Vedi Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
