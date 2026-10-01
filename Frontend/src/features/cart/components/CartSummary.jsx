import React, { useState } from "react";
import { formatCurrency } from "../../products/components/ProductCard";
import {
  BoltIcon,
  ShieldCheckIcon,
  CpuIcon,
  TruckIcon,
} from "../../products/components/Icons";

export const CartSummary = ({
  totalItems,
  subtotal,
  totalSavings = 0,
  currency = "INR",
  onCheckout,
  isProcessing = false,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === "RESPAWNX10" || cleanCode === "GRID10") {
      setDiscountPercent(10);
      setPromoApplied(true);
      setPromoError("");
    } else if (cleanCode === "CYBER20") {
      setDiscountPercent(20);
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid access voucher code.");
    }
  };

  const shippingFee = subtotal > 2000 || subtotal === 0 ? 0 : 150;
  const discountAmount = (subtotal * discountPercent) / 100;
  const estimatedTax = Math.round((subtotal - discountAmount) * 0.05); // 5% cyber tax estimate
  const finalTotal = Math.max(0, subtotal - discountAmount + estimatedTax + shippingFee);

  const handleCheckoutClick = () => {
    if (onCheckout) {
      onCheckout({ finalTotal });
    }
  };

  return (
    <div className="cyber-cart-summary">
      <div className="summary-header">
        <h3 className="summary-title">Tactical Order Breakdown</h3>
        <span className="summary-badge">{totalItems} UNITS QUEUED</span>
      </div>

      {/* Breakdown lines */}
      <div className="breakdown-matrix">
        <div className="matrix-row">
          <span className="row-lbl">Hardware Subtotal</span>
          <span className="row-val">{formatCurrency(subtotal, currency)}</span>
        </div>

        {totalSavings > 0 && (
          <div className="matrix-row discount-row">
            <span className="row-lbl">Seller Price Drop Savings</span>
            <span className="row-val">-{formatCurrency(totalSavings, currency)}</span>
          </div>
        )}

        {promoApplied && (
          <div className="matrix-row discount-row">
            <span className="row-lbl">Access Voucher ({discountPercent}%)</span>
            <span className="row-val">-{formatCurrency(discountAmount, currency)}</span>
          </div>
        )}

        <div className="matrix-row">
          <div className="row-lbl-with-icon">
            <TruckIcon size={16} />
            <span>Tactical Dispatch</span>
          </div>
          <span className="row-val highlight-free">
            {shippingFee === 0 ? "FREE DISPATCH" : formatCurrency(shippingFee, currency)}
          </span>
        </div>

        <div className="matrix-row">
          <span className="row-lbl">Grid Telemetry / Tax (5%)</span>
          <span className="row-val">{formatCurrency(estimatedTax, currency)}</span>
        </div>

        <div className="matrix-divider" />

        {/* Total Row */}
        <div className="matrix-row total-row">
          <div className="total-label-group">
            <span className="total-title">Total Tactical Value</span>
            <span className="total-sub">Includes all sector duties</span>
          </div>
          <span className="total-digits">
            {formatCurrency(finalTotal, currency)}
          </span>
        </div>
      </div>

      {/* Promo Code Input HUD */}
      <form onSubmit={handleApplyPromo} className="promo-form">
        <div className="promo-input-group">
          <input
            type="text"
            className="promo-input"
            placeholder="ACCESS VOUCHER (e.g. GRID10)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            disabled={promoApplied}
          />
          <button
            type="submit"
            className="promo-btn"
            disabled={promoApplied || !promoCode.trim()}
          >
            {promoApplied ? "APPLIED" : "ACTIVATE"}
          </button>
        </div>
        {promoError && <span className="promo-msg error">{promoError}</span>}
        {promoApplied && (
          <span className="promo-msg success">
            ✓ Tactical clearance granted: {discountPercent}% reduction applied!
          </span>
        )}
      </form>

      {/* Checkout Action CTA */}
      <div className="checkout-action-zone">
        <button
          type="button"
          className="btn-checkout-cta"
          onClick={handleCheckoutClick}
          disabled={totalItems === 0 || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="pulse-spinner" />
              <span>INITIALIZING SECURE PAYMENT...</span>
            </>
          ) : (
            <>
              <BoltIcon size={18} />
              <span>INITIATE GEAR DISPATCH</span>
            </>
          )}
        </button>
      </div>

      {/* Guarantees Matrix */}
      <div className="summary-guarantees">
        <div className="guarantee-row">
          <ShieldCheckIcon size={16} className="guarantee-icon" />
          <span>AES-256 Direct Encrypted Handshake</span>
        </div>
        <div className="guarantee-row">
          <TruckIcon size={16} className="guarantee-icon" />
          <span>Low-Latency Tactical Express Tracking</span>
        </div>
        <div className="guarantee-row">
          <CpuIcon size={16} className="guarantee-icon" />
          <span>24-Month Rig Coverage & Instant Swap</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
