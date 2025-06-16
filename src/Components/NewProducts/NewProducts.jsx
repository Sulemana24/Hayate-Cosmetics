import React from "react";
import "./NewProducts.css";
import Item from "../Item/Item";
import new_products from "../Assets/new_products";

const NewProducts = () => {
  return (
    <div className="new_products">
      <h1>NEW ARRIVALS! FRESH CONFIDENCE</h1>
      <hr />
      <div className="products">
        {new_products.map((item, i) => {
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

export default NewProducts;
