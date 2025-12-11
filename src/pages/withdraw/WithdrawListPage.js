// admin/src/pages/wallet/AdminWithdrawListPage.js
import React, { useEffect, useState } from "react";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import {
  adminGetWithdraws,
  adminUpdateWithdrawStatus,
} from "../../api/adminWithdrawApi";

function AdminWithdrawListPage() {
  const [withdraws, setWithdraws] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING"); // default
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWithdraws();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  async function loadWithdraws() {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: 20,
        status: statusFilter || "PENDING",
      };
      if (search.trim()) {
        params.search = search.trim();
      }

      const data = await adminGetWithdraws(params);
      if (!data.success) {
        setError(data.message || "Failed to load withdraw requests.");
        setWithdraws([]);
        setPagination({ page: 1, page_size: 20, total: 0 });
        return;
      }

      setWithdraws(data.withdraws || []);
      setPagination(data.pagination || { page: 1, page_size: 20, total: 0 });
    } catch (err) {
      console.error(err);
      setError("Failed to load withdraw requests.");
      setWithdraws([]);
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

  const formatAmount = (value) => {
    if (value == null) return "€0.00";
    return `€${Number(value).toFixed(2)}`;
  };

  const formatStatusBadge = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "approved") {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Approved
        </span>
      );
    }
    if (st === "rejected") {
      return (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
          Rejected
        </span>
      );
    }
    // pending
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        Pending
      </span>
    );
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadWithdraws();
  };

  const handleChangeStatus = async (withdraw, nextStatus) => {
    const pretty =
      nextStatus === "approved"
        ? "APPROVED (success)"
        : nextStatus === "rejected"
        ? "REJECTED"
        : nextStatus.toUpperCase();

    if (
      !window.confirm(
        `Change withdraw #${withdraw.withdraw_money_id} status to ${pretty}?`
      )
    ) {
      return;
    }

    try {
      await adminUpdateWithdrawStatus(withdraw.withdraw_money_id, nextStatus);
      await loadWithdraws();
    } catch (err) {
      console.error(err);
      alert("Failed to update withdraw status.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Withdraw Requests
          </h1>
          <p className="text-sm text-slate-600">
            Review and approve pending withdraw requests. Default view shows
            only pending requests.
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
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All</option>
          </select>
        </div>

        <div className="w-full sm:flex-1">
          <TextInput
            label="Search (user, phone, email, method, number)"
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
        <div>Loading withdraw requests...</div>
      ) : withdraws.length === 0 ? (
        <div className="rounded-xl border bg-white px-4 py-6 text-xs text-slate-500">
          No withdraw requests found.
        </div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Cost</th>
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2">Number</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withdraws.map((w) => {
                const st = (w.status || "").toLowerCase();
                const isPending = st === "pending";

                return (
                  <tr key={w.withdraw_money_id}>
                    <td className="px-3 py-2">
                      {formatDateTime(w.created_at)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">
                          {w.user_name || "-"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          name: {w.name} <br />
                           {w.user_email || "-"} <br />
                           
                          {w.user_phone || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {formatAmount(w.amount)}
                    </td>
                    <td className="px-3 py-2">{formatAmount(w.cost || 0)}</td>
                    <td className="px-3 py-2 uppercase">{w.method}</td>
                    <td className="px-3 py-2">{w.number}</td>
                    <td className="px-3 py-2">{formatStatusBadge(w.status)}</td>
                    <td className="px-3 py-2 text-right space-x-1">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            className="rounded border border-emerald-300 px-2 py-0.5 text-[11px] text-emerald-700 hover:bg-emerald-50"
                            onClick={() =>
                              handleChangeStatus(w, "approved")
                            }
                          >
                            Mark Approved
                          </button>
                          <button
                            type="button"
                            className="rounded border border-red-300 px-2 py-0.5 text-[11px] text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleChangeStatus(w, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}

export default AdminWithdrawListPage;
