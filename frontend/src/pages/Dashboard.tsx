import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import { UploadZone } from '../components/UploadZone';
import { BiasMetricCard } from '../components/BiasMetricCard';
import { FairnessChart } from '../components/FairnessChart';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import { AuditSummaryCard } from '../components/AuditSummaryCard';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { getAudits, deleteAudit } from '../context/store';
import type { BiasAudit } from '../types/types';
import { ShieldCheck, Users, Calendar, TrendingDown } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<BiasAudit[]>([]);
  const [latestAudit, setLatestAudit] = useState<BiasAudit | null>(null);

useEffect(() => {
  async function loadAudits() {
    const data = await getAudits();
    setAudits(data);
    setLatestAudit(data[0] ?? null);
  }

  loadAudits();
}, []);

  const handleAuditComplete = useCallback(async (audit: BiasAudit) => {
  const fresh = await getAudits();
  setAudits(fresh);
  setLatestAudit(fresh[0] ?? audit);
}, []);

  const handleDelete = useCallback(async (id: any) => {
  await deleteAudit(id);
  const fresh = await getAudits();
  setAudits(fresh);
  setLatestAudit(fresh[0] ?? null);
}, []);

  const biasPercent = latestAudit ? Math.round(latestAudit.overall_bias_score * 100) : null;
  const biasColor =
    biasPercent == null
      ? '#374151'
      : biasPercent >= 50
      ? '#DC2626'
      : biasPercent < 10
      ? '#16A34A'
      : '#EA580C';

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      <Toaster richColors position="top-right" />

      <div className="mx-auto px-6 py-8" style={{ maxWidth: '1152px' }}>
        {/* Page heading */}
        <div className="mb-6">
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#312E81', fontFamily: 'Inter, sans-serif' }}>
            FAIRHIRE Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: 4 }}>
            Upload a candidate CSV to audit your AI hiring model for gender, region, and education bias.
          </p>
        </div>

        {/* Demo hint pill */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', fontSize: '12px', color: '#4F46E5', fontWeight: 500 }}
          >
            <ShieldCheck size={13} />
            Demo data pre-loaded — upload your own CSV to run a fresh audit
          </span>
        </div>

        {/* Upload zone */}
        <div className="mb-8">
          <UploadZone onAuditComplete={handleAuditComplete} />
        </div>

        {/* Stats row — show after audit */}
        {latestAudit && (
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Overall Bias Score"
              value={`${biasPercent}%`}
              sub={`1 − avg(DI) across 3 attributes`}
              valueColor={biasColor}
              icon={<TrendingDown size={16} />}
            />
            <StatCard
              label="Risk Level"
              value={<RiskBadge level={latestAudit.risk_level} size="lg" />}
              sub="Based on minimum Disparate Impact"
              icon={<ShieldCheck size={16} />}
            />
            <StatCard
              label="Disparate Impact"
              value={(latestAudit.disparate_impact ?? 0).toFixed(3)}
              sub={(latestAudit.disparate_impact ?? 0) >= 0.8 ? '✓ Above EEOC 0.8 threshold' : '✗ Below EEOC 0.8 threshold'}
              valueColor={(latestAudit.disparate_impact ?? 0) >= 0.8 ? '#16A34A' : '#DC2626'}
              icon={<TrendingDown size={16} />}
            />
            <StatCard
              label="Candidates Audited"
              value={(latestAudit.total_candidates ?? 0).toLocaleString()}
              sub={`Batch: ${latestAudit.batch_id}`}
              icon={<Users size={16} />}
            />
          </div>
        )}

        {/* Bias Metric Cards */}
        {latestAudit && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <BiasMetricCard metrics={latestAudit.gender_metrics} />
            <BiasMetricCard metrics={latestAudit.region_metrics} />
            <BiasMetricCard metrics={latestAudit.education_metrics} />
          </div>
        )}

        {/* Fairness chart */}
        {latestAudit && (
          <div className="mb-6">
            <FairnessChart audit={latestAudit} />
          </div>
        )}

        {/* Recommendations */}
        {latestAudit && (
          <div className="mb-8">
            <RecommendationsPanel
              recommendations={latestAudit.recommendations}
              riskLevel={latestAudit.risk_level}
            />
          </div>
        )}

        {/* Audit History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#312E81', fontFamily: 'Inter, sans-serif' }}>
              Audit History
            </h2>
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
              {audits.length} audit{audits.length !== 1 ? 's' : ''}
            </span>
          </div>

          {audits.length === 0 ? (
            <div
              className="rounded-xl border border-gray-200 bg-white p-10 text-center"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <Calendar size={36} color="#D1D5DB" className="mx-auto mb-3" />
              <p style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
                No audits yet — upload a CSV to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {audits.map((audit) => (
                <AuditSummaryCard
                  key={audit._id || audit.id}
                  audit={audit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}