// admin/src/pages/contacts/AdminContactListPage.js
import React, { useEffect, useState } from "react";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import {
  adminGetContacts,
  adminReplyContact,
  adminUpdateContactStatus,
} from "../../api/adminContactApi";
import { useAdminAuth } from "../../hooks/useAdminAuth";

function AdminContactListPage() {
    const {admin} = useAdminAuth()
    const adminId = admin.admin_id;
  const [contacts, setContacts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("OPEN"); // OPEN | RESOLVED | ALL
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeContact, setActiveContact] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  async function loadContacts() {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: 20,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await adminGetContacts(params);
      if (!data.success) {
        setError(data.message || "Failed to load contacts.");
        setContacts([]);
        setPagination({ page: 1, page_size: 20, total: 0 });
        return;
      }

      setContacts(data.contacts || []);
      setPagination(data.pagination || { page: 1, page_size: 20, total: 0 });
    } catch (err) {
      console.error(err);
      setError("Failed to load contacts.");
      setContacts([]);
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

  const formatStatusBadge = (status) => {
    if (status === "RESOLVED") {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        Open
      </span>
    );
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadContacts();
  };

  const openReplyModal = (contact) => {
    setActiveContact(contact);
    setReplyText(contact.reply || "");
  };

  const closeReplyModal = () => {
    setActiveContact(null);
    setReplyText("");
    setSavingReply(false);
  };

  const handleSaveReply = async (markResolved = true) => {
    if (!activeContact) return;
    if (!replyText.trim()) {
      alert("Reply message is required.");
      return;
    }

    try {
      setSavingReply(true);
      await adminReplyContact(activeContact.contact_id, {
        reply: replyText.trim(),
        mark_resolved: markResolved,
      });
      await loadContacts();
      closeReplyModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save reply.");
      setSavingReply(false);
    }
  };

  const handleUpdateStatus = async (contact, nextStatus) => {
    if (
      !window.confirm(
        `Change status to ${nextStatus} for contact #${contact.contact_id}?`
      )
    )
      return;

    try {
      await adminUpdateContactStatus(contact.contact_id, nextStatus, adminId);
      await loadContacts();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const formatType = (type) => {
    if (!type) return "-";
    return type;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Contact Messages
          </h1>
          <p className="text-sm text-slate-600">
            View messages from users and reply. Mark messages as resolved when
            handled.
          </p>
        </div>
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
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ALL">All</option>
          </select>
        </div>

        <div className="w-full sm:flex-1">
          <TextInput
            label="Search (user name / email / phone / message)"
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
        <div>Loading contact messages...</div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border bg-white px-4 py-6 text-xs text-slate-500">
          No contact messages found.
        </div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Message</th>
                
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((c) => (
                <tr key={c.contact_id}>
                  <td className="px-3 py-2">
                    {formatDateTime(c.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {c.user_name || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ID: {c.user_id} • {c.user_email || "-"} •{" "}
                        {c.user_phone || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">{formatType(c.type)}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="line-clamp-3">{c.message}</div>
                  </td>
                  
                  <td className="px-3 py-2">{formatStatusBadge(c.status)}</td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-0.5 text-[11px] hover:bg-slate-100"
                      onClick={() => openReplyModal(c)}
                    >
                      View / Reply
                    </button>
                    {c.status === "OPEN" ? (
                      <button
                        type="button"
                        className="rounded border border-emerald-300 px-2 py-0.5 text-[11px] text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleUpdateStatus(c, "RESOLVED")}
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
                        onClick={() => handleUpdateStatus(c, "OPEN")}
                      >
                        Reopen
                      </button>
                    )}
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

      {/* Reply modal */}
      {activeContact && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg text-xs max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">
                  Reply to contact #{activeContact.contact_id}
                </div>
                <div className="text-[11px] text-slate-500">
                  User: {activeContact.user_name || "-"} (ID:{" "}
                  {activeContact.user_id})
                </div>
              </div>
              <button
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={closeReplyModal}
              >
                ✕
              </button>
            </div>

            <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-semibold text-slate-700 mb-1">
                User Message
              </div>
              <div className="text-[11px] text-slate-700 whitespace-pre-wrap">
                {activeContact.message}
              </div>
              {activeContact.file && (
                <div className="mt-2">
                  <a
                    href={activeContact.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-600 hover:underline"
                  >
                    View attachment
                  </a>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-800 mb-1">
                Admin Reply
              </label>
              <textarea
                rows={5}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply to the user..."
              />
              {activeContact.reply && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Last reply at:{" "}
                  {activeContact.user_id
                    ? formatDateTime(activeContact.user_id)
                    : "-"}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1 text-[11px]"
                onClick={closeReplyModal}
              >
                Cancel
              </button>
              <Button
                type="button"
                className="px-3 py-1"
                loading={savingReply}
                onClick={() => handleSaveReply(false)}
              >
                Save (Keep Open)
              </Button>
              <Button
                type="button"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700"
                loading={savingReply}
                onClick={() => handleSaveReply(true)}
              >
                Reply & Resolve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContactListPage;
