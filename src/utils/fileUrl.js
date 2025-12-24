// admin/src/utils/fileUrl.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://server.reviewmarketeu.com"

export function getFileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // path like "/uploads/notices/xxx"
  return `${API_BASE_URL}${path}`;
}
