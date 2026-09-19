import React from "react";
import { Link } from "react-router";
import { HardwareIcon, PlusIcon, BoltIcon } from "../../products/components/Icons";
import { formatCurrency } from "../../products/components/ProductCard";

export const CartItem = ({ item, onIncrement, isUpdating }) => {
  if (!item) return null;

  const product = typeof item.product === "object" ? item.product : null;
  const productId = product?._id || item.product;
  const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;

  // Locate matching variant for extra telemetry
  const matchedVariant = product?.variants?.find(
    (v) => String(v._id || v.id) === String(variantId)
  );

  // Determine optimal thumbnail
  const imageUrl =
    matchedVariant?.images?.[0]?.url ||
    product?.images?.[0]?.url ||
    null;

  // Format variant attributes (e.g. { Color: "Stealth Black", Switch: "Tactile" })
  let variantLabel = null;
  if (matchedVariant?.attributes) {
    try {
      const attrs =
        typeof matchedVariant.attributes === "string"
          ? JSON.parse(matchedVariant.attributes)
          : matchedVariant.attributes;
      const entries = Object.entries(attrs);
      if (entries.length > 0) {
        variantLabel = entries.map(([k, v]) => `${k}: ${v}`).join(" | ");
      }
    } catch {
      variantLabel = String(matchedVariant.attributes);
    }
  }

  const unitPrice = item.price?.amount ?? 0;
  const currency = item.price?.currency ?? "INR";
  const quantity = item.quantity ?? 1;
  const lineTotal = unitPrice * quantity;
  const stock = matchedVariant?.stock ?? 10;
  const isMaxStock = stock !== undefined && quantity >= stock;

  return (
    <div className="cyber-cart-item">
      {/* Item Image / Visual HUD */}
      <div className="item-visual">
        {imageUrl ? (
          <img src={imageUrl} alt={product?.title || "Hardware item"} className="item-thumb" />
        ) : (
          <div className="item-thumb-placeholder">
            <HardwareIcon size={28} />
          </div>
        )}
        <div className="visual-scanline" />
      </div>

      {/* Item Details */}
      <div className="item-details">
        <div className="item-meta-top">
          <span className="sector-tag">
            SECTOR #{String(productId).slice(-6).toUpperCase()}
          </span>
          <span className="stock-tag">
            {stock > 0 ? "● VERIFIED IN STOCK" : "✕ LOW STOCK"}
          </span>
        </div>

        <Link to={`/products/${productId}`} className="item-title">
          {product?.title || `Hardware Node #${String(productId).slice(-6)}`}
        </Link>

        {variantLabel && (
          <div className="variant-badge">
            <span className="badge-prefix">SPEC:</span> {variantLabel}
          </div>
        )}

        <div className="item-unit-price">
          Unit Price: <span>{formatCurrency(unitPrice, currency)}</span>
        </div>
      </div>

      {/* Quantity & Action Matrix */}
      <div className="item-matrix">
        <div className="qty-control-group">
          <span className="qty-label">UNITS:</span>
          <div className="qty-pill">
            <span className="qty-count">{quantity}</span>
            <button
              type="button"
              className="qty-inc-btn"
              title={isMaxStock ? "Max stock reached" : "Add 1 more unit"}
              disabled={isMaxStock || isUpdating}
              onClick={() => onIncrement && onIncrement({ productId, variantId })}
            >
              <PlusIcon size={14} />
            </button>
          </div>
        </div>

        {isMaxStock && (
          <span className="stock-warning">Max stock limit</span>
        )}

        {/* Total Price Block */}
        <div className="item-total-block">
          <span className="total-label">Line Telemetry</span>
          <span className="total-amount">{formatCurrency(lineTotal, currency)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
