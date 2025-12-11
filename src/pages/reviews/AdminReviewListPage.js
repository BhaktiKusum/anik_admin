// admin/src/pages/reviews/AdminReviewListPage.js
import React, { useEffect, useState } from "react";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import {
  adminGetReviews,
  adminApproveReview,
  adminRejectReview,
} from "../../api/adminReviewApi";

function AdminReviewListPage() {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING"); // default PENDING
  const [userIdFilter, setUserIdFilter] = useState("");
  const [businessIdFilter, setBusinessIdFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: 20,
      };
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (userIdFilter.trim()) {
        params.user_id = userIdFilter.trim();
      }
      if (businessIdFilter.trim()) {
        params.business_id = businessIdFilter.trim();
      }

      const data = await adminGetReviews(params);
      if (!data.success) {
        setError(data.message || "Failed to load reviews.");
        setReviews([]);
        setPagination({ page: 1, page_size: 20, total: 0 });
        return;
      }

      setReviews(data.reviews || []);
      setPagination(data.pagination || { page: 1, page_size: 20, total: 0 });
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews.");
      setReviews([]);
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

  const formatTypeLabel = (type) => {
    if (!type) return "-";
    if (type === "RESTAURANT") return "Restaurant";
    if (type === "HOTEL") return "Hotel";
    if (type === "GYM") return "Gym";
    return type;
  };

  const formatStatusBadge = (status) => {
    if (status === "APPROVED") {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Approved
        </span>
      );
    }
    if (status === "REJECTED") {
      return (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        Pending
      </span>
    );
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadReviews();
  };

  const handleApprove = async (reviewId) => {
    if (!window.confirm("Approve this review and add €0.20 to wallet?"))
      return;
    try {
      setActionLoadingId(reviewId);
      await adminApproveReview(reviewId);
      await loadReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to approve review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (reviewId) => {
    if (!window.confirm("Reject this review?")) return;
    try {
      setActionLoadingId(reviewId);
      await adminRejectReview(reviewId);
      await loadReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to reject review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Review Moderation
          </h1>
          <p className="text-sm text-slate-600">
            Approve or reject user reviews. Approving adds €0.20 to the user's
            wallet.
          </p>
        </div>
      </div>

      {/* Filters */}
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 border shadow-sm text-xs"
        onSubmit={handleFilterSubmit}
      >
        <div className="w-full sm:w-48">
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

        <div className="w-full sm:w-40">
          <TextInput
            label="User ID"
            name="user_id"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="User ID"
          />
        </div>

        <div className="w-full sm:w-40">
          <TextInput
            label="Business ID"
            name="business_id"
            value={businessIdFilter}
            onChange={(e) => setBusinessIdFilter(e.target.value)}
            placeholder="Business ID"
          />
        </div>

        <Button type="submit" className="h-9 px-4">
          Apply
        </Button>

        <div className="ml-auto text-[11px] text-slate-500">
          Total: {pagination.total || 0} • Page {page} /{" "}
          {Math.max(
            1,
            Math.ceil(
              (pagination.total || 0) / (pagination.page_size || 20)
            )
          )}
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border bg-white px-4 py-6 text-xs text-slate-500">
          No reviews found.
        </div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Business</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Answers</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Earned</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {r.user_name || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Name: {r.name} <br />
                        Email: {r.user_email}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {r.business_name}
                      </span>
                      {/* <span className="text-[11px] text-slate-500">
                        ID: {r.business_id}
                      </span> */}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="uppercase text-[11px] text-slate-700">
                      {formatTypeLabel(r.business_type)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    A: {r.ans_a ?? "-"} / B: {r.ans_b ?? "-"} / C:{" "}
                    {r.ans_c ?? "-"}
                  </td>
                  <td className="px-3 py-2">{r.rating}★</td>
                  <td className="px-3 py-2">
                    € {Number(r.earned_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{formatStatusBadge(r.status)}</td>
                  <td className="px-3 py-2 text-right space-x-1">
                    {r.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          className="rounded border border-emerald-300 px-2 py-0.5 text-[11px] text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          onClick={() => handleApprove(r.id)}
                          disabled={actionLoadingId === r.id}
                        >
                          {actionLoadingId === r.id
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-300 px-2 py-0.5 text-[11px] text-red-700 hover:bg-red-50 disabled:opacity-50"
                          onClick={() => handleReject(r.id)}
                          disabled={actionLoadingId === r.id}
                        >
                          {actionLoadingId === r.id
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        No actions
                      </span>
                    )}
                  </td>
                </tr>
              ))}
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

export default AdminReviewListPage;
