import type {
  Candidate,
  AttributeMetrics,
  GroupMetrics,
  RiskLevel,
  BiasedFeature,
  ShapFeature,
  BiasAudit,
} from '../types/types';

// ─── Risk Level ───────────────────────────────────────────────────────────────

export function getRiskLevel(di: number): RiskLevel {
  if (di >= 0.9) return 'low';
  if (di >= 0.8) return 'medium';
  if (di >= 0.5) return 'high';
  return 'critical';
}

// ─── Attribute Metrics ────────────────────────────────────────────────────────

function computeAttributeMetrics(
  candidates: Candidate[],
  attribute: keyof Pick<Candidate, 'gender' | 'region' | 'education_level'>,
  label: string
): AttributeMetrics {
  const groups: Record<string, { total: number; hired: number }> = {};

  for (const c of candidates) {
    const val = (c[attribute] as string | undefined) || 'Unknown';
    if (!groups[val]) groups[val] = { total: 0, hired: 0 };
    groups[val].total++;
    if (c.model_decision) groups[val].hired++;
  }

  const groupMetrics: GroupMetrics[] = Object.entries(groups).map(
    ([group, { total, hired }]) => ({
      group,
      total,
      hired,
      selection_rate: total > 0 ? hired / total : 0,
    })
  );

  const rates = groupMetrics.map((g) => g.selection_rate);
  const minRate = rates.length ? Math.min(...rates) : 0;
  const maxRate = rates.length ? Math.max(...rates) : 1;

  const di = maxRate > 0 ? minRate / maxRate : 1;
  const spd = maxRate - minRate;
  const risk_level = getRiskLevel(di);

  return {
    attribute,
    label,
    disparate_impact: di,
    statistical_parity_diff: spd,
    risk_level,
    groups: groupMetrics.sort((a, b) => b.selection_rate - a.selection_rate),
  };
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function generateRecommendations(
  gm: AttributeMetrics,
  rm: AttributeMetrics,
  em: AttributeMetrics
): string[] {
  const recs: string[] = [];
  // Critical
  [
    { name: 'Gender', m: gm },
    { name: 'Region', m: rm },
    { name: 'Education', m: em },
  ].forEach(({ name, m }) => {
    if (m.risk_level === 'critical') {
      recs.push(
        `Suspend all automated decisions affected by ${name} bias immediately. Disparate Impact (${m.disparate_impact.toFixed(2)}) is critically below the EEOC 0.80 threshold.`
      );
      recs.push(
        `Conduct an emergency audit of training data for ${name.toLowerCase()}-correlated patterns and implement adversarial debiasing or fairness constraints.`
      );
    }
  });
  // High
  [
    { name: 'Gender', m: gm },
    { name: 'Region', m: rm },
    { name: 'Education', m: em },
  ].forEach(({ name, m }) => {
    if (m.risk_level === 'high') {
      recs.push(
        `Apply reweighing or stratified oversampling to correct significant ${name} bias (DI = ${m.disparate_impact.toFixed(2)}). This is below the legal EEOC 80% threshold.`
      );
      recs.push(
        `Remove or transform ${name.toLowerCase()}-correlated proxy features (e.g., zip code, school name) from the feature set.`
      );
    }
  });
  // Medium
  [
    { name: 'Gender', m: gm },
    { name: 'Region', m: rm },
    { name: 'Education', m: em },
  ].forEach(({ name, m }) => {
    if (m.risk_level === 'medium') {
      recs.push(
        `Monitor ${name} bias closely (DI = ${m.disparate_impact.toFixed(2)}). Consider applying preprocessing reweighing before the next model retrain.`
      );
    }
  });
  // Low / no issues
  if (recs.length === 0) {
    recs.push(
      'Model meets all EEOC fairness thresholds. Continue regular monitoring every 3 months.'
    );
    recs.push(
      'Maintain documentation of fairness metrics for compliance and regulatory reporting.'
    );
    recs.push(
      'Consider expanding protected attributes to include age, disability, and veteran status in future audits.'
    );
  }
  return recs;
}

// ─── SHAP Mock ────────────────────────────────────────────────────────────────

function generateShapFeatures(
  gm: AttributeMetrics,
  rm: AttributeMetrics,
  em: AttributeMetrics
): ShapFeature[] {
  const features: ShapFeature[] = [
    { feature: 'years_experience', importance: 0.32 },
    { feature: 'model_score', importance: 0.28 },
    { feature: 'education_level', importance: em.statistical_parity_diff * 0.8 + 0.05 },
    { feature: 'region', importance: rm.statistical_parity_diff * 0.7 + 0.03 },
    { feature: 'gender', importance: gm.statistical_parity_diff * 0.9 + 0.02 },
  ];
  return features.sort((a, b) => b.importance - a.importance);
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export function runBiasAnalysis(
  candidates: Candidate[],
  batchId: string,
  auditId: number
): BiasAudit {
  const genderMetrics = computeAttributeMetrics(candidates, 'gender', 'Gender');
  const regionMetrics = computeAttributeMetrics(candidates, 'region', 'Region');
  const educationMetrics = computeAttributeMetrics(
    candidates,
    'education_level',
    'Education Level'
  );

  const avgDI =
    (genderMetrics.disparate_impact +
      regionMetrics.disparate_impact +
      educationMetrics.disparate_impact) /
    3;
  const avgSPD =
    (genderMetrics.statistical_parity_diff +
      regionMetrics.statistical_parity_diff +
      educationMetrics.statistical_parity_diff) /
    3;

  const overall_bias_score = 1 - avgDI;
  const minDI = Math.min(
    genderMetrics.disparate_impact,
    regionMetrics.disparate_impact,
    educationMetrics.disparate_impact
  );
  const risk_level = getRiskLevel(minDI);

  const top_biased_features: BiasedFeature[] = [
    {
      attribute: 'Gender',
      spd: genderMetrics.statistical_parity_diff,
      di: genderMetrics.disparate_impact,
      risk_level: genderMetrics.risk_level,
    },
    {
      attribute: 'Region',
      spd: regionMetrics.statistical_parity_diff,
      di: regionMetrics.disparate_impact,
      risk_level: regionMetrics.risk_level,
    },
    {
      attribute: 'Education Level',
      spd: educationMetrics.statistical_parity_diff,
      di: educationMetrics.disparate_impact,
      risk_level: educationMetrics.risk_level,
    },
  ].sort((a, b) => b.spd - a.spd);

  const recommendations = generateRecommendations(
    genderMetrics,
    regionMetrics,
    educationMetrics
  );
  const shap_features = generateShapFeatures(genderMetrics, regionMetrics, educationMetrics);

  return {
    id: auditId,
    batch_id: batchId,
    overall_bias_score,
    risk_level,
    gender_metrics: genderMetrics,
    region_metrics: regionMetrics,
    education_metrics: educationMetrics,
    disparate_impact: avgDI,
    statistical_parity_diff: avgSPD,
    top_biased_features,
    shap_features,
    recommendations,
    total_candidates: candidates.length,
    created_at: new Date().toISOString(),
    candidates,
  };
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

export function parseCsvToCandidates(
  rows: Record<string, string>[],
  batchId: string
): Candidate[] {
  return rows
    .filter((r) => r.model_decision !== undefined && r.model_decision !== '')
    .map((row, idx) => {
      const normalise = (k: string) =>
        row[k] !== undefined && row[k] !== '' ? row[k].trim() : undefined;

      return {
        id: idx + 1,
        gender: normalise('gender'),
        region: normalise('region'),
        education_level: normalise('education_level'),
        years_experience: row.years_experience ? parseFloat(row.years_experience) : undefined,
        model_score: row.model_score ? parseFloat(row.model_score) : undefined,
        model_decision: parseInt(row.model_decision) === 1,
        actual_outcome:
          row.actual_outcome !== undefined && row.actual_outcome !== ''
            ? parseInt(row.actual_outcome) === 1
            : undefined,
        batch_id: batchId,
        created_at: new Date().toISOString(),
      };
    });
}