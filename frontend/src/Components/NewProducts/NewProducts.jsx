import React, { useEffect, useState } from "react";
import "./NewProducts.css";
import Item from "../Item/Item";

const NewProducts = () => {
  const [new_products, setNew_products] = useState([]);

  useEffect(() => {
    fetch("https://hayate-cosmetics-1.onrender.com/newcollections")
      .then((response) => response.json())
      .then((data) => setNew_products(data));
  }, []);

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
