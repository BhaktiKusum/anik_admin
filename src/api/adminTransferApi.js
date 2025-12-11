// admin/src/api/adminTransferApi.js
import api from "../configs/axiosConfig";

export async function adminGetTransfers(params = {}) {
  const res = await api.get("/transfer", { params });
  return res.data; // { success, transfers, pagination }
}
