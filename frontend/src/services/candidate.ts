import api from "./api";

export const getCandidates = async () => {
  const res = await api.get("/candidates");
  return res.data;
};

export const addCandidate = async (data: any) => {
  const res = await api.post("/candidates", data);
  return res.data;
};