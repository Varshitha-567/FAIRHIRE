import type { RiskLevel } from '../types/types';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle,
} from 'lucide-react';

interface RecommendationsPanelProps {
  recommendations: string[];
  riskLevel: RiskLevel;
}

const RISK_STYLES: Record<
  RiskLevel,
  {
    bg: string;
    border: string;
    text: string;
    titleColor: string;
    icon: typeof AlertOctagon;
  }
> = {
  critical: {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
    titleColor: '#DC2626',
    icon: AlertOctagon,
  },
  high: {
    bg: '#FFF7ED',
    border: '#FED7AA',
    text: '#9A3412',
    titleColor: '#EA580C',
    icon: AlertTriangle,
  },
  medium: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
    titleColor: '#D97706',
    icon: Info,
  },
  low: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    text: '#14532D',
    titleColor: '#16A34A',
    icon: CheckCircle,
  },
};

const RISK_TITLES: Record<RiskLevel, string> = {
  critical: 'Critical Action Required',
  high: 'High Priority Recommendations',
  medium: 'Recommended Improvements',
  low: 'Monitoring Recommendations',
};

export function RecommendationsPanel({
  recommendations = [],
  riskLevel,
}: RecommendationsPanelProps) {
  const safeLevel = riskLevel || 'low';
  const s = RISK_STYLES[safeLevel];
  const Icon = s.icon;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} color={s.titleColor} />
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: s.titleColor,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {RISK_TITLES[safeLevel]}
        </h3>

        <span
          className="ml-auto rounded-full px-2.5 py-0.5"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: `1px solid ${s.border}`,
            fontSize: '12px',
            fontWeight: 600,
            color: s.titleColor,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {recommendations.length} action
          {recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ol className="flex flex-col gap-3">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 22,
                height: 22,
                background: s.titleColor,
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                marginTop: 1,
              }}
            >
              {i + 1}
            </span>

            <p
              style={{
                fontSize: '13px',
                color: s.text,
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
              }}
            >
              {rec}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}