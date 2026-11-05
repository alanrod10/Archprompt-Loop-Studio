import { PromptItem } from '../types';

export function exportToMarkdown(prompt: PromptItem): string {
  const parts: string[] = [];
  parts.push(`# ${prompt.title}`);
  parts.push(`> **Categoría:** ${prompt.category} | **Subcategoría:** ${prompt.subcategory || 'General'}`);
  parts.push(`> **Modelo Destino:** ${prompt.targetModel} | **Arquitectura:** ${prompt.architecture} | **Versión:** v${prompt.version}`);
  parts.push(`> **Fecha:** ${new Date(prompt.updatedAt || prompt.createdAt).toLocaleString('es-ES')}\n`);

  if (prompt.specification) {
    parts.push(`## Especificación de la Tarea`);
    parts.push(`- **Objetivo Real:** ${prompt.specification.realGoal}`);
    parts.push(`- **Resultado Esperado:** ${prompt.specification.expectedOutcome}`);
    parts.push(`- **Complejidad:** ${prompt.specification.complexity}`);
    if (prompt.specification.constraints?.length) {
      parts.push(`- **Restricciones:**\n  ${prompt.specification.constraints.map(c => `- ${c}`).join('\n  ')}`);
    }
    if (prompt.specification.toolsNeeded?.length) {
      parts.push(`- **Herramientas:** ${prompt.specification.toolsNeeded.join(', ')}`);
    }
    parts.push('');
  }

  parts.push(`## Contenido del Prompt`);
  parts.push('```markdown');
  parts.push(prompt.content);
  parts.push('```\n');

  if (prompt.audit) {
    parts.push(`## Auditoría Estática (Puntuación: ${prompt.audit.score}/100)`);
    parts.push(`- **Rating de Seguridad:** ${prompt.audit.securityRating}`);
    parts.push(`- **Eficiencia de Contexto:** ${prompt.audit.tokenEfficiencyScore}/100`);
    parts.push(`- **Resumen:** ${prompt.audit.summary}`);
    if (prompt.audit.findings.length > 0) {
      parts.push(`### Hallazgos:`);
      prompt.audit.findings.forEach(f => {
        parts.push(`- **[${f.type.toUpperCase()} / ${f.category}]**: ${f.description}`);
        parts.push(`  *Sugerencia:* ${f.suggestion}`);
      });
    }
  }

  return parts.join('\n');
}

export function exportToTxt(prompt: PromptItem): string {
  return [
    `================================================================================`,
    `ARCHPROMPT LOOP STUDIO - EXPORTACIÓN DE PROMPT`,
    `================================================================================`,
    `Título: ${prompt.title}`,
    `Versión: v${prompt.version}`,
    `Modelo: ${prompt.targetModel}`,
    `Arquitectura: ${prompt.architecture}`,
    `Categoría: ${prompt.category}`,
    `Fecha: ${prompt.updatedAt || prompt.createdAt}`,
    `--------------------------------------------------------------------------------`,
    `INSTRUCCIONES / CONTENIDO DEL PROMPT:`,
    `--------------------------------------------------------------------------------`,
    prompt.content,
    `================================================================================`
  ].join('\n');
}

export function exportToJson(prompt: PromptItem): string {
  return JSON.stringify(prompt, null, 2);
}

export function exportToYaml(prompt: PromptItem): string {
  const sanitize = (str: string) => {
    if (str.includes('\n') || str.includes(':') || str.includes('"')) {
      return `|\n    ${str.split('\n').join('\n    ')}`;
    }
    return `"${str.replace(/"/g, '\\"')}"`;
  };

  const lines: string[] = [
    `title: ${sanitize(prompt.title)}`,
    `version: ${prompt.version}`,
    `category: ${prompt.category}`,
    `target_model: "${prompt.targetModel}"`,
    `architecture: "${prompt.architecture}"`,
    `status: "${prompt.status}"`,
    `created_at: "${prompt.createdAt}"`,
    `tags: [${(prompt.tags || []).map(t => `"${t}"`).join(', ')}]`,
    `content: ${sanitize(prompt.content)}`
  ];

  if (prompt.specification) {
    lines.push(`specification:`);
    lines.push(`  real_goal: ${sanitize(prompt.specification.realGoal)}`);
    lines.push(`  expected_outcome: ${sanitize(prompt.specification.expectedOutcome)}`);
    lines.push(`  complexity: "${prompt.specification.complexity}"`);
  }

  return lines.join('\n');
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
