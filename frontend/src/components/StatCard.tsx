import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: string;
  valueColor?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, sub, valueColor, icon }: StatCardProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-1"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          {label}
        </span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: valueColor || '#312E81', fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
          {sub}
        </div>
      )}
    </div>
  );
}
