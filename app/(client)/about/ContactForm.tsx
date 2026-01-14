"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("Message sent successfully ✅");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Send Us a Message
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Fill out the form below and we&apos;ll get back to you as soon as
        possible
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent text-black"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent text-black"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2" htmlFor="subject">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent text-black"
            placeholder="How can we help?"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2" htmlFor="message">
            Message *
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent resize-none text-black"
            placeholder="Your message here..."
          ></textarea>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-60"
          >
            <FiSend className="w-5 h-5" />
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>

        {status && (
          <p className="text-center mt-4 text-sm text-gray-600">{status}</p>
        )}
      </form>
    </div>
  );
}
