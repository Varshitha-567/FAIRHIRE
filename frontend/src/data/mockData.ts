import type { BiasAudit, Candidate } from '../types/types';

// ─── Deterministic pseudo-random ─────────────────────────────────────────────
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─── Generate 2000-candidate demo dataset matching spec biases ────────────────
function generateCandidates(batchId: string, count = 2000): Candidate[] {
  const rand = seeded(42);
  const genders = ['M', 'F', 'Non-binary'];
  const regions = ['North', 'South', 'East', 'West'];
  const educations = ['HS', 'Bachelor', 'Master', 'PhD'];
  const candidates: Candidate[] = [];

  for (let i = 0; i < count; i++) {
    const gender = genders[Math.floor(rand() * genders.length)];
    const region = regions[Math.floor(rand() * regions.length)];
    const education = educations[Math.floor(rand() * educations.length)];
    const exp = Math.round(rand() * 15 * 10) / 10;

    // Base score
    let score = 0.4 + rand() * 0.35;
    // Intentional biases (matching spec)
    if (gender === 'M') score += 0.18;
    if (gender === 'F') score -= 0.05;
    if (region === 'North') score += 0.1;
    if (region === 'South') score -= 0.15;
    if (education === 'PhD') score += 0.3;
    if (education === 'Master') score += 0.12;
    if (education === 'HS') score -= 0.05;
    score = Math.max(0, Math.min(1, score));

    const threshold = 0.62;
    const decision = score >= threshold;

    candidates.push({
      id: i + 1,
      gender,
      region,
      education_level: education,
      years_experience: exp,
      model_score: Math.round(score * 100) / 100,
      model_decision: decision,
      batch_id: batchId,
      created_at: new Date(Date.now() - (count - i) * 60000).toISOString(),
    });
  }
  return candidates;
}

function generateSmallCandidates(batchId: string, count = 450): Candidate[] {
  const rand = seeded(99);
  const genders = ['M', 'F'];
  const regions = ['North', 'East', 'West'];
  const educations = ['Bachelor', 'Master', 'PhD'];
  const candidates: Candidate[] = [];

  for (let i = 0; i < count; i++) {
    const gender = genders[Math.floor(rand() * genders.length)];
    const region = regions[Math.floor(rand() * regions.length)];
    const education = educations[Math.floor(rand() * educations.length)];
    const exp = Math.round(rand() * 12 * 10) / 10;
    let score = 0.45 + rand() * 0.35;
    if (gender === 'M') score += 0.07;
    if (region === 'North') score += 0.04;
    if (education === 'PhD') score += 0.1;
    if (education === 'Master') score += 0.05;
    score = Math.max(0, Math.min(1, score));
    const decision = score >= 0.65;

    candidates.push({
      id: i + 1,
      gender,
      region,
      education_level: education,
      years_experience: exp,
      model_score: Math.round(score * 100) / 100,
      model_decision: decision,
      batch_id: batchId,
      created_at: new Date(Date.now() - 7 * 24 * 3600000 - (count - i) * 60000).toISOString(),
    });
  }
  return candidates;
}

// Pre-built audit 1 — HIGH/CRITICAL bias (the big demo dataset)
const batch1 = 'BATCH-2026-001';
const cands1 = generateCandidates(batch1, 2000);

const audit1: BiasAudit = {
  id: 1,
  batch_id: batch1,
  overall_bias_score: 0.476,
  risk_level: 'critical',
  gender_metrics: {
    attribute: 'gender',
    label: 'Gender',
    disparate_impact: 0.603,
    statistical_parity_diff: 0.25,
    risk_level: 'high',
    groups: [
      { group: 'M', total: 668, hired: 421, selection_rate: 0.63 },
      { group: 'Non-binary', total: 664, hired: 336, selection_rate: 0.51 },
      { group: 'F', total: 668, hired: 254, selection_rate: 0.38 },
    ],
  },
  region_metrics: {
    attribute: 'region',
    label: 'Region',
    disparate_impact: 0.54,
    statistical_parity_diff: 0.29,
    risk_level: 'high',
    groups: [
      { group: 'North', total: 500, hired: 315, selection_rate: 0.63 },
      { group: 'East', total: 500, hired: 265, selection_rate: 0.53 },
      { group: 'West', total: 500, hired: 230, selection_rate: 0.46 },
      { group: 'South', total: 500, hired: 170, selection_rate: 0.34 },
    ],
  },
  education_metrics: {
    attribute: 'education_level',
    label: 'Education Level',
    disparate_impact: 0.431,
    statistical_parity_diff: 0.41,
    risk_level: 'critical',
    groups: [
      { group: 'PhD', total: 500, hired: 360, selection_rate: 0.72 },
      { group: 'Master', total: 500, hired: 280, selection_rate: 0.56 },
      { group: 'Bachelor', total: 500, hired: 220, selection_rate: 0.44 },
      { group: 'HS', total: 500, hired: 155, selection_rate: 0.31 },
    ],
  },
  disparate_impact: 0.524,
  statistical_parity_diff: 0.317,
  top_biased_features: [
    { attribute: 'Education Level', spd: 0.41, di: 0.431, risk_level: 'critical' },
    { attribute: 'Region', spd: 0.29, di: 0.54, risk_level: 'high' },
    { attribute: 'Gender', spd: 0.25, di: 0.603, risk_level: 'high' },
  ],
  shap_features: [
    { feature: 'years_experience', importance: 0.32 },
    { feature: 'model_score', importance: 0.28 },
    { feature: 'education_level', importance: 0.22 },
    { feature: 'region', importance: 0.12 },
    { feature: 'gender', importance: 0.06 },
  ],
  recommendations: [
    'Suspend all automated decisions affected by Education Level bias immediately. Disparate Impact (0.43) is critically below the EEOC 0.80 threshold.',
    'Conduct an emergency audit of training data for education-correlated patterns and implement adversarial debiasing or fairness constraints.',
    'Apply reweighing or stratified oversampling to correct significant Gender bias (DI = 0.60). This is below the legal EEOC 80% threshold.',
    'Remove or transform gender-correlated proxy features (e.g., names, institution affiliations) from the feature set.',
    'Apply reweighing or stratified oversampling to correct significant Region bias (DI = 0.54). This is below the legal EEOC 80% threshold.',
    'Remove or transform region-correlated proxy features (e.g., zip code, area code) from the feature set.',
  ],
  total_candidates: 2000,
  created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  candidates: cands1,
};

// Pre-built audit 2 — MEDIUM bias (smaller dataset, after some debiasing)
const batch2 = 'BATCH-2026-002';
const cands2 = generateSmallCandidates(batch2, 450);

const audit2: BiasAudit = {
  id: 2,
  batch_id: batch2,
  overall_bias_score: 0.138,
  risk_level: 'medium',
  gender_metrics: {
    attribute: 'gender',
    label: 'Gender',
    disparate_impact: 0.865,
    statistical_parity_diff: 0.082,
    risk_level: 'medium',
    groups: [
      { group: 'M', total: 230, hired: 138, selection_rate: 0.6 },
      { group: 'F', total: 220, hired: 113, selection_rate: 0.514 },
    ],
  },
  region_metrics: {
    attribute: 'region',
    label: 'Region',
    disparate_impact: 0.88,
    statistical_parity_diff: 0.074,
    risk_level: 'medium',
    groups: [
      { group: 'North', total: 155, hired: 96, selection_rate: 0.619 },
      { group: 'East', total: 145, hired: 82, selection_rate: 0.566 },
      { group: 'West', total: 150, hired: 82, selection_rate: 0.547 },
    ],
  },
  education_metrics: {
    attribute: 'education_level',
    label: 'Education Level',
    disparate_impact: 0.826,
    statistical_parity_diff: 0.124,
    risk_level: 'medium',
    groups: [
      { group: 'PhD', total: 148, hired: 103, selection_rate: 0.696 },
      { group: 'Master', total: 152, hired: 95, selection_rate: 0.625 },
      { group: 'Bachelor', total: 150, hired: 87, selection_rate: 0.58 },
    ],
  },
  disparate_impact: 0.857,
  statistical_parity_diff: 0.093,
  top_biased_features: [
    { attribute: 'Education Level', spd: 0.124, di: 0.826, risk_level: 'medium' },
    { attribute: 'Gender', spd: 0.082, di: 0.865, risk_level: 'medium' },
    { attribute: 'Region', spd: 0.074, di: 0.88, risk_level: 'medium' },
  ],
  shap_features: [
    { feature: 'years_experience', importance: 0.38 },
    { feature: 'model_score', importance: 0.31 },
    { feature: 'education_level', importance: 0.14 },
    { feature: 'region', importance: 0.1 },
    { feature: 'gender', importance: 0.07 },
  ],
  recommendations: [
    'Monitor Education Level bias closely (DI = 0.83). Consider applying preprocessing reweighing before the next model retrain.',
    'Monitor Gender bias closely (DI = 0.87). Consider applying preprocessing reweighing before the next model retrain.',
    'Monitor Region bias closely (DI = 0.88). Consider applying preprocessing reweighing before the next model retrain.',
    'Maintain documentation of fairness metrics for compliance and regulatory reporting.',
  ],
  total_candidates: 450,
  created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  candidates: cands2,
};

export const MOCK_AUDITS: BiasAudit[] = [audit1, audit2];
