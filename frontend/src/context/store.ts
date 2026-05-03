import api from "../services/api";

export async function getAudits() {
  const res = await api.get("/audits");
  return res.data;
}

export async function getAuditById(id: string | number) {
  const audits = await getAudits();
  return audits.find((a: any) => String(a._id) === String(id));
}

export async function addAudit(audit: any) {
  const res = await api.post("/audits", audit);
  return res.data;
}

export async function deleteAudit(id: string) {
  return await api.delete(`/audits/${id}`);
}

export async function getAllCandidates() {
  const res = await api.get("/candidates");
  return res.data;
}

export function nextId() {
  return Date.now();
}