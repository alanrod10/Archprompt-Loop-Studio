import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  PromptItem, 
  PromptVersion, 
  TechniqueItem, 
  InvestigationItem, 
  EvaluationItem, 
  EngineVersionItem, 
  EngineProposalItem, 
  UserSettingsItem,
  TargetModel,
  PromptArchitecture
} from '../types';
import { 
  getPromptsFromDb, 
  savePromptToDb, 
  deletePromptFromDb, 
  savePromptVersionToDb, 
  getPromptVersionsFromDb,
  getTechniquesFromDb,
  saveTechniqueToDb,
  getInvestigationsFromDb,
  saveInvestigationToDb,
  getEvaluationsFromDb,
  saveEvaluationToDb,
  getEngineVersionsFromDb,
  saveEngineVersionToDb,
  getEngineProposalsFromDb,
  saveEngineProposalToDb,
  testConnection
} from '../firebase/config';
import { DEFAULT_TECHNIQUES } from '../utils/defaultTechniques';
import { INITIAL_ENGINE_VERSION, INITIAL_PROPOSAL } from '../utils/defaultEngine';
import { useAuth } from './AuthContext';

export type StudioView = 
  | 'dashboard'
  | 'create'
  | 'agentic_builder'
  | 'library'
  | 'laboratory'
  | 'techniques'
  | 'investigation'
  | 'evolution'
  | 'settings';

interface StudioContextType {
  currentView: StudioView;
  setCurrentView: (view: StudioView) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  // Prompts
  prompts: PromptItem[];
  activePrompt: PromptItem | null;
  setActivePrompt: (prompt: PromptItem | null) => void;
  savePrompt: (prompt: PromptItem) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<PromptItem>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (prompt: PromptItem) => Promise<PromptItem>;
  createPromptVersion: (promptId: string, content: string, description: string, score: number) => Promise<void>;
  getVersionsForPrompt: (promptId: string) => Promise<PromptVersion[]>;
  // Techniques
  techniques: TechniqueItem[];
  addTechnique: (technique: TechniqueItem) => Promise<void>;
  // Investigations
  investigations: InvestigationItem[];
  addInvestigation: (investigation: InvestigationItem) => Promise<void>;
  // Evaluations
  evaluations: EvaluationItem[];
  addEvaluation: (evaluation: EvaluationItem) => Promise<void>;
  // Engine Evolution
  activeEngineVersion: EngineVersionItem;
  engineVersions: EngineVersionItem[];
  engineProposals: EngineProposalItem[];
  addEngineProposal: (proposal: EngineProposalItem) => Promise<void>;
  approveProposal: (proposalId: string) => Promise<void>;
  rejectProposal: (proposalId: string) => Promise<void>;
  revertToEngineVersion: (versionId: string) => Promise<void>;
  // Mobile Menu State
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  // Status & Notifications
  isLoading: boolean;
  firestoreConnected: boolean;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ownerId, isAuthReady, currentUser } = useAuth();
  
  const [currentView, setCurrentViewState] = useState<StudioView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const setCurrentView = (view: StudioView) => {
    setCurrentViewState(view);
    setIsMobileMenuOpen(false);
  };
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [prompts, setPrompts] = useState<PromptItem[]>(() => {
    try {
      const s = localStorage.getItem('archprompt_prompts');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [activePrompt, setActivePrompt] = useState<PromptItem | null>(null);
  const [techniques, setTechniques] = useState<TechniqueItem[]>(() => {
    try {
      const s = localStorage.getItem('archprompt_techniques');
      return s ? JSON.parse(s) : DEFAULT_TECHNIQUES;
    } catch {
      return DEFAULT_TECHNIQUES;
    }
  });
  const [investigations, setInvestigations] = useState<InvestigationItem[]>(() => {
    try {
      const s = localStorage.getItem('archprompt_investigations');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(() => {
    try {
      const s = localStorage.getItem('archprompt_evaluations');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [activeEngineVersion, setActiveEngineVersion] = useState<EngineVersionItem>(() => {
    try {
      const s = localStorage.getItem('archprompt_active_engine');
      return s ? JSON.parse(s) : INITIAL_ENGINE_VERSION;
    } catch {
      return INITIAL_ENGINE_VERSION;
    }
  });
  const [engineVersions, setEngineVersions] = useState<EngineVersionItem[]>([INITIAL_ENGINE_VERSION]);
  const [engineProposals, setEngineProposals] = useState<EngineProposalItem[]>([INITIAL_PROPOSAL]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('archprompt_prompts', JSON.stringify(prompts));
    } catch (e) {
      console.warn('LocalStorage error saving prompts:', e);
    }
  }, [prompts]);

  useEffect(() => {
    try {
      localStorage.setItem('archprompt_techniques', JSON.stringify(techniques));
    } catch (e) {
      console.warn('LocalStorage error saving techniques:', e);
    }
  }, [techniques]);

  useEffect(() => {
    try {
      localStorage.setItem('archprompt_investigations', JSON.stringify(investigations));
    } catch (e) {
      console.warn('LocalStorage error saving investigations:', e);
    }
  }, [investigations]);

  useEffect(() => {
    try {
      localStorage.setItem('archprompt_evaluations', JSON.stringify(evaluations));
    } catch (e) {
      console.warn('LocalStorage error saving evaluations:', e);
    }
  }, [evaluations]);

  useEffect(() => {
    try {
      localStorage.setItem('archprompt_active_engine', JSON.stringify(activeEngineVersion));
    } catch (e) {
      console.warn('LocalStorage error saving activeEngineVersion:', e);
    }
  }, [activeEngineVersion]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initial load from Firestore or local seed
  useEffect(() => {
    if (!isAuthReady) return;

    // If user is not authenticated yet, keep initial seed in-memory and do not query Firestore
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const isOnline = await testConnection();
        setFirestoreConnected(isOnline);

        // Load Prompts
        try {
          const dbPrompts = await getPromptsFromDb(ownerId);
          if (isMounted && dbPrompts && dbPrompts.length > 0) {
            setPrompts(dbPrompts);
          }
        } catch (e) {
          console.warn('Could not load prompts from DB, using memory', e);
        }

        // Load Techniques
        try {
          const dbTech = await getTechniquesFromDb(ownerId);
          if (isMounted && dbTech && dbTech.length > 0) {
            // merge with defaults
            const merged = [...DEFAULT_TECHNIQUES];
            for (const t of dbTech) {
              if (!merged.some(m => m.id === t.id)) {
                merged.push(t);
              }
            }
            setTechniques(merged);
          }
        } catch (e) {
          console.warn('Could not load techniques from DB', e);
        }

        // Load Investigations
        try {
          const dbInv = await getInvestigationsFromDb(ownerId);
          if (isMounted && dbInv && dbInv.length > 0) {
            setInvestigations(dbInv);
          }
        } catch (e) {
          console.warn('Could not load investigations from DB', e);
        }

        // Load Evaluations
        try {
          const dbEval = await getEvaluationsFromDb(ownerId);
          if (isMounted && dbEval && dbEval.length > 0) {
            setEvaluations(dbEval);
          }
        } catch (e) {
          console.warn('Could not load evaluations from DB', e);
        }

        // Load Engine Versions & Proposals
        try {
          const dbEng = await getEngineVersionsFromDb(ownerId);
          if (isMounted && dbEng && dbEng.length > 0) {
            setEngineVersions(dbEng);
            const active = dbEng.find(v => v.status === 'active') || dbEng[0];
            setActiveEngineVersion(active);
          }

          const dbProps = await getEngineProposalsFromDb(ownerId);
          if (isMounted && dbProps && dbProps.length > 0) {
            setEngineProposals(dbProps);
          }
        } catch (e) {
          console.warn('Could not load engine evolution from DB', e);
        }

      } catch (err) {
        console.error('Data loading error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [ownerId, isAuthReady, currentUser]);

  // Save prompt
  const savePrompt = async (prompt: PromptItem) => {
    try {
      await savePromptToDb(prompt);
      setPrompts(prev => {
        const idx = prev.findIndex(p => p.id === prompt.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = prompt;
          return updated;
        }
        return [prompt, ...prev];
      });
      showToast(`Prompt "${prompt.title}" guardado en Firestore.`, 'success');
    } catch (err: any) {
      // Fallback update in state if offline
      setPrompts(prev => [prompt, ...prev.filter(p => p.id !== prompt.id)]);
      showToast(`Guardado localmente. Aviso de Firestore: ${err.message}`, 'info');
    }
  };

  const updatePrompt = async (id: string, updates: Partial<PromptItem>) => {
    const existing = prompts.find(p => p.id === id);
    if (!existing) return;
    const updated: PromptItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await savePrompt(updated);
  };

  const deletePrompt = async (id: string) => {
    try {
      await deletePromptFromDb(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
      if (activePrompt?.id === id) setActivePrompt(null);
      showToast('Prompt eliminado.', 'info');
    } catch (err: any) {
      setPrompts(prev => prev.filter(p => p.id !== id));
      showToast('Eliminado localmente.', 'info');
    }
  };

  const duplicatePrompt = async (prompt: PromptItem): Promise<PromptItem> => {
    const newPrompt: PromptItem = {
      ...prompt,
      id: `prompt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${prompt.title} (Copia)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await savePrompt(newPrompt);
    return newPrompt;
  };

  const createPromptVersion = async (
    promptId: string, 
    content: string, 
    description: string, 
    score: number
  ) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    const newVersionNumber = (prompt.version || 1) + 1;
    const versionItem: PromptVersion = {
      id: `ver-${promptId}-v${newVersionNumber}-${Date.now()}`,
      promptId,
      version: newVersionNumber,
      content,
      changesDescription: description,
      auditScore: score,
      ownerId,
      createdAt: new Date().toISOString()
    };
    try {
      await savePromptVersionToDb(versionItem);
    } catch (e) {
      console.warn('Error saving version to DB:', e);
    }
    await updatePrompt(promptId, {
      version: newVersionNumber,
      content
    });
    showToast(`Nueva versión v${newVersionNumber} registrada con éxito.`, 'success');
  };

  const getVersionsForPrompt = async (promptId: string): Promise<PromptVersion[]> => {
    try {
      return await getPromptVersionsFromDb(promptId, ownerId);
    } catch (e) {
      return [];
    }
  };

  const addTechnique = async (tech: TechniqueItem) => {
    try {
      await saveTechniqueToDb(tech);
      setTechniques(prev => [tech, ...prev]);
      showToast(`Técnica "${tech.name}" agregada.`, 'success');
    } catch (e) {
      setTechniques(prev => [tech, ...prev]);
      showToast(`Técnica guardada localmente.`, 'info');
    }
  };

  const addInvestigation = async (inv: InvestigationItem) => {
    try {
      await saveInvestigationToDb(inv);
      setInvestigations(prev => [inv, ...prev]);
      showToast(`Investigación registrada en Firestore.`, 'success');
    } catch (e) {
      setInvestigations(prev => [inv, ...prev]);
      showToast(`Investigación guardada localmente.`, 'info');
    }
  };

  const addEvaluation = async (ev: EvaluationItem) => {
    try {
      await saveEvaluationToDb(ev);
      setEvaluations(prev => [ev, ...prev]);
      showToast(`Evaluación guardada con promedio de ${ev.averageScore}/10.`, 'success');
    } catch (e) {
      setEvaluations(prev => [ev, ...prev]);
      showToast(`Evaluación guardada localmente.`, 'info');
    }
  };

  const addEngineProposal = async (prop: EngineProposalItem) => {
    try {
      await saveEngineProposalToDb(prop);
      setEngineProposals(prev => [prop, ...prev]);
      showToast(`Propuesta "${prop.title}" creada y pendiente de aprobación.`, 'success');
    } catch (e) {
      setEngineProposals(prev => [prop, ...prev]);
      showToast(`Propuesta guardada localmente.`, 'info');
    }
  };

  const approveProposal = async (proposalId: string) => {
    const prop = engineProposals.find(p => p.id === proposalId);
    if (!prop) return;

    const nextVerNumber = `v1.${engineVersions.length}.0`;
    const newVersion: EngineVersionItem = {
      id: `eng-ver-${Date.now()}`,
      version: nextVerNumber,
      title: prop.title,
      summary: prop.hypothesis,
      affectedComponents: prop.affectedComponents,
      methodologyPrompt: `${activeEngineVersion.methodologyPrompt}\n\n[ACTUALIZACIÓN ${nextVerNumber}]:\n${prop.afterDiff}`,
      auditRulesSpec: activeEngineVersion.auditRulesSpec,
      architectureRulesSpec: activeEngineVersion.architectureRulesSpec,
      evidence: prop.evidence,
      status: 'active',
      approvedAt: new Date().toISOString(),
      ownerId,
      createdAt: new Date().toISOString()
    };

    // Mark previous as superseded
    const updatedPrev = engineVersions.map(v => v.id === activeEngineVersion.id ? { ...v, status: 'superseded' as const } : v);
    const updatedVersions = [newVersion, ...updatedPrev];

    setEngineVersions(updatedVersions);
    setActiveEngineVersion(newVersion);
    setEngineProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'approved' as const } : p));

    try {
      await saveEngineVersionToDb(newVersion);
      await saveEngineProposalToDb({ ...prop, status: 'approved' });
    } catch (e) {
      console.warn('Error syncing approved version to DB:', e);
    }

    showToast(`¡Propuesta APROBADA! El motor ha evolucionado a ${nextVerNumber}.`, 'success');
  };

  const rejectProposal = async (proposalId: string) => {
    setEngineProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'rejected' as const } : p));
    const prop = engineProposals.find(p => p.id === proposalId);
    if (prop) {
      try {
        await saveEngineProposalToDb({ ...prop, status: 'rejected' });
      } catch (e) {}
    }
    showToast('Propuesta de evolución rechazada.', 'info');
  };

  const revertToEngineVersion = async (versionId: string) => {
    const target = engineVersions.find(v => v.id === versionId);
    if (!target) return;

    const updated = engineVersions.map(v => ({
      ...v,
      status: v.id === versionId ? ('active' as const) : ('superseded' as const)
    }));

    setEngineVersions(updated);
    setActiveEngineVersion(target);
    showToast(`Motor revertido a la versión ${target.version}.`, 'info');
  };

  return (
    <StudioContext.Provider
      value={{
        currentView,
        setCurrentView,
        theme,
        toggleTheme,
        prompts,
        activePrompt,
        setActivePrompt,
        savePrompt,
        updatePrompt,
        deletePrompt,
        duplicatePrompt,
        createPromptVersion,
        getVersionsForPrompt,
        techniques,
        addTechnique,
        investigations,
        addInvestigation,
        evaluations,
        addEvaluation,
        activeEngineVersion,
        engineVersions,
        engineProposals,
        addEngineProposal,
        approveProposal,
        rejectProposal,
        revertToEngineVersion,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isLoading,
        firestoreConnected,
        toastMessage,
        showToast
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
