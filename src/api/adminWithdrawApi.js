// admin/src/api/adminWithdrawApi.js
import api from "../configs/axiosConfig";

// List withdraw requests
export async function adminGetWithdraws(params = {}) {
  // params: { status, search, page, page_size }
  const res = await api.get("/withdraw_money", { params });
  return res.data; // { success, withdraws, pagination }
}

// Update status: pending → approved / rejected
export async function adminUpdateWithdrawStatus(id, status) {
  // status: 'pending' | 'approved' | 'rejected'
  const res = await api.post(`/withdraw_money/${id}/status`, { status });
  return res.data;
}
