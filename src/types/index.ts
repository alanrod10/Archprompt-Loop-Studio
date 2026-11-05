export type PromptCategory = 
  | 'fundamentales'
  | 'arquitectura'
  | 'avanzados'
  | 'agenticos'
  | 'especializados';

export type PromptArchitecture = 
  | 'simple'
  | 'system_prompt'
  | 'layered'
  | 'pipeline'
  | 'loop_prompt'
  | 'agentic'
  | 'multi_agent'
  | 'eval_guard';

export type TargetModel = 
  | 'gemini-3.8-flash'
  | 'gemini-4-argon'
  | 'gemini-3.1-flash-lite'
  | 'gpt-4o'
  | 'claude-3-7-sonnet'
  | 'deepseek-r1'
  | 'grok-2'
  | 'openrouter-auto'
  | 'ollama-local'
  | 'mcp-compatible';

export type ValidationStatus = 
  | 'propuesta'
  | 'experimental'
  | 'validada'
  | 'en_revision'
  | 'obsoleta';

export type EvidenceType = 
  | 'scientific'
  | 'vendor_docs'
  | 'empirical'
  | 'opinion';

export interface PromptSpecification {
  realGoal: string;
  expectedOutcome: string;
  targetModel: TargetModel;
  context: string;
  constraints: string[];
  complexity: 'baja' | 'media' | 'alta' | 'critica';
  risks: string[];
  toolsNeeded: string[];
  requiresResearch: boolean;
  suggestedArchitecture: PromptArchitecture;
  assumptions: string[];
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  options?: string[];
  userAnswer?: string;
  assumptionIfSkipped: string;
}

export interface AuditFinding {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'contradiccion' | 'ambiguedad' | 'regla_imposible' | 'incompatibilidad_modelo' | 'vulnerabilidad_seguridad' | 'loop_infinito' | 'consumo_contexto' | 'suposicion_infundada';
  description: string;
  location?: string;
  suggestion: string;
}

export interface AuditReport {
  score: number; // 0 - 100
  passed: boolean;
  summary: string;
  findings: AuditFinding[];
  securityRating: 'A' | 'B' | 'C' | 'D' | 'F';
  tokenEfficiencyScore: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  content: string;
  changesDescription: string;
  auditScore: number;
  ownerId: string;
  createdAt: string;
}

export interface PromptItem {
  id: string;
  title: string;
  category: PromptCategory;
  subcategory: string;
  targetModel: TargetModel;
  architecture: PromptArchitecture;
  content: string;
  originalInput: string;
  specification?: PromptSpecification;
  clarifyingQuestions?: ClarifyingQuestion[];
  audit?: AuditReport;
  version: number;
  status: 'draft' | 'ready' | 'archived' | 'production';
  tags: string[];
  ownerId: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechniqueItem {
  id: string;
  name: string;
  description: string;
  category: string;
  problemSolved: string;
  source: string;
  url: string;
  publicationDate: string;
  queryDate: string;
  compatibleModels: string[];
  limitations: string;
  evidence: string;
  evidenceType: EvidenceType;
  validationStatus: ValidationStatus;
  ownerId: string;
  createdAt: string;
}

export interface GroundingCitation {
  title: string;
  uri: string;
  snippet?: string;
  date?: string;
}

export interface InvestigationItem {
  id: string;
  query: string;
  summary: string;
  citations: GroundingCitation[];
  findings: Array<{
    title: string;
    details: string;
    sourceIndex?: number;
  }>;
  modelUsed: string;
  groundingApplied: boolean;
  ownerId: string;
  createdAt: string;
}

export interface RubricDimension {
  name: string;
  score: number; // 1-10
  feedback: string;
}

export interface TestCase {
  id: string;
  title: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  isAdversarial?: boolean;
  adversarialCategory?: 'injection' | 'jailbreak' | 'exfiltration' | 'privilege_escalation' | 'tool_abuse';
  executionTimeMs?: number;
}

export interface EvaluationItem {
  id: string;
  promptId: string;
  promptTitle: string;
  targetModel: string;
  rubrics: {
    claridad: RubricDimension;
    precision: RubricDimension;
    completitud: RubricDimension;
    coherencia: RubricDimension;
    cumplimientoRestricciones: RubricDimension;
    compatibilidad: RubricDimension;
    robustez: RubricDimension;
    seguridad: RubricDimension;
    eficiencia: RubricDimension;
    verificabilidad: RubricDimension;
  };
  averageScore: number;
  testCases: TestCase[];
  executionStatus: 'completed' | 'pending' | 'error';
  limitations: string;
  ownerId: string;
  createdAt: string;
}

export interface EngineVersionItem {
  id: string;
  version: string;
  title: string;
  summary: string;
  affectedComponents: string[];
  methodologyPrompt: string;
  auditRulesSpec: string;
  architectureRulesSpec: string;
  evidence: string;
  status: 'active' | 'proposed' | 'rejected' | 'superseded';
  approvedAt?: string;
  ownerId: string;
  createdAt: string;
}

export interface EngineProposalItem {
  id: string;
  title: string;
  hypothesis: string;
  evidence: string;
  affectedComponents: string[];
  beforeDiff: string;
  afterDiff: string;
  testResults: Array<{
    testName: string;
    beforeScore: number;
    afterScore: number;
    regressionDetected: boolean;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string;
  createdAt: string;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  status: 'connected' | 'disconnected' | 'configuring' | 'error';
  capabilities: string[];
  limitations: string[];
  requiresApiKey: boolean;
  hasCustomKey: boolean;
  lastChecked?: string;
  latencyMs?: number;
}

export interface UserSettingsItem {
  id: string;
  primaryProvider: string;
  activeModel: string;
  enableGrounding: boolean;
  costControlLimit: number;
  theme: 'dark' | 'light' | 'system';
  ownerId: string;
  updatedAt: string;
}
