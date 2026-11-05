import { PromptCategory, PromptArchitecture, TargetModel } from '../types';

export interface TaxonomyCategoryDef {
  id: PromptCategory;
  name: string;
  description: string;
  badgeColor: string;
  subcategories: string[];
  recommendedArchitectures: PromptArchitecture[];
}

export const TAXONOMY_CATEGORIES: TaxonomyCategoryDef[] = [
  {
    id: 'fundamentales',
    name: 'Fundamentales',
    description: 'Patrones base de un solo paso, roles, directivas cero/pocos disparos y restricciones primarias.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    subcategories: [
      'Zero-shot y Few-shot',
      'Prompts convencionales',
      'Prompts de rol y persona',
      'Prompts especializados',
      'Instrucciones estructuradas',
      'Ejemplos y restricciones no negociables'
    ],
    recommendedArchitectures: ['simple', 'system_prompt']
  },
  {
    id: 'arquitectura',
    name: 'Arquitectura',
    description: 'Estructuración por capas, prompts de desarrollador/sistema, protocolos de herramientas y parametrización.',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    subcategories: [
      'System Prompts jerárquicos',
      'Developer Prompts',
      'User Prompts de entrada estructurada',
      'Instrucciones de herramientas (Function Calling)',
      'Plantillas parametrizadas ({variables})',
      'Prompts multimodales (Visión/Audio)'
    ],
    recommendedArchitectures: ['system_prompt', 'layered', 'pipeline']
  },
  {
    id: 'avanzados',
    name: 'Avanzados',
    description: 'Bucles de autocorrección, reflexión activa, verificación de hipótesis, auditoría y análisis documental.',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    subcategories: [
      'Loop Prompts y autocorrección',
      'Reflexión y verificación paso a paso',
      'Investigación profunda (Deep Research)',
      'Auditoría y Red Teaming',
      'Optimización automática de instrucciones',
      'Evaluación de resultados y Rúbricas',
      'Análisis documental con RAG'
    ],
    recommendedArchitectures: ['loop_prompt', 'eval_guard', 'layered']
  },
  {
    id: 'agenticos',
    name: 'Agénticos',
    description: 'Sistemas autónomos, orquestación multiagente, memoria de estado, llamadas seguras a herramientas y parada estricta.',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    subcategories: [
      'Agentes autónomos de propósito específico',
      'Sistemas multiagente jerárquicos',
      'Planificación, Descomposición y Ejecución',
      'Orquestación y Delegación entre agentes',
      'Gestión de memoria de corto/largo plazo',
      'Uso de herramientas y protocolos MCP',
      'Recuperación ante errores y reintentos',
      'Condiciones de parada y presupuesto estricto'
    ],
    recommendedArchitectures: ['agentic', 'multi_agent', 'loop_prompt']
  },
  {
    id: 'especializados',
    name: 'Especializados',
    description: 'Dominios técnicos verticales: ingeniería de software, SQL, análisis científico, visión y RAG avanzado.',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    subcategories: [
      'Desarrollo de Software y Arquitectura',
      'Python, SQL y Bases de Datos',
      'Ciencia de Datos y Análisis Estadístico',
      'Automatizaciones e Integraciones',
      'Investigación Científica y Literatura',
      'RAG y Documentación Técnica',
      'Escritura Técnica y Profesional',
      'Generación de Multimedia (Imagen/Audio/Video)'
    ],
    recommendedArchitectures: ['system_prompt', 'pipeline', 'eval_guard']
  }
];

export interface ModelProfile {
  id: TargetModel;
  name: string;
  vendor: string;
  badge: string;
  contextWindow: string;
  strengths: string[];
  promptingGuidelines: string[];
}

export const MODEL_PROFILES: ModelProfile[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    vendor: 'Google',
    badge: 'Recomendado General',
    contextWindow: '1M tokens',
    strengths: ['Velocidad ultrarrápida', 'Search Grounding nativo', 'Multimodal', 'Reasoning ThinkingLevel'],
    promptingGuidelines: [
      'Utilizá delimitadores claros para secciones (<instructions>, <context>).',
      'Aprovechá Search Grounding cuando se requiera evidencia actualizada.',
      'Configurá thinkingLevel en lugar de presupuestos obsoletos de temperatura.'
    ]
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    vendor: 'Google',
    badge: 'Máximo Razonamiento',
    contextWindow: '2M tokens',
    strengths: ['Razonamiento matemático profundo', 'Ingeniería compleja', 'Coding de alto calibre'],
    promptingGuidelines: [
      'Permite razonamiento multi-paso sin micro-gestión excesiva.',
      'Ideal para arquitecturas de agentes autónomos y auditoría de seguridad.'
    ]
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    vendor: 'Anthropic',
    badge: 'Razonamiento Híbrido',
    contextWindow: '200K tokens',
    strengths: ['Atención a restricciones complejas', 'Código limpio', 'Redacción matizada'],
    promptingGuidelines: [
      'Excelente con tags XML (<instruction>, <scratchpad>, <output_format>).',
      'Declará ejemplos negativos explícitos ("No hagas...").'
    ]
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    vendor: 'OpenAI',
    badge: 'Multimodal Versátil',
    contextWindow: '128K tokens',
    strengths: ['Instrucciones de sistema directas', 'Structured Outputs JSON', 'Function Calling'],
    promptingGuidelines: [
      'Priorizá System Prompts concisos con esquemas JSON explícitos.',
      'Separa claramente el rol de las herramientas disponibles.'
    ]
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    vendor: 'DeepSeek',
    badge: 'Razonamiento Abierto',
    contextWindow: '128K tokens',
    strengths: ['Cadena de pensamiento exhaustiva', 'Resolución lógica', 'Optimización matemática'],
    promptingGuidelines: [
      'No sobrecargues con directivas de "piensa paso a paso", el modelo ya razona nativamente.',
      'Priorizá la definición precisa del formato final deseado.'
    ]
  },
  {
    id: 'ollama-local',
    name: 'Modelos Locales / Ollama',
    vendor: 'Local / Self-hosted',
    badge: 'Privacidad Total',
    contextWindow: 'Variable (8K - 32K)',
    strengths: ['Offline', 'Cero latencia de red', 'Control de datos sensible'],
    promptingGuidelines: [
      'Mantén los prompts compactos y sin redundancias.',
      'Usa formatos sencillos de texto o JSON simplificado.'
    ]
  },
  {
    id: 'mcp-compatible',
    name: 'Herramientas y Protocolo MCP',
    vendor: 'Model Context Protocol',
    badge: 'Interoperable',
    contextWindow: 'N/A',
    strengths: ['Llamada de herramientas estandarizada', 'Servidores de contexto', 'Seguridad de permisos'],
    promptingGuidelines: [
      'Define schemas de parámetros con tipos estrictos.',
      'Exige validación de confirmación humana para herramientas destructivas.'
    ]
  }
];
