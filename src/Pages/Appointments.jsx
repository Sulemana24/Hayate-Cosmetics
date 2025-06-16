import React, { useState } from "react";
import "./CSS/Appointments.css";

const Appointments = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    service: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment Data:", formData);
    setSubmitted(true);

    // Optionally send this data to backend/server here
    // fetch("/api/appointments", {...})
  };

  return (
    <div className="appointments-container">
      <h2>Book an Appointment</h2>
      {submitted ? (
        <div className="success-message">
          <p>Thank you! Your appointment has been booked.</p>
        </div>
      ) : (
        <form className="appointment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
          />
          <input
            type="time"
            name="time"
            required
            value={formData.time}
            onChange={handleChange}
          />
          <select
            name="service"
            required
            value={formData.service}
            onChange={handleChange}
          >
            <option value="">Select a Service</option>
            <option value="skincare">Skincare Consultation</option>
            <option value="makeup">Makeup Session</option>
            <option value="haircare">Haircare Treatment</option>
          </select>
          <button type="submit">Book Now</button>
        </form>
      )}
    </div>
  );
};

export default Appointments;
