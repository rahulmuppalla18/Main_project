import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import AvailabilityManager from "../Components/AvailabilityManager";

/**
 * Booking page with availability + slot-locking integrated.
 *
 * - Shows service details (fetches by id or localStorage)
 * - User can "Check availability" (opens AvailabilityManager)
 * - AvailabilityManager returns { slot, lock } via onLock
 * - Booking payload includes lock.lockToken so backend can finalize booking
 *
 * NOTE: Availability endpoints must exist:
 *  GET  /provider/:providerId/availability?serviceId=
 *  POST /provider/slots/lock  { slotId, serviceId }  => returns { lockToken, expiresAt, ... }
 * If your API fields differ, change `lock.lockToken` usage below.
 */

// demo services fallback
const demoServices = [
  { _id: "demo-1", title: "Basic Plumbing Repair", description: "Fix leaking taps, unclog drains, replace washers.", price: 499, providerName: "AquaFix Pros", providerId: "prov-1", category: "Plumbing", image: "https://images.unsplash.com/photo-1581578017424-2c1f0f0b8b5b?auto=format&fit=crop&w=900&q=60", duration: "30–60 mins" },
  { _id: "demo-2", title: "AC Service & Gas Top-up", description: "Full AC cleaning", price: 999, providerName: "CoolCare", providerId: "prov-2", category: "AC Repair", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=60", duration: "1–2 hours" }
];

function isoDateTodayPlus(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Booking() {
  const { serviceId: paramServiceId } = useParams();
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

  // availability / lock
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [lockedSlot, setLockedSlot] = useState(null); // { slot, lock }
  const [lockInfo, setLockInfo] = useState(null); // convenience pointer to lock object

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const slots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  // prefill contact
  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    const savedPhone = localStorage.getItem("user_phone");
    const savedEmail = localStorage.getItem("user_email");
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // fetch service details
  useEffect(() => {
    let mounted = true;
    setLoadingService(true);

    const savedId = paramServiceId || localStorage.getItem("ls_selected_service");
    if (!savedId) {
      setService(demoServices[0]);
      setLoadingService(false);
      return;
    }

    api.get(`/services/${savedId}`)
      .then(res => {
        if (!mounted) return;
        if (res?.data && Object.keys(res.data).length > 0) {
          setService(res.data);
        } else {
          // fallback: fetch all and find
          return api.get("/services");
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

  // handle lock set by AvailabilityManager
  const handleLock = ({ slot, lock }) => {
    // save lock and slot locally
    setLockedSlot({ slot, lock });
    setLockInfo(lock || null);
    setAvailabilityOpen(false);
    // show user
    alert(`Slot locked until ${lock?.expiresAt || "a short time"}. Proceed to confirm booking.`);
  };

  // submit booking (pay later / on-submit)
  const submitBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const v = validate();
    if (v) { setError(v); return; }

    // ensure future date/time
    const selectedDateTime = new Date(`${date}T${time}:00`);
    if (selectedDateTime < new Date()) {
      setError("Please choose a future date/time.");
      return;
    }

    // store contact locally
    localStorage.setItem("user_name", name);
    localStorage.setItem("user_phone", phone);
    localStorage.setItem("user_email", email);

    // build booking payload; include lockToken if present
    const payload = {
      serviceId: service?._id || null,
      serviceTitle: service?.title || "",
      providerId: service?.providerId || service?.provider?._id || service?.providerId || null,
      providerName: service?.providerName || service?.provider?.name || "",
      date,
      time,
      customer: { name, phone, email },
      notes,
      price: service?.price ?? null,
      slotLock: lockInfo ? { lockToken: lockInfo.lockToken, expiresAt: lockInfo.expiresAt } : null,
    };

    setLoading(true);
    try {
      // POST booking
      const res = await api.post("/bookings", payload, { timeout: 15000 });
      setLoading(false);

      // success handling: cache and redirect to confirmation
      const created = res?.data || {};
      try { localStorage.setItem("last_booking", JSON.stringify(created)); } catch {}
      const bid = created._id || created.bookingId || created.id;
      if (bid) {
        window.location.href = `/booking/confirmation?bookingId=${bid}`;
      } else {
        window.location.href = `/booking/confirmation`;
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setLoading(false);
      // show server message if available
      setError(err?.response?.data?.message || "Booking failed — please try again.");
    }
  };

  // optional: startRazorpay function if you want pay-now flow (left out here for brevity)
  // you can keep your existing Razorpay helper and call it after lock verification if desired.

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
                {/* Pay now can be wired to Razorpay helper if you want */}
                <button
                  className="flex-1 py-2 rounded-md bg-slate-50 border border-slate-200 text-sm"
                  onClick={() => setAvailabilityOpen(true)}
                >
                  Check availability
                </button>

                <button
                  className="py-2 px-3 rounded-md bg-white border border-slate-200 text-sm"
                  onClick={() => alert("Pay later selected — booking will proceed without payment in demo.")}
                >
                  Pay later
                </button>
              </div>
            </div>

            {lockInfo && (
              <div className="mt-4 p-3 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm">
                <div><strong>Slot locked</strong> — expires: {lockInfo.expiresAt ? new Date(lockInfo.expiresAt).toLocaleString() : "soon"}</div>
                <div className="text-xs text-slate-600 mt-1">You may complete booking to reserve this slot.</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setLockInfo(null)} className="px-3 py-1 border rounded text-sm">Release</button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            <strong>Notes:</strong> Locking a slot is a temporary reservation. Backend should verify the `slotLock.lockToken` when creating booking to finalize it.
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

      {/* Availability modal */}
      {availabilityOpen && service && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAvailabilityOpen(false)} />
          <div className="bg-white rounded-xl shadow p-6 max-w-3xl w-full z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg">Check availability — {service.title}</div>
                <div className="text-sm text-slate-500">Choose a slot and lock it while you complete booking</div>
              </div>
              <button className="px-3 py-1 border rounded" onClick={() => setAvailabilityOpen(false)}>Close</button>
            </div>

            <AvailabilityManager
              providerId={service?.providerId || service?.provider?._id || service?.providerId}
              serviceId={service._id}
              onLock={handleLock}
            />
          </div>
        </div>
      )}
    </div>
  );
}
