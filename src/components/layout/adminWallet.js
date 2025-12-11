import React, { useEffect, useState } from "react";
import { adminGetDashboard } from "../../api/adminDashboardApi";



import { getSTATUS_LEVEL } from "../../utils/status";




function AdminWalletPage() {


  const [filterType, setFilterType] = useState("today");
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [filterType, date]);


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

  

  if (loading || !data) return <div>Loading...</div>;

  const users = data.userStatus || [];
  const income = data.wallet || {};
  const adminWallet = data.adminWallet|| {};
  const expenses = data.expenses || {};

  const transformedUsers = users.map(user => {
    const statusName = getSTATUS_LEVEL[user.status];
    return {
      statusLevel: statusName || 'Unknown', 
      total: user.total
    };
  });

  let totalUser = 0
  let totalActivateUser = 0

  users.map(user => {
    totalUser += user.total
    if(user.status >=2) totalActivateUser += user.total
  })

  //onsole.log(transformedUsers);


  return (
    <div className="space-y-6">
      

      

      {/* User Stats */}
      {/* <div>
        <h2 className="text-lg font-semibold mb-2">Users by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
          {users.map((u) => (
            <div
              key={u.status}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="text-sm text-slate-500">{getSTATUS_LEVEL[u.status]}</div>
              <div className="text-2xl font-bold">{u.total}</div>
            </div>
          ))}
        </div>
      </div> */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
                Total User: {totalUser} <br />
            </div>
        
        
            <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
                Total Activate user: {totalActivateUser}
            </div>
        
        </div>
      </div>
      

      {/* Income / Expense */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Wallet Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
            <div className="text-sm font-semibold">Income</div>
            <div className="flex flex-col gap-1 text-sm">
              
              <span>Transfer Fee: €{income.total_transfer_fee}</span>
              <span>Withdraw Fee: €{income.total_withdraw_fee}</span>
              <span>Fine + Acctivation  Fee: €{income.total_fine}</span>
              <span>Withdraw Payouts: €{income.total_withdraw}</span>
              
            </div>
          </div>

          {/* Expense */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
            <div className="text-sm font-semibold">Expenses</div>
            <div className="flex flex-col gap-1 text-sm">
              {/* <span>Bonus: €{income.total_bonus}</span>  */}
              
              <span>Review Income: €{income.total_review_income}</span>
              <span>Referal Income: €{income.total_refer_income}</span>
              <span>Bouns: €{income.total_bonus}</span>
            </div>
          </div>

          {/* Net Balance */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        {/* <h2 className="text-lg font-semibold mb-1">Admin Wallet Balance</h2> */}

        <div className="text-3xl font-bold">
          {/* €
          {
            ((
              Number(income.total_transfer_fee) 
              + Number(income.total_withdraw_fee) 
              + Number(income.total_fine)
              + Number(income.total_withdraw) 
            ) 
              - 
            (
                Number(income.total_bonus) 
              + Number(income.total_review_income) 
              + Number(income.total_refer_income)
            )).toFixed(2)
          } */}
          
          
        </div>
        <div className="flex flex-col gap-1 text-sm">
            Admin balance: €{adminWallet.balance} 
          {/* Balance: {adminWallet.balance} <br />
          Review Income: {adminWallet.refer_income} <br />
          Refer Income: {adminWallet.refer_income} <br />
          Withdraw: {adminWallet.withdraw_money} <br />
          Transfer Vat: {adminWallet.transfer_fee} <br />
          Transfer Vat: {adminWallet.withdraw_fee}
          <br />
          Fine/ Activation Fee: {adminWallet.fine}
          <br />
          Bonus: {adminWallet.bonus} */}
        </div>

        
        
      </div>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1 text-sm">
            Total User Wallet Balance: €{income.total_balance}
        </div>
      </div>



        </div>
      </div>

      
    </div>
  );
}

export default AdminWalletPage;
