import React from 'react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Database, 
  Cpu, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  ShieldCheck,
  GitBranch
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme, activeEngineVersion, firestoreConnected, setCurrentView } = useStudio();
  const { currentUser, userEmail, signInWithGoogle, signOut, isOwner } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-mono font-bold text-lg">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 text-base">
                ARCHPROMPT
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                LOOP STUDIO
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Laboratorio de Ingeniería, Evaluación y Automejora de Prompts
            </p>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1 hidden md:block" />

        {/* Engine Evolution Status */}
        <button
          onClick={() => setCurrentView('evolution')}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
          title="Ver versión y propuestas de evolución del motor"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Motor {activeEngineVersion?.version || 'v1.0.0'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Firestore status indicator */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          title="Firestore Cloud Database configurado y en línea"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Firestore Persistente</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active AI Model Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          <Cpu className="w-3.5 h-3.5 text-cyan-500" />
          <span>Gemini 3.8 Flash</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* User Auth Info / Button */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
                {currentUser.displayName || userEmail}
              </span>
              <span className="text-[10px] text-emerald-500 font-medium flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" /> Propietario
              </span>
            </div>
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {userEmail.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={signOut}
              className="p-1.5 text-zinc-500 hover:text-rose-500 transition-colors"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Google Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
