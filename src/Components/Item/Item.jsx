import React from "react";
import "./Item.css";
import { Link } from "react-router-dom";

const Item = (props) => {
  return (
    <div className="item-div">
      <div className="item">
        <Link to={`/product/${props.id}`}>
          <img onClick={window.scrollTo(0, 0)} src={props.image} alt="" />
        </Link>
        <p className="name">{props.name}</p>
        <p>{props.description}</p>
        <div className="item-prices">
          <div className="item-price-new">Ghc{props.new_price}</div>
          <div className="item-price-old">Ghc{props.old_price}</div>
        </div>
      </div>
    </div>
  );
};

export default Item;
