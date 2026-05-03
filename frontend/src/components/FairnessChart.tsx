import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { BiasAudit } from '../types/types';

interface FairnessChartProps {
  audit: BiasAudit;
}

const COLORS = [
  '#4F46E5',
  '#7C3AED',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
];

export function FairnessChart({ audit }: FairnessChartProps) {
  const gender = audit.gender_metrics || { label: 'Gender', groups: [] };
  const region = audit.region_metrics || { label: 'Region', groups: [] };
  const education = audit.education_metrics || {
    label: 'Education',
    groups: [],
  };

  const attributeGroups = [
    { attr: gender },
    { attr: region },
    { attr: education },
  ];

  const allGroupNames = Array.from(
    new Set(
      attributeGroups.flatMap((a: any) =>
        (a.attr.groups || []).map((g: any) => g.group)
      )
    )
  );

  const data = attributeGroups.map((a: any) => {
    const entry: Record<string, string | number> = {
      attribute: a.attr.label,
    };

    (a.attr.groups || []).forEach((g: any) => {
      entry[g.group] = Number(
        ((g.selection_rate || 0) * 100).toFixed(1)
      );
    });

    return entry;
  });

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="attribute" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="6 3" />

          {allGroupNames.map((group, i) => (
            <Bar
              key={group}
              dataKey={group}
              fill={COLORS[i % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}