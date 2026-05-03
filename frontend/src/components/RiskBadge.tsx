import type { RiskLevel } from '../types/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'lg';
}

const CONFIG: Record<
  RiskLevel,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  low: {
    label: 'LOW',
    bg: '#F0FDF4',
    text: '#16A34A',
    dot: '#22C55E',
    border: '#BBF7D0',
  },
  medium: {
    label: 'MEDIUM',
    bg: '#FFFBEB',
    text: '#D97706',
    dot: '#F59E0B',
    border: '#FDE68A',
  },
  high: {
    label: 'HIGH',
    bg: '#FFF7ED',
    text: '#EA580C',
    dot: '#F97316',
    border: '#FED7AA',
  },
  critical: {
    label: 'CRITICAL',
    bg: '#FEF2F2',
    text: '#DC2626',
    dot: '#EF4444',
    border: '#FECACA',
  },
};

export function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const c = CONFIG[level] || CONFIG.low;

  const padding = size === 'lg' ? '6px 14px' : '3px 10px';
  const fontSize = size === 'lg' ? '13px' : '11px';
  const dotSize = size === 'lg' ? '8px' : '6px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        borderRadius: '9999px',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  );
}