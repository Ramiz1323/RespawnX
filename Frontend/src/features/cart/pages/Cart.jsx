import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useCart } from "../hook/useCart";
import Navbar from "../../products/components/Navbar";
import Footer from "../../products/components/Footer";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import {
  CartIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  HardwareIcon,
} from "../../products/components/Icons";
import "../styles/Cart.scss";

export const Cart = () => {
  const { handleAddItem, handleGetCart, handleIncrementCartItem, handleDecrementCartItem } = useCart();
  const cartState = useSelector((state) => state.cart) || { items: [], loading: false, error: null };
  const items = cartState.items || [];
  const loading = cartState.loading || false;
  const error = cartState.error || null;
  const user = useSelector((state) => state.auth?.user);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item?.quantity) || 0), 0),
    [items]
  );
  const subtotal = useMemo(
    () =>
      items.reduce((acc, item) => {
        const itemPrice = Number(item?.price?.amount) || 0;
        const qty = Number(item?.quantity) || 0;
        return acc + itemPrice * qty;
      }, 0),
    [items]
  );
  const currency = items[0]?.price?.currency || "INR";

  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState("");

  useEffect(() => {
    let isMounted = true;
    handleGetCart().catch((err) => {
      console.warn("Cart fetch failed or user is not logged in:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleIncrement = async ({ productId, variantId }) => {
    setUpdatingItemId(`${productId}_${variantId}`);
    setActionFeedback("");
    try {
      await handleIncrementCartItem({ productId, variantId });
    } catch (err) {
      console.error("Failed to increment quantity:", err);
      setActionFeedback(err?.response?.data?.message || "Could not increment quantity.");
      setTimeout(() => setActionFeedback(""), 4000);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDecrement = async ({ productId, variantId }) => {
    setUpdatingItemId(`${productId}_${variantId}`);
    setActionFeedback("");
    try {
      await handleDecrementCartItem({ productId, variantId });
    } catch (err) {
      console.error("Failed to decrement quantity:", err);
      setActionFeedback(err?.response?.data?.message || "Could not decrement quantity.");
      setTimeout(() => setActionFeedback(""), 4000);
    } finally {
      setUpdatingItemId(null);
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

        {/* Error or Notice Alert */}
        {(error || actionFeedback) && (
          <div className="cart-error-alert">
            <span>[WARNING] {actionFeedback || error}</span>
            <button
              type="button"
              className="alert-close-btn"
              onClick={() => setActionFeedback("")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Guest Warning if not logged in */}
        {!user && (
          <div className="guest-auth-banner">
            <span>
              &gt; OPERATOR NOT AUTHENTICATED. PLEASE CONNECT SESSION TO SYNC CLOUD LOADOUT.
            </span>
            <Link to="/login" className="btn-auth-sync">
              SIGN IN &rarr;
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading && items.length === 0 ? (
          <div className="cart-loading-state">
            &gt; SCANNING ORBITAL CARGO BAY & RETRIEVING LOADOUT DATA...
          </div>
        ) : items.length > 0 ? (
          /* Main Cart Content Grid */
          <div className="cart-layout-grid">
            {/* Left Column: List of items */}
            <section className="cart-items-stream" aria-label="Cart Items">
              {items.map((item, index) => {
                const itemKey = `${item.product?._id || item.product}_${item.variant?._id || item.variant || index}`;
                return (
                  <CartItem
                    key={itemKey}
                    item={item}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    isUpdating={updatingItemId === itemKey}
                  />
                );
              })}
            </section>

            {/* Right Column: Order Summary HUD */}
            <aside aria-label="Order Summary">
              <CartSummary
                totalItems={totalItems}
                subtotal={subtotal}
                currency={currency}
              />
            </aside>
          </div>
        ) : (
          /* Empty Loadout State */
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

      <Footer />
    </div>
  );
};

export default Cart;
