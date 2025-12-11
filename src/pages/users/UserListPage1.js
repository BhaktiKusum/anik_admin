// admin/src/pages/users/UserListPage.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import {
  adminGetUsers,
  adminUpdateUser,
  adminBlockUser,
} from "../../api/adminUserApi";

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    status: "",
    refer_id: "",
    refer_by: "",
  });

  const [blockUserId, setBlockUserId] = useState(null);
  const [blockDays, setBlockDays] = useState("");
  const [blockReason, setBlockReason] = useState("")

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await adminGetUsers({
        search: search || undefined,
        status: statusFilter || undefined,
      });

      const total = Object.keys(data.users).length;

      setUsers(data.users || []);
      setTotal(total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      country: user.country || "",
      status: user.status || "",
      refer_id: user.refer_id || "",
      refer_by: user.refer_by || "",
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaving(true);

      await adminUpdateUser(editingUser.user_id, editForm);
      closeEditModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const openBlockModal = (userId) => {
    setBlockUserId(userId);
    setBlockDays("");
    setBlockReason("")
  };

  const closeBlockModal = () => {
    setBlockUserId(null);
    setBlockDays("");
    setBlockReason("")
  };

  const submitBlock = async (e) => {
    e.preventDefault();
    if (!blockUserId) return;
    const days = parseInt(blockDays, 10);
    const reason = blockReason
    if (!days || days <= 0) {
      alert("Please enter valid days.");
      return;
    }

    try {
      setSaving(true);
      await adminBlockUser(blockUserId, { days, reason });
      closeBlockModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to block user.");
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-slate-600">
          Search users, update information, and block accounts for a period.
        </p>
      </div>

      {/* Filters */}
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 border shadow-sm text-xs"
        onSubmit={handleSearchSubmit}
      >
        <div className="w-full sm:w-64">
          <TextInput
            label="Search (id, name, email, phone)"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type keyword..."
          />
        </div>

        {/* <div className="w-full sm:w-64">
          <TextInput
            label="Search (refer_by)"
            name="refer_by"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type keyword..."
          />
        </div>

        <div className="w-full sm:w-64">
          <TextInput
            label="Search (refer_id)"
            name="refer_id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type keyword..."
          />
        </div> */}

        <div className="w-full sm:w-40">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="">All</option>
            <option value="1">New Account</option>
            <option value="2">Activated Account</option>
            <option value="3">Bronze Account</option>
            <option value="4">Silver Account</option>
            <option value="5">Gold Account</option>
          </select>
        </div>

        <Button type="submit" className="h-9 px-4">
          Apply
        </Button>

        <div className="ml-auto text-[11px] text-slate-500">
          Total: <span className="font-semibold">{total}</span> users
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">User Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Refer ID</th>
                <th className="px-3 py-2">Refer By</th>
                <th className="px-3 py-2">Referrer User Name</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.user_id}>
                  
                  <td className="px-3 py-2">
  <Link
    to={`/admin/users/${u.user_id}`}
    className="font-medium text-slate-800 hover:underline"
  >
    {u.name}
  </Link>
</td>

                <td className="px-3 py-2 font-mono text-[11px]">
                    {u.user_name}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {u.phone}
                  </td>
                  <td className="px-3 py-2">{u.status_level}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {u.refer_id}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {u.refer_by}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {u.referrer_user_name}
                  </td>
                  
                  <td className="px-3 py-2">
                    {formatDateTime(u.created_at)}
                  </td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button
                      className="rounded border border-slate-300 px-2 py-0.5 text-[11px] hover:bg-slate-100"
                      onClick={() => openEditModal(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded border border-red-300 px-2 py-0.5 text-[11px] text-red-700 hover:bg-red-50"
                      onClick={() => openBlockModal(u.user_id)}
                    >
                      Block
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editingUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg text-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">
                  Edit User #{editingUser.user_id}
                </div>
                <div className="text-[11px] text-slate-500">
                  Update user information.
                </div>
              </div>
              <button
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={closeEditModal}
              >
                ✕
              </button>
            </div>

            <form className="space-y-3" onSubmit={submitEdit}>
              {/* <TextInput
                label="Name"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
              />
              <TextInput
                label="Email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
              />
              <TextInput
                label="Phone"
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
              />
              <TextInput
                label="Country"
                name="country"
                value={editForm.country}
                onChange={handleEditChange}
              /> */}
              {/* <TextInput
                label="Status"
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
              /> */}

              <select
              name="status"
            //value={statusFilter}
            onChange={handleEditChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value={editForm.status}>{editForm.status_level}</option>
            <option value="1">New Account</option>
            <option value="2">Activated Account</option>
            <option value="3">Bronze Account</option>
            <option value="4">Silver Account</option>
            <option value="5">Gold Account</option>
          </select>
              {/* <TextInput
                label="Refer ID"
                name="refer_id"
                value={editForm.refer_id}
                onChange={handleEditChange}
                disabled
              />
              <TextInput
                label="Refer By"
                name="refer_by"
                value={editForm.refer_by}
                onChange={handleEditChange}
              /> */}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-[11px]"
                  onClick={closeEditModal}
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

      {/* Block modal */}
      {blockUserId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-lg text-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">
                  Block User #{blockUserId}
                </div>
                <div className="text-[11px] text-slate-500">
                  Block this user for a number of days.
                </div>
              </div>
              <button
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={closeBlockModal}
              >
                ✕
              </button>
            </div>

            <form className="space-y-3" onSubmit={submitBlock}>
              <TextInput
                label="Block for (days)"
                name="blockDays"
                type="number"
                value={blockDays}
                onChange={(e) => setBlockDays(e.target.value)}
                min="1"
              />
              {/* <TextInput
                label="Block Reason"
                name="blockDays"
                type="number"
                value={blockDays}
                onChange={(e) => setBlockDays(e.target.value)}
                min="1"
              /> */}
              <label className="block text-xs font-medium text-slate-800">
                Block Reason
              </label>
              <textarea
                label="Block Reason"
                name="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Describe your experience. Please be honest and specific."
                // disabled={!canSubmitReview}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-[11px]"
                  onClick={closeBlockModal}
                >
                  Cancel
                </button>
                <Button type="submit" loading={saving} className="bg-red-600 hover:bg-red-700">
                  Block
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserListPage;
