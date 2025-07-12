import React, { useState } from "react";
import "./NewsLetter.css";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubscribe = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setMessage({ type: "error", text: "Email is required." });
    } else if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email." });
    } else {
      setMessage({ type: "success", text: "Thank you for subscribing!" });
      setEmail("");

      // Optional: send to backend/API here
    }

    // Remove message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div className="newsletter">
      <h1>Subscribe to our Newsletter</h1>
      <p>Get the latest updates and offers directly in your inbox.</p>

      <div>
        <input
          type="email"
          placeholder="Enter Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSubscribe}>Subscribe</button>
      </div>

      {message.text && (
        <div className={`newsletter-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default NewsLetter;
