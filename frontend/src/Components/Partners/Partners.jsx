import React from "react";
import nivea from "../Assets/Nivea_logo.svg";
import dove from "../Assets/Dove logo.svg";
import unilever from "../Assets/unilever-logo.jpg";
import chanel from "../Assets/Chanel_logo_interlocking_cs.svg.png";
import dior from "../Assets/Christian Dior SE logo - Brandlogos.net.svg";
import versace from "../Assets/versace-logo.png";
import dolce from "../Assets/Dolce & Gabbana logomark logo - Brandlogos.net.svg";
import maison from "../Assets/Maison 21G logo - Brandlogos.net.svg";
import "./Partners.css";

const Partners = () => {
  return (
    <div>
      <div className="brand-partners-container">
        <h2>Our Trusted Brand Partners</h2>
        <p>
          We are proud to collaborate with some of the best brands in the
          industry to deliver exceptional products and services to our
          customers.
        </p>
        <div className="partners-logos">
          <div className="partner-logo">
            <img src={nivea} alt="Nivea logo" title="Nivea" />
          </div>
          <div className="partner-logo">
            <img src={dove} alt="Dove" title="Dove" />
          </div>
          <div className="partner-logo">
            <img src={unilever} alt="Unilever" title="Unilever" />
          </div>
          <div className="partner-logo">
            <img src={chanel} alt="Chanel logo" title="Chanel" />
          </div>
          <div className="partner-logo">
            <img src={dior} alt="Dior logo" title="Christian Dior" />
          </div>
          <div className="partner-logo">
            <img src={versace} alt="Versace logo" title="Versace" />
          </div>
          <div className="partner-logo">
            <img src={dolce} alt="Partner 3" title="Dolce & Gabbana" />
          </div>
          <div className="partner-logo">
            <img src={maison} alt="Maison logo" title="Maison" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
