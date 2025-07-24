import React from "react";
import "./Sidebar.css";
import { Link, Links } from "react-router-dom";
import { BsFillCartPlusFill } from "react-icons/bs";
import { RiDatabase2Fill } from "react-icons/ri";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to={"/addproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <BsFillCartPlusFill />
          <p>Add Product</p>
        </div>
      </Link>
      <Link to={"/listproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <RiDatabase2Fill />
          <p>Product List</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
