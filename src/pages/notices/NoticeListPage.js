// admin/src/pages/notices/AdminNoticeListPage.js
import React, { useEffect, useState } from "react";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import {
  adminGetNotices,
  adminCreateNotice,
  adminUpdateNotice,
  adminDeleteNotice,
  adminSetNoticeActive,
} from "../../api/adminNoticeApi";

import { getFileUrl } from './../../utils/fileUrl';

function AdminNoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState({
    serial: "",
    text: "",
    is_active: true,
    file: null, // <-- NEW
  });
  const [saving, setSaving] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  async function loadNotices() {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: 20,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await adminGetNotices(params);
      if (!data.success) {
        setError(data.message || "Failed to load notices.");
        setNotices([]);
        setPagination({ page: 1, page_size: 20, total: 0 });
        return;
      }

      setNotices(data.notices || []);
      setPagination(data.pagination || { page: 1, page_size: 20, total: 0 });
    } catch (err) {
      console.error(err);
      setError("Failed to load notices.");
      setNotices([]);
      setPagination({ page: 1, page_size: 20, total: 0 });
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.total || 0) / (pagination.page_size || 20))
  );
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const formatStatusBadge = (is_active) => {
    if (is_active) {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        Inactive
      </span>
    );
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadNotices();
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setForm({
      serial: "",
      text: "",
      is_active: true,
      file: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setForm({
      serial: notice.serial ?? "",
      text: notice.text || "",
      is_active: notice.is_active === 1,
      file: null, // we don't preload file, only show existing link
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
    setSaving(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        file: files && files.length > 0 ? files[0] : null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      alert("Notice text is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        text: form.text.trim(),
        is_active: form.is_active,
        serial: form.serial === "" ? null : Number(form.serial),
        file: form.file || null,
      };

      if (editingNotice) {
        await adminUpdateNotice(editingNotice.notice_id, payload);
      } else {
        await adminCreateNotice(payload);
      }

      await loadNotices();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save notice.");
      setSaving(false);
    }
  };

  const handleDelete = async (notice) => {
    if (
      !window.confirm(
        `Delete notice #${notice.notice_id}? This cannot be undone.`
      )
    )
      return;

    try {
      await adminDeleteNotice(notice.notice_id);
      await loadNotices();
    } catch (err) {
      console.error(err);
      alert("Failed to delete notice.");
    }
  };

  const handleToggleActive = async (notice) => {
    try {
      await adminSetNoticeActive(notice.notice_id, !notice.is_active);
      await loadNotices();
    } catch (err) {
      console.error(err);
      alert("Failed to update active status.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notices</h1>
          <p className="text-sm text-slate-600">
            Manage the messages that show on the client home hero slider.
          </p>
        </div>
        <Button onClick={openCreateModal}>Add Notice</Button>
      </div>

      {/* Filters */}
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 border shadow-sm text-xs"
        onSubmit={handleFilterSubmit}
      >
        <div className="w-full sm:w-40">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="w-full sm:flex-1">
          <TextInput
            label="Search (text / file path)"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type keyword..."
          />
        </div>

        <Button type="submit" className="h-9 px-4">
          Apply
        </Button>

        <div className="ml-auto text-[11px] text-slate-500">
          Total: {pagination.total || 0} • Page {page} / {totalPages}
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div>Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="rounded-xl border bg-white px-4 py-6 text-xs text-slate-500">
          No notices found.
        </div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Serial</th>
                <th className="px-3 py-2">Text</th>
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notices.map((n) => (
                <tr key={n.notice_id}>
                  <td className="px-3 py-2">{n.serial}</td>
                  <td className="px-3 py-2 max-w-md">
                    <div className="line-clamp-2">{n.text}</div>
                  </td>
                  <td className="px-3 py-2">
                    {n.url ? (
  //                       <a
  //   href={getFileUrl(n.url)}
  //   target="_blank"
  //   rel="noreferrer"
  //   className="text-[11px] text-sky-600 hover:underline"
  // >
  //   Open file
  // </a>

                              <button
                                type="button"
                                className="h-10 w-16 overflow-hidden rounded bg-slate-100 border border-slate-200"
                                onClick={() => setPreviewImageUrl(n.url)}
                                title="Click to view large"
                            >
                                <img
                                //src={`http://localhost:1000${n.url}`}
                                src={getFileUrl(n.url)}
                                alt=""
                                className="h-full w-full object-cover"
                                />
                            </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {formatStatusBadge(n.is_active)}
                  </td>
                  <td className="px-3 py-2">
                    {formatDateTime(n.created_at)}
                  </td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-0.5 text-[11px] hover:bg-slate-100"
                      onClick={() => openEditModal(n)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={
                        "rounded border px-2 py-0.5 text-[11px] " +
                        (n.is_active
                          ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50")
                      }
                      onClick={() => handleToggleActive(n)}
                    >
                      {n.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-300 px-2 py-0.5 text-[11px] text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(n)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <Button
            className="px-3 py-1"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
          >
            Prev
          </Button>
          <Button
            className="px-3 py-1"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg text-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                {editingNotice ? "Edit Notice" : "Create Notice"}
              </div>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSave}>
              <TextInput
                label="Serial (order)"
                name="serial"
                type="number"
                value={form.serial}
                onChange={handleFormChange}
                placeholder="Auto if empty"
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Text
                </label>
                <textarea
                  name="text"
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                  value={form.text}
                  onChange={handleFormChange}
                  placeholder="This text will show in the hero section."
                />
              </div>

              {/* File upload */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Attachment (optional)
                </label>
                {editingNotice && editingNotice.url && (
                  <div className="mb-1 text-[11px]">
                    <span className="text-slate-600 mr-2">
                      Current file:
                    </span>
                    <a
                      href={editingNotice.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 hover:underline"
                    >
                      Open
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  name="file"
                  onChange={handleFormChange}
                  className="w-full text-[11px]"
                />
                <p className="text-[10px] text-slate-500">
                  If you upload a new file, it will replace the existing one.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleFormChange}
                />
                <span>Active</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-[11px]"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <Button type="submit" loading={saving}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Large image preview modal */}
{previewImageUrl && (
  <div
    className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
    onClick={() => setPreviewImageUrl(null)}
  >
    <div
      className="relative max-h-[90vh] max-w-3xl rounded-xl bg-black/90 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-800 shadow hover:bg-white"
        onClick={() => setPreviewImageUrl(null)}
      >
        ✕ Close
      </button>
      <div className="max-h-[80vh] overflow-auto">
        <img
          //src={`http://localhost:1000${previewImageUrl}`}
          src = {getFileUrl(previewImageUrl)}
          alt="Business preview"
          className="block max-h-[80vh] w-auto rounded-md object-contain"
        />
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminNoticeListPage;
