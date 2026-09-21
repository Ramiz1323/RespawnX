import React from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hook/useAuth";
import { BrandLogoIcon, PlusIcon, CartIcon } from "./Icons";
import "../styles/Navbar.scss";

export const Navbar = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + (Number(item?.quantity) || 0),
    0
  );
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
          <Link
            to="/cart"
            className={`cart-nav-btn ${isActive("/cart") ? "active" : ""}`}
            title="Battle Station Loadout / Cart"
          >
            <div className="cart-icon-wrapper">
              <CartIcon size={18} />
              {totalCartCount > 0 && (
                <span className="cart-badge-count">{totalCartCount}</span>
              )}
            </div>
            <span className="cart-btn-label">Loadout</span>
          </Link>

          <Link to="/products/create" className="deploy-btn">
            <PlusIcon size={16} />
            <span>Deploy Gear</span>
          </Link>

          {user ? (
            <div className="user-group">
              <div className="user-pill">
                <div className="status-dot" />
                <span className="user-name">{user.fullname || user.email}</span>
                <span className="role-tag">[{user.role || "OPERATOR"}]</span>
              </div>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
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
