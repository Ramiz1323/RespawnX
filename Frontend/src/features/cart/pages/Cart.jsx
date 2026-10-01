import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useCart } from "../hook/useCart";
import Navbar from "../../products/components/Navbar";
import Footer from "../../products/components/Footer";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import PaymentSuccessModal from "../components/PaymentSuccessModal";
import { loadRazorpayScript } from "../utils/razorpay";
import { ArrowLeftIcon, ShoppingBagIcon, HardwareIcon } from "../../products/components/Icons";
import "../styles/Cart.scss";

export const Cart = () => {
  const {
    handleGetCart,
    handleIncrementCartItem,
    handleDecrementCartItem,
    handleCreateCartOrder,
    handleVerifyCartOrder,
    handleClearCart,
  } = useCart();

  const { items = [], loading = false, error = null } = useSelector((state) => state.cart || {});
  const user = useSelector((state) => state.auth?.user);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessDetails, setPaymentSuccessDetails] = useState(null);
  const [actionFeedback, setActionFeedback] = useState("");

  useEffect(() => {
    handleGetCart().catch(() => {});
  }, []);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item?.quantity) || 0), 0),
    [items]
  );

  const { subtotal, totalSavings } = useMemo(() => {
    let sub = 0;
    let savings = 0;
    items.forEach((item) => {
      const product = typeof item.product === "object" ? item.product : null;
      const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;
      const matchedVariant = Array.isArray(product?.variants)
        ? product.variants.find((v) => String(v._id || v.id) === String(variantId))
        : product?.variants && typeof product.variants === "object"
        ? product.variants
        : null;

      const originalPrice = Number(item?.price?.amount) || 0;
      const livePrice = Number(matchedVariant?.price?.amount ?? product?.price?.amount ?? originalPrice) || 0;
      const qty = Number(item?.quantity) || 0;

      sub += livePrice * qty;
      if (originalPrice > livePrice) {
        savings += (originalPrice - livePrice) * qty;
      }
    });
    return { subtotal: sub, totalSavings: savings };
  }, [items]);

  const currency = items[0]?.price?.currency || "INR";

  const handleQtyChange = async (fn, payload) => {
    setActionFeedback("");
    try {
      await fn(payload);
    } catch (err) {
      setActionFeedback(err?.response?.data?.message || "Action failed");
      setTimeout(() => setActionFeedback(""), 4000);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setActionFeedback("Please sign in to proceed with checkout.");
      return;
    }

    setIsProcessingPayment(true);
    setActionFeedback("");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Could not load Razorpay SDK.");

      const orderData = await handleCreateCartOrder();
      if (!orderData?.order?.id) throw new Error(orderData?.message || "Failed to create order.");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TiiKQYNPpwySHj",
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "RespawnX",
        description: "Gaming Gear Loadout Order",
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await handleVerifyCartOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes?.success) {
              setPaymentSuccessDetails({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                amount: orderData.order.amount ? orderData.order.amount / 100 : subtotal,
              });
              handleClearCart();
            } else {
              setActionFeedback(verifyRes?.message || "Payment verification failed.");
            }
          } catch (err) {
            setActionFeedback(err?.response?.data?.message || "Verification error.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || user?.username || "Operator",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#00e5a3" },
        modal: {
          ondismiss: () => setIsProcessingPayment(false),
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (res) => {
        setIsProcessingPayment(false);
        setActionFeedback(res?.error?.description || "Payment failed.");
      });

      razorpayInstance.open();
    } catch (err) {
      setActionFeedback(err?.response?.data?.message || err.message || "Checkout failed.");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="cyber-cart-page">
      <Navbar />

      <main className="cart-container">
        {/* Tactical Breadcrumbs */}
        <div className="cart-breadcrumbs">
          <Link to="/">Store</Link>
          <span className="divider">/</span>
          <span>Loadout</span>
          <span className="divider">/</span>
          <span className="current">Tactical Cart</span>
        </div>

        {/* Page Header HUD */}
        <div className="cart-header-hud">
          <div className="cart-title-group">
            <div className="telemetry-chip">
              <span className="chip-dot" />
              <span>LIVE CARGO TELEMETRY // SECTOR 01</span>
            </div>
            <h1 className="cart-main-title">
              BATTLESTATION <span>LOADOUT</span>
            </h1>
          </div>

          <div className="cart-header-actions">
            <Link to="/" className="continue-shopping-link">
              <ArrowLeftIcon size={16} />
              <span>Continue Arming</span>
            </Link>
          </div>
        </div>

        {/* Error / Notice Alert */}
        {(error || actionFeedback) && (
          <div className="cart-error-alert">
            <span>[WARNING] {actionFeedback || error}</span>
            <button type="button" className="alert-close-btn" onClick={() => setActionFeedback("")}>
              ✕
            </button>
          </div>
        )}

        {/* Guest Warning */}
        {!user && (
          <div className="guest-auth-banner">
            <span>&gt; OPERATOR NOT AUTHENTICATED. PLEASE CONNECT SESSION TO SYNC CLOUD LOADOUT.</span>
            <Link to="/login" className="btn-auth-sync">SIGN IN &rarr;</Link>
          </div>
        )}

        {/* Main Content */}
        {loading && items.length === 0 ? (
          <div className="cart-loading-state">
            &gt; SCANNING ORBITAL CARGO BAY & RETRIEVING LOADOUT DATA...
          </div>
        ) : items.length > 0 ? (
          <div className="cart-layout-grid">
            <section className="cart-items-stream" aria-label="Cart Items">
              {items.map((item, idx) => {
                const itemKey = `${item.product?._id || item.product}_${item.variant?._id || item.variant || idx}`;
                return (
                  <CartItem
                    key={itemKey}
                    item={item}
                    onIncrement={(p) => handleQtyChange(handleIncrementCartItem, p)}
                    onDecrement={(p) => handleQtyChange(handleDecrementCartItem, p)}
                  />
                );
              })}
            </section>

            <aside aria-label="Order Summary">
              <CartSummary
                totalItems={totalItems}
                subtotal={subtotal}
                totalSavings={totalSavings}
                currency={currency}
                onCheckout={handleCheckout}
                isProcessing={isProcessingPayment}
              />
            </aside>
          </div>
        ) : (
          <div className="cart-empty-state">
            <div className="empty-icon-wrap">
              <ShoppingBagIcon size={36} />
            </div>
            <h2 className="empty-title">Arsenal Loadout Empty</h2>
            <p className="empty-desc">
              Your battlestation cargo matrix has zero hardware units queued for dispatch. Explore our verified marketplace to acquire pro-tier gaming gear.
            </p>
            <Link to="/" className="empty-cta-btn">
              <HardwareIcon size={18} />
              <span>Explore Hardware Catalog</span>
            </Link>
          </div>
        )}
      </main>

      {/* Payment Success Confirmation Modal */}
      <PaymentSuccessModal
        isOpen={Boolean(paymentSuccessDetails)}
        onClose={() => setPaymentSuccessDetails(null)}
        paymentDetails={paymentSuccessDetails}
        currency={currency}
      />

      <Footer />
    </div>
  );
};

export default Cart;
