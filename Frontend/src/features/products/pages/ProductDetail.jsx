import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { useSelector } from "react-redux";
import { useProduct } from "../hooks/useProduct";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatCurrency } from "../components/ProductCard";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  BoltIcon,
  CpuIcon,
  HardwareIcon,
  LayersIcon,
} from "../components/Icons";
import "../styles/ProductDetail.scss";

export const ProductDetail = () => {
  const { id } = useParams();
  const { handleGetProductById } = useProduct();
  const user = useSelector((state) => state.auth?.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [acquiredMessage, setAcquiredMessage] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await handleGetProductById(id);
        if (res && isMounted) {
          setProduct(res);
        } else if (isMounted) {
          setFetchError("Hardware module not found on the grid.");
        }
      } catch (err) {
        console.error("Error fetching product from backend:", err);
        if (isMounted) {
          setFetchError(err?.response?.data?.message || "Hardware module could not be retrieved.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Aggregate all images (product base images + variant images)
  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img?.url && !imgs.includes(img.url)) imgs.push(img.url);
      });
    }
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.images && v.images.length > 0) {
          v.images.forEach((img) => {
            if (img?.url && !imgs.includes(img.url)) imgs.push(img.url);
          });
        }
      });
    }
    return imgs;
  }, [product]);

  const activeVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants[selectedVariantIndex] || product.variants[0];
  }, [product, selectedVariantIndex]);

  const currentPrice = activeVariant?.price?.amount ?? product?.price?.amount ?? 0;
  const currentCurrency = activeVariant?.price?.currency ?? product?.price?.currency ?? "INR";
  const currentStock = activeVariant?.stock ?? 10;

  const isSellerOwner = useMemo(() => {
    if (!user || !product) return false;
    const sellerId = product.seller?._id || product.seller;
    const currentUserId = user._id || user.id;
    return sellerId === currentUserId;
  }, [user, product]);

  const handleAcquire = () => {
    setAcquiredMessage(true);
    setTimeout(() => setAcquiredMessage(false), 3000);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div style={{ textAlign: "center", padding: "6rem 1.5rem", color: "#00e5a3", fontFamily: "'JetBrains Mono', monospace" }}>
          &gt; QUERYING HARDWARE TELEMETRY FROM BACKEND...
        </div>
        <Footer />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="detail-container" style={{ textAlign: "center", padding: "6rem 1.5rem" }}>
          <HardwareIcon size={48} style={{ color: "#ff4a5a", margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff" }}>
            Hardware Module Not Found
          </h2>
          <p style={{ color: "#8e95a5", marginTop: "0.75rem", fontSize: "0.95rem" }}>
            {fetchError || "The requested hardware sector ID is not registered in the database."}
          </p>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#00e5a3",
              color: "#000000",
              fontWeight: "700",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              marginTop: "1.5rem",
              textDecoration: "none",
              textTransform: "uppercase",
              fontSize: "0.85rem",
            }}
          >
            <ArrowLeftIcon size={16} />
            <span>Return to Store Catalog</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Navbar />

      <div className="detail-container">
        {/* Breadcrumbs */}
        <div className="detail-breadcrumbs">
          <Link to="/">Store</Link>
          <span className="divider">/</span>
          <span>Hardware</span>
          <span className="divider">/</span>
          <span className="current">{product.title}</span>
        </div>

        {/* Main Grid */}
        <div className="product-main-grid">
          {/* Left: Gallery Viewport */}
          <div className="detail-gallery">
            <div className="main-viewport">
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImageIndex] || allImages[0]}
                  alt={product.title}
                  className="main-img"
                />
              ) : (
                <div className="viewport-placeholder">
                  <HardwareIcon size={48} />
                  <span>[NO OPTICAL SENSOR CAPTURE]</span>
                </div>
              )}

              <div className="gallery-badge">
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.72rem",
                    color: "#00e5a3",
                    background: "rgba(0, 0, 0, 0.75)",
                    border: "1px solid rgba(0, 229, 163, 0.3)",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "4px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  OPTIC VIEW // {allImages.length > 0 ? activeImageIndex + 1 : 0} OF {allImages.length}
                </span>
              </div>
            </div>

            {/* Thumbnails Row */}
            {allImages.length > 1 && (
              <div className="thumbnail-reel">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-btn ${activeImageIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={imgUrl} alt={`angle ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info HUD */}
          <div className="detail-info">
            <div className="header-block">
              <div className="telemetry-row">
                <span className="seller-pill">
                  SECTOR ID: <span>#{String(product._id || product.id).slice(-6).toUpperCase()}</span>
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.72rem",
                    color: "#00e5a3",
                    background: "rgba(0, 229, 163, 0.1)",
                    border: "1px solid rgba(0, 229, 163, 0.3)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "4px",
                  }}
                >
                  VERIFIED HARDWARE
                </span>
              </div>

              <h1 className="detail-title">{product.title}</h1>
            </div>

            {/* Price & Stock HUD */}
            <div className="price-container">
              <div className="price-main">
                <span className="price-label">Telemetry Price</span>
                <span className="price-digits">
                  {formatCurrency(currentPrice, currentCurrency)}
                </span>
              </div>

              <div className="stock-indicator">
                <span className="stock-label">Inventory Matrix</span>
                <span className={`stock-val ${currentStock > 0 ? "in-stock" : "out-of-stock"}`}>
                  {currentStock > 0 ? `● ${currentStock} UNITS READY` : "✕ INVENTORY DEPLETED"}
                </span>
              </div>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="variants-section">
                <div className="section-heading">
                  <span>Select Hardware Variant</span>
                  <span>{product.variants.length} Configurations</span>
                </div>

                <div className="variants-grid">
                  {product.variants.map((variant, idx) => {
                    let label = `Variant #${idx + 1}`;
                    if (variant.attributes) {
                      const attrs =
                        typeof variant.attributes === "string"
                          ? JSON.parse(variant.attributes || "{}")
                          : variant.attributes;
                      const keys = Object.keys(attrs);
                      if (keys.length > 0) {
                        label = `${keys[0]}: ${attrs[keys[0]]}`;
                      }
                    }

                    return (
                      <div
                        key={idx}
                        className={`variant-tile ${selectedVariantIndex === idx ? "active" : ""}`}
                        onClick={() => setSelectedVariantIndex(idx)}
                      >
                        <span className="variant-name">{label}</span>
                        <span className="variant-price">
                          {formatCurrency(variant.price?.amount || currentPrice, variant.price?.currency || currentCurrency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="description-block">
              <span className="desc-title">Hardware Blueprint</span>
              <p className="desc-text">{product.description}</p>
            </div>

            {/* Tech Specs Matrix */}
            <div className="specs-block">
              <span className="specs-title">Telemetry Specifications</span>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Chassis Standard</th>
                    <td>Pro-Tier Battle Ready Rig/Peripheral</td>
                  </tr>
                  <tr>
                    <th>Firmware Standard</th>
                    <td>RespawnX Low-Latency DirectLink</td>
                  </tr>
                  <tr>
                    <th>Warranty Coverage</th>
                    <td>2-Year Advanced Hardware Replacement</td>
                  </tr>
                  {activeVariant?.attributes &&
                    Object.entries(
                      typeof activeVariant.attributes === "string"
                        ? JSON.parse(activeVariant.attributes || "{}")
                        : activeVariant.attributes
                    ).map(([k, v]) => (
                      <tr key={k}>
                        <th>{k.charAt(0).toUpperCase() + k.slice(1)}</th>
                        <td>{String(v)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Actions HUD */}
            <div className="actions-hud">
              {acquiredMessage && (
                <div
                  style={{
                    background: "rgba(0, 229, 163, 0.15)",
                    border: "1px solid #00e5a3",
                    color: "#00e5a3",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  &gt; [SUCCESS] HARDWARE ACQUIRED TO BATTLESTATION LOADOUT!
                </div>
              )}

              <div className="buy-row">
                <button
                  type="button"
                  className="btn-acquire"
                  onClick={handleAcquire}
                  disabled={currentStock <= 0}
                >
                  <BoltIcon size={18} />
                  <span>{currentStock > 0 ? "Acquire Hardware" : "Out of Stock"}</span>
                </button>

                <button type="button" className="btn-loadout" onClick={handleAcquire}>
                  Save to Rig
                </button>
              </div>

              {/* Seller Direct Link if user owns product or is seller */}
              {(isSellerOwner || user?.role === "seller") && (
                <Link
                  to={`/seller/products/${product._id || product.id}`}
                  className="seller-manage-link"
                >
                  <LayersIcon size={16} />
                  <span>Manage Hardware Variants in Seller Terminal &rarr;</span>
                </Link>
              )}
            </div>

            {/* Guarantees */}
            <div className="guarantees-grid">
              <div className="guarantee-card">
                <ShieldCheckIcon size={20} className="icon" />
                <span className="title">AES-256 Verified</span>
                <span className="desc">Direct cryptographic hardware telemetry</span>
              </div>
              <div className="guarantee-card">
                <BoltIcon size={20} className="icon" />
                <span className="title">Zero Latency</span>
                <span className="desc">48-hour expedited tactical dispatch</span>
              </div>
              <div className="guarantee-card">
                <CpuIcon size={20} className="icon" />
                <span className="title">Pro Warranty</span>
                <span className="desc">24 months comprehensive swap protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
