import React from 'react';
import {
  Bot,
  Radar,
  Send,
  MessageSquare,
  Kanban,
  Settings,
  Power,
  Sparkles,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  botActive: boolean;
  setBotActive: (active: boolean) => void;
  unreadCount: number;
  totalLeadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  botActive,
  setBotActive,
  unreadCount,
  totalLeadsCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Live Engine', icon: Zap },
    { id: 'hunter', label: 'Cerca Clienti', icon: Radar, badge: totalLeadsCount },
    { id: 'broadcast', label: 'Broadcast & Campagne', icon: Send },
    { id: 'conversations', label: 'Live Chat & Auto-Pilot', icon: MessageSquare, badge: unreadCount },
    { id: 'pipeline', label: 'Pipeline CRM', icon: Kanban },
    { id: 'settings', label: 'Strategia AI', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 p-1 border border-cyan-500/30 shadow-lg shadow-cyan-500/25">
            <img
              src="/assets/aistudio/Robot_magnete_per_generare_contatti_50e9ce44.png"
              alt="Prospect AI Logo"
              className="h-full w-full object-contain filter drop-shadow"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                botActive ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-500/40' : 'bg-amber-400'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Prospect
              </span>
              <span className="rounded bg-gradient-to-r from-cyan-500 to-indigo-500 px-1.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider shadow-xs">
                AI BOT
              </span>
            </div>
            <p className="text-xs text-slate-400">Magnete Clienti & Broadcast Outbound</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Master Bot Toggle & AI Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Gemini 3.8 Flash Engine</span>
          </div>

          <button
            onClick={() => setBotActive(!botActive)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shadow-md ${
              botActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-emerald-950/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
            }`}
            title={botActive ? 'Clicca per mettere in pausa il bot' : 'Clicca per attivare il bot'}
          >
            <Power className={`h-3.5 w-3.5 ${botActive ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <span>{botActive ? 'BOT ATTIVO' : 'BOT IN PAUSA'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 px-2 py-2 gap-1 bg-slate-950">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
