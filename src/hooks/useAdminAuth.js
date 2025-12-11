// admin/src/hooks/useAdminAuth.js
import { useContext, createContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // you can later call /api/admin/me to verify token
    const stored = localStorage.getItem("admin_user");
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        setAdmin(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
