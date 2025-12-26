"use client";

import { useState } from "react";
import {
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiMessageCircle,
} from "react-icons/fi";
import { FaRegSmile } from "react-icons/fa";

export default function TestimonialFAQSection() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}

// Testimonials Component
function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Accra, Ghana",
      comment:
        "The skincare products transformed my complexion! My skin has never felt better. The Vitamin C serum is now a staple in my routine.",
      rating: 5,
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Kwame Osei",
      location: "Kumasi, Ghana",
      comment:
        "Fast delivery and authentic products. The fragrance collection is exceptional - received many compliments!",
      rating: 4,
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Ama Mensah",
      location: "Cape Coast, Ghana",
      comment:
        "I was skeptical about online beauty shopping, but Glamour exceeded expectations. Packaging was secure and products fresh.",
      rating: 5,
      date: "3 weeks ago",
    },
    {
      id: 4,
      name: "Tiyumba Bobgu",
      location: "Tamale, Ghana",
      comment:
        "Customer service is top-notch! Helped me choose the perfect skincare routine for my skin type. Highly recommended!",
      rating: 5,
      date: "2 months ago",
    },
    {
      id: 5,
      name: "Esi Boateng",
      location: "Takoradi, Ghana",
      comment:
        "The accessories collection is beautiful. The sunglasses are high quality and arrived perfectly. Will definitely shop again!",
      rating: 4,
      date: "1 week ago",
    },
    {
      id: 6,
      name: "Michael Tetteh",
      location: "Tema, Ghana",
      comment:
        "Best prices for authentic products in Ghana. Saved me from ordering internationally and waiting for months.",
      rating: 5,
      date: "2 weeks ago",
    },
  ];

  // Get first character of name for profile pic
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Generate random color based on name for consistency
  const getAvatarColor = (name: string) => {
    const colors = [
      "from-[#e39a89] to-[#d87a6a]",
      "from-[#1b3c35] to-[#2a4d45]",
      "from-[#8B5CF6] to-[#7C3AED]",
      "from-[#0EA5E9] to-[#0284C7]",
      "from-[#10B981] to-[#059669]",
      "from-[#F59E0B] to-[#D97706]",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;

  const nextTestimonials = () => {
    setCurrentIndex(
      (prev) => (prev + testimonialsPerPage) % testimonials.length
    );
  };

  const prevTestimonials = () => {
    setCurrentIndex(
      (prev) =>
        (prev - testimonialsPerPage + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-full mb-4">
          <FiMessageCircle className="w-5 h-5 text-[#e39a89]" />
          <span className="text-[#e39a89] font-medium">Customer Stories</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          What Our Customers Say
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join thousands of satisfied customers across Ghana who trust us for
          their beauty and wellness needs
        </p>
      </div>

      <div className="relative">
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testimonials
            .slice(currentIndex, currentIndex + testimonialsPerPage)
            .map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {testimonial.date}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(
                      testimonial.name
                    )} flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {getInitials(testimonial.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={prevTestimonials}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:border-[#e39a89] hover:bg-[#e39a89]/5 flex items-center justify-center transition-all duration-300"
            aria-label="Previous testimonials"
          >
            <FiChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
          </button>
          <button
            onClick={nextTestimonials}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:border-[#e39a89] hover:bg-[#e39a89]/5 flex items-center justify-center transition-all duration-300"
            aria-label="Next testimonials"
          >
            <FiChevronDown className="w-5 h-5 text-gray-600 -rotate-90" />
          </button>
        </div>
      </div>
    </section>
  );
}

// FAQ Component
function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      id: 1,
      question: "How long does delivery take in Ghana?",
      answer:
        "We offer nationwide delivery within 2-5 business days for major cities (Accra, Kumasi, Tamale, Takoradi) and 5-7 days for other regions.",
    },
    {
      id: 2,
      question: "Are your products authentic and original?",
      answer:
        "Yes! We guarantee 100% authenticity for all our products. We source directly from authorized distributors and manufacturers. All products come with their original packaging and seals.",
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer:
        "We accept multiple payment methods: Mobile Money  and Cash on Delivery (available in Kumasi). All transactions are secure and encrypted.",
    },
    {
      id: 4,
      question: "Can I return or exchange products?",
      answer:
        "Normally, we do not accept returns or exchanges due to hygiene reasons. However, if you receive a damaged or incorrect item, please contact our support team within 48 hours for assistance.",
    },
    {
      id: 5,
      question: "How do I choose the right skincare products?",
      answer:
        "You can use our consultation service to get personalized recommendations based on your skin type and concerns. Additionally, our product descriptions provide detailed information to help you make informed choices.",
    },
    {
      id: 6,
      question: "Do you offer international shipping?",
      answer:
        "Currently, we only ship within Ghana. However, we're working on expanding our services to other West African countries soon. Subscribe to our newsletter for updates on international shipping.",
    },
  ];

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1b3c35]/10 to-[#2a4d45]/10 rounded-full mb-4">
          <FaRegSmile className="w-5 h-5 text-[#1b3c35]" />
          <span className="text-[#1b3c35] font-medium">Help Center</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Find quick answers to common questions about shopping with us
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-[#e39a89] rounded-full"></span>
          Still have questions?{" "}
          <a
            href="/contact"
            className="text-[#e39a89] hover:text-[#d87a6a] font-medium"
          >
            Contact our support team
          </a>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="mb-4 bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#e39a89]/30 transition-colors duration-300"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              aria-expanded={openFAQ === faq.id}
            >
              <h3 className="text-lg font-semibold text-gray-800 pr-4">
                {faq.question}
              </h3>
              {openFAQ === faq.id ? (
                <FiChevronUp className="w-5 h-5 text-[#e39a89] flex-shrink-0" />
              ) : (
                <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openFAQ === faq.id
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
