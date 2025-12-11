// admin/src/api/adminNoticeApi.js
import api from "../configs/axiosConfig";

// GET /admin/notices
export async function adminGetNotices(params = {}) {
  const res = await api.get("/notices", { params });
  return res.data;
}

// POST /admin/notices  (create)
export async function adminCreateNotice(payload) {
  // payload: { serial?, text, is_active, file? }
  const formData = new FormData();
  if (payload.serial !== "" && payload.serial != null) {
    formData.append("serial", payload.serial);
  }
  formData.append("text", payload.text);
  formData.append("is_active", payload.is_active ? "1" : "0");
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await api.post("/notices", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// PUT /admin/notices/:id  (update)
export async function adminUpdateNotice(id, payload) {
  const formData = new FormData();
  if (payload.serial !== "" && payload.serial != null) {
    formData.append("serial", payload.serial);
  }
  if (payload.text != null) {
    formData.append("text", payload.text);
  }
  if (payload.is_active != null) {
    formData.append("is_active", payload.is_active ? "1" : "0");
  }
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await api.put(`/notices/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// DELETE /admin/notices/:id
export async function adminDeleteNotice(id) {
  const res = await api.delete(`/notices/${id}`);
  return res.data;
}

// POST /admin/notices/:id/active
export async function adminSetNoticeActive(id, is_active) {
  const res = await api.post(`/notices/${id}/active`, {
    is_active,
  });
  return res.data;
}
