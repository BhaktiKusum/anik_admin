// admin/src/api/adminUserApi.js
import api from "../configs/axiosConfig";

// GET /admin/users?search=...&status=...&page=1
export async function adminGetUsers(params = {}) {

  const response = await api.get("/users/all_user", { params });
  return response.data; // expect { users: [], total: number }
}

// PUT /admin/users/:user_id
export async function adminUpdateUser(userId, payload) {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data;
}

// POST /admin/users/:user_id/block
export async function adminBlockUser(userId, payload) {

  // payload: { blocked_until: '2025-01-10' } or { days: 7 }
  const response = await api.post(`/users/${userId}/block`, payload);
  return response.data;
}

// NEW: unblock user
export async function adminUnblockUser(userId) {
  const res = await api.post(`/users/${userId}/unblock`);
  return res.data;
}

