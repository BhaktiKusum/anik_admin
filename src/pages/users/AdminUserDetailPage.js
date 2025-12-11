// admin/src/pages/users/AdminUserDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../../components/common/Button";
import TextInput from "../../components/common/TextInput";
import {
  adminGetUserWallet,
  adminGetUserTransfers,
  adminGetUserWithdraws,
  adminGetUserReviews,
  adminGetUserReferrals,
  adminResetUserPassword,
  adminAdjustUserWallet,
  adminGetUserWalletAdjustments,
} from "../../api/adminUserDetailApi";

function AdminUserDetailPage() {
  const { id } = useParams();
  const userId = id;

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);

  //const userName = user.user_name;

  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Transfers
  const [transfers, setTransfers] = useState([]);
  const [transfersPage, setTransfersPage] = useState(1);
  const [transfersPagination, setTransfersPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  // Withdraws
  const [withdraws, setWithdraws] = useState([]);
  const [withdrawsPage, setWithdrawsPage] = useState(1);
  const [withdrawsPagination, setWithdrawsPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  // Referrals
  const [referrals, setReferrals] = useState(null);

  // Security: password reset
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Wallet adjustment
  const [adjustType, setAdjustType] = useState("BONUS");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustMsg, setAdjustMsg] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

    // Wallet adjustment history
  const [adjustments, setAdjustments] = useState([]);
  const [adjustmentsPage, setAdjustmentsPage] = useState(1);
  const [adjustmentsPagination, setAdjustmentsPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });


  useEffect(() => {
    loadUserWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (activeTab === "transfers") loadTransfers(transfersPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, transfersPage]);

  useEffect(() => {
    if (activeTab === "withdraws") loadWithdraws(withdrawsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, withdrawsPage]);

  useEffect(() => {
    if (activeTab === "tasks") loadReviews(reviewsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, reviewsPage]);

  useEffect(() => {
    if (activeTab === "referrals") loadReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "adjust") loadAdjustments(adjustmentsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, adjustmentsPage]);


  async function loadUserWallet() {
    try {
      setLoading(true);
      setError("");

      const data = await adminGetUserWallet(userId);
      if (!data.success) {
        setError(data.message || "Failed to load user.");
        setUser(null);
        setWallet(null);
        return;
      }
      setUser(data.user);
      setWallet(data.wallet);
    } catch (err) {
      console.error(err);
      setError("Failed to load user.");
      setUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransfers(page) {
    try {
      const data = await adminGetUserTransfers(userId, {
        page,
        page_size: 20,
      });
      if (!data.success) {
        return;
      }
      setTransfers(data.transfers || []);
      setTransfersPagination(data.pagination || transfersPagination);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadWithdraws(page) {
    try {
      const data = await adminGetUserWithdraws(userId, {
        page,
        page_size: 20,
      });
      if (!data.success) {
        return;
      }
      setWithdraws(data.withdraws || []);
      setWithdrawsPagination(data.pagination || withdrawsPagination);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadReviews(page) {
    try {
      const data = await adminGetUserReviews(userId, {
        page,
        page_size: 20,
      });
      if (!data.success) {
        return;
      }
      setReviews(data.reviews || []);
      setReviewsPagination(data.pagination || reviewsPagination);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadReferrals() {
    try {
      const data = await adminGetUserReferrals(userId);
      if (!data.success) {
        return;
      }
      setReferrals(data);
    } catch (err) {
      console.error(err);
    }
  }

    async function loadAdjustments(page) {
    try {
      const data = await adminGetUserWalletAdjustments(userId, {
        page,
        page_size: 20,
      });
      if (!data.success) return;
      setAdjustments(data.adjustments || []);
      setAdjustmentsPagination(data.pagination || adjustmentsPagination);
    } catch (err) {
      console.error(err);
    }
  }


  const formatAmount = (value) => {
    if (value == null) return "€0.00";
    return `€${Number(value).toFixed(2)}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const renderTabButton = (key, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={
        "px-3 py-1 text-xs rounded-md border " +
        (activeTab === key
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
      }
    >
      {label}
    </button>
  );

  const totalPages = (pagination) =>
    Math.max(1, Math.ceil((pagination.total || 0) / (pagination.page_size || 20)));

  if (loading) {
    return <div>Loading user...</div>;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs"
          >
            ←
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">User detail</h1>
        </div>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        <div className="text-xs text-slate-500">User not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.name || "User"}{" "}
              <span className="text-xs text-slate-500">#{user.user_id}</span>
            </h1>
            <p className="text-xs text-slate-600">
              {user.email || "-"} • {user.phone || "-"} • Status:{" "}
              <span className="font-medium">{user.status}</span> (level{" "}
              {user.status_level})
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500">
          <div>
            Wallet balance:{" "}
            <span className="font-semibold text-slate-800">
              {wallet ? formatAmount(wallet.balance) : "€0.00"}
            </span>
          </div>
          <div>
            Refer ID:{" "}
            <span className="font-mono text-slate-700">
              {user.refer_id || "-"}
            </span>
            {" • "}
            Refer by:{" "}
            <span className="font-mono text-slate-700">
              {user.refer_by || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {renderTabButton("overview", "Overview")}
        {renderTabButton("wallet", "Wallet")}
        {renderTabButton("transfers", "Transfers")}
        {renderTabButton("withdraws", "Withdraws")}
        {renderTabButton("tasks", "Tasks / Reviews")}
        {renderTabButton("referrals", "Referrals")}
        {renderTabButton("security", "Security")}
        {renderTabButton("adjust", "Adjust Wallet")}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Wallet summary */}
          <div className="rounded-xl border bg-white shadow-sm p-4 text-xs space-y-2">
            <div className="text-sm font-semibold text-slate-800 mb-1">
              Wallet Overview
            </div>
            <div className="flex flex-col gap-1">
              <div>
                Total balance:{" "}
                <span className="font-semibold">
                  {formatAmount(wallet.balance)}
                </span>
              </div>
              <div>
                Review income: {formatAmount(wallet.review_income)} • Refer
                income: {formatAmount(wallet.refer_income)}
              </div>
              <div>
                Received money: {formatAmount(wallet.received_money)} •
                Transferred: {formatAmount(wallet.transfer_money)}
              </div>
              <div>
                Withdrawn: {formatAmount(wallet.withdraw_money)}
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="rounded-xl border bg-white shadow-sm p-4 text-xs space-y-2">
            <div className="text-sm font-semibold text-slate-800 mb-1">
              User Info
            </div>
            <div>Created at: {formatDateTime(user.created_at)}</div>
            <div>Updated at: {formatDateTime(user.updated_at)}</div>
            <div>Status level: {user.status_level}</div>
            <div>Status text: {user.status}</div>
          </div>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="rounded-xl border bg-white shadow-sm p-4 text-xs space-y-2">
          <div className="text-sm font-semibold text-slate-800 mb-2">
            Wallet Overview
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div>
              <div className="text-[11px] text-slate-500">Balance</div>
              <div className="text-sm font-semibold">
                {formatAmount(wallet.balance)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Review income</div>
              <div className="text-sm font-semibold">
                {formatAmount(wallet.review_income)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Refer income</div>
              <div className="text-sm font-semibold">
                {formatAmount(wallet.refer_income)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Received money</div>
              <div className="text-sm font-semibold">
                {formatAmount(wallet.received_money)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">
                Transferred money
              </div>
              <div className="text-sm font-semibold">
                {formatAmount(wallet.transfer_money)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Withdrawn money</div>
              <div className="text-sm font-semibold">
                {formatAmount(wallet.withdraw_money)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transfers" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="text-sm font-semibold text-slate-800">
              Transfer history
            </div>
            <div className="text-[11px] text-slate-500">
              Total: {transfersPagination.total || 0} • Page{" "}
              {transfersPagination.page} / {totalPages(transfersPagination)}
            </div>
          </div>

          <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
            {transfers.length === 0 ? (
              <div className="px-4 py-4 text-[11px] text-slate-500">
                No transfers.
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Direction</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Cost</th>
                    <th className="px-3 py-2">From</th>
                    <th className="px-3 py-2">To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.map((t) => (
                    <tr key={t.transfer_money_id}>
                      <td className="px-3 py-2">
                        {formatDateTime(t.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border " +
                            (t.direction === "outgoing"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100")
                          }
                        >
                          {t.direction === "outgoing" ? "Sent" : "Received"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {formatAmount(t.amount)}
                      </td>
                      <td className="px-3 py-2">
                        {formatAmount(t.cost || 0)}
                      </td>
                      <td className="px-3 py-2">{t.transferer_user_name}</td>
                      <td className="px-3 py-2">{t.receiver_user_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages(transfersPagination) > 1 && (
            <div className="flex items-center justify-end gap-2 text-xs">
              <Button
                className="px-3 py-1"
                onClick={() =>
                  setTransfersPage((p) => Math.max(1, p - 1))
                }
                disabled={transfersPage <= 1}
              >
                Prev
              </Button>
              <Button
                className="px-3 py-1"
                onClick={() =>
                  setTransfersPage((p) =>
                    Math.min(totalPages(transfersPagination), p + 1)
                  )
                }
                disabled={
                  transfersPage >= totalPages(transfersPagination)
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "withdraws" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="text-sm font-semibold text-slate-800">
              Withdraw history
            </div>
            <div className="text-[11px] text-slate-500">
              Total: {withdrawsPagination.total || 0} • Page{" "}
              {withdrawsPagination.page} / {totalPages(withdrawsPagination)}
            </div>
          </div>

          <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
            {withdraws.length === 0 ? (
              <div className="px-4 py-4 text-[11px] text-slate-500">
                No withdraws.
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Cost</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Number</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdraws.map((w) => (
                    <tr key={w.withdraw_money_id}>
                      <td className="px-3 py-2">
                        {formatDateTime(w.created_at)}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {formatAmount(w.amount)}
                      </td>
                      <td className="px-3 py-2">
                        {formatAmount(w.cost || 0)}
                      </td>
                      <td className="px-3 py-2 uppercase">
                        {w.method}
                      </td>
                      <td className="px-3 py-2">{w.number}</td>
                      <td className="px-3 py-2 text-[11px]">
                        {w.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages(withdrawsPagination) > 1 && (
            <div className="flex items-center justify-end gap-2 text-xs">
              <Button
                className="px-3 py-1"
                onClick={() =>
                  setWithdrawsPage((p) => Math.max(1, p - 1))
                }
                disabled={withdrawsPage <= 1}
              >
                Prev
              </Button>
              <Button
                className="px-3 py-1"
                onClick={() =>
                  setWithdrawsPage((p) =>
                    Math.min(totalPages(withdrawsPagination), p + 1)
                  )
                }
                disabled={
                  withdrawsPage >= totalPages(withdrawsPagination)
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="text-sm font-semibold text-slate-800">
              Review / task history
            </div>
            <div className="text-[11px] text-slate-500">
              Total: {reviewsPagination.total || 0} • Page{" "}
              {reviewsPagination.page} / {totalPages(reviewsPagination)}
            </div>
          </div>

          <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
            {reviews.length === 0 ? (
              <div className="px-4 py-4 text-[11px] text-slate-500">
                No reviews.
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Business</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Rating</th>
                    <th className="px-3 py-2">Earned</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <tr key={r.review_id}>
                      <td className="px-3 py-2">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        {r.business_name} (# {r.business_id})
                      </td>
                      <td className="px-3 py-2">{r.business_type}</td>
                      <td className="px-3 py-2">{r.rating}</td>
                      <td className="px-3 py-2">
                        {formatAmount(r.earned_amount)}
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        {r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages(reviewsPagination) > 1 && (
            <div className="flex items-center justify-end gap-2 text-xs">
              <Button
                className="px-3 py-1"
                onClick={() =>
                  setReviewsPage((p) => Math.max(1, p - 1))
                }
                disabled={reviewsPage <= 1}
              >
                Prev
              </Button>
              <Button
                className="px-3 py-1"
                onClick={() =>
                  setReviewsPage((p) =>
                    Math.min(totalPages(reviewsPagination), p + 1)
                  )
                }
                disabled={
                  reviewsPage >= totalPages(reviewsPagination)
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "referrals" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="text-sm font-semibold text-slate-800">
              Referral list
            </div>
            {referrals && (
              <div className="text-[11px] text-slate-500">
                Total referred: {referrals.total_referred} • Activated:{" "}
                {referrals.activated_count} • Total refer income:{" "}
                {Number(referrals.activated_count) * 3}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
            {!referrals || referrals.referred_users.length === 0 ? (
              <div className="px-4 py-4 text-[11px] text-slate-500">
                No referred users.
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Status</th>
                    
                    <th className="px-3 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">

                  {referrals.referred_users.map((r) => (
                    <tr key={r.user_id}>
                      <td className="px-3 py-2">
                        {r.user_name} 
                      </td>
                      <td className="px-3 py-2">
                        {r.name} <br />
                        {r.email || "-"} • {r.phone || "-"}
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        {r.status} (level {r.status_level})
                      </td>
                      
                      <td className="px-3 py-2">
                        {formatDateTime(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}


        


      {activeTab === "security" && (
        <div className="rounded-xl border bg-white shadow-sm p-4 text-xs space-y-3">
          <div className="text-sm font-semibold text-slate-800 mb-1">
            Change password
          </div>

          {passwordMsg && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
              {passwordMsg}
            </div>
          )}

          <form
            className="max-w-sm space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setPasswordMsg("");
              // if (!newPassword || newPassword.length < 6) {
              //   setPasswordMsg(
              //     "Password must be at least 6 characters."
              //   );
              //   return;
              // }
              try {
                setPasswordLoading(true);
                const data = await adminResetUserPassword(
                  userId,
                  newPassword
                );
                setPasswordMsg(data.message || "Password updated.");
                setNewPassword("");
              } catch (err) {
                console.error(err);
                setPasswordMsg("Failed to update password.");
              } finally {
                setPasswordLoading(false);
              }
            }}
          >
            <TextInput
              label="New password"
              name="newPassword"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Button
              type="submit"
              loading={passwordLoading}
              className="mt-1"
            >
              Update password
            </Button>
          </form>
        </div>
      )}

            {activeTab === "adjust" && (
        <div className="space-y-4">
          {/* Adjust form */}
          <div className="rounded-xl border bg-white shadow-sm p-4 text-xs space-y-3 max-w-md">
            <div className="text-sm font-semibold text-slate-800 mb-1">
              Adjust wallet (Bonus / Penalty)
            </div>

            {adjustMsg && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                {adjustMsg}
              </div>
            )}

            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setAdjustMsg("");

                const amountNum = Number(adjustAmount);
                if (!amountNum || amountNum <= 0) {
                  setAdjustMsg("Amount must be greater than 0.");
                  return;
                }

                try {
                  setAdjustLoading(true);
                  // const data = await adminAdjustUserWallet(userId, {
                  //   type: adjustType,
                  //   amount: amountNum,
                  //   note: adjustNote || undefined,
                  // });

                  const data = await adminAdjustUserWallet(user.user_name, {
                    type: adjustType,
                    amount: amountNum,
                    note: adjustNote || undefined,
                  });
                  setAdjustMsg(data.message || "Wallet adjusted.");
                  setAdjustAmount("");
                  setAdjustNote("");
                  // reload wallet + history
                  await loadUserWallet();
                  await loadAdjustments(1);
                  setAdjustmentsPage(1);
                } catch (err) {
                  console.error(err);
                  setAdjustMsg("Failed to adjust wallet.");
                } finally {
                  setAdjustLoading(false);
                }
              }}
            >
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Type
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 bg-white"
                >
                  <option value="BONUS">BONUS (add money)</option>
                  <option value="PENALTY">PENALTY (cut money)</option>
                </select>
              </div>

              <TextInput
                label="Amount (€)"
                name="adjustAmount"
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Note (optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                  rows={3}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Reason for bonus / penalty"
                />
              </div>

              <Button type="submit" loading={adjustLoading}>
                Apply adjustment
              </Button>
            </form>

            <div className="text-[11px] text-slate-500">
              • BONUS will increase wallet balance.  
              • PENALTY will decrease balance (cannot go below 0).  
              • All adjustments are stored in <code>wallet_adjustments</code>.
            </div>
          </div>

          {/* History table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="text-sm font-semibold text-slate-800">
                Wallet adjustment history
              </div>
              <div className="text-[11px] text-slate-500">
                Total: {adjustmentsPagination.total || 0} • Page{" "}
                {adjustmentsPagination.page} /{" "}
                {totalPages(adjustmentsPagination)}
              </div>
            </div>

            <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
              {adjustments.length === 0 ? (
                <div className="px-4 py-4 text-[11px] text-slate-500">
                  No adjustments yet.
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Note</th>
                      <th className="px-3 py-2">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adjustments.map((a) => {
                      const isBonus = a.type === "BONUS";
                      return (
                        <tr key={a.adjustment_id}>
                          <td className="px-3 py-2">
                            {formatDateTime(a.created_at)}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border " +
                                (isBonus
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-red-200 bg-red-50 text-red-700")
                              }
                            >
                              {isBonus ? "BONUS" : "PENALTY"}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {isBonus ? "+" : "-"}
                            {formatAmount(a.amount)}
                          </td>
                          <td className="px-3 py-2 max-w-xs">
                            <span className="line-clamp-2">
                              {a.note || "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {a.created_by || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages(adjustmentsPagination) > 1 && (
              <div className="flex items-center justify-end gap-2 text-xs">
                <Button
                  className="px-3 py-1"
                  onClick={() =>
                    setAdjustmentsPage((p) => Math.max(1, p - 1))
                  }
                  disabled={adjustmentsPage <= 1}
                >
                  Prev
                </Button>
                <Button
                  className="px-3 py-1"
                  onClick={() =>
                    setAdjustmentsPage((p) =>
                      Math.min(totalPages(adjustmentsPagination), p + 1)
                    )
                  }
                  disabled={
                    adjustmentsPage >= totalPages(adjustmentsPagination)
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUserDetailPage;
