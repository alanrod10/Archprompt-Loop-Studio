import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  Sliders,
  DollarSign,
  Key,
  ExternalLink
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
import { ProviderAdapter } from '../../types';
import { downloadFile } from '../../utils/exportUtils';

export const SettingsView: React.FC = () => {
  const { prompts, techniques, evaluations, engineVersions, firestoreConnected, showToast } = useStudio();
  const { userEmail } = useAuth();

  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<Record<string, { status: string; latency?: number; message?: string }>>({
    gemini: { status: 'connected', latency: 180, message: 'Conectado a través del sistema de secretos de Google AI Studio.' }
  });

  const [enableGroundingSetting, setEnableGroundingSetting] = useState<boolean>(true);
  const [costBudgetLimit, setCostBudgetLimit] = useState<number>(10.00);

  const adapters: ProviderAdapter[] = [
    {
      id: 'gemini',
      name: 'Google Gemini (Motor Principal)',
      models: ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-3.1-flash-lite'],
      defaultModel: 'gemini-3.8-flash',
      status: 'connected',
      capabilities: ['Search Grounding', 'Structured JSON', 'Thinking Mode', 'Multimodal'],
      limitations: ['Requiere Gemini API Key inyectada en secretos'],
      requiresApiKey: false,
      hasCustomKey: true
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      models: ['claude-3-7-sonnet', 'claude-3-5-haiku'],
      defaultModel: 'claude-3-7-sonnet',
      status: 'configuring',
      capabilities: ['XML Tags', 'Prompt Caching', 'Razonamiento Híbrido'],
      limitations: ['Requiere clave API de Anthropic independiente'],
      requiresApiKey: true,
      hasCustomKey: false
    },
    {
      id: 'openai',
      name: 'OpenAI / ChatGPT',
      models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
      defaultModel: 'gpt-4o',
      status: 'configuring',
      capabilities: ['Structured Outputs', 'Function Calling', 'JSON Schema'],
      limitations: ['Requiere clave API de OpenAI'],
      requiresApiKey: true,
      hasCustomKey: false
    },
    {
      id: 'ollama',
      name: 'Ollama (Modelos Locales / Offline)',
      models: ['llama3.3', 'qwen2.5-coder', 'deepseek-r1-distill'],
      defaultModel: 'llama3.3',
      status: 'disconnected',
      capabilities: ['Privacidad total', 'Offline', 'Cero Costo de Inferencia'],
      limitations: ['Requiere servidor Ollama en ejecución local (puerto 11434)'],
      requiresApiKey: false,
      hasCustomKey: false
    }
  ];

  const handleTestConnection = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const res = await fetch('/api/providers/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      setProviderStatuses(prev => ({
        ...prev,
        [providerId]: {
          status: data.status,
          latency: data.latencyMs,
          message: data.message
        }
      }));
      showToast(`Prueba de ${providerId}: ${data.status.toUpperCase()}`, 'info');
    } catch (err: any) {
      setProviderStatuses(prev => ({
        ...prev,
        [providerId]: {
          status: 'error',
          message: err.message
        }
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleExportFullBackup = () => {
    const backup = {
      app: 'ARCHPROMPT LOOP STUDIO',
      exportedAt: new Date().toISOString(),
      ownerEmail: userEmail,
      prompts,
      techniques,
      evaluations,
      engineVersions
    };
    downloadFile(`archprompt-backup-${new Date().toISOString().split('T')[0]}.json`, JSON.stringify(backup, null, 2), 'application/json');
    showToast('Copia de seguridad completa descargada.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Configuración del Sistema y Proveedores</span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Adaptadores de Modelos, Costos y Respaldo
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">
          Administra las conexiones a modelos de IA, políticas de presupuesto de tokens, Google Search Grounding y copias de seguridad de datos.
        </p>
      </div>

      {/* Database & Identity Status */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Firebase Cloud Firestore</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                En Línea
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Propietario exclusivo: <span className="font-mono text-indigo-500 font-semibold">{userEmail}</span>. Aislamiento estricto por reglas de seguridad.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportFullBackup}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Backup Completo (JSON)</span>
        </button>
      </div>

      {/* Model Adapters Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span>Adaptadores de Proveedores y Modelos</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adapters.map((adapter) => {
            const statusInfo = providerStatuses[adapter.id];
            const isConnected = statusInfo?.status === 'connected';

            return (
              <div
                key={adapter.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {adapter.name}
                    </h4>
                    <span className="text-xs text-zinc-400 font-mono">
                      {adapter.defaultModel}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {statusInfo?.status || adapter.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-zinc-600 dark:text-zinc-400">
                    <strong>Capacidades:</strong> {adapter.capabilities.join(', ')}
                  </div>
                  <div className="text-zinc-500 text-[11px]">
                    <strong>Limitaciones:</strong> {adapter.limitations.join(', ')}
                  </div>
                </div>

                {statusInfo?.message && (
                  <p className="text-[11px] text-zinc-500 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 font-mono">
                    {statusInfo.message} {statusInfo.latency ? `(${statusInfo.latency}ms)` : ''}
                  </p>
                )}

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    {adapter.id === 'gemini' ? 'Clave de servidor GEMINI_API_KEY activa' : 'Adaptador modular'}
                  </span>

                  <button
                    onClick={() => handleTestConnection(adapter.id)}
                    disabled={testingProvider === adapter.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
                  >
                    {testingProvider === adapter.id ? 'Probando...' : 'Probar Conexión'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Controls & Safety Policies */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>Políticas de Control de Costos y Google Search Grounding</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                Google Search Grounding Bajo Demanda
              </span>
              <p className="text-zinc-500 mt-0.5">
                Solo invocar búsquedas web cuando el usuario lo solicite expresamente o la tarea lo requiera.
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableGroundingSetting}
              onChange={(e) => {
                setEnableGroundingSetting(e.target.checked);
                showToast(`Search Grounding ${e.target.checked ? 'habilitado' : 'desactivado'}.`, 'info');
              }}
              className="accent-indigo-500 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                Tratamiento Estricto de Fuentes Externas (Anti-Inyección)
              </span>
              <p className="text-zinc-500 mt-0.5">
                Cualquier documento o contenido web recuperado se aísla como texto plano no confiable sin privilegios de ejecución.
              </p>
            </div>
            <span className="text-emerald-500 font-bold">Activo Obligatorio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
