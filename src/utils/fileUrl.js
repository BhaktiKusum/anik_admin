// admin/src/utils/fileUrl.js

const API_BASE_URL = process.env.API_BASE_URL

export function getFileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // path like "/uploads/notices/xxx"
  return `${API_BASE_URL}${path}`;
}
