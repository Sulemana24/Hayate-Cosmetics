import React, { useState } from "react";
import hayate from "../Assets/IMG-20240911-WA0059.jpg";
import "./Ceo.css";

const Ceo = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="about-ceo">
      <div className="about-ceo-container">
        <div className="ceo-image">
          <img src={hayate} alt="ceo" />
        </div>
        <div className="ceo-details">
          <h2>Yussif Hayate</h2>
          <p>
            <strong>CEO & Founder</strong>
          </p>
          <p className="ceo-description">
            Hayate, the visionary leader behind Hayate Cosmetics, is a
            trailblazer in the beauty industry with a passion for innovation and
            inclusivity. With a deep understanding of skincare and cosmetics,
            Hayate founded the brand to empower individuals to embrace their
            unique beauty.
          </p>
          <p className={`extra-info ${showMore ? "show" : ""}`}>
            Under Hayate's leadership, Hayate Cosmetics has grown into a trusted
            name synonymous with high-quality, cruelty-free, and eco-conscious
            products. A champion of diversity and sustainability, Hayate ensures
            that every product reflects the brand's commitment to creating
            beauty solutions for all skin types and tones while protecting the
            planet. Beyond business, Hayate is an advocate for self-confidence
            and self-expression, inspiring people to feel their best in their
            skin. With a relentless drive to redefine beauty standards, Hayate
            continues to push boundaries, delivering innovative products that
            combine science, nature, and artistry.
          </p>
          <button
            className="show-more-btn"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Show Less" : "Read More"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ceo;
