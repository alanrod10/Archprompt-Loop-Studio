import React, { useState } from 'react';
import { 
  BrainCircuit, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers,
  BookOpen
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
import { TechniqueItem, ValidationStatus, EvidenceType } from '../../types';

export const TechniquesView: React.FC = () => {
  const { techniques, addTechnique, showToast } = useStudio();
  const { ownerId } = useAuth();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueItem | null>(null);

  // New Technique Form
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('avanzados');
  const [newProblem, setNewProblem] = useState<string>('');
  const [newSource, setNewSource] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newStatus, setNewStatus] = useState<ValidationStatus>('experimental');
  const [newEvidence, setNewEvidence] = useState<string>('');
  const [newEvidenceType, setNewEvidenceType] = useState<EvidenceType>('empirical');

  const filtered = techniques.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.problemSolved.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.validationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) {
      showToast('Por favor completa el nombre y descripción de la técnica.', 'error');
      return;
    }

    const tech: TechniqueItem = {
      id: `tech-${Date.now()}`,
      name: newName,
      description: newDesc,
      category: newCategory,
      problemSolved: newProblem || 'Optimización de precisión en inferencia',
      source: newSource || 'Laboratorio Propio',
      url: newUrl || 'https://arxiv.org',
      publicationDate: new Date().toISOString().split('T')[0],
      queryDate: new Date().toISOString().split('T')[0],
      compatibleModels: ['gemini-3.8-flash', 'claude-3-7-sonnet', 'gpt-4o'],
      limitations: 'Requiere validación empírica continua.',
      evidence: newEvidence || 'Pruebas internas en el laboratorio.',
      evidenceType: newEvidenceType,
      validationStatus: newStatus,
      ownerId,
      createdAt: new Date().toISOString()
    };

    await addTechnique(tech);
    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
  };

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'validada':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'experimental':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'propuesta':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'en_revision':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'obsoleta':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            <span>Biblioteca de Técnicas de Prompting ({techniques.length})</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Catálogo de patrones validados, papers científicos, evidencia empírica y estado de validación.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Técnica</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por técnica, problema que resuelve o fuente..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
        >
          <option value="all">Todos los Estados</option>
          <option value="validada">Validada</option>
          <option value="experimental">Experimental</option>
          <option value="propuesta">Propuesta</option>
          <option value="en_revision">En Revisión</option>
          <option value="obsoleta">Obsoleta</option>
        </select>
      </div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((tech) => (
          <div
            key={tech.id}
            onClick={() => setSelectedTechnique(tech)}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/40 transition-all cursor-pointer space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {tech.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {tech.category}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(tech.validationStatus)}`}>
                {tech.validationStatus}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
              {tech.description}
            </p>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
              <div><strong className="text-zinc-700 dark:text-zinc-300">Resuelve:</strong> {tech.problemSolved}</div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="truncate max-w-[200px]">{tech.source}</span>
                <span className="font-mono">{tech.evidenceType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {selectedTechnique.name}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(selectedTechnique.validationStatus)}`}>
                  {selectedTechnique.validationStatus}
                </span>
              </div>
              <button
                onClick={() => setSelectedTechnique(null)}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-zinc-700 dark:text-zinc-300 block mb-1">Descripción de la Técnica:</strong>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {selectedTechnique.description}
                </p>
              </div>

              <div>
                <strong className="text-zinc-700 dark:text-zinc-300 block mb-1">Problema que Resuelve:</strong>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {selectedTechnique.problemSolved}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Fuente / Paper:</strong>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{selectedTechnique.source}</p>
                  {selectedTechnique.url && (
                    <a
                      href={selectedTechnique.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-500 hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      <span>Ver publicación</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Tipo de Evidencia:</strong>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 uppercase font-mono font-semibold">{selectedTechnique.evidenceType}</p>
                  <p className="text-zinc-500 text-[11px] mt-1">{selectedTechnique.evidence}</p>
                </div>
              </div>

              {selectedTechnique.limitations && (
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300 block mb-1">Limitaciones Conocidas:</strong>
                  <p className="text-zinc-500 italic">
                    {selectedTechnique.limitations}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleAddSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Registrar Nueva Técnica de Prompting
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-zinc-500"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre de la Técnica</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Program-Aided Language Models (PAL)"
                  className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Descripción y Mecanismo</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Explica cómo opera la técnica a nivel de contexto y directivas..."
                  className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Estado de Validación</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                  >
                    <option value="experimental">Experimental</option>
                    <option value="validada">Validada</option>
                    <option value="propuesta">Propuesta</option>
                    <option value="en_revision">En Revisión</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Tipo de Evidencia</label>
                  <select
                    value={newEvidenceType}
                    onChange={(e) => setNewEvidenceType(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                  >
                    <option value="scientific">Científica (Paper)</option>
                    <option value="vendor_docs">Documentación del Proveedor</option>
                    <option value="empirical">Experimentación Propia</option>
                    <option value="opinion">Opinión Técnica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Problema que Resuelve</label>
                <input
                  type="text"
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  placeholder="Ej: Errores en razonamiento aritmético multi-paso"
                  className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Fuente / Autores (ej. Gao et al., 2023)"
                  className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                />
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="URL del Paper o Documentación"
                  className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
              >
                Guardar Técnica
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
