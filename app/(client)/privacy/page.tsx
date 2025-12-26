"use client";

import { useState } from "react";
import Link from "next/link";
import { FiShield, FiMail, FiLock } from "react-icons/fi";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("data-collection");

  const sections = [
    { id: "data-collection", title: "Data Collection" },
    { id: "data-usage", title: "How We Use Data" },
    { id: "cookies", title: "Cookies" },
    { id: "data-security", title: "Data Security" },

    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <FiShield className="w-12 h-12 text-[#e39a89]" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Privacy Policy
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Last updated: December 2025. We respect your privacy and are
              committed to protecting your personal data.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Quick Navigation
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document
                          .getElementById(section.id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 text-[#e39a89]"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                {/* Introduction */}
                <div className="mb-12">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    At Hayate Cosmetics, we take your privacy seriously. This
                    policy explains how we collect, use, disclose, and safeguard
                    your information when you visit our website or make a
                    purchase.
                  </p>
                </div>

                {/* Data Collection */}
                <section id="data-collection" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-lg flex items-center justify-center">
                      <FiMail className="w-5 h-5 text-[#e39a89]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Data We Collect
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Personal Information
                      </h3>
                      <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
                        <li>Name and contact details (email, phone number)</li>
                        <li>Shipping addresses</li>
                        <li>
                          Payment information (processed securely by our payment
                          partners)
                        </li>
                        <li>Order history and preferences</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Usage */}
                <section id="data-usage" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    How We Use Your Data
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "Order Processing",
                        desc: "To process and fulfill your orders",
                      },
                      {
                        title: "Customer Support",
                        desc: "To provide assistance and respond to inquiries",
                      },
                      {
                        title: "Personalization",
                        desc: "To recommend products you might love",
                      },
                      {
                        title: "Marketing",
                        desc: "To send updates about new products (with consent)",
                      },
                      {
                        title: "Improvements",
                        desc: "To enhance our website and services",
                      },
                      {
                        title: "Security",
                        desc: "To prevent fraud and ensure security",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl"
                      >
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Cookies */}
                <section id="cookies" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Cookies & Tracking
                  </h2>
                  <div className="bg-gradient-to-r from-[#e39a89]/5 to-[#1b3c35]/5 p-6 rounded-xl">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      We use cookies to enhance your shopping experience. You
                      can control cookies through your browser settings.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          Essential Cookies
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Required for site functionality
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          Analytics Cookies
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Help us improve our services
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          Marketing Cookies
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Used for personalized ads (opt-in required)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          Preference Cookies
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Remember your settings
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Security */}
                <section id="data-security" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-lg flex items-center justify-center">
                      <FiLock className="w-5 h-5 text-[#e39a89]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Data Security
                    </h2>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      We implement appropriate technical and organizational
                      security measures to protect your personal data,
                      including:
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
                      <li>SSL encryption for all data transfers</li>
                      <li>Regular security audits and updates</li>
                      <li>Limited access to personal data</li>
                      <li>
                        Secure payment processing through trusted partners
                      </li>
                      <li>Data minimization principles</li>
                    </ul>
                  </div>
                </section>

                {/* Your Rights */}
                <section id="your-rights" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Your Rights Under GDPR/CCPA
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        right: "Right to Access",
                        desc: "Request copies of your personal data",
                      },
                      {
                        right: "Right to Rectification",
                        desc: "Request correction of inaccurate data",
                      },
                      {
                        right: "Right to Erasure",
                        desc: "Request deletion of your personal data",
                      },
                      {
                        right: "Right to Restrict",
                        desc: "Request restriction of processing",
                      },
                      {
                        right: "Right to Object",
                        desc: "Object to processing of your data",
                      },
                      {
                        right: "Right to Data Portability",
                        desc: "Request transfer of your data",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-[#e39a89] text-white rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {item.right}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Contact */}
                <section id="contact" className="scroll-mt-24">
                  <div className="bg-gradient-to-r from-[#1b3c35]/5 to-[#e39a89]/5 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Contact Our Privacy Team
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      For privacy-related inquiries or to exercise your rights,
                      contact us:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                          Email
                        </h3>
                        <Link
                          href="mailto:privacy@hayatecosmetics.com"
                          className="text-[#e39a89] hover:underline"
                        >
                          yussifhayate@icloud.com
                        </Link>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                          Contact
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          (233) 53-384-2202
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Policy Updates */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We may update this privacy policy from time to time. We will
                    notify you of any changes by posting the new policy on this
                    page and updating the &quot;Last updated&quot; date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
