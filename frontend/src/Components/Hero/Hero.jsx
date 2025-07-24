import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Empower Your Beauty, Everyday</h1>
        <p>
          Discover a wide range of premium beauty products that bring elegance
          and confidence to your everyday life.
        </p>
        <div className="hero-buttons">
          <button
            onClick={() => {
              setTimeout(() => {
                const shopSection = document.getElementById("shop");
                if (shopSection) {
                  shopSection.scrollIntoView({ behavior: "smooth" });
                }
              }, 300);
            }}
          >
            Shop Now
          </button>
          <button
            onClick={() => {
              setTimeout(() => {
                const aboutSection = document.getElementById("about");
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: "smooth" });
                }
              }, 300);
            }}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
