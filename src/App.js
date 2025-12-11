// admin/src/App.js
import React from "react";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <AdminAuthProvider>
      <AdminRoutes />
    </AdminAuthProvider>
  );
}

export default App;
