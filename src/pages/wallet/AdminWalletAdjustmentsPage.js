
import React, { useEffect, useState } from "react";
import {
  adminGetWalletAdjustments,
  adminCreateWalletAdjustment,
} from "../../api/adminWalletAdjustmentApi";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";

function AdminWalletAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "", "BONUS", "PENALTY"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modal state for new adjustment
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAdj, setNewAdj] = useState({
    user_id: "",
    type: "BONUS",
    amount: "",
    note: "",
  });

  const loadAdjustments = async (pageOverride, searchOverride, typeOverride) => {
    try {
      setLoading(true);
      setError("");
      // don't clear message here so user can still see success

      const pageToUse = pageOverride ?? pagination.page ?? 1;
      const searchToUse = searchOverride ?? search ?? "";
      const typeToUse = typeOverride ?? typeFilter ?? "";

      const data = await adminGetWalletAdjustments({
        page: pageToUse,
        page_size: pagination.page_size,
        search: searchToUse || undefined,
        type: typeToUse || undefined,
      });

      if (!data.success) {
        setError(data.message || "Failed to load wallet adjustments.");
        return;
      }

      setAdjustments(data.adjustments || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error(err);
      setError("Failed to load wallet adjustments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustments(1, "", "");
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
    loadAdjustments(1, search, typeFilter);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setTypeFilter(newType);
    loadAdjustments(1, search, newType);
  };

  const handlePrevPage = () => {
    if (pagination.page <= 1) return;
    loadAdjustments(pagination.page - 1, search, typeFilter);
  };

  const handleNextPage = () => {
    if (pagination.page >= totalPages) return;
    loadAdjustments(pagination.page + 1, search, typeFilter);
  };

  const handleNewAdjChange = (e) => {
    const { name, value } = e.target;
    setNewAdj((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = () => {
    setError("");
    setMessage("");
    setNewAdj({
      user_id: "",
      type: "BONUS",
      amount: "",
      note: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (creating) return; // avoid closing while submitting
    setShowModal(false);
  };

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newAdj.user_id || !newAdj.amount) {
      setError("User ID and amount are required.");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        user_id: Number(newAdj.user_id),
        type: newAdj.type,
        amount: Number(newAdj.amount),
        note: newAdj.note,
      };

      const res = await adminCreateWalletAdjustment(newAdj.user_id, payload);
      if (!res.success) {
        setError(res.message || "Failed to apply adjustment.");
        return;
      }

      setMessage(res.message || "Wallet adjustment applied successfully.");

      // close modal & reset
      setShowModal(false);
      setNewAdj({
        user_id: "",
        type: "BONUS",
        amount: "",
        note: "",
      });

      // reload list from page 1
      loadAdjustments(1, search, typeFilter);
    } catch (err) {
      setShowModal(false);
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to apply wallet adjustment."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Wallet Adjustments
          </h1>
          <p className="text-sm text-slate-600">
            View and create bonus/penalty adjustments to user wallets.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          {/* Search */}
          <form
            className="flex items-center gap-2"
            onSubmit={handleSearchSubmit}
          >
            <TextInput
              name="search"
              placeholder="Search user/admin/note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={handleTypeChange}
            className="border border-slate-300 rounded px-2 py-1 text-xs"
          >
            <option value="">All types</option>
            <option value="BONUS">EURO OUT</option>
            <option value="PENALTY">EURO IN</option>
          </select>

          {/* Add button */}
          <Button size="sm" className="md:ml-2" onClick={handleOpenModal}>
            Add Wallet Adjustment
          </Button>
        </div>
      </div>

      {/* Global messages */}
      {error && 
        //alert(error)
        (<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
        <div className="border-b bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 flex items-center justify-between">
          <span>
            Adjustments ({pagination.total || 0}) • Page {pagination.page} /{" "}
            {totalPages}
          </span>
          <div className="text-[11px] text-slate-500">
            Page size: {pagination.page_size}
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-4 text-xs text-slate-500">
            Loading wallet adjustments...
          </div>
        ) : adjustments.length === 0 ? (
          <div className="px-4 py-4 text-xs text-slate-500">
            No adjustments found.
          </div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Note</th>
                
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
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {a.user_name || "-"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Name: {a.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {a.user_email || a.user_phone || ""}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border " +
                          (!isBonus
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700")
                        }
                      >
                        {a.type === "BONUS"? "EURO OUT": "EURO IN"}
                        
                      </span>
                    </td>

                    <td className="px-3 py-2 font-semibold">
                      {isBonus ? "-" : "+"}
                      {formatAmount(a.amount)}
                    </td>

                    <td className="px-3 py-2 max-w-xs">
                      <span className="line-clamp-2">{a.note || "-"}</span>
                    </td>

                    
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <Button
            size="sm"
            onClick={handlePrevPage}
            disabled={pagination.page <= 1}
          >
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

      {/* Modal for Add Wallet Adjustment */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">
                Add Wallet Adjustment
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleCreateAdjustment}>
              <TextInput
                label="User Name"
                name="user_id"
                value={newAdj.user_id}
                onChange={handleNewAdjChange}
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Type
                </label>
                <select
                  name="type"
                  value={newAdj.type}
                  onChange={handleNewAdjChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 bg-white"
                >
                  <option value="BONUS">EURO OUT (- money)</option>
                  <option value="PENALTY">EURO IN (+ money)</option>
                </select>
              </div>

              <TextInput
                label="Amount (€)"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={newAdj.amount}
                onChange={handleNewAdjChange}
              />

              <TextInput
                label="Note"
                name="note"
                value={newAdj.note}
                onChange={handleNewAdjChange}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  onClick={handleCloseModal}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={creating}>
                  Apply Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWalletAdjustmentsPage;
