import test from 'node:test';
import assert from 'node:assert/strict';
import { exportToMarkdown, exportToTxt, exportToJson, exportToYaml } from './exportUtils.ts';
import { PromptItem } from '../types/index.ts';

const mockPrompt: PromptItem = {
  id: 'test-123',
  title: 'Analizador de Código Seguro',
  category: 'especializados',
  subcategory: 'Seguridad',
  targetModel: 'gemini-3.8-flash',
  architecture: 'system_prompt',
  content: 'Eres un analista de seguridad senior. Revisa vulnerabilidades OWASP Top 10.',
  originalInput: 'Quiero un prompt para auditar seguridad en código.',
  specification: {
    realGoal: 'Auditar vulnerabilidades de software',
    expectedOutcome: 'Reporte estructurado con CWE y mitigación',
    targetModel: 'gemini-3.8-flash',
    context: 'Revisión pre-commit',
    constraints: ['No ejecutar código malicioso', 'Solo análisis estático'],
    complexity: 'alta',
    risks: ['Falsos positivos'],
    toolsNeeded: ['AST parser'],
    requiresResearch: false,
    suggestedArchitecture: 'system_prompt',
    assumptions: ['Código en TypeScript o Python']
  },
  version: 1,
  status: 'ready',
  tags: ['seguridad', 'owasp', 'code-audit'],
  ownerId: 'user-xyz',
  createdAt: '2026-11-05T12:00:00Z',
  updatedAt: '2026-11-05T12:30:00Z'
};

test('exportToMarkdown generates formatted markdown with metadata and code block', () => {
  const md = exportToMarkdown(mockPrompt);
  assert.ok(md.includes('# Analizador de Código Seguro'));
  assert.ok(md.includes('**Modelo Destino:** gemini-3.8-flash'));
  assert.ok(md.includes('```markdown'));
  assert.ok(md.includes(mockPrompt.content));
});

test('exportToTxt generates plain text format with clear dividers', () => {
  const txt = exportToTxt(mockPrompt);
  assert.ok(txt.includes('ARCHPROMPT LOOP STUDIO - EXPORTACIÓN DE PROMPT'));
  assert.ok(txt.includes('Título: Analizador de Código Seguro'));
  assert.ok(txt.includes(mockPrompt.content));
});

test('exportToJson serializes prompt faithfully', () => {
  const jsonStr = exportToJson(mockPrompt);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.id, mockPrompt.id);
  assert.equal(parsed.title, mockPrompt.title);
  assert.equal(parsed.content, mockPrompt.content);
});

test('exportToYaml generates valid key-value yaml structure', () => {
  const yaml = exportToYaml(mockPrompt);
  assert.ok(yaml.includes('title:'));
  assert.ok(yaml.includes('version: 1'));
  assert.ok(yaml.includes('target_model: "gemini-3.8-flash"'));
});
