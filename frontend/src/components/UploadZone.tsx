import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { parseCsvToCandidates, runBiasAnalysis } from '../utils/biasEngine';
import { addAudit, nextId } from '../context/store';
import type { BiasAudit } from '../types/types';
import { toast } from 'sonner';

interface UploadZoneProps {
  onAuditComplete: (audit: BiasAudit) => void;
}

type ZoneState = 'idle' | 'hover' | 'uploading' | 'error';

function generateBatchId() {
  const now = new Date();
  return `BATCH-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export function UploadZone({ onAuditComplete }: UploadZoneProps) {
  const [state, setState] = useState<ZoneState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setErrorMsg('Only .csv files are accepted.');
        setState('error');
        return;
      }
      setState('uploading');
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data;
            if (!rows.length) throw new Error('CSV is empty.');
            const firstRow = rows[0];
            const keys = Object.keys(firstRow).map((k) => k.toLowerCase().trim());
            if (!keys.includes('model_decision')) {
              throw new Error("CSV must contain a 'model_decision' column (0 or 1).");
            }
            // Normalise keys
            const normalised = rows.map((row) => {
              const out: Record<string, string> = {};
              Object.entries(row).forEach(([k, v]) => {
                out[k.toLowerCase().trim()] = v;
              });
              return out;
            });

            const batchId = generateBatchId();
            const auditId = nextId();
            const candidates = parseCsvToCandidates(normalised, batchId);
            if (!candidates.length) throw new Error('No valid rows found.');
            const audit = runBiasAnalysis(candidates, batchId, auditId);

const savedAudit = await addAudit(audit);

setState('idle');

toast.success(
  `Audit complete — ${candidates.length.toLocaleString()} candidates analysed`
);

onAuditComplete(savedAudit);
          } catch (err) {
            setErrorMsg((err as Error).message || 'Failed to process CSV.');
            setState('error');
          }
        },
        error: () => {
          setErrorMsg('Failed to parse CSV file.');
          setState('error');
        },
      });
    },
    [onAuditComplete]
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState('hover');
  };
  const onDragLeave = () => {
    if (state !== 'uploading') setState('idle');
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const bgMap: Record<ZoneState, string> = {
    idle: 'transparent',
    hover: '#EEF2FF',
    uploading: '#F9FAFB',
    error: '#FEF2F2',
  };
  const borderColorMap: Record<ZoneState, string> = {
    idle: '#D1D5DB',
    hover: '#6366F1',
    uploading: '#6366F1',
    error: '#FCA5A5',
  };

  return (
    <div
      className="rounded-xl transition-all cursor-pointer select-none"
      style={{
        border: `2px dashed ${borderColorMap[state]}`,
        background: bgMap[state],
        padding: '40px 24px',
        transform: state === 'hover' ? 'scale(1.01)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => state !== 'uploading' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={onChange}
      />

      <div className="flex flex-col items-center text-center gap-3">
        {state === 'uploading' ? (
          <>
            <div
              className="rounded-full border-4 border-t-indigo-600"
              style={{
                width: 44,
                height: 44,
                borderColor: '#E5E7EB',
                borderTopColor: '#4F46E5',
                animation: 'spin 0.9s linear infinite',
              }}
            />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#4F46E5', fontFamily: 'Inter, sans-serif' }}>
              Running bias analysis...
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
              Computing fairness metrics, DI, SPD, and recommendations
            </p>
          </>
        ) : state === 'error' ? (
          <>
            <AlertCircle size={40} color="#EF4444" />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>
              Upload failed
            </p>
            <p style={{ fontSize: '13px', color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>
              {errorMsg}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setState('idle'); setErrorMsg(''); }}
              className="rounded-lg px-4 py-1.5 text-sm font-medium"
              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontFamily: 'Inter, sans-serif' }}
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 52, height: 52, background: '#EEF2FF' }}
            >
              <Upload size={22} color="#4F46E5" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#312E81', fontFamily: 'Inter, sans-serif' }}>
                Drag & drop your CSV file here
              </p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                or click to browse — accepts <code style={{ fontFamily: 'Courier New', background: '#F3F4F6', padding: '1px 5px', borderRadius: 4 }}>.csv</code> files only
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#4F46E5', fontFamily: 'Inter, sans-serif' }}>
                Required column:
              </span>
              <code style={{ fontSize: '11px', color: '#4F46E5', fontFamily: 'Courier New' }}>model_decision</code>
              <span style={{ fontSize: '11px', color: '#6366F1', fontFamily: 'Inter, sans-serif' }}>(0/1)</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={14} color="#6366F1" />
              <span style={{ fontSize: '12px', color: '#6366F1', fontFamily: 'Inter, sans-serif' }}>
                Optional: gender, region, education_level, years_experience, model_score, actual_outcome
              </span>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
