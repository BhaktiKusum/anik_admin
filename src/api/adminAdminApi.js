import api from "../configs/axiosConfig";

export async function createSubAdmin(payload) {
  const res = await api.post("/admins", payload);
  return res.data;
}

export async function getAllAdmins() {
  const res = await api.get("/admins");
  return res.data;
}

export async function updateAdminStatus(id, status) {
  const res = await api.post(`/admins/${id}/status`, { status });
  return res.data;
}

export async function adminChangePassword(id, newPassword) {
  const res = await api.post(`/admins/${id}/change-password`, {
    new_password: newPassword,
  });
  return res.data;
}
