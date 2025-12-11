// admin/src/routes/AdminRoutes.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import AdminLoginPage from "../pages/auth/AdminLoginPage";
import UserListPage from "../pages/users/UserListPage";
import AdminUserDetailPage from "../pages/users/AdminUserDetailPage";
import NoticeListPage from "../pages/notices/NoticeListPage";
import BusinessListPage from "../pages/businesses/BusinessListPage";
import AdminReviewListPage from "../pages/reviews/AdminReviewListPage";
import AdminContactListPage from "../pages/contacts/AdminContactListPage";
import AdminWithdrawListPage from "../pages/withdraw/WithdrawListPage";

import AdminDashboardPage from "../pages/dashboard/AdminDashboardPage";
import AdminManageAdminsPage from "../pages/admins/AdminManageAdminsPage";
import AdminTransfersPage from "../pages/transfers/AdminTransfersPage";

import AdminWalletAdjustmentsPage from "../pages/wallet/AdminWalletAdjustmentsPage";
import AdminWallet from "../pages/wallet/adminWallet";



function AdminPrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return children;
}

function AdminRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin/users"
          element={
            <AdminPrivateRoute>
              <AdminLayout>
                <UserListPage />
              </AdminLayout>
            </AdminPrivateRoute>
          }
        />

        <Route
            path="/admin/notices"
            element={
                <AdminPrivateRoute>
                <AdminLayout>
                    <NoticeListPage />
                </AdminLayout>
                </AdminPrivateRoute>
            }
            />

            {/* <Route
                path="/admin/reviews"
                element={
                    <AdminPrivateRoute>
                    <AdminLayout>
                        <ReviewModerationPage />
                    </AdminLayout>
                    </AdminPrivateRoute>
                }
            /> */}

            <Route
                path="/admin/businesses"
                element={
                    <AdminPrivateRoute>
                    <AdminLayout>
                        <BusinessListPage />
                    </AdminLayout>
                    </AdminPrivateRoute>
                }
            />

            <Route
                path="/admin/reviews"
                element={
                    <AdminPrivateRoute>
                    <AdminLayout>
                        <AdminReviewListPage />
                    </AdminLayout>
                    </AdminPrivateRoute>
                }
            />

            <Route
                path="/admin/contacts"
                element={
                    <AdminPrivateRoute>
                    <AdminLayout>
                        <AdminContactListPage />
                    </AdminLayout>
                    </AdminPrivateRoute>
                }
            />
            <Route
              path="/admin/withdraws"
              element={
                <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminWithdrawListPage />
                  </AdminLayout>
                </AdminPrivateRoute>
              }
            />

            
            <Route
              path="/admin/users/:id"
              element={
                <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminUserDetailPage />
                  </AdminLayout>
                </AdminPrivateRoute>
              }
            />

            <Route
             path="/admin/dashboard" 
             element={
              <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                </AdminPrivateRoute>
             } 
             />

             <Route path="/admin/manage-admins" 
             element={
              <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminManageAdminsPage />
                  </AdminLayout>
                </AdminPrivateRoute>

            
            } 
             />

             <Route path="/admin/transfers" 
             element={
              <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminTransfersPage />
                  </AdminLayout>
                </AdminPrivateRoute>
            } />
             <Route path="/admin/wallet-adjustments" element={
              <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminWalletAdjustmentsPage />
                  </AdminLayout>
                </AdminPrivateRoute>

            } />

            <Route path="/admin/wallet" element={
              <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminWallet />
                  </AdminLayout>
                </AdminPrivateRoute>

            } />




        {/* You will add: /admin/notices, /admin/wallets, /admin/contacts, /admin/reviews later */}

        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AdminRoutes;
