// admin/src/components/layout/AdminSidebar.js
import React from "react";
import { NavLink } from "react-router-dom";

const linkBase =
  "block rounded-md px-3 py-2 text-xs font-medium transition-colors";
const linkActive = "bg-slate-900 text-white";
const linkInactive = "text-slate-700 hover:bg-slate-100";

function AdminSidebar() {
  return (
    <aside className="flex w-56 flex-col border-r bg-white px-3 py-4 text-xs">
      <div className="mb-4 text-[11px] font-semibold uppercase text-slate-500">
        Navigation
      </div>

      <NavLink
        to="/admin/users"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
      >
        Users
      </NavLink>

      {/* <NavLink to="/admin/dashboard" 
      className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          Dashboard
        </NavLink> */}

      <NavLink
        to="/admin/notices"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
      >
        Notices
      </NavLink>

      {/* <NavLink
        to="/admin/wallets"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
      >
        Wallet / Transactions
      </NavLink> */}

      

      <NavLink
        to="/admin/contacts"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
      >
        Contacts
      </NavLink>

      <NavLink
        to="/admin/businesses"
        className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
        >
        Businesses
    </NavLink>

      <NavLink
        to="/admin/reviews"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
        }
      >
        Reviews
      </NavLink>

        <NavLink
          to="/admin/withdraws"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          Withdraw Requests
        </NavLink>

        <NavLink to="/admin/transfers" className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
          }>
          Transfers
      </NavLink>

      <NavLink to="/admin/wallet-adjustments" className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
          }>
          Wallet Adjustments
        </NavLink>

      <NavLink to="/admin/wallet" className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : linkInactive}`
          }>
          Wallet
        </NavLink>

        

        {/* <NavLink to="/admin/manage-admins" 
        className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
            }>
          Manage Admins
        </NavLink> */}


      
    </aside>
  );
}

export default AdminSidebar;
