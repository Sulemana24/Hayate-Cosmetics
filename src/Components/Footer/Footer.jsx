import React from "react";
import "./Footer.css";
import footer_logo from "../Assets/comlogo.png";
import instagram from "../Assets/instagram_icon.png";
import pinterest from "../Assets/pintester_icon.png";
import whatsapp from "../Assets/whatsapp_icon.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-logo">
        <img src={footer_logo} alt="" />
      </div>
      <ul className="footer-links">
        <li>
          <Link
            style={{ textDecoration: "none", color: "#1b3c35" }}
            to="/about"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            style={{ textDecoration: "none", color: "#1b3c35" }}
            to="/products"
          >
            Products
          </Link>
        </li>
        <li>
          <Link
            style={{ textDecoration: "none", color: "#1b3c35" }}
            to="/offices"
          >
            Offices
          </Link>
        </li>
        <li>
          <Link
            style={{ textDecoration: "none", color: "#1b3c35" }}
            to="/contact"
          >
            Contact Us
          </Link>
        </li>
      </ul>

      <div className="footer-social-icon">
        <div className="footer-icons-container">
          <a
            href="https://instagram.com"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={instagram} alt="Instagram" />
          </a>
          <a
            href="https://pinterest.com"
            aria-label="Pinterest"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={pinterest} alt="Pinterest" />
          </a>
          <a
            href="https://wa.me/+233551333780"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={whatsapp} alt="WhatsApp" />
          </a>
        </div>
      </div>
      <div className="footer-copyright">
        <hr />
        <p>© {new Date().getFullYear()} Hayate - All rights reserved.</p>

        <p>Terms of Service | Privacy Policy</p>
      </div>
    </div>
  );
};

export default Footer;
