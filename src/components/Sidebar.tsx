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
  ChevronRight,
  X
} from 'lucide-react';
import { useStudio, StudioView } from '../context/StudioContext';

interface NavItem {
  id: StudioView;
  label: string;
  badge?: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    prompts, 
    techniques, 
    evaluations, 
    engineProposals,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useStudio();

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

  const renderNavList = (onItemClick?: () => void) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              if (onItemClick) onItemClick();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
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
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex-col justify-between p-3 shrink-0 h-[calc(100vh-4rem)] select-none">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Navegación del Laboratorio
          </div>
          {renderNavList()}
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

      {/* 2. Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            <div className="space-y-3">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm">
                    A
                  </div>
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    ARCHPROMPT STUDIO
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Cerrar navegación"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Módulos del Laboratorio
              </div>

              {renderNavList(() => setIsMobileMenuOpen(false))}
            </div>

            {/* Mobile Drawer Footer Status */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs mt-4">
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-semibold mb-0.5">
                <span>Motor v1.0.0</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Search Grounding y Auditoría Activa
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
