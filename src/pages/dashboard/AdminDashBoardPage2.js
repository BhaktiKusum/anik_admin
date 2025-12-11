import React, { useEffect, useState } from "react";
import { adminGetDashboard } from "../../api/adminDashboardApi";

import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
  ResponsiveContainer
} from "recharts";

import {
  adminGetMonthlyIncome,
  adminGetDailyIncome,
} from "../../api/adminDashboardApi";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#ef4444"];



function AdminDashboardPage() {


  const [filterType, setFilterType] = useState("today");
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [monthlyData, setMonthlyData] = useState([]);
const [dailyData, setDailyData] = useState([]);
const [selectedMonth, setSelectedMonth] = useState(
  new Date().toISOString().slice(0, 7)
);



  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [filterType, date]);

  useEffect(() => {
  loadMonthly();
  loadDaily();
}, [selectedMonth]);

  async function loadData() {
    try {
      setLoading(true);
      const res = await adminGetDashboard({
        type: filterType,
        date: date || undefined,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  
async function loadMonthly() {
  const year = selectedMonth.slice(0, 4);
  const data = await adminGetMonthlyIncome(year);

  // Merge rows into chart format
  const merged = Array.from({ length: 12 }, (_, i) => {
    const m = `${year}-${String(i + 1).padStart(2, "0")}`;
    return {
      month: m,
      review: data.review_income.find(x => x.month === m)?.review_income || 0,
      refer: data.refer_income.find(x => x.month === m)?.refer_income || 0,
      fees: data.fees.find(x => x.month === m)?.total_fees || 0,
    };
  });

  setMonthlyData(merged);
}


async function loadDaily() {
  const data = await adminGetDailyIncome(selectedMonth);

  const daysInMonth =
    new Date(selectedMonth.slice(0, 4), selectedMonth.slice(5, 7), 0).getDate();

  const merged = Array.from({ length: daysInMonth }, (_, i) => {
    const d = `${selectedMonth}-${String(i + 1).padStart(2, "0")}`;
    return {
      day: d,
      review: data.review_income.find(x => x.day === d)?.review_income || 0,
      refer: data.refer_income.find(x => x.day === d)?.refer_income || 0,
    };
  });

  setDailyData(merged);
}

  if (loading || !data) return <div>Loading...</div>;

  const users = data.users || [];
  const income = data.income || {};
  const expenses = data.expenses || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Overview of users, income & expenses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          className="border px-3 py-2 rounded"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setDate("");
          }}
        >
          <option value="today">Today</option>
          <option value="month">This Month</option>
          <option value="day">Custom Day</option>
          <option value="month">Custom Month</option>
        </select>

        {(filterType === "day" || filterType === "today") && (
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}

        {(filterType === "month") && (
          <input
            type="month"
            className="border px-3 py-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Users by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {users.map((u) => (
            <div
              key={u.status}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="text-sm text-slate-500">{u.status}</div>
              <div className="text-2xl font-bold">{u.total}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Income / Expense */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Financial Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
            <div className="text-sm font-semibold">Income</div>
            <div className="flex flex-col gap-1 text-sm">
              <span>Review Income: €{income.review_income}</span>
              <span>Refer Income: €{income.refer_income}</span>
              <span>Transfer Fee: €{income.transfer_fee}</span>
              <span>Withdraw Fee: €{income.withdraw_fee}</span>
              <span>Penalties: €{income.penalties}</span>
            </div>
          </div>

          {/* Expense */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
            <div className="text-sm font-semibold">Expenses</div>
            <div className="flex flex-col gap-1 text-sm">
              <span>Bonus: €{expenses.bonus}</span>
              <span>Withdraw Payouts: €{expenses.withdraw_payout}</span>
            </div>

            </div>

            {/* Pie chat start */}

            <div className="rounded-xl border bg-white p-4 shadow-sm">
  <h2 className="font-semibold mb-2 text-lg">User Distribution</h2>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={users}
        dataKey="total"
        nameKey="status"
        label
      >
        {users.map((entry, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>



<div className="rounded-xl border bg-white p-4 shadow-sm">
  <h2 className="font-semibold mb-2 text-lg">Monthly Income Overview</h2>

  <ResponsiveContainer width="100%" height={350}>
    <LineChart data={monthlyData}>
      <CartesianGrid stroke="#eee" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="review" stroke="#10b981" name="Review Income" />
      <Line type="monotone" dataKey="refer" stroke="#0ea5e9" name="Refer Income" />
      <Line type="monotone" dataKey="fees" stroke="#f59e0b" name="Fees" />
    </LineChart>
  </ResponsiveContainer>
</div>



<div className="rounded-xl border bg-white p-4 shadow-sm">
  <h2 className="font-semibold mb-2 text-lg">
    Daily Income — {selectedMonth}
  </h2>

  <input
    type="month"
    className="border px-3 py-2 rounded mb-4"
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
  />

  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={dailyData}>
      <CartesianGrid stroke="#eee" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="review" fill="#10b981" name="Review Income" />
      <Bar dataKey="refer" fill="#0ea5e9" name="Refer Income" />
    </BarChart>
  </ResponsiveContainer>
</div>


          
        </div>
      </div>

      {/* Net Balance */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">Net Profit</h2>

        <div className="text-3xl font-bold">
          €
          {(
            (income.review_income +
              income.refer_income +
              income.transfer_fee +
              income.withdraw_fee +
              income.penalties) -
            (expenses.bonus + expenses.withdraw_payout)
          ).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
