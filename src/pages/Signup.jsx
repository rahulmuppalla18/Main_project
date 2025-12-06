import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function EyeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6 0-10-8-10-8a21.9 21.9 0 0 1 5-5.11"></path>
      <path d="M1 1l22 22"></path>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    </svg>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.phone.trim()) return "Please enter your phone number.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/auth/signup", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: form.role,
      }, { timeout: 10000 });
      setLoading(false);
      navigate("/services");
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(err?.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Promo panel */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-emerald-500 to-sky-500 p-8 gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="LocalServices" className="w-10 h-10 rounded-md object-contain bg-white/10 p-1" />
              <div className="text-white">
                <div className="font-semibold text-base">LocalServices</div>
                <div className="text-xs opacity-90">Trusted pros near you</div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Welcome to LocalServices</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Create an account to book trusted local professionals or list your services and gain clients in your area.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">✓</div>
                <div className="text-white">
                  <div className="font-medium">Verified providers</div>
                  <div className="text-xs opacity-90">Quality checked and rated</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">⚡</div>
                <div className="text-white">
                  <div className="font-medium">Fast bookings</div>
                  <div className="text-xs opacity-90">Simple booking & secure payments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="p-7 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="LocalServices" className="w-10 h-10 object-contain" />
                <div>
                  <div className="text-lg font-semibold text-slate-900">Create your account</div>
                  <div className="text-xs text-slate-500">Sign up as customer or provider</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Full name</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Phone</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">Email</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 pr-12"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a strong password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-3 text-slate-600 p-1 rounded-md hover:bg-slate-100"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-1">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="role"
                    checked={form.role === "customer"}
                    onChange={() => setForm({ ...form, role: "customer" })}
                    className="accent-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Customer</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="role"
                    checked={form.role === "provider"}
                    onChange={() => setForm({ ...form, role: "provider" })}
                    className="accent-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Provider</span>
                </label>
              </div>

              {/* Stacked CTA + login link (button full width, login below) */}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow hover:translate-y-[-1px] transition-transform disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="60" strokeDashoffset="0" strokeLinecap="round" fill="none" />
                    </svg>
                  ) : null}
                  Create account
                </button>

                <div className="mt-3 text-center">
                  <span className="text-sm text-slate-500 mr-2">Already have an account?</span>
                  <button type="button" onClick={() => navigate("/login")} className="text-emerald-600 font-medium text-sm">
                    Log in
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              By creating an account you agree to our <span className="text-slate-600">Terms</span> &amp; <span className="text-slate-600">Privacy</span>.
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} LocalServices
        </div>
      </div>
    </div>
  );
}
