// admin/src/components/layout/AdminLayout.js
import React from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminWalletPage from "./adminWallet";

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-4">
          {/* <div className="mx-auto max-w-6xl">
            <AdminWalletPage/>
          </div> */}
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
