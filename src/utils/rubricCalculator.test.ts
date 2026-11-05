import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAverageScore, buildRubricsObject, getEvaluationTier } from './rubricCalculator.ts';

test('buildRubricsObject constructs all 10 standard dimensions clamped between 1 and 10', () => {
  const rubrics = buildRubricsObject({
    claridad: 9,
    precision: 12, // should clamp to 10
    completitud: 8,
    coherencia: 9,
    cumplimientoRestricciones: 10,
    compatibilidad: 8,
    robustez: -2, // should clamp to 1
    seguridad: 9,
    eficiencia: 8,
    verificabilidad: 9
  });

  assert.equal(rubrics.claridad.score, 9);
  assert.equal(rubrics.precision.score, 10);
  assert.equal(rubrics.robustez.score, 1);
  assert.equal(Object.keys(rubrics).length, 10);
});

test('calculateAverageScore computes precise arithmetic mean', () => {
  const rubrics = buildRubricsObject({
    claridad: 8,
    precision: 8,
    completitud: 8,
    coherencia: 8,
    cumplimientoRestricciones: 8,
    compatibilidad: 8,
    robustez: 8,
    seguridad: 8,
    eficiencia: 8,
    verificabilidad: 8
  });

  const avg = calculateAverageScore(rubrics);
  assert.equal(avg, 8.0);
});

test('getEvaluationTier assigns appropriate tier and color metadata', () => {
  const elite = getEvaluationTier(9.2);
  assert.ok(elite.tier.includes('Élite'));

  const advanced = getEvaluationTier(8.1);
  assert.ok(advanced.tier.includes('Avanzado'));

  const deficient = getEvaluationTier(5.0);
  assert.ok(deficient.tier.includes('Deficiente'));
});
