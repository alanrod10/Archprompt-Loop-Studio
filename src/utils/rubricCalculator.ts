import { EvaluationItem, RubricDimension } from '../types';

export interface RubricInput {
  claridad: number;
  precision: number;
  completitud: number;
  coherencia: number;
  cumplimientoRestricciones: number;
  compatibilidad: number;
  robustez: number;
  seguridad: number;
  eficiencia: number;
  verificabilidad: number;
  feedbacks?: Record<string, string>;
}

export function calculateAverageScore(rubrics: Record<string, RubricDimension>): number {
  const dimensions = Object.values(rubrics);
  if (dimensions.length === 0) return 0;
  const sum = dimensions.reduce((acc, dim) => acc + (dim.score || 0), 0);
  return Math.round((sum / dimensions.length) * 10) / 10;
}

export function buildRubricsObject(input: RubricInput): EvaluationItem['rubrics'] {
  const clamp = (val: number) => Math.max(1, Math.min(10, Math.round(val)));

  return {
    claridad: {
      name: 'Claridad',
      score: clamp(input.claridad),
      feedback: input.feedbacks?.claridad || (input.claridad >= 8 ? 'Excelente redacción y estructura comprensible.' : 'Mejorar separación de instrucciones y objetivos.')
    },
    precision: {
      name: 'Precisión',
      score: clamp(input.precision),
      feedback: input.feedbacks?.precision || (input.precision >= 8 ? 'Términos y directivas bien delimitadas.' : 'Evitar adjetivos vagos como "buena calidad".')
    },
    completitud: {
      name: 'Completitud',
      score: clamp(input.completitud),
      feedback: input.feedbacks?.completitud || (input.completitud >= 8 ? 'Cubre todos los escenarios esperados y bordes.' : 'Faltan detalles en casos límite o fallos.')
    },
    coherencia: {
      name: 'Coherencia',
      score: clamp(input.coherencia),
      feedback: input.feedbacks?.coherencia || (input.coherencia >= 8 ? 'Sin contradicciones internas.' : 'Revisar instrucciones contrapuestas.')
    },
    cumplimientoRestricciones: {
      name: 'Cumplimiento de Restricciones',
      score: clamp(input.cumplimientoRestricciones),
      feedback: input.feedbacks?.cumplimientoRestricciones || (input.cumplimientoRestricciones >= 8 ? 'Reglas negativas y límites acatados.' : 'Falta rigidez en reglas no negociables.')
    },
    compatibilidad: {
      name: 'Compatibilidad con Modelo',
      score: clamp(input.compatibilidad),
      feedback: input.feedbacks?.compatibilidad || (input.compatibilidad >= 8 ? 'Alineado con las capacidades del modelo destino.' : 'Ajustar para la ventana de contexto o tokens de razonamiento.')
    },
    robustez: {
      name: 'Robustez ante Variaciones',
      score: clamp(input.robustez),
      feedback: input.feedbacks?.robustez || (input.robustez >= 8 ? 'Tolera entradas ruidosas o mal formateadas.' : 'Puede romperse ante entradas inesperadas.')
    },
    seguridad: {
      name: 'Seguridad y Resistencia a Inyección',
      score: clamp(input.seguridad),
      feedback: input.feedbacks?.seguridad || (input.seguridad >= 8 ? 'Protección contra jailbreaks y anulación de sistema.' : 'Vulnerable a bypass por texto no confiable.')
    },
    eficiencia: {
      name: 'Eficiencia de Tokens',
      score: clamp(input.eficiencia),
      feedback: input.feedbacks?.eficiencia || (input.eficiencia >= 8 ? 'Excelente ratio información/tokens.' : 'Reducir redundancias y frases de relleno.')
    },
    verificabilidad: {
      name: 'Verificabilidad de Resultados',
      score: clamp(input.verificabilidad),
      feedback: input.feedbacks?.verificabilidad || (input.verificabilidad >= 8 ? 'Resultados fácilmente auditables y testeables.' : 'Difícil comprobar programáticamente el resultado.')
    }
  };
}

export function getEvaluationTier(averageScore: number): { tier: string; badgeColor: string; description: string } {
  if (averageScore >= 9.0) {
    return { tier: 'Nivel Élite (Producción)', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', description: 'Apto para despliegue crítico en agentes autónomos o sistemas empresariales.' };
  }
  if (averageScore >= 7.5) {
    return { tier: 'Nivel Avanzado (Validado)', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30', description: 'Excelente rendimiento con desviaciones menores tolerables.' };
  }
  if (averageScore >= 6.0) {
    return { tier: 'Nivel Aceptable (En Revisión)', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30', description: 'Requiere ajustes de formato, restricciones o seguridad antes de producción.' };
  }
  return { tier: 'Nivel Deficiente (Rechazado)', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30', description: 'Contiene inconsistencias graves o vulnerabilidades a inyección.' };
}
