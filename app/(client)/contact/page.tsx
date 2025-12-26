"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FiPhone className="w-6 h-6" />,
      title: "Call Us",
      details: ["+233 55 123 4567", "+233 20 987 6543"],
      description: "Monday-Friday, 9AM-6PM",
    },
    {
      icon: <FiMail className="w-6 h-6" />,
      title: "Email Us",
      details: ["support@hayatecosmetics.com", "wholesale@hayatecosmetics.com"],
      description: "Response within 24 hours",
    },
    {
      icon: <FiMapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: ["123 Beauty Street, Osu", "Accra, Ghana"],
      description: "Flagship Store & HQ",
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Store Hours",
      details: ["Mon-Sat: 9AM-8PM", "Sunday: 10AM-6PM"],
      description: "Public holidays may vary",
    },
  ];

  const faqs = [
    {
      question: "What is your shipping policy?",
      answer:
        "We offer free shipping on orders over ₵100 within Ghana. International shipping available.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Tracking information is sent via email once your order ships. You can also check your account.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship worldwide. Shipping costs and times vary by location.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We accept returns within 30 days for unopened products. See our Terms for details.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1b3c35] via-[#2a5a50] to-[#e39a89]/20 py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Get in <span className="text-[#e39a89]">Touch</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              We&apos;re here to help with any questions about our products,
              orders, or beauty advice.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-[#e39a89] mb-4 group-hover:scale-110 transition-transform">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {info.title}
                </h3>
                <div className="space-y-1 mb-3">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 dark:text-gray-300">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {info.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="sticky top-24">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] rounded-xl flex items-center justify-center">
                    <FiMessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Send Us a Message
                  </h2>
                </div>

                {isSubmitted ? (
                  <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-200 dark:border-green-900 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <FiCheckCircle className="w-8 h-8 text-green-500" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Message Sent Successfully!
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Thank you for contacting us. Our team will respond within
                      24 hours. In the meantime, check out our FAQ section
                      below.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                        placeholder="+233 XX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                      >
                        <option value="">Select a topic</option>
                        <option value="order">Order Inquiry</option>
                        <option value="product">Product Question</option>
                        <option value="shipping">Shipping & Delivery</option>
                        <option value="return">Returns & Refunds</option>
                        <option value="consultation">
                          Beauty Consultation
                        </option>
                        <option value="wholesale">Wholesale Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200 resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Map & FAQ */}
            <div className="space-y-12">
              {/* Map */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Visit Our Flagship Store
                </h3>
                <div className="relative h-[300px] rounded-2xl overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e39a89]/20 to-[#1b3c35]/20" />
                  <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#e39a89] rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiMapPin className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-gray-600">Interactive Map Here</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Address:</strong> 123 Beauty Street, Osu, Accra,
                    Ghana
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Parking:</strong> Free parking available
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Accessibility:</strong> Wheelchair accessible
                  </p>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-[#e39a89] transition-colors"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 text-[#e39a89] font-semibold hover:underline"
                  >
                    View all FAQs
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-r from-[#1b3c35] to-[#2a5a50] text-white rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6">Connect With Us</h3>
                <p className="text-gray-200 mb-6">
                  Follow us for beauty tips, new product launches, and exclusive
                  offers.
                </p>
                <div className="flex gap-4">
                  {["Instagram", "Facebook", "Twitter", "YouTube"].map(
                    (platform) => (
                      <a
                        key={platform}
                        href="#"
                        className="flex-1 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-center font-semibold hover:bg-white/20 transition-colors"
                      >
                        {platform}
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Need Immediate Assistance?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Our customer support team is available via live chat during business
            hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white font-semibold rounded-full hover:opacity-90 transition-opacity">
              Start Live Chat
            </button>
            <Link
              href="/consultation"
              className="px-8 py-3 border-2 border-[#e39a89] text-[#e39a89] font-semibold rounded-full hover:bg-[#e39a89] hover:text-white transition-colors"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
