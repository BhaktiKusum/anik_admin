// admin/src/api/adminBusinessApi.js
import api from "../configs/axiosConfig";

// GET /admin/businesses
export async function adminGetBusinesses(params = {}) {
  const res = await api.get("/businesses/get_business", { params });

  return res.data;
}

// GET /admin/businesses/:id (business + images)
export async function adminGetBusinessDetail(id) {
  const res = await api.get(`/businesses/get_business_by_id/${id}`);

  return res.data;
}

// POST /admin/businesses
export async function adminCreateBusiness(payload) {
  const res = await api.post("/businesses/business_create", payload);
  return res.data;
}

// PUT /admin/businesses/:id
export async function adminUpdateBusiness(id, payload) {

  const res = await api.put(`/businesses/update_business/${id}`, payload);
  return res.data;
}

// DELETE /admin/businesses/:id
export async function adminDeleteBusiness(id) {
  const res = await api.delete(`/businesses/delete_business_with_img/${id}`);
  return res.data;
}

// POST /admin/businesses/:id/images
export async function adminAddBusinessImage(businessId, { file, sort_order }) {
  const formData = new FormData();
  formData.append("image", file);
  if (sort_order !== undefined && sort_order !== null) {
    formData.append("sort_order", sort_order);
  }

  const res = await api.post(`/businesses/images_upload/${businessId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// PUT /admin/business_images/:imageId
export async function adminUpdateBusinessImage(imageId, { file, sort_order }) {
  const formData = new FormData();
  if (file) {
    formData.append("image", file);
  }
  if (sort_order !== undefined && sort_order !== null) {
    formData.append("sort_order", sort_order);
  }

  const res = await api.put(`/businesses/images_update/${imageId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// DELETE /admin/business_images/:imageId
export async function adminDeleteBusinessImage(imageId) {
  const res = await api.delete(`/businesses/images_delete/${imageId}`);
  return res.data;
}
