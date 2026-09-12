import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useProduct } from "../hooks/useProduct";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatCurrency } from "../components/ProductCard";
import {
  PlusIcon,
  SearchIcon,
  CpuIcon,
  LayersIcon,
  ShieldCheckIcon,
  BoltIcon,
  HardwareIcon,
} from "../components/Icons";
import "../styles/Dashboard.scss";

export const Dashboard = () => {
  const { handleGetSellerProduct } = useProduct();
  const sellerProducts = useSelector((state) => state.product?.sellerProducts || []);
  const user = useSelector((state) => state.auth?.user);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchSellerData = async () => {
      try {
        await handleGetSellerProduct();
      } catch (err) {
        console.error("Failed to fetch seller products from backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSellerData();
    return () => {
      isMounted = false;
    };
  }, []);

  // ONLY real data from backend
  const displayListings = sellerProducts || [];

  // Metrics calculations from real database listings
  const metrics = useMemo(() => {
    const totalListings = displayListings.length;
    let totalUnits = 0;
    let totalValuation = 0;

    displayListings.forEach((item) => {
      const vCount = item.variants?.length || 0;
      if (vCount > 0) {
        item.variants.forEach((v) => {
          const qty = Number(v.stock) || 0;
          const amt = Number(v.price?.amount || item.price?.amount) || 0;
          totalUnits += qty;
          totalValuation += qty * amt;
        });
      } else {
        totalUnits += 1;
        totalValuation += Number(item.price?.amount) || 0;
      }
    });

    return {
      totalListings,
      totalUnits,
      totalValuation,
    };
  }, [displayListings]);

  // Search filter
  const filteredListings = useMemo(() => {
    return displayListings.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayListings, searchTerm]);

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dash-header">
          <div className="header-left">
            <span className="dash-telemetry">
              <span className="status-dot" /> OPERATOR STATION // SECTOR COMMAND
            </span>
            <h1 className="dash-title">Hardware Command Deck</h1>
            <p className="dash-subtitle">
              Manage telemetry deployments, stock units, and variant matrices for operator {user?.fullname || user?.email || "Seller"}.
            </p>
          </div>

          <Link to="/products/create" className="deploy-btn">
            <PlusIcon size={18} />
            <span>+ Deploy New Hardware</span>
          </Link>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="card-top">
              <span className="card-label">Active Deployments</span>
              <CpuIcon size={22} className="card-icon" />
            </div>
            <span className="card-value">{metrics.totalListings}</span>
            <span className="card-trend">&gt; Online on RespawnX Grid</span>
          </div>

          <div className="metric-card">
            <div className="card-top">
              <span className="card-label">Total Stock Units</span>
              <LayersIcon size={22} className="card-icon" />
            </div>
            <span className="card-value">{metrics.totalUnits}</span>
            <span className="card-trend">&gt; Verified in Inventory</span>
          </div>

          <div className="metric-card">
            <div className="card-top">
              <span className="card-label">Pipeline Valuation</span>
              <BoltIcon size={22} className="card-icon" />
            </div>
            <span className="card-value">
              {formatCurrency(metrics.totalValuation, "INR")}
            </span>
            <span className="card-trend">&gt; Live Inventory Value</span>
          </div>

          <div className="metric-card">
            <div className="card-top">
              <span className="card-label">Grid Health</span>
              <ShieldCheckIcon size={22} className="card-icon" />
            </div>
            <span className="card-value" style={{ color: "#00e5a3" }}>
              OPTIMAL
            </span>
            <span className="card-trend">&gt; AES-256 Synchronized</span>
          </div>
        </div>

        {/* Inventory Table Section */}
        <div className="inventory-section">
          <div className="inventory-header">
            <h3 className="section-title">
              Hardware Inventory Matrix
              <span className="count-pill">{filteredListings.length} LISTINGS</span>
            </h3>

            <div className="table-search">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Filter deployed listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#00e5a3", fontFamily: "'JetBrains Mono', monospace" }}>
                &gt; POLLING SELLER INVENTORY TELEMETRY FROM BACKEND...
              </div>
            ) : filteredListings.length > 0 ? (
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Hardware Model</th>
                    <th>Base Price</th>
                    <th>Configurations</th>
                    <th>Timestamp</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((item) => {
                    const id = item._id || item.id;
                    const thumb = item.images?.[0]?.url || item.variants?.[0]?.images?.[0]?.url;
                    const vCount = item.variants?.length || 0;
                    const dateStr = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "ACTIVE";

                    return (
                      <tr key={id}>
                        <td>
                          <div className="hardware-cell">
                            {thumb ? (
                              <img src={thumb} alt="" className="thumb" />
                            ) : (
                              <div className="thumb-placeholder">
                                <HardwareIcon size={20} />
                              </div>
                            )}
                            <div className="info">
                              <span className="title">{item.title}</span>
                              <span className="sub-id">#{String(id).slice(-8)}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="price-text">
                            {formatCurrency(item.price?.amount, item.price?.currency)}
                          </span>
                        </td>

                        <td>
                          <span className="variants-pill">
                            {vCount} {vCount === 1 ? "Variant" : "Variants"}
                          </span>
                        </td>

                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>
                          {dateStr}
                        </td>

                        <td>
                          <div className="actions-cell" style={{ justifyContent: "flex-end" }}>
                            <Link
                              to={`/seller/products/${id}`}
                              className="btn-action-variants"
                            >
                              Manage Variants
                            </Link>

                            <Link
                              to={`/products/${id}`}
                              className="btn-action-view"
                            >
                              Inspect
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="inventory-empty">
                <HardwareIcon size={44} className="empty-icon" />
                <p className="empty-text">
                  {searchTerm
                    ? "No matching hardware listings found."
                    : "No hardware listings deployed by your operator account yet."}
                </p>
                <Link to="/products/create" className="deploy-btn" style={{ marginTop: "0.5rem" }}>
                  Deploy First Hardware Model
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
