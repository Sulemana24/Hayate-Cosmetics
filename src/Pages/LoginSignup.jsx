import React from "react";
import "./CSS/Login.css";

const LoginSignup = () => {
  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>Sign Up</h1>
        <div className="loginsignup-fields">
          <input type="text" placeholder="Enter your name" />
          <input type="email" placeholder="Enter your email address" />
          <input type="password" placeholder="Enter password" />
        </div>
        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        <button>Continue</button>
        <p className="loginsignup-login">
          Already have an account? <span>Login Here</span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
