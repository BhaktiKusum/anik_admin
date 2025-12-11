// admin/src/api/adminWalletAdjustmentApi.js
import api from "../configs/axiosConfig";

export async function adminGetWalletAdjustments(params = {}) {
  const res = await api.get("/wallet_adjustment", { params });
  return res.data; // { success, adjustments, pagination }
}


// export async function adminCreateWalletAdjustment(payload) {
//   const res = await api.post("/wallet-adjustments", payload);
//   return res.data;
// }

export async function adminCreateWalletAdjustment(userId, payload) {
    const res = await api.post(
    `/wallet/${userId}/wallet-adjustment`,
    payload
  );
  // const res = await api.post("/wallet-adjustments", payload);
  return res.data;
}