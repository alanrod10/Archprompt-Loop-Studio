import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Repeat, 
  BookOpen, 
  FlaskConical, 
  BrainCircuit, 
  Search, 
  GitBranch, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useStudio, StudioView } from '../context/StudioContext';

interface NavItem {
  id: StudioView;
  label: string;
  badge?: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, prompts, techniques, evaluations, engineProposals } = useStudio();

  const pendingProposalsCount = engineProposals.filter(p => p.status === 'pending').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Crear Prompt', icon: Sparkles },
    { id: 'agentic_builder', label: 'Loops y Agentes', icon: Repeat },
    { id: 'library', label: 'Biblioteca', icon: BookOpen, badge: prompts.length },
    { id: 'laboratory', label: 'Laboratorio', icon: FlaskConical, badge: evaluations.length },
    { id: 'techniques', label: 'Técnicas', icon: BrainCircuit, badge: techniques.length },
    { id: 'investigation', label: 'Investigación', icon: Search },
    { id: 'evolution', label: 'Evolución Motor', icon: GitBranch, badge: pendingProposalsCount > 0 ? `${pendingProposalsCount} nueva` : undefined },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between p-3 shrink-0 h-[calc(100vh-4rem)] select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Navegación del Laboratorio
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.id === 'evolution' && pendingProposalsCount > 0
                        ? 'bg-purple-500 text-white animate-pulse'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Status Box */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-500/20 text-xs">
        <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
          <span>Sistema Activo</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          ARCHPROMPT v1.0.0 activo con auditoría estática y Search Grounding habilitado.
        </p>
      </div>
    </aside>
  );
};
