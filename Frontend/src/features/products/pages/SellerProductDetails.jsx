import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useProduct } from "../hooks/useProduct";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatCurrency } from "../components/ProductCard";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  HardwareIcon,
  LayersIcon,
} from "../components/Icons";
import "../styles/SellerProductDetails.scss";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];

export const SellerProductDetails = () => {
  const { id } = useParams();
  const { handleGetProductById, handleAddProductVariant } = useProduct();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Variant Form state
  const [variantPrice, setVariantPrice] = useState("");
  const [variantCurrency, setVariantCurrency] = useState("INR");
  const [variantStock, setVariantStock] = useState("10");
  const [attributeRows, setAttributeRows] = useState([
    { key: "switch", value: "Linear Red" },
    { key: "color", value: "Cyber Black" },
  ]);
  const [variantImages, setVariantImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertStatus, setAlertStatus] = useState({ type: "", message: "" });

  const fetchProduct = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await handleGetProductById(id);
      if (res) {
        setProduct(res);
        if (res.price) {
          setVariantCurrency(res.price.currency || "INR");
        }
      } else {
        setFetchError("Hardware not located on backend.");
      }
    } catch (err) {
      console.error("Could not fetch product for seller variant management:", err);
      setFetchError(err?.response?.data?.message || "Failed to load hardware details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Attribute builder functions
  const handleAddAttributeRow = () => {
    setAttributeRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleAttributeChange = (index, field, val) => {
    setAttributeRows((prev) => {
      const updated = [...prev];
      updated[index][field] = val;
      return updated;
    });
  };

  const handleRemoveAttributeRow = (index) => {
    setAttributeRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Image selection for variant
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImgs = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setVariantImages((prev) => [...prev, ...newImgs]);
  };

  const handleRemoveImage = (idx) => {
    setVariantImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].preview);
      updated.splice(idx, 1);
      return updated;
    });
  };

  // Submit Variant
  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    setAlertStatus({ type: "", message: "" });

    if (!variantPrice || Number(variantPrice) <= 0) {
      setAlertStatus({ type: "error", message: "Please specify a valid variant price." });
      return;
    }

    setIsSubmitting(true);

    try {
      const attributesObj = {};
      attributeRows.forEach((row) => {
        if (row.key.trim() && row.value.trim()) {
          attributesObj[row.key.trim()] = row.value.trim();
        }
      });

      const newVariantPayload = {
        priceAmount: variantPrice,
        priceCurrency: variantCurrency,
        stock: Number(variantStock) || 0,
        attributes: attributesObj,
        images: variantImages.map((img) => img.file),
      };

      await handleAddProductVariant(id, newVariantPayload);

      setAlertStatus({
        type: "success",
        message: "Hardware variant committed and deployed to product matrix!",
      });

      // Reset variant form
      setVariantPrice("");
      setVariantImages([]);
      fetchProduct();
    } catch (err) {
      console.error("Add variant error:", err);
      setAlertStatus({
        type: "error",
        message: err?.response?.data?.message || "Failed to commit hardware variant to grid.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-details-page">
        <Navbar />
        <div style={{ padding: "6rem", textAlign: "center", color: "#00e5a3", fontFamily: "'JetBrains Mono', monospace" }}>
          &gt; QUERYING HARDWARE VARIANT TERMINAL FROM BACKEND...
        </div>
        <Footer />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="seller-details-page">
        <Navbar />
        <div className="seller-details-container" style={{ textAlign: "center", padding: "6rem 1.5rem" }}>
          <HardwareIcon size={44} style={{ color: "#ff4a5a", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.8rem", color: "#ffffff" }}>Hardware Not Found</h2>
          <p style={{ color: "#8e95a5", marginTop: "0.5rem" }}>{fetchError || "Hardware record not found in database."}</p>
          <Link
            to="/seller/dashboard"
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
            <span>Return to Command Deck</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const thumbUrl = product?.images?.[0]?.url || product?.variants?.[0]?.images?.[0]?.url;

  return (
    <div className="seller-details-page">
      <Navbar />

      <div className="seller-details-container">
        {/* Navigation Bar */}
        <div className="top-nav-bar">
          <Link to="/seller/dashboard" className="back-btn">
            <ArrowLeftIcon size={16} />
            <span>Return to Command Deck</span>
          </Link>

          <Link to={`/products/${id}`} className="public-view-link">
            Inspect in Public Store &rarr;
          </Link>
        </div>

        {/* Hardware Overview Card */}
        <div className="hardware-overview">
          <div className="thumb-viewport">
            {thumbUrl ? (
              <img src={thumbUrl} alt={product.title} />
            ) : (
              <HardwareIcon size={32} className="placeholder-icon" />
            )}
          </div>

          <div className="hardware-meta">
            <span className="badge-id">HARDWARE DESIGNATION #{String(product._id || product.id).slice(-8)}</span>
            <h1 className="title">{product.title}</h1>
            <p className="desc">{product.description}</p>
          </div>

          <div className="price-badge-box">
            <span className="lbl">Base Telemetry Price</span>
            <span className="amt">
              {formatCurrency(product.price?.amount, product.price?.currency)}
            </span>
          </div>
        </div>

        {/* Manager Grid */}
        <div className="variant-manager-grid">
          {/* Left: Add Variant Form */}
          <div className="add-variant-panel">
            <div className="panel-header">
              <h2 className="title">Deploy Hardware Variant</h2>
              <p className="sub">
                Add distinct configuration profiles (switch types, finishes, materials, stock allocations).
              </p>
            </div>

            {alertStatus.message && (
              <div
                style={{
                  padding: "0.85rem",
                  borderRadius: "4px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.8rem",
                  background:
                    alertStatus.type === "error" ? "rgba(255, 74, 90, 0.15)" : "rgba(0, 229, 163, 0.15)",
                  color: alertStatus.type === "error" ? "#ff4a5a" : "#00e5a3",
                  border:
                    alertStatus.type === "error"
                      ? "1px solid rgba(255, 74, 90, 0.4)"
                      : "1px solid rgba(0, 229, 163, 0.4)",
                }}
              >
                &gt; {alertStatus.type === "error" ? "ERROR: " : "SUCCESS: "}
                {alertStatus.message}
              </div>
            )}

            <form className="variant-form" onSubmit={handleVariantSubmit}>
              {/* Price & Currency */}
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Variant Price</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 15999"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Currency</label>
                  <select
                    className="input"
                    value={variantCurrency}
                    onChange={(e) => setVariantCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div className="form-group">
                <label className="label">Allocated Stock Units</label>
                <input
                  type="number"
                  className="input"
                  placeholder="10"
                  value={variantStock}
                  onChange={(e) => setVariantStock(e.target.value)}
                  min="0"
                  required
                />
              </div>

              {/* Dynamic Attribute Builder */}
              <div className="attributes-builder">
                <div className="attr-header">
                  <span className="label">Configuration Attributes</span>
                  <button
                    type="button"
                    className="btn-add-attr"
                    onClick={handleAddAttributeRow}
                  >
                    + Add Attribute
                  </button>
                </div>

                <div className="attr-rows">
                  {attributeRows.map((row, idx) => (
                    <div key={idx} className="attr-row">
                      <input
                        type="text"
                        className="input"
                        placeholder="Key (e.g. switch)"
                        value={row.key}
                        onChange={(e) => handleAttributeChange(idx, "key", e.target.value)}
                        style={{ height: "36px", fontSize: "0.82rem" }}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="Value (e.g. Linear Red)"
                        value={row.value}
                        onChange={(e) => handleAttributeChange(idx, "value", e.target.value)}
                        style={{ height: "36px", fontSize: "0.82rem" }}
                      />
                      <button
                        type="button"
                        className="btn-remove-attr"
                        onClick={() => handleRemoveAttributeRow(idx)}
                        title="Remove attribute"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant Images Upload */}
              <div className="variant-upload">
                <span className="label">Variant Captures (Optional)</span>
                <label className="upload-box">
                  <span className="upload-text">Click to attach variant visual captures</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleImageSelect}
                  />
                </label>

                {variantImages.length > 0 && (
                  <div className="previews-container">
                    {variantImages.map((img, idx) => (
                      <div key={idx} className="thumb-preview">
                        <img src={img.preview} alt="" />
                        <button
                          type="button"
                          className="del-btn"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit-variant" disabled={isSubmitting}>
                <PlusIcon size={16} />
                <span>{isSubmitting ? "Committing..." : "Commit Variant to Hardware"}</span>
              </button>
            </form>
          </div>

          {/* Right: Existing Variants Reel */}
          <div className="variants-list-panel">
            <div className="panel-header">
              <h2 className="title">
                Existing Hardware Configurations
                <span className="count-tag">{product?.variants?.length || 0} TOTAL</span>
              </h2>
            </div>

            {product?.variants && product.variants.length > 0 ? (
              <div className="variants-container">
                {product.variants.map((v, idx) => {
                  const imgUrl = v.images?.[0]?.url;
                  const attrs =
                    typeof v.attributes === "string"
                      ? JSON.parse(v.attributes || "{}")
                      : v.attributes || {};

                  return (
                    <div key={idx} className="variant-item-card">
                      <div className="variant-left">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="variant-img" />
                        ) : (
                          <div className="variant-img-placeholder">
                            <LayersIcon size={22} />
                          </div>
                        )}

                        <div className="variant-specs">
                          <div className="attr-pills">
                            {Object.entries(attrs).map(([k, val]) => (
                              <span key={k} className="attr-pill">
                                <strong>{k}:</strong> {String(val)}
                              </span>
                            ))}
                          </div>

                          <span className="stock-tag">
                            STOCK UNITS: <span>{v.stock ?? 0}</span>
                          </span>
                        </div>
                      </div>

                      <span className="variant-price">
                        {formatCurrency(v.price?.amount || product.price?.amount, v.price?.currency || product.price?.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-variants-placeholder">
                No variants deployed for this hardware model yet. Use the deployment form on the left to add configuration options.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerProductDetails;
