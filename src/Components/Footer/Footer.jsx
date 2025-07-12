import React from "react";
import "./Footer.css";
import footer_logo from "../Assets/comlogo.png";
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaFacebookF } from "react-icons/fa";
/* import instagram from "../Assets/instagram_icon.png";
import pinterest from "../Assets/pintester_icon.png";
import whatsapp from "../Assets/whatsapp_icon.png"; */
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
            <FaInstagram />
          </a>
          <a
            href="https://tiktok.com"
            aria-label="Pinterest"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTiktok />
          </a>
          <a
            href="https://wa.me/+233551333780"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IoLogoWhatsapp />
          </a>
          <a
            href="https://wa.me/+233551333780"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
        </div>
      </div>
      <div className="footer-copyright">
        <hr />
        <p>
          © {new Date().getFullYear()} Hayate Cosmetics - All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
