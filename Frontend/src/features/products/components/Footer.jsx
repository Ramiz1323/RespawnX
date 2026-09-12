import React from "react";
import { Link } from "react-router";
import { BrandLogoIcon } from "./Icons";
import "../styles/Footer.scss";

export const Footer = () => {
  return (
    <footer className="cyber-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <BrandLogoIcon size={24} style={{ color: "#00e5a3" }} />
              Respawn<span>X</span>
            </Link>
            <p className="footer-desc">
              Precision-engineered hardware interface for pro-tier battlestations, competitive esports gear, and elite mechanical peripherals.
            </p>
            <div className="footer-telemetry">
              <span>
                <span className="live-dot" /> SYS.STATUS: ONLINE
              </span>
              <span>ENCRYPTION: AES-256</span>
            </div>
          </div>

          {/* Sectors */}
          <div className="footer-col">
            <span className="col-title">Sectors</span>
            <ul className="footer-links">
              <li><Link to="/">Hardware Grid</Link></li>
              <li><Link to="/products/create">Deploy Listing</Link></li>
              <li><Link to="/seller/dashboard">Command Deck</Link></li>
              <li><a href="#rigs">Pre-Built Rigs</a></li>
            </ul>
          </div>

          {/* Protocols */}
          <div className="footer-col">
            <span className="col-title">Protocols</span>
            <ul className="footer-links">
              <li><a href="#warranty">Warranty Matrix</a></li>
              <li><a href="#dispatch">Rapid Dispatch</a></li>
              <li><a href="#security">Zero-Latency SLA</a></li>
              <li><a href="#telemetry">Telemetry Feed</a></li>
            </ul>
          </div>

          {/* Legal / Auth */}
          <div className="footer-col">
            <span className="col-title">Terminal</span>
            <ul className="footer-links">
              <li><Link to="/login">Operator Login</Link></li>
              <li><Link to="/register">Create Session</Link></li>
              <li><a href="#privacy">Privacy Protocol</a></li>
              <li><a href="#terms">Terms of Engagement</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <span className="copyright">
            &copy; {new Date().getFullYear()} RespawnX Inc. All telemetry rights reserved.
          </span>
          <span className="status-badge">
            GRID STATUS // 99.98% OPTIMAL
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
