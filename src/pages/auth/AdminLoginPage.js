// admin/src/pages/auth/AdminLoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import api from "../../configs/axiosConfig";

function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await api.post("/login", form);

      // expected: { token, admin: {...} }
      login(res.data.token, res.data.admin);
      navigate("/admin/users", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-lg font-semibold tracking-tight mb-1">
          Admin Login
        </h1>
        <p className="text-xs text-slate-600 mb-4">
          Enter your admin credentials.
        </p>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-3 text-xs" onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@example.com"
          />
          <TextInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
