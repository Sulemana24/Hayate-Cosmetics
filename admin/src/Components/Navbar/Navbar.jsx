import React from "react";
import "./Navbar.css";
import navlogo from "../../assets/comlogo.png";
import { FaCircleUser } from "react-icons/fa6";

const Navbar = () => {
  return (
    <div className="navbar">
      <img src={navlogo} alt="" className="nav-logo" />
      <FaCircleUser className="nav-profile" />
    </div>
  );
};

export default Navbar;
