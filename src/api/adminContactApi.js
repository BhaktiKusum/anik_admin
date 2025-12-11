// admin/src/api/adminContactApi.js
import api from "../configs/axiosConfig";

// GET /admin/contacts
export async function adminGetContacts(params = {}) {

  const res = await api.get("/contacts", { params });

  return res.data; // { success, contacts, pagination }
}

// GET /admin/contacts/:id
export async function adminGetContactDetail(contactId) {
  const res = await api.get(`/contacts/${contactId}`);
  return res.data; // { success, contact }
}

// POST /admin/contacts/:id/reply
export async function adminReplyContact(contactId, payload) {
  // payload: { reply_message, mark_resolved?: boolean }
  const res = await api.post(`/contacts/${contactId}/reply`, payload);
  return res.data;
}

// POST /admin/contacts/:id/status
export async function adminUpdateContactStatus(contactId, status, adminId) {
  const res = await api.post(`/contacts/${contactId}/status`, { status, adminId });
  return res.data;
}
