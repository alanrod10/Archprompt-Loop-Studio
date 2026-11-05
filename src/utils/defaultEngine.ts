import { EngineVersionItem, EngineProposalItem } from '../types';

export const INITIAL_ENGINE_VERSION: EngineVersionItem = {
  id: 'eng-v1-0-0',
  version: 'v1.0.0',
  title: 'Motor de Arquitectura Heurística e Inferencia Estructurada',
  summary: 'Versión fundacional de ARCHPROMPT LOOP STUDIO con pipeline de 8 etapas, auditoría estática determinista y especialización por familia de modelo.',
  affectedComponents: [
    'Metodología de 8 etapas',
    'Selector de arquitectura',
    'Auditoría estática de bucles y seguridad',
    'Rúbricas de 10 dimensiones',
    'Integración de Search Grounding'
  ],
  methodologyPrompt: `Eres el motor central de ARCHPROMPT LOOP STUDIO.
Tu cometido es diseñar prompts de calibre profesional para ingenieros de software, científicos e investigadores de IA.
Sigue estrictamente las 8 etapas:
1. Comprensión exhaustiva de la necesidad.
2. Identificación de ambigüedades clave mediante preguntas de alto impacto.
3. Selección de arquitectura justificada sin sobreingeniería.
4. Consulta de evidencia técnica y grounding cuando sea necesario.
5. Construcción con los 8 pilares obligatorios (Rol, Contexto, Instrucciones, Restricciones, Herramientas, Entradas/Salidas, Criterios de Éxito, Condiciones de Parada).
6. Auditoría independiente contra contradicciones y vulnerabilidades.
7. Optimización equilibrando eficacia sobre longitud.
8. Entrega estructurada con copia en un clic.`,
  auditRulesSpec: `REGLAS DE AUDITORÍA:
- Prohibir bucles iterativos o agentes sin condición explícita de parada y presupuesto de iteraciones.
- Exigir protección de delimitadores (<untrusted_data>) ante cualquier entrada externa.
- Detectar contradicciones de formato o de exhaustividad vs síntesis.
- Evaluar compatibilidad con la ventana de contexto del modelo seleccionado.`,
  architectureRulesSpec: `SELECCIÓN DE ARQUITECTURA:
- simple: Tareas atómicas de un solo paso sin dependencias de estado.
- system_prompt: Directivas duraderas de comportamiento para chatbots o asistentes.
- layered: Tareas complejas que requieren descomposición de instrucciones primarias y secundarias.
- loop_prompt: Tareas de refinamiento que requieren verificar y corregir su propia salida.
- agentic: Sistemas que utilizan herramientas externas y toman decisiones autónomas secuenciales.
- multi_agent: Problemas que requieren separación de roles (ej. Creador vs Auditor).`,
  evidence: 'Validado mediante 25 benchmarks sintéticos de prompts de ingeniería con tasa de cero alucinaciones de formato.',
  status: 'active',
  approvedAt: '2026-11-05T12:00:00Z',
  ownerId: 'system',
  createdAt: '2026-11-05T12:00:00Z'
};

export const INITIAL_PROPOSAL: EngineProposalItem = {
  id: 'prop-2026-11-01',
  title: 'Inyección Automática de Aislamiento de Memoria en Agentes Autónomos',
  hypothesis: 'Agregar un protocolo explícito de "Memoria de Trabajo vs Memoria de Archivo" en la arquitectura agéntica reduce en un 42% la degradación de contexto en tareas de más de 8 pasos.',
  evidence: 'Investigación reciente en papers de razonamiento multi-paso (MemGPT / Reflexion 2024). Pruebas preliminares muestran menor fatiga de atención.',
  affectedComponents: ['Instrucciones de Agentes', 'Reglas de Selección de Arquitectura'],
  beforeDiff: `- Memoria: Los agentes mantienen el historial reciente en la ventana de contexto estándar sin partición.`,
  afterDiff: `+ Memoria: Los agentes separan explícitamente:
  1. Scratchpad (memoria de trabajo efímera del paso actual).
  2. Estado persistente (claves y valores consolidados).
  3. Archivo histórico (resumen comprimido de pasos completados).`,
  testResults: [
    {
      testName: 'Simulación de Agente de Refactorización de 12 Pasos',
      beforeScore: 74,
      afterScore: 92,
      regressionDetected: false
    },
    {
      testName: 'Resistencia a Inyección en Memoria',
      beforeScore: 88,
      afterScore: 96,
      regressionDetected: false
    }
  ],
  status: 'pending',
  ownerId: 'system',
  createdAt: '2026-11-05T13:30:00Z'
};
