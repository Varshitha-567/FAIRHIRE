import type { AttributeMetrics } from '../types/types';
import { RiskBadge } from './RiskBadge';
import { Users, MapPin, GraduationCap } from 'lucide-react';

interface BiasMetricCardProps {
  metrics: AttributeMetrics;
}

const ATTR_ICONS: Record<string, typeof Users> = {
  gender: Users,
  region: MapPin,
  education_level: GraduationCap,
};

const BAR_COLORS = [
  '#4F46E5',
  '#7C3AED',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
];

export function BiasMetricCard({ metrics }: BiasMetricCardProps) {
  const safeMetrics = metrics || {
    attribute: 'gender',
    label: 'Metrics',
    groups: [],
    disparate_impact: 0,
    statistical_parity_diff: 0,
    risk_level: 'low',
  };

  const Icon = ATTR_ICONS[safeMetrics.attribute] || Users;

  const maxRate = safeMetrics.groups.length
    ? Math.max(...safeMetrics.groups.map((g: any) => g.selection_rate || 0))
    : 1;

  const di = safeMetrics.disparate_impact ?? 0;
  const spd = safeMetrics.statistical_parity_diff ?? 0;

  const diColor = di >= 0.8 ? '#16A34A' : '#DC2626';
  const spdColor = spd <= 0.1 ? '#16A34A' : '#DC2626';

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-4"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: '#EEF2FF' }}
          >
            <Icon size={16} color="#4F46E5" />
          </div>

          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#312E81',
            }}
          >
            {safeMetrics.label}
          </span>
        </div>

        <RiskBadge level={safeMetrics.risk_level as any} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg p-3 text-center border">
          <div>Disparate Impact</div>
          <div style={{ color: diColor }}>{di.toFixed(3)}</div>
        </div>

        <div className="rounded-lg p-3 text-center border">
          <div>Selection Rate Gap</div>
          <div style={{ color: spdColor }}>
            {(spd * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {safeMetrics.groups.map((g: any, i: number) => (
          <div key={g.group} className="flex items-center gap-2">
            <span style={{ width: 72 }}>{g.group}</span>

            <div
              className="flex-1 rounded-full overflow-hidden"
              style={{ height: 8, background: '#F3F4F6' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${((g.selection_rate || 0) / Math.max(maxRate, 0.01)) * 100}%`,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
            </div>

            <span>{((g.selection_rate || 0) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}