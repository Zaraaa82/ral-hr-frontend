import api from "./api";

async function getAllAuditLogs(params = {}) {
  const response = await api.get("/audit-logs", { params });
  return response.data;
}

async function getAuditLogById(logId) {
  const response = await api.get(`/audit-logs/${logId}`);
  return response.data;
}

export const fetchAuditLogsService = getAllAuditLogs;

export { getAllAuditLogs, getAuditLogById };
