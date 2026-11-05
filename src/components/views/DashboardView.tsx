import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FlaskConical, 
  BrainCircuit, 
  Search, 
  GitBranch, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Repeat
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { exportToMarkdown } from '../../utils/exportUtils';

export const DashboardView: React.FC = () => {
  const { 
    prompts, 
    evaluations, 
    techniques, 
    investigations, 
    engineProposals, 
    activeEngineVersion, 
    setCurrentView,
    setActivePrompt,
    showToast
  } = useStudio();

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    showToast('Prompt copiado al portapapeles', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingProposals = engineProposals.filter(p => p.status === 'pending');
  const avgAuditScore = prompts.length > 0
    ? Math.round(prompts.reduce((acc, p) => acc + (p.audit?.score || 85), 0) / prompts.length)
    : 92;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-zinc-900 to-purple-950 border border-indigo-500/20 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Laboratorio de Ingeniería de Prompts de Alta Precisión</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Bienvenido a ARCHPROMPT LOOP STUDIO
          </h1>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
            Plataforma profesional para analizar necesidades en lenguaje natural, investigar técnicas avanzadas, diseñar instrucciones con arquitecturas especializadas, auditar seguridad y evolucionar metódicamente el motor.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView('create')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Diseñar Nuevo Prompt (8 Etapas)</span>
            </button>
            <button
              onClick={() => setCurrentView('agentic_builder')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-all min-h-[44px]"
            >
              <Repeat className="w-4 h-4 text-amber-400" />
              <span>Generar Bucle / Agente</span>
            </button>
            <button
              onClick={() => setCurrentView('investigation')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-all min-h-[44px]"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Investigar con Search Grounding</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prompts en Biblioteca</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {prompts.length}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Persistidos en Cloud Firestore
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Auditoría Promedio</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-baseline gap-1">
            <span>{avgAuditScore}</span>
            <span className="text-sm font-normal text-zinc-400">/100</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sin inyecciones detectadas
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Técnicas Validadas</span>
            <BrainCircuit className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {techniques.length}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            ReAct, Reflexion, SoT, Guardrails...
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Evolución del Motor</span>
            <GitBranch className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {activeEngineVersion?.version || 'v1.0.0'}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            {pendingProposals.length > 0 ? `${pendingProposals.length} propuesta pendiente de aprobar` : 'Metodología actualizada'}
          </p>
        </div>
      </div>

      {/* Pending Engine Proposal Alert (if any) */}
      {pendingProposals.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Propuesta de Automejora Pendiente: {pendingProposals[0].title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {pendingProposals[0].hypothesis}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('evolution')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            Revisar y Decidir
          </button>
        </div>
      )}

      {/* Two columns: Recent Prompts & Prompt Engineering Techniques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompts recientes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>Prompts Diseñados Recientemente</span>
            </h2>
            <button
              onClick={() => setCurrentView('library')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos ({prompts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {prompts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
                Aún no has creado ningún prompt
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Iniciá el motor central de 8 etapas para diseñar tu primera instrucción profesional adaptada a tu modelo preferido.
              </p>
              <button
                onClick={() => setCurrentView('create')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Crear Mi Primer Prompt
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {prompts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {p.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        v{p.version}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {p.targetModel}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {p.architecture}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-mono bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      {p.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-1">
                    <button
                      onClick={() => handleCopy(p.content, p.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Copiar prompt"
                    >
                      {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setActivePrompt(p);
                        setCurrentView('library');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Técnicas de Vanguardia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-500" />
              <span>Técnicas Destacadas</span>
            </h2>
            <button
              onClick={() => setCurrentView('techniques')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Explorar
            </button>
          </div>

          <div className="space-y-3">
            {techniques.slice(0, 3).map((tech) => (
              <div
                key={tech.id}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {tech.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {tech.validationStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {tech.description}
                </p>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="truncate max-w-[180px]">{tech.source}</span>
                  <a
                    href={tech.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-500 hover:underline flex items-center gap-0.5"
                  >
                    <span>Doc</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
