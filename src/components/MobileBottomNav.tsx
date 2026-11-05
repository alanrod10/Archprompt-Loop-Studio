import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Repeat, 
  BookOpen, 
  Menu
} from 'lucide-react';
import { useStudio, StudioView } from '../context/StudioContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, prompts, setIsMobileMenuOpen } = useStudio();

  const primaryMobileTabs: Array<{ id: StudioView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'create', label: 'Crear', icon: Sparkles },
    { id: 'agentic_builder', label: 'Loops', icon: Repeat },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
  ];

  return (
    <nav 
      aria-label="Navegación inferior móvil"
      className="sticky bottom-0 left-0 right-0 w-full shrink-0 z-40 md:hidden bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-lg flex items-center justify-around px-1 py-1 shadow-lg pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      {primaryMobileTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all relative ${
              isActive 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : ''} transition-transform`} />
              {tab.id === 'library' && prompts.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {prompts.length > 99 ? '99+' : prompts.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-tight">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        );
      })}

      {/* Menu Drawer Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
        aria-label="Abrir menú completo con más herramientas"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 leading-tight">Más</span>
      </button>
    </nav>
  );
};
