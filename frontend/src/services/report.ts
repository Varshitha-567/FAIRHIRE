import api from "./api";

export const getReports = async () => {
  const res = await api.get("/reports");
  return res.data;
};

export const createReport = async (data: any) => {
  const res = await api.post("/reports", data);
  return res.data;
};