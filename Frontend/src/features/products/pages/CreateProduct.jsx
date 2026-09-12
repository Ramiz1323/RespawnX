import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useProduct } from "../hooks/useProduct";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { UploadIcon, TrashIcon, PlusIcon } from "../components/Icons";
import "../styles/CreateProduct.scss";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];
const MAX_IMAGES = 5;

export const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });

  // Array of { file: File, preview: string }
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${MAX_IMAGES} images reached.`);
      return;
    }

    const newImgs = files.slice(0, availableSlots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImgs]);
    setErrorMessage("");
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[indexToRemove].preview);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.title.trim()) {
      setErrorMessage("Hardware designation (title) is required.");
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage("Hardware telemetry specification (description) is required.");
      return;
    }
    if (!formData.priceAmount || Number(formData.priceAmount) <= 0) {
      setErrorMessage("Valid price amount is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("priceAmount", formData.priceAmount);
      data.append("priceCurrency", formData.priceCurrency);

      images.forEach((img) => {
        data.append("images", img.file);
      });

      const result = await handleCreateProduct(data);
      setSuccessMessage("Hardware successfully deployed to RespawnX Grid!");

      setTimeout(() => {
        if (result?._id) {
          navigate(`/seller/products/${result._id}`);
        } else {
          navigate("/seller/dashboard");
        }
      }, 1500);
    } catch (err) {
      console.error("Deploy product error:", err);
      setErrorMessage(
        err?.response?.data?.message || "Hardware deployment failed. Verify permissions or session status."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live preview mockup object
  const previewProduct = {
    id: "live-preview",
    title: formData.title || "Titan-Core Hardware Listing (Designation)",
    description:
      formData.description ||
      "Live telemetry specification will stream here as you input hardware properties, dimensions, and actuation benchmarks...",
    price: {
      amount: formData.priceAmount ? Number(formData.priceAmount) : 19999,
      currency: formData.priceCurrency,
    },
    images: images.length > 0 ? [{ url: images[0].preview }] : [],
    variants: [],
  };

  return (
    <div className="create-product-page">
      <Navbar />

      <div className="create-container">
        {/* Page Header */}
        <div className="page-header">
          <span className="header-badge">DEPLOYMENT TERMINAL // HARDWARE GRID</span>
          <h1 className="page-title">Deploy New Hardware</h1>
          <p className="page-subtitle">
            Configure specifications, pricing telemetry, and visual captures for the RespawnX marketplace.
          </p>
        </div>

        {/* Dual Column Workspace */}
        <div className="create-grid">
          {/* Left: Input Form Panel */}
          <div className="form-panel">
            {errorMessage && (
              <div className="status-alert error">
                &gt; ERROR: {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="status-alert success">
                &gt; SUCCESS: {successMessage}
              </div>
            )}

            <form className="deploy-form" onSubmit={handleSubmit}>
              {/* Title */}
              <div className="field-group">
                <label className="field-label">
                  <span>Hardware Title</span>
                  <span className="field-count">{formData.title.length}/100</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="field-input"
                  placeholder="e.g. Apex Pro TKL Mechanical Keyboard (Gen-3)"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div className="field-group">
                <label className="field-label">
                  <span>Hardware Telemetry & Specifications</span>
                </label>
                <textarea
                  name="description"
                  className="field-textarea"
                  placeholder="Detail switch actuation, polling frequency, chassis material, battery runtime, and key tech specs..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
                <span className="field-hint">
                  Markdown and structured bullet points will render clearly on product showcase.
                </span>
              </div>

              {/* Price & Currency */}
              <div className="field-group">
                <label className="field-label">
                  <span>Pricing Telemetry</span>
                </label>
                <div className="price-row">
                  <select
                    name="priceCurrency"
                    className="currency-select"
                    value={formData.priceCurrency}
                    onChange={handleChange}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    name="priceAmount"
                    className="field-input"
                    placeholder="e.g. 14999"
                    value={formData.priceAmount}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Multi-Image Upload */}
              <div className="upload-section">
                <label className="field-label">
                  <span>Visual Sensor Captures</span>
                  <span className="field-count">
                    ({images.length}/{MAX_IMAGES})
                  </span>
                </label>

                {images.length < MAX_IMAGES && (
                  <label className="dropzone">
                    <UploadIcon size={36} className="upload-icon" />
                    <p className="dropzone-title">Click to upload optical captures</p>
                    <p className="dropzone-sub">
                      PNG, JPG, WEBP up to 5MB each. Max {MAX_IMAGES} captures.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="file-hidden-input"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}

                {/* Previews Reel */}
                {images.length > 0 && (
                  <div className="image-previews">
                    {images.map((img, idx) => (
                      <div key={idx} className="preview-card">
                        <img src={img.preview} alt={`upload-${idx}`} />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove capture"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
                <PlusIcon size={18} />
                <span>{isSubmitting ? "Deploying Hardware..." : "Commit Hardware to Grid"}</span>
              </button>
            </form>
          </div>

          {/* Right: Live Preview */}
          <div className="preview-panel">
            <div className="preview-header">
              <span className="preview-label">Real-Time Marketplace Preview</span>
              <span className="preview-live-tag">
                <span className="live-dot" /> LIVE SYNC
              </span>
            </div>

            <div className="preview-card-wrapper">
              <ProductCard product={previewProduct} />
            </div>

            <p style={{ fontSize: "0.78rem", color: "#8e95a5", lineHeight: "1.5", margin: "0.5rem 0 0" }}>
              💡 <em>Note:</em> After committing your hardware base model, you can configure switch types, colors, and add distinct variant pricing inside the Seller Terminal.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateProduct;