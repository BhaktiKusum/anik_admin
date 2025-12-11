// admin/src/api/adminReviewApi.js
import api from "../configs/axiosConfig";

// GET /admin/reviews?status=PENDING
export async function adminGetReviews(params = {}) {
  const res = await api.get("/reviews", { params });
  return res.data;
}

// POST /admin/reviews/:id/status
export async function adminUpdateReviewStatus(id, status) {
  const res = await api.post(`/reviews/${id}/status`, { status });
  return res.data;
}

// POST /admin/reviews/:id/approve
export async function adminApproveReview(reviewId) {
  const res = await api.post(`/reviews/${reviewId}/approve`);
  return res.data;
}

// POST /admin/reviews/:id/reject
export async function adminRejectReview(reviewId) {
  const res = await api.post(`/reviews/${reviewId}/reject`);
  return res.data;
}