import React, { useContext, useState } from "react";
import "./Navbar.css";
import logo from "../Assets/comlogo.png";
import cartIcon from "../Assets/cart_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalCartItems } = useContext(ShopContext);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav>
        <div className="navbar">
          <div className="nav-logo">
            <img className="logo" src={logo} alt="" />
          </div>
          <div class="nav-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? (
              <FiX size={28} color="#1b3c35" />
            ) : (
              <FiMenu size={28} color="#1b3c35" />
            )}
          </div>
        </div>
        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li
            onClick={() => {
              setMenu("home");
              setIsMenuOpen(false);
            }}
          >
            <Link style={{ textDecoration: "none", color: "#1b3c35" }} to="/">
              Home
            </Link>
            {menu === "home" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("skincare");
              setIsMenuOpen(false);
            }}
          >
            <Link
              style={{ textDecoration: "none", color: "#1b3c35" }}
              to="/skincare"
            >
              Skincare
            </Link>
            {menu === "skincare" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("makeup");
              setIsMenuOpen(false);
            }}
          >
            <Link
              style={{ textDecoration: "none", color: "#1b3c35" }}
              to="/makeup"
            >
              Makeup
            </Link>
            {menu === "makeup" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("haircare");
              setIsMenuOpen(false);
            }}
          >
            <Link
              style={{ textDecoration: "none", color: "#1b3c35" }}
              to="/haircare"
            >
              Haircare
            </Link>
            {menu === "haircare" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("appointments");
              setIsMenuOpen(false);
            }}
          >
            <Link
              style={{ textDecoration: "none", color: "#1b3c35" }}
              to="/appointments"
            >
              Appointments
            </Link>
            {menu === "appointments" ? <hr /> : <></>}
          </li>
          <div className="nav-login-cart">
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <button>login</button>
            </Link>
            <div className="nav-cart">
              <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                <img src={cartIcon} alt="" />
              </Link>
              <div className="nav-cart-count">{getTotalCartItems()}</div>
            </div>
          </div>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
