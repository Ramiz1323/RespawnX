import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useProduct } from "../hooks/useProduct";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { SearchIcon, PlusIcon, CpuIcon, LayersIcon } from "../components/Icons";
import "../styles/Home.scss";

const CATEGORIES = [
  "ALL HARDWARE",
  "KEYBOARDS",
  "MICE",
  "RIGS & GPUS",
  "AUDIO",
  "DISPLAYS",
  "ACCESSORIES"
];

export const Home = () => {
  const { handleGetAllProducts } = useProduct();
  const reduxProducts = useSelector((state) => state.product?.products || []);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL HARDWARE");
  const [sortBy, setSortBy] = useState("NEWEST");

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await handleGetAllProducts();
      } catch (err) {
        console.error("Failed to load products from backend API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // ONLY real data from backend
  const activeProducts = reduxProducts || [];

  // Filtering and Sorting
  const filteredProducts = useMemo(() => {
    return activeProducts
      .filter((p) => {
        const matchesQuery =
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesQuery) return false;

        if (selectedCategory === "ALL HARDWARE") return true;
        const cat = selectedCategory.toLowerCase();
        const text = `${p.title} ${p.description}`.toLowerCase();

        if (cat.includes("keyboard")) return text.includes("keyboard") || text.includes("keycap") || text.includes("switch");
        if (cat.includes("mice")) return text.includes("mouse") || text.includes("sensor") || text.includes("dpi");
        if (cat.includes("rigs")) return text.includes("rig") || text.includes("rtx") || text.includes("pc") || text.includes("gpu");
        if (cat.includes("audio")) return text.includes("headset") || text.includes("audio") || text.includes("sound");
        if (cat.includes("displays")) return text.includes("monitor") || text.includes("oled") || text.includes("display");
        if (cat.includes("accessories")) return text.includes("controller") || text.includes("hub") || text.includes("deck");

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "PRICE_ASC") return (a.price?.amount || 0) - (b.price?.amount || 0);
        if (sortBy === "PRICE_DESC") return (b.price?.amount || 0) - (a.price?.amount || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [activeProducts, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-telemetry-badge">
            <span className="pulse-indicator" />
            <span>GRID TELEMETRY: ONLINE // SECTOR 01</span>
          </div>

          <h1 className="hero-title">
            NEXT-GEN GAMING GEAR. <span>RESPAWN READY.</span>
          </h1>

          <p className="hero-description">
            Precision-crafted peripherals, liquid-cooled battle rigs, and high-frequency hardware engineered to dominate every millisecond.
          </p>

          <div className="hero-actions">
            <a href="#catalog" className="btn-hero-primary">
              <CpuIcon size={18} />
              <span>Explore Hardware</span>
            </a>
            <Link to="/products/create" className="btn-hero-secondary">
              <PlusIcon size={18} />
              <span>Deploy Gear</span>
            </Link>
          </div>

          {/* Telemetry Metrics */}
          <div className="hero-metrics">
            <div className="metric-item">
              <span className="val">{activeProducts.length}</span>
              <span className="lbl">Active Listings</span>
            </div>
            <div className="metric-item">
              <span className="val">AES-256</span>
              <span className="lbl">Verified Telemetry</span>
            </div>
            <div className="metric-item">
              <span className="val">0.03ms</span>
              <span className="lbl">Fast Response</span>
            </div>
            <div className="metric-item">
              <span className="val">100%</span>
              <span className="lbl">Live Backend Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section className="catalog-section" id="catalog">
        {/* Filter HUD */}
        <div className="filters-bar">
          <div className="search-and-sort">
            <div className="search-box">
              <SearchIcon size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Scan sector by hardware title, sensor, switch, or spec..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sort-select-wrapper">
              <label className="sort-label">Sort By:</label>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="NEWEST">Latest Deployed</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Selector Pills */}
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Count */}
        <div className="grid-telemetry">
          <div className="item-count">
            ACTIVE DEPLOYMENTS: <span>{filteredProducts.length} UNITS</span>
          </div>
          <div>STATUS: SCANNING SECTOR</div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 1.5rem", color: "#00e5a3", fontFamily: "'JetBrains Mono', monospace" }}>
            &gt; INITIALIZING SECTOR SCAN FROM BACKEND...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <LayersIcon size={44} className="empty-icon" />
            <h3 className="empty-title">
              {searchQuery || selectedCategory !== "ALL HARDWARE"
                ? "No Hardware Matches Filter"
                : "No Hardware Deployed on Grid"}
            </h3>
            <p className="empty-desc">
              {searchQuery || selectedCategory !== "ALL HARDWARE"
                ? "Adjust your telemetry query or clear active category filters to inspect all gear."
                : "No hardware listings exist in the database yet. Deploy the first gaming gear to initialize the marketplace."}
            </p>
            {searchQuery || selectedCategory !== "ALL HARDWARE" ? (
              <button
                type="button"
                className="reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL HARDWARE");
                }}
              >
                Reset Filters
              </button>
            ) : (
              <Link to="/products/create" className="reset-btn" style={{ textDecoration: "none" }}>
                + Deploy First Hardware Model
              </Link>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;
