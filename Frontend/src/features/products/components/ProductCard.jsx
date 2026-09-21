import React from "react";
import { Link } from "react-router";
import { ArrowRightIcon, HardwareIcon } from "./Icons";
import "../styles/ProductCard.scss";

// Currency Formatter Helper
export const formatCurrency = (amount, currency = "INR") => {
  if (amount === undefined || amount === null) return "--";
  const num = Number(amount);
  if (isNaN(num)) return amount;

  const symbolMap = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const symbol = symbolMap[currency] || currency + " ";
  return `${symbol}${num.toLocaleString()}`;
};

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const productId = product._id || product.id;
  const imageUrl = product.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url;
  const variantCount = product.variants?.length || 0;
  
  // Calculate total stock if variants exist
  const totalStock = variantCount > 0
    ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : 10; // Default in stock indicator

  return (
    <Link to={`/products/${productId}`} className="cyber-product-card">
      {/* Media Viewport */}
      <div className="card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="product-image" loading="lazy" />
        ) : (
          <div className="image-placeholder">
            <HardwareIcon size={32} />
            <span>[NO TELEMETRY IMAGE]</span>
          </div>
        )}

        {/* Status Pill */}
        <div className="status-badge-container">
          <span className={`stock-status-pill ${totalStock > 0 ? "available" : "sold-out"}`}>
            {totalStock > 0 ? "Available" : "Sold Out"}
          </span>
        </div>

        {/* Variant count pill */}
        {variantCount > 0 && (
          <div className="variant-count-badge">
            {variantCount} {variantCount === 1 ? "Variant" : "Variants"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="card-footer">
          <div className="price-block">
            <span className="price-label">Price Spec</span>
            <span className="price-val">
              {formatCurrency(product.price?.amount, product.price?.currency)}
            </span>
          </div>

          <div className="action-trigger">
            <span>Inspect</span>
            <ArrowRightIcon size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
