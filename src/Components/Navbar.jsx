import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-0">

        {/* Logo + Name */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="LocalServices"
            className="w-12 h-12 object-contain drop-shadow-sm"
          />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">LocalServices</h1>
            <p className="text-xs text-slate-500 -mt-1">Trusted pros near you</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-teal-600">Home</Link>
          <Link to="/services" className="hover:text-teal-600">Services</Link>
          <Link to="/signup" className="hover:text-teal-600">Signup</Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600 shadow-sm"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded hover:bg-slate-100"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="w-6 h-6 text-slate-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 py-3 px-6 space-y-3">
          <Link to="/" className="block text-slate-700">Home</Link>
          <Link to="/services" className="block text-slate-700">Services</Link>
          <Link to="/signup" className="block text-slate-700">Signup</Link>
          <Link
            to="/signup"
            className="block bg-teal-500 text-white text-center py-2 rounded-md shadow-sm"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
