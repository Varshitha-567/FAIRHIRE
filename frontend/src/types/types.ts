export interface Candidate {
  id: number;
  gender?: string;
  region?: string;
  education_level?: string;
  years_experience?: number;
  model_score?: number;
  model_decision: boolean;
  actual_outcome?: boolean;
  batch_id: string;
  created_at: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface GroupMetrics {
  group: string;
  total: number;
  hired: number;
  selection_rate: number;
}

export interface AttributeMetrics {
  attribute: string;
  label: string;
  disparate_impact: number;
  statistical_parity_diff: number;
  risk_level: RiskLevel;
  groups: GroupMetrics[];
}

export interface BiasedFeature {
  attribute: string;
  spd: number;
  di: number;
  risk_level: RiskLevel;
}

export interface ShapFeature {
  feature: string;
  importance: number;
}

export interface BiasAudit {
  id: number;
  batch_id: string;
  overall_bias_score: number;
  risk_level: RiskLevel;
  gender_metrics: AttributeMetrics;
  region_metrics: AttributeMetrics;
  education_metrics: AttributeMetrics;
  disparate_impact: number;
  statistical_parity_diff: number;
  top_biased_features: BiasedFeature[];
  shap_features: ShapFeature[];
  recommendations: string[];
  total_candidates: number;
  created_at: string;
  candidates: Candidate[];
}
