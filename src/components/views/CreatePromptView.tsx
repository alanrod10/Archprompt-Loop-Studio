import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Copy, 
  Download, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Sliders, 
  Save, 
  Layers, 
  Terminal, 
  Wand2, 
  Info,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PromptItem, 
  PromptSpecification, 
  ClarifyingQuestion, 
  AuditReport, 
  TargetModel, 
  PromptArchitecture, 
  PromptCategory 
} from '../../types';
import { MODEL_PROFILES, TAXONOMY_CATEGORIES } from '../../utils/taxonomy';
import { exportToMarkdown, exportToTxt, exportToJson, exportToYaml, downloadFile } from '../../utils/exportUtils';
import { runStaticAudit } from '../../utils/auditEngine';

export const CreatePromptView: React.FC = () => {
  const { savePrompt, showToast, setCurrentView, setActivePrompt } = useStudio();
  const { ownerId, userEmail } = useAuth();

  // Stepper: 1 to 8
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [userInput, setUserInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<TargetModel>('gemini-3.8-flash');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('especializados');
  const [selectedArchitecture, setSelectedArchitecture] = useState<PromptArchitecture>('system_prompt');
  const [enableGrounding, setEnableGrounding] = useState<boolean>(false);

  // Stage 1 output: specification
  const [specification, setSpecification] = useState<PromptSpecification | null>(null);

  // Stage 2 output: clarifying questions
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Stage 4 output: research grounding context
  const [researchSummary, setResearchSummary] = useState<string>('');
  const [citations, setCitations] = useState<Array<{ title: string; uri: string }>>([]);

  // Stage 5 output: generated prompt
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [justification, setJustification] = useState<string>('');

  // Stage 6 output: audit
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  // Stage 7: optimized prompt
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationNotes, setOptimizationNotes] = useState<string>('');

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // ETAPA 1: Enviar solicitud libre y comprender la tarea
  const handleStage1Comprehend = async () => {
    if (!userInput.trim()) {
      showToast('Por favor describe lo que necesitas que haga tu prompt.', 'error');
      return;
    }
    setIsLoading(true);
    setStatusMessage('Etapa 1: Analizando objetivo real, riesgos y especificación...');
    try {
      const res = await fetch('/api/pipeline/stage1-comprehension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          preferredModel: selectedModel
        })
      });
      if (!res.ok) throw new Error('Fallo en comprensión');
      const data: PromptSpecification = await res.json();
      setSpecification(data);
      if (data.targetModel) setSelectedModel(data.targetModel);
      if (data.suggestedArchitecture) setSelectedArchitecture(data.suggestedArchitecture);

      // Proceder a Etapa 2: Obtener preguntas inteligentes
      setStatusMessage('Etapa 2: Evaluando ambigüedades clave y decisiones...');
      const qRes = await fetch('/api/pipeline/stage2-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specification: data,
          userInput
        })
      });
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions(qData.questions || []);
      }
      setCurrentStage(2);
    } catch (err: any) {
      console.error(err);
      showToast(`Error al analizar: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // ETAPA 4 & 5: Construcción del Prompt
  const handleStage5Construct = async () => {
    setIsLoading(true);
    let researchContext = researchSummary;

    // Si requiere investigación o el usuario activó Search Grounding
    if (enableGrounding && !researchSummary) {
      setStatusMessage('Etapa 4: Investigando documentación y papers con Search Grounding...');
      try {
        const rRes = await fetch('/api/research/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Técnicas de ingeniería de prompts y mejores prácticas para: ${specification?.realGoal || userInput}`
          })
        });
        if (rRes.ok) {
          const rData = await rRes.json();
          researchContext = rData.summary;
          setResearchSummary(rData.summary);
          setCitations(rData.citations || []);
        }
      } catch (e) {
        console.warn('Grounding notice:', e);
      }
    }

    setStatusMessage('Etapa 5: Construyendo prompt adaptado al modelo...');
    try {
      const res = await fetch('/api/pipeline/stage5-construction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specification,
          answers,
          architecture: selectedArchitecture,
          targetModel: selectedModel,
          researchContext
        })
      });
      if (!res.ok) throw new Error('Error al construir el prompt');
      const data = await res.json();
      setGeneratedTitle(data.title || 'Prompt de Alta Precisión');
      setGeneratedPrompt(data.content || '');
      setJustification(data.justification || '');

      // Ejecutar Etapa 6 de Auditoría de inmediato
      setStatusMessage('Etapa 6: Ejecutando auditoría estática independiente...');
      let audit = runStaticAudit(data.content, selectedArchitecture, selectedModel);
      try {
        const aRes = await fetch('/api/pipeline/stage6-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptContent: data.content,
            architecture: selectedArchitecture,
            targetModel: selectedModel
          })
        });
        if (aRes.ok) {
          const aiAudit = await aRes.json();
          // Merge heuristics with AI findings
          audit = {
            ...aiAudit,
            findings: [...audit.findings, ...(aiAudit.findings || [])]
          };
        }
      } catch (e) {}

      setAuditReport(audit);
      setCurrentStage(6);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // ETAPA 7: Optimización basada en auditoría
  const handleOptimize = async () => {
    if (!generatedPrompt || !auditReport) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/pipeline/stage7-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptContent: generatedPrompt,
          auditFindings: auditReport.findings,
          targetModel: selectedModel,
          architecture: selectedArchitecture
        })
      });
      if (!res.ok) throw new Error('Error al optimizar');
      const data = await res.json();
      setGeneratedPrompt(data.optimizedContent);
      setOptimizationNotes(data.efficiencyGain || 'Optimizaciones aplicadas exitosamente.');

      // Re-auditar
      const reAudit = runStaticAudit(data.optimizedContent, selectedArchitecture, selectedModel);
      setAuditReport(reAudit);
      showToast('Prompt optimizado y corregido.', 'success');
    } catch (err: any) {
      showToast(`Error al optimizar: ${err.message}`, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // ETAPA 8: Guardar en Firestore
  const handleSaveToFirestore = async () => {
    if (!generatedPrompt) return;
    const promptItem: PromptItem = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: generatedTitle || 'Prompt de Ingeniería',
      category: selectedCategory,
      subcategory: specification?.complexity || 'General',
      targetModel: selectedModel,
      architecture: selectedArchitecture,
      content: generatedPrompt,
      originalInput: userInput,
      specification: specification || undefined,
      clarifyingQuestions: questions,
      audit: auditReport || undefined,
      version: 1,
      status: 'ready',
      tags: [selectedArchitecture, selectedModel, selectedCategory],
      ownerId,
      ownerEmail: userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await savePrompt(promptItem);
    setActivePrompt(promptItem);
  };

  const stagesList = [
    { num: 1, name: 'Comprensión' },
    { num: 2, name: 'Preguntas' },
    { num: 3, name: 'Arquitectura' },
    { num: 5, name: 'Construcción' },
    { num: 6, name: 'Auditoría' },
    { num: 8, name: 'Entrega' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Title & Stage Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Motor Central de Creación de Prompts</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Metodología estructurada de 8 etapas con adaptación estricta por modelo.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {stagesList.map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                currentStage === st.num
                  ? 'bg-indigo-600 text-white'
                  : currentStage > st.num
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              <span>{st.num}.</span>
              <span>{st.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col items-center justify-center space-y-3 text-center">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {statusMessage || 'Procesando pipeline de inferencia...'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
            El motor está aplicando análisis estático, adaptación de directivas y verificación de restricciones.
          </p>
        </div>
      )}

      {/* ----------------- STAGE 1: COMPRENSIÓN ----------------- */}
      {!isLoading && currentStage === 1 && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Etapa 1: Descripción Libre de la Necesidad
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Explicá libremente qué querés conseguir. El motor deducirá el objetivo real, el contexto, las restricciones implícitas y los riesgos.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                ¿Qué necesitas que haga tu prompt?
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ejemplo: Necesito un prompt para un agente que revise pull requests de TypeScript, detecte vulnerabilidades OWASP Top 10, sugiera parches de código y rechace el PR si faltan tests unitarios..."
                rows={5}
                className="w-full p-4 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-sans resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Modelo Destino Recomendado / Preferido
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as TargetModel)}
                  className="w-full p-2.5 rounded-xl text-xs font-medium bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MODEL_PROFILES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.vendor} - {m.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Categoría Taxonómica
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as PromptCategory)}
                  className="w-full p-2.5 rounded-xl text-xs font-medium bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TAXONOMY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-400">
                Presiona analizar para transformar en especificación estructurada.
              </span>
              <button
                onClick={handleStage1Comprehend}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                <span>Analizar Necesidad</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- STAGE 2: PREGUNTAS INTELIGENTES ----------------- */}
      {!isLoading && currentStage === 2 && specification && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Etapa 2: Aclaración de Ambigüedades Clave
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                El motor detectó decisiones importantes para refinar la eficacia del prompt sin cuestionarios redundantes.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500">
              Complejidad: {specification.complexity.toUpperCase()}
            </span>
          </div>

          {/* Specification preview */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Especificación deducida:</span>
            </div>
            <p><strong className="text-zinc-600 dark:text-zinc-400">Objetivo Real:</strong> {specification.realGoal}</p>
            <p><strong className="text-zinc-600 dark:text-zinc-400">Resultado Esperado:</strong> {specification.expectedOutcome}</p>
            {specification.assumptions?.length > 0 && (
              <p className="text-zinc-500 italic">
                <strong>Suposiciones automáticas registradas:</strong> {specification.assumptions.join('; ')}
              </p>
            )}
          </div>

          {/* Questions */}
          {questions.length === 0 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ No se detectaron ambigüedades críticas. La solicitud es lo suficientemente precisa para proceder a la arquitectura.
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{q.question}</span>
                  </h4>

                  {q.options && q.options.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            answers[q.id] === opt
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={`O escribir respuesta personalizada (por defecto: ${q.assumptionIfSkipped})`}
                    className="w-full p-2.5 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setCurrentStage(1)}
              className="text-xs text-zinc-500 hover:underline"
            >
              Volver a editar descripción
            </button>

            <button
              onClick={() => setCurrentStage(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
            >
              <span>Continuar a Selección de Arquitectura</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ----------------- STAGE 3: ARQUITECTURA & INVESTIGACIÓN ----------------- */}
      {!isLoading && currentStage === 3 && specification && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Etapa 3 & 4: Arquitectura del Prompt e Investigación
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Selecciona la estructura organizativa más adecuada para la complejidad de la tarea sin sobreingeniería.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'simple', label: 'Prompt Simple', desc: 'Atómico, un solo paso de ejecución sin dependencias complejas.' },
              { id: 'system_prompt', label: 'System Prompt', desc: 'Directivas maestras duraderas de rol, límites y formato.' },
              { id: 'layered', label: 'Capas Jerárquicas', desc: 'Instrucciones primarias, secundarias y reglas de desempate.' },
              { id: 'pipeline', label: 'Pipeline de Pasos', desc: 'Ejecución secuencial por etapas obligatorias.' },
              { id: 'loop_prompt', label: 'Loop Prompt', desc: 'Bucle iterativo con reflexión y condición estricta de parada.' },
              { id: 'agentic', label: 'Arquitectura Agéntica', desc: 'Uso de herramientas, estado, memoria y presupuesto de pasos.' },
              { id: 'multi_agent', label: 'Sistema Multiagente', desc: 'Separación de roles en tándem (ej. Generador + Auditor).' },
              { id: 'eval_guard', label: 'Prompt con Rúbrica Guard', desc: 'Salida con auto-evaluación previa a la emisión.' }
            ].map((arch) => (
              <button
                key={arch.id}
                onClick={() => setSelectedArchitecture(arch.id as PromptArchitecture)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  selectedArchitecture === arch.id
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{arch.label}</span>
                  {selectedArchitecture === arch.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  {arch.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Search Grounding toggle */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-500" />
                <span>Investigación con Google Search Grounding</span>
              </h4>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Consulta fuentes oficiales, papers recientes y repositorios web para enriquecer el prompt con evidencia actual.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableGrounding}
                onChange={(e) => setEnableGrounding(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setCurrentStage(2)}
              className="text-xs text-zinc-500 hover:underline"
            >
              Volver a preguntas
            </button>

            <button
              onClick={handleStage5Construct}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span>Construir y Auditar Prompt (Etapas 5 y 6)</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- STAGE 6, 7 & 8: RESULTADO, AUDITORÍA Y ENTREGA ----------------- */}
      {!isLoading && currentStage === 6 && generatedPrompt && (
        <div className="space-y-6">
          {/* Audit Banner */}
          {auditReport && (
            <div className={`p-5 rounded-2xl border ${
              auditReport.passed 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${auditReport.passed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {auditReport.passed ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base">
                        Auditoría Independiente: {auditReport.score}/100
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-white/40 dark:bg-black/30">
                        Rating Seguridad: {auditReport.securityRating}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mt-0.5">
                      {auditReport.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all disabled:opacity-50"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                    <span>{isOptimizing ? 'Optimizando...' : 'Optimizar Prompt (Etapa 7)'}</span>
                  </button>
                </div>
              </div>

              {/* Findings list */}
              {auditReport.findings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Hallazgos detectados ({auditReport.findings.length}):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {auditReport.findings.map((f) => (
                      <div key={f.id} className="p-2.5 rounded-lg bg-white/60 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] uppercase tracking-wide">
                            [{f.category}]
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            f.type === 'error' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                          }`}>
                            {f.type}
                          </span>
                        </div>
                        <p className="leading-snug">{f.description}</p>
                        <p className="text-[11px] opacity-80 italic">Sugerencia: {f.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Citations if Grounding was active */}
          {citations.length > 0 && (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
              <div className="text-xs font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-500" />
                <span>Fuentes y Citas Web Verificadas (Google Search Grounding):</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {citations.map((c, i) => (
                  <a
                    key={i}
                    href={c.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-zinc-900 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>{c.title || c.uri}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* The Prompt Editor / Code Box */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 bg-zinc-50 dark:bg-zinc-950">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedTitle}
                    onChange={(e) => setGeneratedTitle(e.target.value)}
                    className="font-extrabold text-sm md:text-base text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-500">
                    {selectedModel}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {selectedArchitecture}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                    showToast('¡Prompt copiado al portapapeles con 1 clic!', 'success');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                  title="Copiar prompt"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>

                <button
                  onClick={handleSaveToFirestore}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar en Biblioteca</span>
                </button>

                {/* Export Dropdown */}
                <div className="relative group">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl hidden group-hover:block z-50 p-1 text-xs">
                    <button
                      onClick={() => {
                        const dummyPrompt: PromptItem = {
                          id: 'temp',
                          title: generatedTitle,
                          category: selectedCategory,
                          subcategory: '',
                          targetModel: selectedModel,
                          architecture: selectedArchitecture,
                          content: generatedPrompt,
                          originalInput: userInput,
                          version: 1,
                          status: 'ready',
                          tags: [],
                          ownerId,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        };
                        downloadFile(`${generatedTitle.toLowerCase().replace(/\s+/g, '-')}.md`, exportToMarkdown(dummyPrompt), 'text/markdown');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Markdown (.md)
                    </button>
                    <button
                      onClick={() => {
                        downloadFile(`${generatedTitle.toLowerCase().replace(/\s+/g, '-')}.txt`, generatedPrompt, 'text/plain');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Texto Plano (.txt)
                    </button>
                    <button
                      onClick={() => {
                        const dummyPrompt = { title: generatedTitle, model: selectedModel, content: generatedPrompt, architecture: selectedArchitecture };
                        downloadFile(`${generatedTitle.toLowerCase().replace(/\s+/g, '-')}.json`, JSON.stringify(dummyPrompt, null, 2), 'application/json');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      JSON (.json)
                    </button>
                    <button
                      onClick={() => {
                        const dummyPrompt: any = { title: generatedTitle, content: generatedPrompt, target_model: selectedModel };
                        downloadFile(`${generatedTitle.toLowerCase().replace(/\s+/g, '-')}.yaml`, exportToYaml(dummyPrompt), 'text/yaml');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      YAML (.yaml)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Content Area */}
            <div className="p-4">
              <textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                rows={16}
                className="w-full p-4 rounded-xl text-xs md:text-sm font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 leading-relaxed resize-y select-text"
              />
            </div>
          </div>

          {/* Rationale & Operational Tips */}
          {justification && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200">
                Justificación de Arquitectura ({selectedArchitecture}):
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {justification}
              </p>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setCurrentStage(1);
                setUserInput('');
                setGeneratedPrompt('');
              }}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Diseñar otro prompt desde cero</span>
            </button>

            <button
              onClick={() => {
                // Navigate to laboratory with this prompt in context
                setCurrentView('laboratory');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
            >
              <span>Probar en el Laboratorio (Rúbricas y Casos de Prueba)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
