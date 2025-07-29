import React, { useEffect, useRef, useState } from "react";
import Item from "../Item/Item";
import "./Popular.css";
import { FaBolt, FaClock } from "react-icons/fa";

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch("https://hayate-cosmetics-1.onrender.com/popular")
      .then((response) => response.json())
      .then((data) => setPopularProducts(data));
  }, []);

  useEffect(() => {
    let targetTime = localStorage.getItem("flashSaleEndTime");

    if (!targetTime) {
      targetTime = new Date().getTime() + 2 * 60 * 60 * 1000;
      localStorage.setItem("flashSaleEndTime", targetTime);
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        timerRef.current.textContent = "Offer Ended";
        localStorage.removeItem("flashSaleEndTime");
      } else {
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerRef.current.textContent = `${hours}h ${minutes}m ${seconds}s`;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="popular">
      <div className="popular-products">
        <h1>
          <FaBolt className="icon flash" /> Flash Sales
        </h1>
        <h4>
          <FaClock className="icon pulse" /> Time Left:{" "}
          <span ref={timerRef}></span>
        </h4>
      </div>
      <div className="popular-item">
        {popularProducts.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default Popular;
