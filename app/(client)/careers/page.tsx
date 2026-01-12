"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiBriefcase,
  FiUsers,
  FiHeart,
  FiGlobe,
  FiClock,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";

type Job = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  salary: string;
};

const jobOpenings: Job[] = [];

const benefits = [
  {
    icon: <FiBriefcase />,
    title: "Growth Opportunities",
    desc: "Clear career progression paths",
  },
  {
    icon: <FiHeart />,
    title: "Health & Wellness",
    desc: "Comprehensive medical coverage",
  },
  {
    icon: <FiUsers />,
    title: "Team Culture",
    desc: "Collaborative and supportive environment",
  },
  {
    icon: <FiGlobe />,
    title: "Remote Options",
    desc: "Flexible work arrangements",
  },

  {
    icon: <FiClock />,
    title: "Flexible Hours",
    desc: "Work-life balance focus",
  },
];

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const departments = [
    "all",
    "Research & Development",
    "Marketing",
    "Operations",
    "Customer Service",
    "Creative",
  ];
  const locations = ["all", "Accra, Ghana", "Remote", "Hybrid"];

  const filteredJobs = jobOpenings.filter((job) => {
    return (
      (selectedDepartment === "all" || job.department === selectedDepartment) &&
      (selectedLocation === "all" || job.location === selectedLocation)
    );
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-[#2a5a50] py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Build the Future of <span className="text-[#e39a89]">Beauty</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join our mission to create clean, effective cosmetics that celebrate
            diversity and sustainability.
          </p>
          <Link
            href="#open-positions"
            className="inline-flex items-center gap-2 bg-[#e39a89] text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            <FiBriefcase className="w-5 h-5" />
            View Open Positions
          </Link>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Join Hayate Cosmetics?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We&apos;re more than a beauty brand. We&apos;re a community of
              innovators, dreamers, and change-makers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {benefits.map((benefit, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-[#e39a89] text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Video/Image Section */}
          {/* <div className="relative h-[400px] rounded-3xl overflow-hidden mb-20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#e39a89]/30 to-[#1b3c35]/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                </div>
                <p className="text-xl font-semibold">See Our Team in Action</p>
              </div>
            </div>
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
          </div> */}
        </div>
      </section>

      {/* Open Positions */}
      <section
        id="open-positions"
        className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Open Positions
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {filteredJobs.length === 0
                  ? "We are not hiring at the moment"
                  : `${filteredJobs.length} positions available`}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mt-6 lg:mt-0">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "all" ? "All Locations" : loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Listings */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#e39a89] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-[#e39a89] font-semibold">
                      {job.department}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 text-[#e39a89] text-sm font-semibold rounded-full">
                    {job.type}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {job.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {job.experience}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {job.salary}
                    </span>
                  </div>
                  <Link
                    href={`/careers/apply/${job.id}`}
                    className="px-6 py-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-12 text-center max-w-2xl mx-auto mt-10">
              <FiBriefcase className="w-16 h-16 text-[#e39a89] mx-auto mb-6" />

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Open Positions
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We are not hiring at the moment, but we are always open to
                meeting talented people. Feel free to send us your resume and
                we’ll reach out when roles open.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="mailto:yussifhayate10@icloud.com"
                  className="bg-[#e39a89] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90"
                >
                  Send Your Resume
                </Link>

                <Link
                  href="/contact"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-full font-semibold hover:opacity-90"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Our Hiring Process
          </h2>

          <div className="relative max-w-4xl mx-auto">
            {/* Process Line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-[#e39a89] to-[#1b3c35] hidden md:block" />

            <div className="grid md:grid-cols-4 gap-8 relative">
              {[
                {
                  step: "1",
                  title: "Application",
                  desc: "Submit your application online",
                },
                {
                  step: "2",
                  title: "Screening",
                  desc: "Initial phone call with our team",
                },
                {
                  step: "3",
                  title: "Interview",
                  desc: "Meet the team virtually or in-person",
                },
                {
                  step: "4",
                  title: "Offer",
                  desc: "Welcome to the Hayate family!",
                },
              ].map((process, index) => (
                <div key={index} className="text-center">
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 mx-auto">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {process.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
