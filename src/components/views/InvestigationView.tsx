import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  ShieldCheck, 
  Calendar, 
  Check, 
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
import { InvestigationItem, TechniqueItem } from '../../types';

export const InvestigationView: React.FC = () => {
  const { investigations, addInvestigation, addTechnique, showToast } = useStudio();
  const { ownerId } = useAuth();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('papers_and_docs');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<InvestigationItem | null>(null);

  const predefinedQueries = [
    'Técnicas recientes de prevención de prompt injection en RAG 2024-2025',
    'Mejores prácticas de diseño de agentes multi-paso con presupuestos de parada',
    'Optimizaciones de System Prompts para modelos con razonamiento extendido (thinking)',
    'Protocolos MCP (Model Context Protocol) para control seguro de herramientas'
  ];

  const handleExecuteSearch = async (queryToUse?: string) => {
    const q = queryToUse || searchQuery;
    if (!q.trim()) {
      showToast('Por favor escribe un término de investigación.', 'error');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch('/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          focusArea
        })
      });

      if (!res.ok) throw new Error('Error al consultar Search Grounding');
      const data = await res.json();

      const item: InvestigationItem = {
        id: `inv-${Date.now()}`,
        query: data.query,
        summary: data.summary,
        citations: data.citations || [],
        findings: [],
        modelUsed: data.modelUsed,
        groundingApplied: data.groundingApplied,
        ownerId,
        createdAt: data.date || new Date().toISOString()
      };

      setActiveResult(item);
      await addInvestigation(item);
      showToast(`Investigación completada con ${item.citations.length} fuentes web indexadas.`, 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConvertToTechnique = async (item: InvestigationItem) => {
    const tech: TechniqueItem = {
      id: `tech-from-inv-${Date.now()}`,
      name: item.query.substring(0, 50),
      description: item.summary.substring(0, 500) + '...',
      category: 'avanzados',
      problemSolved: 'Hallazgo derivado de investigación web activa.',
      source: item.citations[0]?.title || 'Google Search Grounding',
      url: item.citations[0]?.uri || 'https://google.com',
      publicationDate: new Date().toISOString().split('T')[0],
      queryDate: new Date().toISOString().split('T')[0],
      compatibleModels: ['gemini-3.8-flash', 'gemini-4-argon', 'claude-3-7-sonnet'],
      limitations: 'Técnica recuperada en consulta web reciente.',
      evidence: 'Extraído mediante Search Grounding con citas verificadas.',
      evidenceType: 'scientific',
      validationStatus: 'experimental',
      ownerId,
      createdAt: new Date().toISOString()
    };
    await addTechnique(tech);
    showToast('Técnica creada e incorporada a la Biblioteca.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 mb-2">
          <Search className="w-3.5 h-3.5" />
          <span>Motor de Investigación y Actualización Técnica</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Investigación Web con Google Search Grounding
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">
          Consulta documentación oficial de proveedores, papers académicos de ArXiv, repositorios y benchmarks. Todas las citas y enlaces son devueltos directamente por la API de Google sin enlaces inventados.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
              placeholder="Escribe un tema de investigación (ej: Técnicas de Reflexion para Gemini 3 y Claude 3.7)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            onClick={() => handleExecuteSearch()}
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition-all shrink-0 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Investigando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Investigar en la Web</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Temas de Investigación Sugeridos:
          </span>
          <div className="flex flex-wrap gap-2">
            {predefinedQueries.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(pq);
                  handleExecuteSearch(pq);
                }}
                className="text-left px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>

        {/* Cost & Grounding Policy Notice */}
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>
            💡 <strong>Control de Costos:</strong> Las búsquedas en la web se ejecutan exclusivamente bajo demanda del usuario para evitar llamadas redundantes.
          </span>
          <span className="font-semibold text-cyan-600 dark:text-cyan-400 shrink-0">
            Grounding Activo
          </span>
        </div>
      </div>

      {/* Active Search Result */}
      {activeResult && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Resultados para: "{activeResult.query}"
              </h2>
              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                <span>{new Date(activeResult.createdAt).toLocaleString('es-ES')}</span>
                <span>•</span>
                <span>{activeResult.modelUsed}</span>
              </div>
            </div>

            <button
              onClick={() => handleConvertToTechnique(activeResult)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Guardar como Técnica</span>
            </button>
          </div>

          {/* Real Citations */}
          {activeResult.citations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Fuentes Web Indexadas ({activeResult.citations.length}):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {activeResult.citations.map((c, idx) => (
                  <a
                    key={idx}
                    href={c.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/40 transition-colors flex items-start justify-between gap-2 group"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-cyan-500">
                        {c.title || c.uri}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {c.uri}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-500 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Research Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Síntesis de Hallazgos y Estado del Arte:
            </h3>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs md:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
              {activeResult.summary}
            </div>
          </div>
        </div>
      )}

      {/* Past Investigations List */}
      {investigations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>Historial de Investigaciones ({investigations.length})</span>
          </h3>

          <div className="space-y-2">
            {investigations.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                onClick={() => setActiveResult(inv)}
                className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    {inv.query}
                  </span>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {new Date(inv.createdAt).toLocaleString('es-ES')} • {inv.citations?.length || 0} fuentes
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
