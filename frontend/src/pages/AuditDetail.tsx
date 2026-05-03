import { useParams, Link, useNavigate } from 'react-router';
import { useState, useMemo, useEffect } from 'react';
import { getAuditById, deleteAudit } from "../context/store";
import type { RiskLevel } from "../types/types";
import { RiskBadge } from '../components/RiskBadge';
import { BiasMetricCard } from '../components/BiasMetricCard';
import { FairnessChart } from '../components/FairnessChart';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import {
  ArrowLeft,
  Download,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const RISK_BAR_COLORS: Record<RiskLevel, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#22C55E',
};

const PAGE_SIZE = 50;

export function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<any>(null);
  const [candidatePage, setCandidatePage] = useState(1);

  useEffect(() => {
  async function loadAudit() {
    if (!id) return;
    const data = await getAuditById(id);
    setAudit(data);
  }

  loadAudit();
}, [id]);

  const candidates = useMemo(() => {
  if (!audit) return [];

  const allCandidates = audit.candidates || [];

  const start = (candidatePage - 1) * PAGE_SIZE;

  return allCandidates.slice(start, start + PAGE_SIZE);
}, [audit, candidatePage]);

 const totalPages = audit
  ? Math.ceil(((audit.candidates || [])?.length || 0) / PAGE_SIZE)
  : 0;

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FAFB' }}>
        <div className="text-center">
          <p style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            Audit not found.
          </p>
          <Link to="/" style={{ color: '#4F46E5', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const biasPercent = Math.round((audit.overall_bias_score ?? 0) * 100);
  const overallSelectionRate =
    (audit.candidates || []).length > 0
      ? (((audit.candidates || []).filter((c) => c.model_decision).length / audit.candidates.length) * 100).toFixed(1)
      : '—';

  const createdDate = new Date(audit.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // PDF download (print preview)
  const handleDownloadPdf = () => {
    window.print();
  };

  const handleDelete = async () => {
  if (window.confirm(`Delete this audit?`)) {
    await deleteAudit(audit._id || audit.id);
    navigate('/');
  }
};

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto px-6 py-8" style={{ maxWidth: '1152px' }}>
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mb-5"
          style={{ fontSize: '13px', color: '#4F46E5', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#312E81', fontFamily: 'Inter, sans-serif' }}>
              Audit Report #{audit._id || audit.id}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <code
                style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Courier New', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}
              >
                {audit.batch_id}
              </code>
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{createdDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={audit.risk_level} size="lg" />
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 transition-colors"
              style={{
                background: '#4F46E5',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#4338CA')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#4F46E5')}
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 36,
                height: 36,
                border: '1px solid #FCA5A5',
                color: '#EF4444',
                background: 'transparent',
                cursor: 'pointer',
              }}
              title="Delete audit"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Key metrics bar */}
        <div
          className="rounded-xl border border-gray-200 bg-white mb-6 overflow-hidden"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100">
            {[
              {
                label: 'Bias Score',
                value: `${biasPercent}%`,
                color: biasPercent >= 50 ? '#DC2626' : biasPercent < 10 ? '#16A34A' : '#EA580C',
              },
              {
                label: 'Disparate Impact',
                value: (audit.disparate_impact ?? 0).toFixed(3),
                color: (audit.disparate_impact ?? 0) >= 0.8 ? '#16A34A' : '#DC2626',
              },
              {
                label: 'Stat. Parity Diff',
                value: ((audit.statistical_parity_diff ?? 0) * 100).toFixed(1) + '%',
                color: '#374151',
              },
              {
                label: 'Candidates',
                value: (audit.total_candidates ?? 0).toLocaleString(),
                color: '#374151',
              },
              {
                label: 'Overall Hire Rate',
                value: `${overallSelectionRate}%`,
                color: '#374151',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 text-center">
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color, fontFamily: 'Inter, sans-serif' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Bias Metric Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <BiasMetricCard metrics={audit.gender_metrics} />
          <BiasMetricCard metrics={audit.region_metrics} />
          <BiasMetricCard metrics={audit.education_metrics} />
        </div>

        {/* Fairness chart */}
        <div className="mb-6">
          <FairnessChart audit={audit} />
        </div>

        {/* Top Biased Features */}
        <div
          className="rounded-xl border border-gray-200 bg-white p-5 mb-6"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#312E81', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            Top Biased Features — Ranked by SPD
          </h3>
          <div className="flex flex-col gap-3">
            {(audit.top_biased_features || []).map((feat, i) => (
              <div key={feat.attribute} className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 24,
                    height: 24,
                    background: '#EEF2FF',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#4F46E5',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{ width: 120, fontSize: '13px', fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}
                >
                  {feat.attribute}
                </span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: '#F3F4F6' }}>
                  <div
                    className="rounded-full"
                    style={{
                      height: '100%',
                      width: `${feat.spd * 100}%`,
                      background: RISK_BAR_COLORS[feat.risk_level],
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
                <span style={{ width: 50, fontSize: '12px', fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
                  SPD {(feat.spd * 100).toFixed(1)}%
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', width: 40, textAlign: 'right', flexShrink: 0 }}>
                  DI {feat.di.toFixed(2)}
                </span>
                <div className="flex-shrink-0">
                  <RiskBadge level={feat.risk_level} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SHAP Feature Importance */}
        <div
          className="rounded-xl border border-gray-200 bg-white p-5 mb-6"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#312E81', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
            SHAP Global Feature Importance
          </h3>
          <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            Mean |SHAP value| — which features drive model decisions most
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              layout="vertical"
              data={[...(audit.shap_features || [])].reverse()}
              margin={{ top: 0, right: 24, left: 24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 0.4]}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fontSize: 12, fill: '#374151', fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                formatter={(v: number) => [v.toFixed(3), 'Importance']}
                contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}
              />
              <Bar dataKey="importance" fill="#4F46E5" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <RecommendationsPanel
            recommendations={audit.recommendations || []}
            riskLevel={audit.risk_level}
          />
        </div>

        {/* Candidates Table */}
        <div
          className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users size={16} color="#4F46E5" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#312E81', fontFamily: 'Inter, sans-serif' }}>
                Candidates
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
              Showing {(candidatePage - 1) * PAGE_SIZE + 1}–
              {Math.min(candidatePage * PAGE_SIZE, (audit.candidates || []).length)} of{' '}
              {(audit.candidates || []).length.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['ID', 'Gender', 'Region', 'Education', 'Exp (yrs)', 'Score', 'Decision'].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left"
                        style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, idx) => (
                  <tr
                    key={`${c.id}-${idx}`}
                    style={{ borderBottom: '1px solid #F3F4F6' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3">
                      <code style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Courier New' }}>
                        {c.id}
                      </code>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {c.gender || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {c.region || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {c.education_level || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {c.years_experience?.toFixed(1) ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <code style={{ fontSize: '12px', color: '#374151', fontFamily: 'Courier New' }}>
                        {c.model_score?.toFixed(2) ?? '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5"
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'Inter, sans-serif',
                          background: c.model_decision ? '#F0FDF4' : '#FEF2F2',
                          color: c.model_decision ? '#16A34A' : '#DC2626',
                          border: `1px solid ${c.model_decision ? '#BBF7D0' : '#FECACA'}`,
                        }}
                      >
                        {c.model_decision ? 'Hired' : 'Rejected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => setCandidatePage((p) => Math.max(1, p - 1))}
                disabled={candidatePage === 1}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
                style={{ border: '1px solid #E5E7EB', color: '#374151', background: 'transparent', cursor: candidatePage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
                Page {candidatePage} of {totalPages}
              </span>
              <button
                onClick={() => setCandidatePage((p) => Math.min(totalPages, p + 1))}
                disabled={candidatePage === totalPages}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
                style={{ border: '1px solid #E5E7EB', color: '#374151', background: 'transparent', cursor: candidatePage === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
