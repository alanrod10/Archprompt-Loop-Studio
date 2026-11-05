import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Layers, 
  GitBranch, 
  Edit3, 
  ChevronDown, 
  Archive, 
  Share2, 
  ExternalLink,
  FlaskConical,
  Eye
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { PromptItem, PromptCategory, TargetModel, PromptVersion } from '../../types';
import { TAXONOMY_CATEGORIES, MODEL_PROFILES } from '../../utils/taxonomy';
import { exportToMarkdown, exportToTxt, exportToJson, exportToYaml, downloadFile } from '../../utils/exportUtils';

export const LibraryView: React.FC = () => {
  const { 
    prompts, 
    deletePrompt, 
    duplicatePrompt, 
    updatePrompt, 
    createPromptVersion, 
    getVersionsForPrompt,
    setCurrentView, 
    setActivePrompt,
    showToast 
  } = useStudio();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [inspectPrompt, setInspectPrompt] = useState<PromptItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [versionsModalPrompt, setVersionsModalPrompt] = useState<PromptItem | null>(null);
  const [versionsList, setVersionsList] = useState<PromptVersion[]>([]);
  const [newVersionDescription, setNewVersionDescription] = useState<string>('');

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const matchesModel = selectedModelFilter === 'all' || p.targetModel === selectedModelFilter;

    return matchesSearch && matchesCategory && matchesModel;
  });

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    showToast('Prompt copiado al portapapeles', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${title}" de Firestore?`)) {
      await deletePrompt(id);
    }
  };

  const handleOpenVersions = async (prompt: PromptItem) => {
    setVersionsModalPrompt(prompt);
    const vers = await getVersionsForPrompt(prompt.id);
    setVersionsList(vers);
  };

  const handleCreateNewVersion = async () => {
    if (!versionsModalPrompt) return;
    await createPromptVersion(
      versionsModalPrompt.id,
      versionsModalPrompt.content,
      newVersionDescription || 'Refinamiento manual de instrucciones',
      versionsModalPrompt.audit?.score || 90
    );
    const updated = await getVersionsForPrompt(versionsModalPrompt.id);
    setVersionsList(updated);
    setNewVersionDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>Biblioteca de Prompts ({prompts.length})</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Colección persistente en Firestore clasificada por taxonomía, arquitectura y modelos compatibles.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('create')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Prompt</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, contenido, etiquetas o palabras clave..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="p-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            <option value="all">Todas las Categorías</option>
            {TAXONOMY_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedModelFilter}
            onChange={(e) => setSelectedModelFilter(e.target.value)}
            className="p-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            <option value="all">Todos los Modelos</option>
            {MODEL_PROFILES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-zinc-400" />
          <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
            No se encontraron prompts con los filtros actuales
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Prueba ajustando la búsqueda o crea un nuevo prompt con el asistente guiado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        v{p.version}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {p.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {p.targetModel}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    (p.audit?.score || 90) >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {p.audit?.score || 90} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 line-clamp-4 select-text leading-relaxed">
                  {p.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(p.content, p.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Copiar prompt con 1 clic"
                  >
                    {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setInspectPrompt(p);
                      setIsEditing(false);
                      setEditTitle(p.title);
                      setEditContent(p.content);
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Ver o editar detalles del prompt"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenVersions(p)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Historial de versiones"
                  >
                    <GitBranch className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setActivePrompt(p);
                      setCurrentView('laboratory');
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-cyan-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Evaluar en el Laboratorio"
                  >
                    <FlaskConical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicatePrompt(p)}
                    className="px-2 py-1 rounded text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Duplicar
                  </button>

                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Eliminar de Firestore"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Prompt Modal */}
      {inspectPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex-1 mr-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-sm font-extrabold bg-zinc-50 dark:bg-zinc-950 border border-indigo-500 text-zinc-900 dark:text-zinc-100"
                    placeholder="Título del Prompt"
                  />
                ) : (
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    {inspectPrompt.title}
                  </h3>
                )}
                <span className="text-xs text-zinc-500 block mt-1">
                  Versión v{inspectPrompt.version} • {inspectPrompt.targetModel} • {inspectPrompt.architecture}
                </span>
              </div>
              <button
                onClick={() => {
                  setInspectPrompt(null);
                  setIsEditing(false);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {isEditing ? 'Editar Instrucciones del Prompt:' : 'Contenido del Prompt:'}
                </label>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-zinc-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Prompt</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(inspectPrompt.title);
                        setEditContent(inspectPrompt.content);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await updatePrompt(inspectPrompt.id, {
                          title: editTitle,
                          content: editContent
                        });
                        setInspectPrompt({
                          ...inspectPrompt,
                          title: editTitle,
                          content: editContent
                        });
                        setIsEditing(false);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                )}
              </div>

              <textarea
                value={isEditing ? editContent : inspectPrompt.content}
                onChange={(e) => setEditContent(e.target.value)}
                readOnly={!isEditing}
                rows={12}
                className={`w-full p-3.5 rounded-xl text-xs font-mono leading-relaxed select-text ${
                  isEditing 
                    ? 'bg-zinc-50 dark:bg-zinc-950 border-2 border-indigo-500/50 text-zinc-900 dark:text-zinc-100' 
                    : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}
              />
            </div>

            {inspectPrompt.specification && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <p><strong>Objetivo:</strong> {inspectPrompt.specification.realGoal}</p>
                <p><strong>Resultado Esperado:</strong> {inspectPrompt.specification.expectedOutcome}</p>
                <p><strong>Complejidad:</strong> {inspectPrompt.specification.complexity}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(`${inspectPrompt.title}.md`, exportToMarkdown(inspectPrompt), 'text/markdown')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
                >
                  Exportar MD
                </button>
                <button
                  onClick={() => downloadFile(`${inspectPrompt.title}.json`, exportToJson(inspectPrompt), 'application/json')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => downloadFile(`${inspectPrompt.title}.txt`, exportToTxt(inspectPrompt), 'text/plain')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
                >
                  Exportar TXT
                </button>
              </div>

              <button
                onClick={() => handleCopy(inspectPrompt.content, inspectPrompt.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white"
              >
                Copiar Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionsModalPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Historial de Versiones: {versionsModalPrompt.title}
                </h3>
                <span className="text-xs text-zinc-500">
                  Versión actual activa: v{versionsModalPrompt.version}
                </span>
              </div>
              <button
                onClick={() => setVersionsModalPrompt(null)}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cerrar ✕
              </button>
            </div>

            {/* Create new version form */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                Registrar Nueva Versión Inmutable (v{(versionsModalPrompt.version || 1) + 1}):
              </h4>
              <input
                type="text"
                value={newVersionDescription}
                onChange={(e) => setNewVersionDescription(e.target.value)}
                placeholder="Descripción del cambio (ej: Añadida regla de aislamiento y delimitadores)"
                className="w-full p-2 rounded-lg text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              />
              <button
                onClick={handleCreateNewVersion}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                Confirmar Versión
              </button>
            </div>

            {/* List of past versions */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Versiones Guardadas:
              </h4>
              {versionsList.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">
                  Esta es la versión fundacional v1. Registra cambios para crear hitos en el historial.
                </p>
              ) : (
                <div className="space-y-2">
                  {versionsList.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-500">v{ver.version}</span>
                          <span className="text-zinc-800 dark:text-zinc-200">{ver.changesDescription}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(ver.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          updatePrompt(versionsModalPrompt.id, {
                            content: ver.content,
                            version: ver.version
                          });
                          showToast(`Prompt restaurado a v${ver.version}`, 'info');
                          setVersionsModalPrompt(null);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
