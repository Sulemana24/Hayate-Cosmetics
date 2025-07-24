import React, { useState } from "react";
import "./AboutCompany.css";
import company from "../Assets/pexels-marketingtuig-87223.jpg";

const AboutCompany = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="about-company">
      <div className="about-company-container">
        <div className="company-image">
          <img src={company} alt="Hayate Cosmetics Headquarters" />
        </div>
        <div className="company-details">
          <h2>About Hayate Cosmetics</h2>
          <p className="company-description">
            Hayate Cosmetics is a globally recognized brand, redefining beauty
            through innovation, inclusivity, and sustainability. Known for its
            high-quality, cruelty-free, and eco-conscious products, the company
            is dedicated to empowering individuals to embrace their unique
            beauty.
          </p>
          <p className={`extra-company-info ${showMore ? "show" : ""}`}>
            Since its founding, Hayate Cosmetics has been at the forefront of
            the beauty industry, blending science, nature, and artistry to
            create products that cater to all skin types and tones. The company
            is committed to sustainability, evident in its eco-friendly
            packaging and ethical sourcing practices.
            <br />
            Hayate Cosmetics also actively supports community initiatives that
            promote self-confidence and self-expression. By setting new
            standards in beauty, Hayate Cosmetics continues to inspire
            individuals worldwide to feel radiant and confident every day.
          </p>
          <button
            className="show-more-company-btn"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Show Less" : "Read More"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutCompany;
