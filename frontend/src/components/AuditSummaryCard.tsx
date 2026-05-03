import { useNavigate } from 'react-router';
import type { BiasAudit } from '../types/types';
import { RiskBadge } from './RiskBadge';
import { Trash2, ExternalLink } from 'lucide-react';

interface AuditSummaryCardProps {
  audit: BiasAudit;
  onDelete: (id: number) => void;
}

export function AuditSummaryCard({ audit, onDelete }: AuditSummaryCardProps) {
  const navigate = useNavigate();
  const biasPercent = Math.round(audit.overall_bias_score * 100);
  const scoreColor =
    biasPercent >= 50 ? '#DC2626' : biasPercent >= 20 ? '#EA580C' : '#16A34A';

  const createdDate = new Date(audit.created_at);
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow cursor-pointer"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')
      }
    >
      {/* Circular score badge */}
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: 52,
          height: 52,
          background: '#F9FAFB',
          border: `3px solid ${scoreColor}`,
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: scoreColor,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {biasPercent}%
        </span>
      </div>

      {/* Middle info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#312E81',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Audit #{audit._id || audit.id}
          </span>
          <RiskBadge level={audit.risk_level} />
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <code
            style={{
              fontSize: '11px',
              color: '#6B7280',
              fontFamily: 'Courier New',
              background: '#F3F4F6',
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {audit.batch_id}
          </code>
          <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
            {(audit.total_candidates ?? 0).toLocaleString()} candidates
          </span>
          <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
            {formattedDate}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
            DI: <span style={{ fontWeight: 600, color: (audit.disparate_impact ?? 0) >= 0.8 ? '#16A34A' : '#DC2626' }}>
              {(audit.disparate_impact ?? 0).toFixed(3)}
            </span>
          </span>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
            SPD: <span style={{ fontWeight: 600, color: '#374151' }}>
              {((audit.statistical_parity_diff ?? 0) * 100).toFixed(1)}%
            </span>
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/audit/${audit._id || audit.id}`); }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
          style={{
            border: '1px solid #4F46E5',
            color: '#4F46E5',
            background: 'transparent',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#EEF2FF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <ExternalLink size={13} />
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete Audit #${audit.id}? This cannot be undone.`)) {
              onDelete(audit._id || audit.id);
            }
          }}
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: 32,
            height: 32,
            border: '1px solid #FCA5A5',
            color: '#EF4444',
            background: 'transparent',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
