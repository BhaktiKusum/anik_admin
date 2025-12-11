import React, { useEffect, useState } from "react";
import {
  createSubAdmin,
  getAllAdmins,
  updateAdminStatus,
  adminChangePassword
} from "../../api/adminAdminApi";

import Button from "../../components/common/Button";
import TextInput from "../../components/common/TextInput";

function AdminManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [passwordChange, setPasswordChange] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    const data = await getAllAdmins();
    setAdmins(data.admins);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await createSubAdmin(form);
      setMessage(res.message);
      setForm({ name: "", phone: "", email: "", password: "" });
      loadAdmins();
    } catch (err) {
      setMessage("Failed to add admin.");
    }
  }

  async function handleStatusChange(id, status) {
    const res = await updateAdminStatus(id, status);
    setMessage(res.message);
    loadAdmins();
  }

  async function handlePasswordUpdate() {
    if (!selectedAdminId || !passwordChange) return;

    const res = await adminChangePassword(selectedAdminId, passwordChange);
    setMessage(res.message);

    setPasswordChange("");
    setSelectedAdminId(null);
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Manage Admin & Sub-Admins</h1>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-xs rounded">
          {message}
        </div>
      )}

      {/* CREATE SUB ADMIN */}
      <div className="rounded-xl bg-white border shadow-sm p-4">
        <h2 className="font-semibold mb-3 text-sm">Add New Sub-Admin</h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleCreate}>
          <TextInput label="Name" name="name" value={form.name} onChange={handleChange} />
          <TextInput label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <TextInput label="Email" name="email" value={form.email} onChange={handleChange} />
          <TextInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} />
          
          <div className="col-span-full">
            <Button type="submit">Add Sub-Admin</Button>
          </div>
        </form>
      </div>

      {/* ADMIN LIST */}
      <div className="rounded-xl bg-white border shadow-sm p-4">
        <h2 className="font-semibold mb-3 text-sm">Admin List</h2>

        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-100 text-left text-[11px] uppercase">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.admin_id} className="border-t">
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2">{a.email}</td>
                <td className="px-3 py-2">{a.phone}</td>
                <td className="px-3 py-2">{a.status}</td>

                <td className="px-3 py-2 space-x-2">
                  {a.status === "ACTIVE" ? (
                    <Button className="bg-red-600" onClick={() => handleStatusChange(a.admin_id, "INACTIVE")}>
                      Deactivate
                    </Button>
                  ) : (
                    <Button className="bg-emerald-600" onClick={() => handleStatusChange(a.admin_id, "ACTIVE")}>
                      Activate
                    </Button>
                  )}

                  <Button
                    className="bg-slate-700"
                    onClick={() => setSelectedAdminId(a.admin_id)}
                  >
                    Change Password
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PASSWORD UPDATE MODAL */}
      {selectedAdminId && (
        <div className="bg-black/40 fixed inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg w-80 p-5 space-y-3">
            <h3 className="font-semibold text-sm">Change Admin Password</h3>

            <TextInput
              label="New Password"
              type="password"
              value={passwordChange}
              onChange={(e) => setPasswordChange(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <Button className="bg-slate-600" onClick={handlePasswordUpdate}>
                Update
              </Button>
              <Button className="bg-red-600" onClick={() => setSelectedAdminId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminManageAdminsPage;
