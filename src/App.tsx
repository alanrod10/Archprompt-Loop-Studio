import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { CreatePromptView } from './components/views/CreatePromptView';
import { AgenticLoopView } from './components/views/AgenticLoopView';
import { LibraryView } from './components/views/LibraryView';
import { LaboratoryView } from './components/views/LaboratoryView';
import { TechniquesView } from './components/views/TechniquesView';
import { InvestigationView } from './components/views/InvestigationView';
import { EngineEvolutionView } from './components/views/EngineEvolutionView';
import { SettingsView } from './components/views/SettingsView';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, toastMessage } = useStudio();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'create':
        return <CreatePromptView />;
      case 'agentic_builder':
        return <AgenticLoopView />;
      case 'library':
        return <LibraryView />;
      case 'laboratory':
        return <LaboratoryView />;
      case 'techniques':
        return <TechniquesView />;
      case 'investigation':
        return <InvestigationView />;
      case 'evolution':
        return <EngineEvolutionView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl border border-zinc-800 dark:border-zinc-200 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudioProvider>
        <MainLayout />
      </StudioProvider>
    </AuthProvider>
  );
}
