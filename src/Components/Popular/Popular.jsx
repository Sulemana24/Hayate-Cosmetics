import React from "react";
import popular_products from "../Assets/data";
import Item from "../Item/Item";
import "./Popular.css";

const Popular = () => {
  return (
    <div className="popular">
      <div className="popular-products">
        <h1>Crafted for Your Confidence</h1>
        <span className="fire-emoji" role="img" aria-label="fire">
          🔥
        </span>
      </div>
      <div className="popular-item">
        {popular_products.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              description={item.description}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Popular;
