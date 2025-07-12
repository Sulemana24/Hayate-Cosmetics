import React, { useContext, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import dropdown_icon from "../Components/Assets/dropdown_icon.png";
import Item from "../Components/Item/Item";
import "./CSS/HomeCategory.css";

const HomeCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const [expanded, setExpanded] = useState(false);
  const initialCount = 8;

  const filtered = all_product.filter(
    (item) => item.category === props.category
  );
  const visibleProducts = expanded ? filtered : filtered.slice(0, initialCount);

  const toggleLoad = () => {
    setExpanded(!expanded);
    if (expanded) {
      document
        .querySelector(".shopcategory-products")
        .scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="shop-category">
      <div className="banner"></div>

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing {visibleProducts.length}</span> out of {filtered.length}{" "}
          products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="sort dropdown" />
        </div>
      </div>

      <div className="shopcategory-products">
        {visibleProducts.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            description={item.description}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>

      {filtered.length > initialCount && (
        <div
          className={`shopcategory-loadmore ${expanded ? "active" : ""}`}
          onClick={toggleLoad}
        >
          {expanded ? "Show Less ▲" : "Explore More ▼"}
        </div>
      )}
    </div>
  );
};

export default HomeCategory;
