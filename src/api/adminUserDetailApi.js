// admin/src/api/adminUserDetailApi.js
import api from "../configs/axiosConfig";

// Wallet overview + basic user info
export async function adminGetUserWallet(userId) {
  const res = await api.get(`/wallet/${userId}/wallet`);
  return res.data; // { success, user, wallet }
}

// Transfers
export async function adminGetUserTransfers(userId, params = {}) {
  const res = await api.get(`/wallet/${userId}/transfers`, { params });
  return res.data; // { success, transfers, pagination }
}

// Withdraws
export async function adminGetUserWithdraws(userId, params = {}) {
  const res = await api.get(`/wallet/${userId}/withdraws`, { params });
  return res.data; // { success, withdraws, pagination }
}

// Reviews / tasks
export async function adminGetUserReviews(userId, params = {}) {
  const res = await api.get(`/wallet/${userId}/reviews`, { params });
  return res.data; // { success, reviews, pagination }
}

// Referrals
export async function adminGetUserReferrals(userId) {
  const res = await api.get(`/wallet/${userId}/referrals`);
  return res.data; // { success, total_referred, activated_count, total_refer_income, referred_users }
}

// Reset password
export async function adminResetUserPassword(userId, newPassword) {
  const res = await api.post(`/users/${userId}/password`, {
    new_password: newPassword,
  });
  return res.data; // { success, message }
}

// Wallet adjustment (bonus / penalty)
export async function adminAdjustUserWallet(userId, payload) {
  // payload: { type: 'BONUS' | 'PENALTY', amount, note? }
  const res = await api.post(
    `/wallet/${userId}/wallet-adjustment`,
    payload
  );
  return res.data; // { success, message, previous_balance, new_balance }
}

// Wallet adjustments history
export async function adminGetUserWalletAdjustments(userId, params = {}) {
  const res = await api.get(`/wallet/${userId}/wallet-adjustments`, {
    params,
  });
  return res.data; // { success, adjustments, pagination }
}

