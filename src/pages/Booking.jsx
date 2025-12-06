import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

/**
 * Booking page (complete)
 * - Reads selected service id from route param or localStorage
 * - Fetches service details (with demo fallback)
 * - Booking form (date, time slot, contact) with validation
 * - POSTs to /bookings and redirects to confirmation page on success
 */

// Demo fallbacks
const demoServices = [
  { _id: "demo-1", title: "Basic Plumbing Repair", description: "Fix leaking taps, unclog drains, replace washers.", price: 499, providerName: "AquaFix Pros", category: "Plumbing", image: "https://images.unsplash.com/photo-1581578017424-2c1f0f0b8b5b?auto=format&fit=crop&w=900&q=60", duration: "30–60 mins" },
  { _id: "demo-2", title: "AC Service & Gas Top-up", description: "Full AC cleaning, cooling check and gas refill.", price: 999, providerName: "CoolCare", category: "AC Repair", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=60", duration: "1–2 hours" },
];

function isoDateTodayPlus(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Booking() {
  const { serviceId: paramServiceId } = useParams(); // optional route param
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);

  // form state
  const [date, setDate] = useState(isoDateTodayPlus(0));
  const [time, setTime] = useState("10:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // time slots (placeholder; replace with provider availability later)
  const slots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  // Prefill contact from localStorage for convenience
  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    const savedPhone = localStorage.getItem("user_phone");
    const savedEmail = localStorage.getItem("user_email");
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Fetch service details
  useEffect(() => {
    let mounted = true;
    setLoadingService(true);

    const savedId = paramServiceId || localStorage.getItem("ls_selected_service");
    if (!savedId) {
      // fallback to demo first item
      setService(demoServices[0]);
      setLoadingService(false);
      return;
    }

    // try to fetch specific service
    axios.get(`http://localhost:5000/services/${savedId}`)
      .then(res => {
        if (!mounted) return;
        if (res?.data && Object.keys(res.data).length > 0) {
          setService(res.data);
        } else {
          // if empty, fetch all and find by id
          return axios.get("http://localhost:5000/services");
        }
      })
      .then(res2 => {
        if (!mounted) return;
        if (res2 && res2.data) {
          const found = res2.data.find(s => s._id === savedId);
          if (found) setService(found);
          else {
            const demo = demoServices.find(d => d._id === savedId) || demoServices[0];
            setService(demo);
          }
        }
      })
      .catch(err => {
        console.warn("Could not fetch service; using demo.", err?.message || err);
        const demo = demoServices.find(d => d._id === savedId) || demoServices[0];
        setService(demo);
      })
      .finally(() => mounted && setLoadingService(false));

    return () => (mounted = false);
  }, [paramServiceId]);

  const validate = () => {
    if (!name.trim()) return "Please provide your name.";
    if (!phone.trim() || !/^\+?[\d\s-]{7,15}$/.test(phone.trim())) return "Please enter a valid phone number.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    if (!date) return "Pick a booking date.";
    if (!time) return "Pick a time slot.";
    return "";
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const v = validate();
    if (v) { setError(v); return; }

    // date/time sanity
    const selectedDateTime = new Date(`${date}T${time}:00`);
    if (selectedDateTime < new Date()) {
      setError("Please choose a future date/time.");
      return;
    }

    // store contact locally for convenience
    localStorage.setItem("user_name", name);
    localStorage.setItem("user_phone", phone);
    localStorage.setItem("user_email", email);

    const payload = {
      serviceId: service?._id || null,
      serviceTitle: service?.title || "",
      providerName: service?.providerName || "",
      date,
      time,
      customer: { name, phone, email },
      notes,
      price: service?.price ?? null,
    };

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/bookings", payload, { timeout: 10000 });
      setLoading(false);

      // success handling: save booking and redirect to confirmation page
      const created = res?.data || {};
      // cache for fallback
      try {
        localStorage.setItem("last_booking", JSON.stringify(created));
      } catch (err) {
        // ignore localStorage errors
      }

      const bid = created._id || created.bookingId || created.id;
      if (bid) {
        // redirect to confirmation with booking id
        window.location.href = `/booking/confirmation?bookingId=${bid}`;
      } else {
        // fallback: redirect without id (confirmation page will read localStorage)
        window.location.href = `/booking/confirmation`;
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setLoading(false);
      setError(err?.response?.data?.message || "Booking failed — please try again.");
    }
  };

  const priceDisplay = useMemo(() => {
    if (!service) return "—";
    return service.price ? `₹${service.price}` : "Contact";
  }, [service]);

  if (loadingService) {
    return (
      <div className="container py-16">
        <div className="animate-pulse h-6 bg-slate-100 w-1/3 mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 rounded-lg" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-40 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Left: summary card */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="rounded-lg overflow-hidden mb-4 h-44 bg-slate-100">
              {service?.image ? (
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              ) : null}
            </div>

            <div className="mb-3">
              <div className="text-sm text-slate-500">Service</div>
              <div className="font-semibold text-lg text-slate-900">{service?.title}</div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-slate-500">Provider</div>
              <div className="text-sm font-medium text-slate-800">{service?.providerName || "Verified Pro"}</div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-slate-500">Duration</div>
              <div className="text-sm text-slate-800">{service?.duration || "Estimate: 1 hour"}</div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-slate-500">Price</div>
              <div className="text-lg font-bold text-slate-900">{priceDisplay}</div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-500">Payment</div>
              <div className="mt-2 flex gap-2">
                <button
                  className="flex-1 py-2 rounded-md bg-slate-50 border border-slate-200 text-sm"
                  onClick={() => alert("Payment integration placeholder — replace with Razorpay/PayPal flow.")}
                >
                  Pay now (demo)
                </button>
                <button
                  className="py-2 px-3 rounded-md bg-white border border-slate-200 text-sm"
                  onClick={() => alert("Payment later selected — booking will proceed without payment in demo.")}
                >
                  Pay later
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-500">
            <strong>Notes:</strong> The booking will be confirmed after provider accepts (demo). Replace the payment button with a real gateway for live transactions.
          </div>
        </aside>

        {/* Right: booking form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Complete your booking</h2>
            <p className="text-sm text-slate-500 mb-4">Choose a date & time and provide contact details so the provider can reach you.</p>

            {error && <div className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>}
            {successMsg && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 text-sm">{successMsg}</div>}

            <form onSubmit={submitBooking} className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={date}
                    min={isoDateTodayPlus(0)}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Time slot</label>
                  <select className="input" value={time} onChange={(e) => setTime(e.target.value)}>
                    {slots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Full name</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Phone</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Email</label>
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Additional notes (optional)</label>
                <textarea className="input h-24" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions for the provider" />
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold hover:brightness-95 disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="60" strokeDashoffset="0" strokeLinecap="round" fill="none" />
                    </svg>
                  ) : null}
                  Confirm booking
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-md border border-slate-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold mb-2">About this service</h3>
            <p className="text-sm text-slate-700">{service?.description || "No description available."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
