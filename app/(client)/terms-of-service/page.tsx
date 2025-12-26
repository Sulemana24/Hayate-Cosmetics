"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiFileText,
  FiShoppingBag,
  FiRefreshCw,
  FiAlertTriangle,
  FiShield,
} from "react-icons/fi";

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview" },
    { id: "accounts", title: "Accounts & Registration" },
    { id: "products", title: "Products & Pricing" },
    { id: "orders", title: "Ordering & Payment" },
    { id: "shipping", title: "Shipping & Delivery" },
    { id: "returns", title: "Returns & Refunds" },
    { id: "intellectual", title: "Intellectual Property" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "changes", title: "Changes to Terms" },
    { id: "contact", title: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <FiFileText className="w-12 h-12 text-[#e39a89]" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Terms of Service
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using our website or
              purchasing our products.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Table of Contents
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

                {/* Important Notice */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#e39a89]/5 to-[#1b3c35]/5 rounded-xl">
                    <FiAlertTriangle className="w-5 h-5 text-[#e39a89] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      By using our website, you agree to these terms. If you
                      disagree, please discontinue use.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                {/* Last Updated */}
                <div className="mb-8 p-4 bg-gradient-to-r from-[#1b3c35]/5 to-[#e39a89]/5 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Last Updated:</strong> December 15, 2023
                  </p>
                </div>

                {/* Overview */}
                <section id="overview" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    1. Overview
                  </h2>
                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p>
                      Welcome to Hayate Cosmetics. These Terms of Service govern
                      your use of our website and services. By accessing or
                      using our services, you agree to be bound by these terms.
                    </p>
                    <p>
                      Hayate Cosmetics is a cosmetics retailer based in Ghana,
                      specializing in premium beauty products. Our website
                      allows users to browse and purchase products, book
                      consultations, and access educational content.
                    </p>
                  </div>
                </section>

                {/* Accounts */}
                <section id="accounts" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-lg flex items-center justify-center">
                      <FiShield className="w-5 h-5 text-[#e39a89]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      2. Accounts & Registration
                    </h2>
                  </div>

                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Account Creation
                      </h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          You must be at least 18 years old to create an account
                        </li>
                        <li>Provide accurate and complete information</li>
                        <li>
                          Maintain the security of your account credentials
                        </li>
                        <li>
                          Notify us immediately of any unauthorized access
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Account Termination
                      </h3>
                      <p>
                        We reserve the right to suspend or terminate accounts
                        that violate these terms, engage in fraudulent activity,
                        or for any other reason at our sole discretion.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Products & Pricing */}
                <section id="products" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-lg flex items-center justify-center">
                      <FiShoppingBag className="w-5 h-5 text-[#e39a89]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      3. Products & Pricing
                    </h2>
                  </div>

                  <div className="space-y-6 text-gray-600 dark:text-gray-300">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Product Information
                      </h3>
                      <p>
                        We strive to display product information accurately,
                        including descriptions, pricing, and availability.
                        However, we cannot guarantee that all information is
                        error-free. Product colors may vary due to monitor
                        settings.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Pricing
                      </h3>
                      <p>
                        All prices are in Ghanaian Cedis (₵) unless otherwise
                        stated. Prices are subject to change without notice. We
                        reserve the right to limit quantities and correct
                        pricing errors.
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-[#e39a89]/5 to-[#1b3c35]/5 p-6 rounded-xl">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Important Notice
                      </h3>
                      <p>
                        Before using any cosmetic product, we recommend
                        performing a patch test. Discontinue use if irritation
                        occurs and consult a healthcare professional.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Ordering & Payment */}
                <section id="orders" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    4. Ordering & Payment
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Order Confirmation",
                        desc: "Orders are confirmed via email. We reserve the right to cancel orders for any reason.",
                      },
                      {
                        title: "Payment Methods",
                        desc: "We accept major credit cards, mobile money, and bank transfers. All payments are processed securely.",
                      },
                      {
                        title: "Sales Tax",
                        desc: "Applicable taxes are included in the displayed price or added at checkout.",
                      },
                      {
                        title: "Order Changes",
                        desc: "Contact us immediately if you need to modify your order. Changes may not be possible once processing begins.",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-6 h-6 bg-[#e39a89] text-white rounded-full flex items-center justify-center text-sm mt-1">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Shipping & Delivery */}
                <section id="shipping" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    5. Shipping & Delivery
                  </h2>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                          Domestic Shipping
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                          <li>3-5 business days within Ghana</li>
                          <li>Free shipping on orders over ₵100</li>
                          <li>Standard shipping: ₵15</li>
                          <li>Express shipping available</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                          International Shipping
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                          <li>7-14 business days worldwide</li>
                          <li>Shipping costs calculated at checkout</li>
                          <li>Customs and import duties may apply</li>
                          <li>Tracking provided for all orders</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Returns & Refunds */}
                <section id="returns" className="mb-12 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-lg flex items-center justify-center">
                      <FiRefreshCw className="w-5 h-5 text-[#e39a89]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      6. Returns & Refunds
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-[#e39a89]/5 to-[#1b3c35]/5 p-6 rounded-xl">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Return Policy
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        We offer a 30-day return policy for unopened and unused
                        products. To be eligible for a return:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                        <li>
                          Items must be in original packaging with tags attached
                        </li>
                        <li>Proof of purchase required</li>
                        <li>Contact us within 30 days of delivery</li>
                        <li>
                          Return shipping costs are the customer&apos;s
                          responsibility
                        </li>
                      </ul>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-900">
                      <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">
                        Non-Returnable Items
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-red-700 dark:text-red-400">
                        <li>Opened or used products (for hygiene reasons)</li>
                        <li>Personalized items</li>
                        <li>Gift cards</li>
                        <li>Sale items marked as final sale</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-900">
                      <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">
                        Refund Process
                      </h3>
                      <p className="text-green-700 dark:text-green-400">
                        Approved returns are processed within 7-10 business
                        days. Refunds are issued to the original payment method.
                        Store credit may be offered at our discretion.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section id="intellectual" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    7. Intellectual Property
                  </h2>
                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p>
                      All content on this website, including text, graphics,
                      logos, images, and software, is the property of Hayate
                      Cosmetics and protected by copyright laws.
                    </p>
                    <p>
                      You may not reproduce, distribute, modify, or create
                      derivative works without our express written permission.
                      The Hayate Cosmetics name and logo are registered
                      trademarks.
                    </p>
                  </div>
                </section>

                {/* Limitation of Liability */}
                <section id="liability" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    8. Limitation of Liability
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      To the fullest extent permitted by law, Hayate Cosmetics
                      shall not be liable for:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                      <li>
                        Any indirect, incidental, or consequential damages
                      </li>
                      <li>Loss of profits, data, or business opportunities</li>
                      <li>Damages resulting from product misuse</li>
                      <li>Third-party actions or content</li>
                      <li>Website downtime or technical issues</li>
                    </ul>
                  </div>
                </section>

                {/* Changes to Terms */}
                <section id="changes" className="mb-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    9. Changes to Terms
                  </h2>
                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p>
                      We reserve the right to modify these terms at any time.
                      Changes will be effective immediately upon posting to the
                      website. Your continued use constitutes acceptance of
                      modified terms.
                    </p>
                    <p>
                      We will notify users of significant changes via email or
                      website notification. It is your responsibility to review
                      these terms periodically.
                    </p>
                  </div>
                </section>

                {/* Contact */}
                <section id="contact" className="scroll-mt-24">
                  <div className="bg-gradient-to-r from-[#1b3c35]/5 to-[#e39a89]/5 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      10. Contact Information
                    </h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-300">
                      <p>
                        For questions about these Terms of Service, please
                        contact us:
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                            Email
                          </h3>
                          <Link
                            href="mailto:legal@hayatecosmetics.com"
                            className="text-[#e39a89] hover:underline"
                          >
                            legal@hayatecosmetics.com
                          </Link>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                            Address
                          </h3>
                          <p>
                            Hayate Cosmetics Ltd.
                            <br />
                            123 Beauty Street
                            <br />
                            Accra, Ghana
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Acceptance */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By using our website and services, you acknowledge that you
                    have read, understood, and agree to be bound by these Terms
                    of Service.
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
