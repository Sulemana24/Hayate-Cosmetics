import React, { useEffect, useState } from "react";
import "./Offers.css";
import exclusiveImage from "../Assets/offers.png";
import { useNavigate } from "react-router-dom";

const Offers = () => {
  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const offerEndTime = new Date().getTime() + 2 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = offerEndTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft("Offer Ended");
      } else {
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="offers">
      <div className="offers-left">
        <img src={exclusiveImage} alt="Exclusive Offer" />
      </div>
      <div className="offers-right">
        <h1>Exclusive Offers Just For You</h1>
        <p>ONLY ON BEST SELLING PRODUCTS</p>
        <button onClick={() => navigate("/haircare")}>Check Now</button>
        <div className="countdown-timer">
          ⏰ Time Left: <span>{timeLeft}</span>
        </div>
      </div>
    </div>
  );
};

export default Offers;
