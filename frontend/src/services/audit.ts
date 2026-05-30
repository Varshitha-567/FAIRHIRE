import api from "./api";

export const getAudits = async () => {
  const res = await api.get("/audits");
  return res.data;
};

export const createAudit = async (data: any) => {
  const res = await api.post("/audits", data);
  return res.data;
};