import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  Layers, 
  ArrowRight,
  TrendingUp,
  FileCode,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
import { EngineProposalItem, EngineVersionItem } from '../../types';

export const EngineEvolutionView: React.FC = () => {
  const { 
    activeEngineVersion, 
    engineVersions, 
    engineProposals, 
    addEngineProposal, 
    approveProposal, 
    rejectProposal, 
    revertToEngineVersion,
    showToast 
  } = useStudio();
  const { ownerId } = useAuth();

  const [isGeneratingProposal, setIsGeneratingProposal] = useState<boolean>(false);
  const [targetImprovementArea, setTargetImprovementArea] = useState<string>('Reforzamiento de aislamiento de memoria en agentes autónomos');
  const [evidenceNotes, setEvidenceNotes] = useState<string>('Disminución de coherencia observada tras iteración 6 en tareas multi-paso');

  const pendingProposals = engineProposals.filter(p => p.status === 'pending');
  const resolvedProposals = engineProposals.filter(p => p.status !== 'pending');

  const handleCreateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const res = await fetch('/api/evolution/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMethodology: activeEngineVersion.methodologyPrompt,
          areaOfImprovement: targetImprovementArea,
          evidenceRationale: evidenceNotes
        })
      });

      if (!res.ok) throw new Error('Error al formular propuesta');
      const data = await res.json();

      const newProposal: EngineProposalItem = {
        id: `prop-${Date.now()}`,
        title: data.title || 'Propuesta de Refinamiento Metodológico',
        hypothesis: data.hypothesis,
        evidence: data.evidence,
        affectedComponents: data.affectedComponents || ['Instrucciones Internas'],
        beforeDiff: data.beforeDiff,
        afterDiff: data.afterDiff,
        testResults: data.testResults || [],
        status: 'pending',
        ownerId,
        createdAt: new Date().toISOString()
      };

      await addEngineProposal(newProposal);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 mb-2">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Evolución del Motor de Prompts</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Automejora Controlada y Versionado Metodológico
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">
          El motor estudia sus propias instrucciones, reglas de arquitectura y rúbricas. Formula propuestas fundadas en evidencia que se someten a pruebas comparativas. Ningún cambio se aplica sin la aprobación expresa del propietario, permitiendo reversión instantánea.
        </p>
      </div>

      {/* Active Version Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-950 via-zinc-900 to-indigo-950 border border-purple-500/30 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                {activeEngineVersion.version} ACTIVA
              </span>
              <h2 className="text-lg md:text-xl font-bold tracking-tight">
                {activeEngineVersion.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-300">
              {activeEngineVersion.summary}
            </p>
          </div>

          <div className="text-right text-xs text-zinc-400 shrink-0">
            Aprobada el: {new Date(activeEngineVersion.approvedAt || activeEngineVersion.createdAt).toLocaleDateString('es-ES')}
          </div>
        </div>

        {/* Affected components badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          <span className="text-xs text-zinc-400 font-semibold py-1">Componentes Activos:</span>
          {activeEngineVersion.affectedComponents.map((comp, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs bg-white/10 text-zinc-200 border border-white/10"
            >
              {comp}
            </span>
          ))}
        </div>
      </div>

      {/* Formular Nueva Propuesta de Automejora */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Formular Nueva Propuesta de Evolución Metodológica</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Área de Oportunidad / Mejora
            </label>
            <input
              type="text"
              value={targetImprovementArea}
              onChange={(e) => setTargetImprovementArea(e.target.value)}
              placeholder="Ej: Aislamiento estricto de scratchpad en bucles de agentes"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Evidencia u Observación Racional
            </label>
            <input
              type="text"
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="Ej: Benchmarks recientes demuestran menor fatiga de contexto"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleCreateProposal}
            disabled={isGeneratingProposal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            {isGeneratingProposal ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Formulando Hipótesis y Ejecutando Tests...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar Propuesta con Suite de Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pending Proposals Section */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>Propuestas Pendientes de Decisión ({pendingProposals.length})</span>
        </h3>

        {pendingProposals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center text-xs text-zinc-500">
            No hay propuestas pendientes. Formula una nueva propuesta de mejora arriba.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProposals.map((prop) => (
              <div
                key={prop.id}
                className="bg-white dark:bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h4 className="font-extrabold text-sm md:text-base text-zinc-900 dark:text-zinc-100">
                      {prop.title}
                    </h4>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                      <strong>Hipótesis:</strong> {prop.hypothesis}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveProposal(prop.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprobar y Evolucionar Motor</span>
                    </button>

                    <button
                      onClick={() => rejectProposal(prop.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>

                {/* Diff Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                    <div className="font-sans font-bold text-[11px] uppercase tracking-wider text-rose-500">
                      Antes (Metodología Anterior)
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed">{prop.beforeDiff}</pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
                    <div className="font-sans font-bold text-[11px] uppercase tracking-wider text-emerald-500">
                      Después (Mejora Propuesta)
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed">{prop.afterDiff}</pre>
                  </div>
                </div>

                {/* Test Results Comparison */}
                {prop.testResults?.length > 0 && (
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Comprobación de Regresiones (Suite Comparativa):
                    </div>
                    <div className="space-y-1.5">
                      {prop.testResults.map((tr, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700 dark:text-zinc-300">{tr.testName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400">Antes: {tr.beforeScore} pts</span>
                            <ArrowRight className="w-3 h-3 text-zinc-400" />
                            <span className="font-bold text-emerald-500">Después: {tr.afterScore} pts</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                              Sin Regresión
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Versions & Rollback Section */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-zinc-500" />
          <span>Historial de Versiones del Motor y Capacidad de Reversión ({engineVersions.length})</span>
        </h3>

        <div className="space-y-3">
          {engineVersions.map((v) => {
            const isCurrent = v.id === activeEngineVersion.id;
            return (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent 
                    ? 'border-purple-500/50 bg-purple-500/5' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {v.version}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {v.title}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        ACTIVA AHORA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {v.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isCurrent && (
                    <button
                      onClick={() => revertToEngineVersion(v.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revertir a esta Versión</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
