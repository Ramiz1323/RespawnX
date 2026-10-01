import React from "react";
import { Link } from "react-router";
import { CheckCircleIcon, ShieldCheckIcon, HardwareIcon } from "../../products/components/Icons";
import { formatCurrency } from "../../products/components/ProductCard";

export const PaymentSuccessModal = ({
  isOpen,
  onClose,
  paymentDetails,
  currency = "INR",
}) => {
  if (!isOpen || !paymentDetails) return null;

  const { orderId, paymentId, amount } = paymentDetails;

  return (
    <div className="payment-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="payment-modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Tactical Hologram / Pulse Header */}
        <div className="modal-glow-badge">
          <CheckCircleIcon size={38} className="success-icon" />
        </div>

        <div className="modal-telemetry-tag">
          <span className="dot" />
          <span>PAYMENT VERIFIED // ORBITAL TRANSMISSION COMPLETE</span>
        </div>

        <h2 className="modal-title">GEAR DISPATCH INITIATED</h2>
        <p className="modal-subtitle">
          Your tactical payment was processed & verified with end-to-end cryptographic integrity. Hardware payload is now queued for deployment.
        </p>

        {/* Order Details Matrix */}
        <div className="modal-matrix-box">
          {orderId && (
            <div className="matrix-item">
              <span className="matrix-lbl">ORDER ID</span>
              <span className="matrix-val mono">{orderId}</span>
            </div>
          )}
          {paymentId && (
            <div className="matrix-item">
              <span className="matrix-lbl">TRANSACTION ID</span>
              <span className="matrix-val mono">{paymentId}</span>
            </div>
          )}
          {amount && (
            <div className="matrix-item">
              <span className="matrix-lbl">TOTAL BILLED</span>
              <span className="matrix-val highlight">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          )}
          <div className="matrix-item">
            <span className="matrix-lbl">SECURITY PROTOCOL</span>
            <span className="matrix-val verified">
              <ShieldCheckIcon size={14} />
              <span>RAZORPAY 256-BIT ENCRYPTED</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Link to="/" className="btn-modal-primary" onClick={onClose}>
            <HardwareIcon size={18} />
            <span>CONTINUE ARMING LOADOUT</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
