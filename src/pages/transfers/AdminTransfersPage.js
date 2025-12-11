import React, { useEffect, useState } from "react";
import { adminGetTransfers } from "../../api/adminTransferApi";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";

function AdminTransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransfers = async (pageOverride, searchOverride) => {
    try {
      setLoading(true);
      setError("");

      const pageToUse = pageOverride ?? pagination.page ?? 1;
      const searchToUse = searchOverride ?? search ?? "";

      const data = await adminGetTransfers({
        page: pageToUse,
        page_size: pagination.page_size,
        search: searchToUse || undefined,
      });

      if (!data.success) {
        setError(data.message || "Failed to load transfers.");
        return;
      }

      setTransfers(data.transfers || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error(err);
      setError("Failed to load transfers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    loadTransfers(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = (v) => {
    if (!v) return "-";
    return new Date(v).toLocaleString();
  };

  const formatAmount = (value) => {
    if (value == null) return "€ 0.00";
    return `€ ${Number(value).toFixed(2)}`;
  };

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.total || 0) / (pagination.page_size || 20))
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // always reset to page 1 when searching
    loadTransfers(1, search);
  };

  const handlePrevPage = () => {
    if (pagination.page <= 1) return;
    loadTransfers(pagination.page - 1, search);
  };

  const handleNextPage = () => {
    if (pagination.page >= totalPages) return;
    loadTransfers(pagination.page + 1, search);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Transfer History
          </h1>
          <p className="text-sm text-slate-600">
            View all users&apos; transfer money history.
          </p>
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={handleSearchSubmit}
        >
          <TextInput
            name="search"
            placeholder="Search by name, email, phone, user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
        <div className="border-b bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 flex items-center justify-between">
          <span>
            Transfers ({pagination.total || 0}) • Page {pagination.page} /{" "}
            {totalPages}
          </span>
          <div className="text-[11px] text-slate-500">
            Page size: {pagination.page_size}
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-4 text-xs text-slate-500">
            Loading transfer history...
          </div>
        ) : transfers.length === 0 ? (
          <div className="px-4 py-4 text-xs text-slate-500">
            No transfers found.
          </div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">From (User)</th>
                <th className="px-3 py-2">To (User)</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((t) => (
                <tr key={t.transfer_money_id}>
                  <td className="px-3 py-2">
                    {formatDateTime(t.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {t.from_user_name || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Name: {t.from_name || t.transfer_from || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t.from_email || t.from_phone || ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {t.to_user_name || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Name: {t.to_name || t.transfer_to || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t.to_email || t.to_phone || ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    {formatAmount(t.amount)}
                  </td>
                  <td className="px-3 py-2">{formatAmount(t.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <Button size="sm" onClick={handlePrevPage} disabled={pagination.page <= 1}>
            Prev
          </Button>
          <Button
            size="sm"
            onClick={handleNextPage}
            disabled={pagination.page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default AdminTransfersPage;
