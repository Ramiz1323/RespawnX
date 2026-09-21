import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { useSelector } from "react-redux";
import { useProduct } from "../hooks/useProduct";
import { useCart } from "../../cart/hook/useCart";
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
  CartIcon,
} from "../components/Icons";
import "../styles/ProductDetail.scss";

export const ProductDetail = () => {
  const { id } = useParams();
  const { handleGetProductById } = useProduct();
  const { handleAddItem } = useCart();
  const user = useSelector((state) => state.auth?.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [acquiredMessage, setAcquiredMessage] = useState(false);
  const [acquireError, setAcquireError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
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

  // Aggregate base product model and any extra deployed variants
  const allVariants = useMemo(() => {
    if (!product) return [];

    const list = [];
    const hasBaseImages = product.images && product.images.length > 0;
    const hasBasePrice = product.price && product.price.amount !== undefined;
    const isBaseInVariants = (product.variants || []).some(
      (v) => v.images?.[0]?.url && v.images[0].url === product.images?.[0]?.url
    );

    // Intelligently infer color/edition from product title/description if available
    let baseLabel = "Standard Spec";
    const textToCheck = ((product.title || "") + " " + (product.description || "")).toLowerCase();
    if (textToCheck.includes("white")) baseLabel = "Color: White";
    else if (textToCheck.includes("black")) baseLabel = "Color: Black";
    else if (textToCheck.includes("silver")) baseLabel = "Color: Silver";
    else if (textToCheck.includes("grey") || textToCheck.includes("gray")) baseLabel = "Color: Grey";

    if ((hasBaseImages || hasBasePrice) && !isBaseInVariants) {
      list.push({
        _id: product.variants?.[0]?._id || product._id || product.id,
        isBase: true,
        displayName: baseLabel,
        attributes: { [baseLabel.includes(":") ? baseLabel.split(":")[0].trim() : "spec"]: baseLabel.includes(":") ? baseLabel.split(":")[1].trim() : baseLabel },
        images: product.images || [],
        price: product.price,
        stock: 10,
      });
    }

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        list.push({
          ...v,
          isBase: false,
        });
      });
    }

    return list;
  }, [product]);

  const activeVariant = useMemo(() => {
    if (allVariants.length === 0) return null;
    return allVariants[selectedVariantIndex] || allVariants[0];
  }, [allVariants, selectedVariantIndex]);

  const currentImages = useMemo(() => {
    if (!product) return [];
    
    if (activeVariant?.images && activeVariant.images.length > 0) {
      const vImgs = activeVariant.images.map((img) => img?.url).filter(Boolean);
      if (vImgs.length > 0) return vImgs;
    }

    if (product.images && product.images.length > 0) {
      const baseImgs = product.images.map((img) => img?.url).filter(Boolean);
      if (baseImgs.length > 0) return baseImgs;
    }

    return [];
  }, [product, activeVariant]);

  const handleSelectVariant = (index) => {
    setSelectedVariantIndex(index);
    setActiveImageIndex(0);
  };

  const currentPrice = activeVariant?.price?.amount ?? product?.price?.amount ?? 0;
  const currentCurrency = activeVariant?.price?.currency ?? product?.price?.currency ?? "INR";
  const currentStock = activeVariant?.stock ?? 10;

  const isSellerOwner = useMemo(() => {
    if (!user || !product) return false;
    const sellerId = product.seller?._id || product.seller;
    const currentUserId = user._id || user.id;
    return sellerId === currentUserId;
  }, [user, product]);

  const handleAcquire = async () => {
    if (!product || !activeVariant) {
      setAcquireError("Please select a valid hardware configuration.");
      return;
    }

    const productId = product._id || product.id;
    const variantId = activeVariant._id || activeVariant.id;

    setIsAdding(true);
    setAcquireError("");
    try {
      await handleAddItem({ productId, variantId, quantity: 1 });
      setAcquiredMessage(true);
      setTimeout(() => setAcquiredMessage(false), 5000);
    } catch (err) {
      console.error("Failed to acquire hardware:", err);
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401
          ? "Authentication required. Please sign in to acquire hardware."
          : "Failed to queue hardware to cart.");
      setAcquireError(msg);
      setTimeout(() => setAcquireError(""), 5000);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="detail-loading-state">
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
        <div className="detail-container error-state">
          <HardwareIcon size={48} className="error-icon" />
          <h2 className="error-title">
            Hardware Module Not Found
          </h2>
          <p className="error-desc">
            {fetchError || "The requested hardware sector ID is not registered in the database."}
          </p>
          <Link to="/" className="btn-return-catalog">
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
              {currentImages.length > 0 ? (
                <img
                  src={currentImages[activeImageIndex] || currentImages[0]}
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
                <span className="optic-badge">
                  OPTIC VIEW // {currentImages.length > 0 ? (activeImageIndex < currentImages.length ? activeImageIndex + 1 : 1) : 0} OF {currentImages.length}
                </span>
              </div>
            </div>

            {/* Thumbnails Row - Shows ONLY images of the currently active variant */}
            {currentImages.length > 1 && (
              <div className="thumbnail-reel">
                {currentImages.map((imgUrl, idx) => (
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
                <span className="verified-pill">
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

            {/* Amazon-Style Hardware Variants Selector */}
            {allVariants && allVariants.length > 1 && (
              <div className="variants-section">
                <div className="section-heading">
                  <span>Select Hardware Variant</span>
                  <span>{allVariants.length} Configurations</span>
                </div>

                <div className="variants-grid">
                  {allVariants.map((variant, idx) => {
                    let label = variant.displayName || `Variant #${idx + 1}`;
                    let subLabel = "";
                    if (!variant.displayName && variant.attributes) {
                      const attrs =
                        typeof variant.attributes === "string"
                          ? JSON.parse(variant.attributes || "{}")
                          : variant.attributes;
                      const entries = Object.entries(attrs);
                      if (entries.length > 0) {
                        label = `${entries[0][0]}: ${entries[0][1]}`;
                        if (entries.length > 1) {
                          subLabel = entries.slice(1).map(([k, v]) => `${k}: ${v}`).join(", ");
                        }
                      }
                    }

                    const variantThumb = variant.images?.[0]?.url;

                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`variant-tile ${selectedVariantIndex === idx ? "active" : ""}`}
                        onClick={() => handleSelectVariant(idx)}
                      >
                        {variantThumb && (
                          <div className="variant-swatch-thumb">
                            <img src={variantThumb} alt={label} />
                          </div>
                        )}
                        <div className="variant-tile-body">
                          <span className="variant-name">{label}</span>
                          {subLabel && <span className="variant-subname">{subLabel}</span>}
                          <span className="variant-price">
                            {formatCurrency(variant.price?.amount || currentPrice, variant.price?.currency || currentCurrency)}
                          </span>
                        </div>
                      </button>
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
                <div className="alert-banner-success">
                  <span>&gt; [SUCCESS] HARDWARE ACQUIRED TO BATTLESTATION LOADOUT!</span>
                  <Link to="/cart" className="btn-view-loadout">
                    <CartIcon size={14} />
                    <span>View Loadout &rarr;</span>
                  </Link>
                </div>
              )}

              {acquireError && (
                <div className="alert-banner-error">
                  &gt; [ALERT] {acquireError}
                </div>
              )}

              <div className="buy-row">
                <button
                  type="button"
                  className="btn-acquire"
                  onClick={handleAcquire}
                  disabled={currentStock <= 0 || isAdding}
                >
                  <BoltIcon size={18} />
                  <span>
                    {isAdding
                      ? "Arming Loadout..."
                      : currentStock > 0
                      ? "Acquire Hardware"
                      : "Out of Stock"}
                  </span>
                </button>

                <Link to="/cart" className="btn-loadout">
                  View Cart
                </Link>
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
