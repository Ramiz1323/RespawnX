import React from "react";
import { Link } from "react-router";
import { HardwareIcon, PlusIcon, MinusIcon, TrashIcon } from "../../products/components/Icons";
import { formatCurrency } from "../../products/components/ProductCard";

export const CartItem = ({ item, onIncrement, onDecrement, isUpdating }) => {
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

  const originalUnitPrice = Number(item.price?.amount) || 0;
  const currentUnitPrice = Number(matchedVariant?.price?.amount ?? product?.price?.amount ?? originalUnitPrice) || 0;
  const currency = item.price?.currency || matchedVariant?.price?.currency || product?.price?.currency || "INR";
  const quantity = Number(item.quantity) || 1;
  const unitPrice = currentUnitPrice;
  const lineTotal = unitPrice * quantity;
  const stock = matchedVariant?.stock ?? 10;
  const isMaxStock = stock !== undefined && quantity >= stock;

  // Price calculations when seller changes the price
  const hasSavings = originalUnitPrice > currentUnitPrice;
  const unitSavings = hasSavings ? originalUnitPrice - currentUnitPrice : 0;
  const totalSavings = unitSavings * quantity;
  const isPriceIncreased = currentUnitPrice > originalUnitPrice && originalUnitPrice > 0;

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
          Unit Price:{" "}
          {hasSavings ? (
            <>
              <span className="original-price-strike">{formatCurrency(originalUnitPrice, currency)}</span>
              <span className="live-price-highlight">{formatCurrency(currentUnitPrice, currency)}</span>
            </>
          ) : (
            <span>{formatCurrency(unitPrice, currency)}</span>
          )}
        </div>

        {/* Dynamic calculation banner for seller price updates / savings */}
        {hasSavings && (
          <div className="item-savings-banner">
            You can buy it for <span className="deal-buy-price">{formatCurrency(currentUnitPrice, currency)}</span> and you can save <span className="deal-save-price">{formatCurrency(unitSavings, currency)}</span>
            {quantity > 1 && <span className="total-savings-pill"> (Save {formatCurrency(totalSavings, currency)} total)</span>}
          </div>
        )}

        {isPriceIncreased && (
          <div className="item-price-notice">
            [NOTICE] Seller updated price to {formatCurrency(currentUnitPrice, currency)}
          </div>
        )}
      </div>

      {/* Quantity & Action Matrix */}
      <div className="item-matrix">
        <div className="qty-control-group">
          <span className="qty-label">UNITS:</span>
          <div className="qty-pill">
            <button
              type="button"
              className={`qty-btn qty-dec-btn ${quantity <= 1 ? "is-remove" : ""}`}
              title={quantity <= 1 ? "Remove item from loadout" : "Decrease quantity by 1"}
              disabled={isUpdating}
              onClick={() => onDecrement && onDecrement({ productId, variantId })}
            >
              {quantity <= 1 ? <TrashIcon size={12} /> : <MinusIcon size={12} />}
            </button>
            <span className="qty-count">{quantity}</span>
            <button
              type="button"
              className="qty-btn qty-inc-btn"
              title={isMaxStock ? "Max stock reached" : "Add 1 more unit"}
              disabled={isMaxStock || isUpdating}
              onClick={() => onIncrement && onIncrement({ productId, variantId })}
            >
              <PlusIcon size={12} />
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
