import api from "../configs/axiosConfig";

export async function adminGetDashboard(params = {}) {
  const res = await api.get("/dashboard", { params });

  return res.data;
}

export async function adminGetMonthlyIncome(year) {
  const res = await api.get("/dashboard/monthly-income", {
    params: { year }
  });
  return res.data;
}

export async function adminGetDailyIncome(month) {
  const res = await api.get("/dashboard/daily-income", {
    params: { month }
  });
  
  return res.data;
}

