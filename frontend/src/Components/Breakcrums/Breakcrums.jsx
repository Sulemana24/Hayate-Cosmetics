import React from "react";
import "./Breakcrums.css";
import arrow_icon from "../Assets/breadcrum_arrow.png";

const Breakcrum = (props) => {
  const { product } = props;
  return (
    <div className="breakcrum">
      Home <img src={arrow_icon} alt="" /> Shop <img src={arrow_icon} alt="" />{" "}
      {product.category} <img src={arrow_icon} alt="" /> {product.name}
    </div>
  );
};

export default Breakcrum;
