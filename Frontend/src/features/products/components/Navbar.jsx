import React from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hook/useAuth";
import { BrandLogoIcon, PlusIcon } from "./Icons";
import "../styles/Navbar.scss";

export const Navbar = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth?.user);
  const { handleLogout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="cyber-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <BrandLogoIcon size={26} />
          </div>
          <span className="brand-title">
            Respawn<span>X</span>
          </span>
          <span className="brand-badge">GRID v2.4</span>
        </Link>

        {/* Links */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              Store
            </Link>
          </li>
          <li>
            <Link
              to="/seller/dashboard"
              className={`nav-link ${isActive("/seller/dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
          </li>
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          <Link to="/products/create" className="deploy-btn">
            <PlusIcon size={16} />
            <span>Deploy Gear</span>
          </Link>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div className="user-pill">
                <div className="status-dot" />
                <span className="user-name">{user.fullname || user.email}</span>
                <span className="role-tag">[{user.role || "OPERATOR"}]</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 74, 90, 0.3)",
                  color: "#ff4a5a",
                  borderRadius: "4px",
                  padding: "0.4rem 0.65rem",
                  fontSize: "0.75rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
                title="Disconnect session"
              >
                Exit
              </button>
            </div>
          ) : (
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
