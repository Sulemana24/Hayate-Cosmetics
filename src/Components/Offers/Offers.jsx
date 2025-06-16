import React from "react";
import "./Offers.css";
import exclusiveImage from "../Assets/offers.png";

const Offers = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <img src={exclusiveImage} alt="" />
      </div>
      <div className="offers-right">
        <h1>Exclusive Offers Just For You</h1>
        <p>ONLY ON BEST SELLING PRODUCTS</p>
        <button>Check Now</button>
      </div>
    </div>
  );
};

export default Offers;
