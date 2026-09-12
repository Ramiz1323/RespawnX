import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Link } from "react-router";
import Navbar from "../../products/components/Navbar";
import Footer from "../../products/components/Footer";
import { ShieldCheckIcon } from "../../products/components/Icons";
import "../styles/ProtectedRoute.scss";

export const ProtectedRoute = ({ children, requireSeller = false, guestOnly = false }) => {
  const location = useLocation();
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="protected-loading">
        &gt; VERIFYING OPERATOR CLEARANCE TELEMETRY...
      </div>
    );
  }

  // If route is for guests only (e.g. login, register) and user is already authenticated
  if (guestOnly) {
    if (user) {
      const redirectPath = location.state?.from?.pathname || (user.role === "seller" ? "/seller/dashboard" : "/");
      return <Navigate to={redirectPath} replace />;
    }
    return children;
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If requires seller role and user is not a seller -> Access Denied notice
  if (requireSeller && user.role !== "seller") {
    return (
      <div className="clearance-denied-layout">
        <Navbar />
        <div className="clearance-denied-container">
          <div className="clearance-card">
            <ShieldCheckIcon size={48} className="icon-danger" />
            <h2 className="clearance-title">
              SELLER CLEARANCE REQUIRED
            </h2>
            <p className="clearance-desc">
              Operator account <strong>{user.fullname || user.email}</strong> has role <strong>[{user.role || "buyer"}]</strong>. Hardware deployment and command deck management are restricted to verified seller clearance.
            </p>
            <div className="clearance-actions">
              <Link to="/" className="btn-store">
                Return to Store
              </Link>
              <Link to="/register" className="btn-register-seller">
                Register as Seller
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

