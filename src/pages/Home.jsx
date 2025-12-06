import React from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaTools,
  FaFan,
  FaBolt,
  FaBook,
} from "react-icons/fa";

export default function Home() {
  return (
    <div className="bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-emerald-500 to-sky-500 text-white">
        {/* soft glow blobs */}
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div>
            <p className="uppercase tracking-wide text-sm text-teal-100 mb-2">
              Local service marketplace
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Book trusted <br className="hidden md:block" />
              local professionals
            </h1>

            <p className="mt-4 text-teal-50/90 text-sm md:text-base max-w-xl">
              Instantly find plumbers, electricians, AC technicians, tutors and more.
              Compare options, pick a time and pay securely — all in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-md bg-white text-teal-700 font-medium shadow-md hover:bg-slate-100"
              >
                Browse services
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-md border border-teal-100 text-white/90 hover:bg-teal-600/40"
              >
                Become a provider
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-white text-lg">50+</div>
                <div className="text-teal-100 text-xs">Service categories</div>
              </div>
              <div>
                <div className="font-semibold text-white text-lg">4.8★</div>
                <div className="text-teal-100 text-xs">Average rating</div>
              </div>
              <div>
                <div className="font-semibold text-white text-lg">24/7</div>
                <div className="text-teal-100 text-xs">Instant booking</div>
              </div>
            </div>
          </div>

          {/* RIGHT – hero card */}
          <div className="bg-white/95 rounded-2xl shadow-2xl p-4 md:p-5 text-slate-900">
            <div className="rounded-xl overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80"
                alt="Local service professional"
                className="w-full h-56 object-cover"
              />
            </div>
            <div className="flex items-center justify-between mb-3 text-sm">
              <div>
                <div className="font-semibold">Today’s top pick</div>
                <div className="text-slate-500 text-xs">AC repair · Plumbing · Cleaning</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                Verified pros
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex-1 rounded-lg border border-slate-200 px-3 py-2">
                <div className="text-slate-500">Select date</div>
                <div className="font-medium text-slate-900">Anytime this week</div>
              </div>
              <div className="flex-1 rounded-lg border border-slate-200 px-3 py-2">
                <div className="text-slate-500">Location</div>
                <div className="font-medium text-slate-900 truncate">Your city</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(45,212,191,1) 0%, rgba(6,182,212,1) 100%)",
              }}
            >
              <FaSearch className="text-white" />
            </div>
            <div className="font-semibold mb-1">Search for a service</div>
            <p className="text-slate-500">
              Choose from categories like plumbing, AC service, electrician, tuition and more.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(124,58,237,1) 100%)",
              }}
            >
              <FaCalendarAlt className="text-white" />
            </div>
            <div className="font-semibold mb-1">Pick your slot</div>
            <p className="text-slate-500">
              View provider availability, select a date and time that works for you.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(167,139,250,1) 0%, rgba(251,113,133,1) 100%)",
              }}
            >
              <FaCheckCircle className="text-white" />
            </div>
            <div className="font-semibold mb-1">Pay & get it done</div>
            <p className="text-slate-500">
              Pay securely and track your booking. Rate your experience afterwards.
            </p>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-semibold text-slate-900 mb-5">Popular categories</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { name: "Plumbing", desc: "Leaks, taps, fittings", icon: <FaTools /> , bg: "linear-gradient(135deg,#10b981,#06b6d4)"},
            { name: "AC Repair", desc: "Service, gas refill", icon: <FaFan /> , bg: "linear-gradient(135deg,#3b82f6,#06b6d4)"},
            { name: "Electrician", desc: "Wiring, switches", icon: <FaBolt /> , bg: "linear-gradient(135deg,#f59e0b,#f97316)"},
            { name: "Home Tuition", desc: "Maths, science & more", icon: <FaBook /> , bg: "linear-gradient(135deg,#ec4899,#f43f5e)"},
          ].map((cat) => (
            <div
              key={cat.name}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ background: cat.bg }}
                >
                  {React.cloneElement(cat.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{cat.name}</div>
                  <div className="text-slate-500 text-xs mt-1">{cat.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
