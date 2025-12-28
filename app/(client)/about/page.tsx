import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from "react-icons/fi";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Your Beauty Store",
  description:
    "Get in touch with us for inquiries, support, or beauty consultations.",
};

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <FiPhone className="w-6 h-6" />,
      title: "Phone",
      details: ["+233 24 123 4567", "+233 55 987 6543"],
      description: "Call us for quick assistance",
    },
    {
      icon: <FiMail className="w-6 h-6" />,
      title: "Email",
      details: ["hello@yourbeautystore.com", "support@yourbeautystore.com"],
      description: "We respond within 24 hours",
    },
    {
      icon: <FiMapPin className="w-6 h-6" />,
      title: "Location",
      details: ["123 Beauty Street, Accra", "Ghana"],
      description: "Visit our store",
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      description: "Closed on Sundays",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f5] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#e39a89] to-[#d87a6a]">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Get in Touch
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We&apos;re here to help with your beauty journey. Reach out for
              product inquiries, consultations, or any questions you may have.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-[#e39a89]/10 flex items-center justify-center text-[#e39a89] mb-6">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {info.title}
                </h3>
                <div className="space-y-1 mb-3">
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-gray-700">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-gray-500 text-sm">{info.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Send Us a Message
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Fill out the form below and we&apos;ll get back to you as soon as
              possible
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="name">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent"
                    placeholder="Your name"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent"
                    placeholder="your@email.com"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] focus:border-transparent resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FiSend className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                How do I know your products are authentic?
              </h3>
              <p className="text-gray-600">
                We source all our products directly from authorized distributors
                and manufacturers. Each product undergoes quality verification
                before being listed on our store.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                What is your return policy?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day return policy for unused products in their
                original packaging. Contact our customer service team to
                initiate a return.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Do you offer beauty consultations?
              </h3>
              <p className="text-gray-600">
                Yes! Our beauty experts are available for free consultations.
                Contact us to schedule a session either in-store or virtually.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                How long does delivery take?
              </h3>
              <p className="text-gray-600">
                Delivery times vary by location. In Accra, expect 1-2 business
                days. Other regions typically take 3-5 business days.
                You&apos;ll receive tracking information once your order ships.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
