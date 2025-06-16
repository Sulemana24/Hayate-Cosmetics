import React from "react";
import "./NewsLetter.css";

const NewsLetter = () => {
  return (
    <div className="newsletter">
      <h1>Subscribe to our Newsletter</h1>
      <p>Get the latest updates and offers directly in your inbox.</p>

      <div>
        <input type="email" placeholder="Enter Your Email Address" />
        <button>Subscribe</button>
      </div>
    </div>
  );
};

export default NewsLetter;
