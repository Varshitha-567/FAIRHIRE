import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { getAudits } from '../context/store';
import type { Candidate } from '../types/types';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const PAGE_SIZE = 50;

interface CandidateWithAudit extends Candidate {
  audit_id: number;
}

export function CandidateList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'all' | 'hired' | 'rejected'>('all');
  const [audits, setAudits] = useState<any[]>([]);

  useEffect(() => {
  async function loadAudits() {
    const data = await getAudits();
    setAudits(data);
  }

  loadAudits();
}, []);

  const allCandidates = useMemo<CandidateWithAudit[]>(() => {
  return audits.flatMap((a: any) =>
    (a.candidates || []).map((c: any) => ({
      ...c,
      audit_id: a._id || a.id
    }))
  );
}, [audits]);

  const filtered = useMemo(() => {
    let result = allCandidates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.gender?.toLowerCase().includes(q) ||
          c.region?.toLowerCase().includes(q) ||
          c.education_level?.toLowerCase().includes(q) ||
          c.batch_id.toLowerCase().includes(q) ||
          String(c.id).includes(q)
      );
    }
    if (decisionFilter === 'hired') result = result.filter((c) => c.model_decision);
    if (decisionFilter === 'rejected') result = result.filter((c) => !c.model_decision);
    return result;
  }, [allCandidates, search, decisionFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hiredCount = allCandidates.filter((c) => c.model_decision).length;
  const rejectedCount = allCandidates.length - hiredCount;

  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto px-6 py-8" style={{ maxWidth: '1152px' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#312E81', fontFamily: 'Inter, sans-serif' }}>
              Candidate Database
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: 4 }}>
              All candidates across {audits.length} audit{audits.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/"
            className="rounded-lg px-4 py-2"
            style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Candidates', value: allCandidates.length.toLocaleString(), color: '#312E81' },
            { label: 'Hired', value: hiredCount.toLocaleString(), color: '#16A34A' },
            { label: 'Rejected', value: rejectedCount.toLocaleString(), color: '#DC2626' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, color, fontFamily: 'Inter, sans-serif' }}>
                {value}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <Search
              size={14}
              color="#9CA3AF"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by ID, gender, region, education, batch…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                background: 'white',
                fontSize: '13px',
                color: '#374151',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'hired', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setDecisionFilter(f); setPage(1); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: decisionFilter === f ? '#4F46E5' : '#E5E7EB',
                  background: decisionFilter === f ? '#EEF2FF' : 'white',
                  color: decisionFilter === f ? '#4F46E5' : '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={36} color="#D1D5DB" className="mb-3" />
              <p style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
                No candidates match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['ID', 'Audit', 'Batch', 'Gender', 'Region', 'Education', 'Exp (yrs)', 'Score', 'Decision', 'Date'].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left"
                          style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c, idx) => (
                    <tr
                      key={`${c.audit_id}-${c.id}-${idx}`}
                      style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-2.5">
                        <code style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Courier New' }}>{c.id}</code>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          to={`/audit/${c.audit_id}`}
                          style={{ fontSize: '12px', color: '#4F46E5', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                        >
                          #{c.audit_id}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <code style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'Courier New', background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>
                          {c.batch_id}
                        </code>
                      </td>
                      <td className="px-4 py-2.5" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.gender || '—'}</td>
                      <td className="px-4 py-2.5" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.region || '—'}</td>
                      <td className="px-4 py-2.5" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.education_level || '—'}</td>
                      <td className="px-4 py-2.5" style={{ fontSize: '13px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.years_experience?.toFixed(1) ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <code style={{ fontSize: '12px', color: '#374151', fontFamily: 'Courier New' }}>
                          {c.model_score?.toFixed(2) ?? '—'}
                        </code>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="rounded-full px-2.5 py-0.5"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            fontFamily: 'Inter, sans-serif',
                            background: c.model_decision ? '#F0FDF4' : '#FEF2F2',
                            color: c.model_decision ? '#16A34A' : '#DC2626',
                            border: `1px solid ${c.model_decision ? '#BBF7D0' : '#FECACA'}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {c.model_decision ? 'Hired' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5" style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 disabled:opacity-40"
                style={{ border: '1px solid #E5E7EB', color: '#374151', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
                Page {page} of {totalPages} — {filtered.length.toLocaleString()} total
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 disabled:opacity-40"
                style={{ border: '1px solid #E5E7EB', color: '#374151', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
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
