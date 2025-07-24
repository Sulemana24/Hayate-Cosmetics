import React, { useState } from "react";
import "./CSS/Login.css";

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const login = async () => {
    setLoading(true);
    let responseData;

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
    } catch (err) {
      console.error("Login failed", err);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);

    if (responseData?.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData?.errors || "Login failed");
    }
  };

  const signup = async () => {
    setLoading(true);
    let responseData;

    try {
      const response = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
    } catch (err) {
      console.error("Signup failed", err);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);

    if (responseData?.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData?.errors || "Signup failed");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? (
            <input
              name="username"
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder="Enter your name"
            />
          ) : (
            <></>
          )}
          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder="Enter your email address"
          />
          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="Enter password"
          />
        </div>
        <div className="loginsignup-agree">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            id="terms"
          />
          <label htmlFor="terms">
            By continuing, I agree to the terms of use & privacy policy.
          </label>
        </div>

        <button
          disabled={loading}
          onClick={() => {
            if (!agreed) {
              setError("Please agree to the terms.", { autoClose: 3000 });
              return;
            }
            setError("");
            state === "Login" ? login() : signup();
          }}
        >
          {loading ? <span className="spinner"></span> : "Continue"}
        </button>

        {error && <p className="error-message">{error}</p>}

        {state === "Sign Up" ? (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span
              onClick={() => {
                setState("Login");
              }}
            >
              Login
            </span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Create an account now.{" "}
            <span
              onClick={() => {
                setState("Sign Up");
              }}
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
