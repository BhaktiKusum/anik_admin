// admin/src/components/layout/AdminHeader.js
import React from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

function AdminHeader() {
  const { admin, logout } = useAdminAuth();

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-2">
      <div className="text-sm font-semibold tracking-tight">
        Admin Panel
      </div>
      <div className="flex items-center gap-3 text-xs">
        {admin && (
          <div className="flex flex-col items-end">
            <span className="font-medium text-slate-800">
              {admin.name || "Admin"}
            </span>
            <span className="text-[11px] text-slate-500">
              {admin.email || ""}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="rounded-md border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
