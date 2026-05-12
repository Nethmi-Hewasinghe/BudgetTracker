import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Coins } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "./appLayout.css";

export function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon">
            <Coins size={28} strokeWidth={2.6} />
          </div>
          <span>FinTrack</span>
        </div>

        <nav className="nav">
          <NavLink to="/dashboard" className="navLink">
            Dashboard
          </NavLink>

          <NavLink to="/transactions" className="navLink">
            Transactions
          </NavLink>

          <NavLink to="/categories" className="navLink">
            Categories
          </NavLink>

          <NavLink to="/budgets" className="navLink">
            Budgets
          </NavLink>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbarLeft">
            <div className="title">Personal Finance</div>
          </div>

          <div className="topbarRight">
            <div className="userChip">
              <div className="userName">{user?.name || "User"}</div>
              <div className="userEmail">{user?.email || ""}</div>
            </div>

            <button
              className="btn btnGhost"
              onClick={() => {
                logout();
                nav("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}