import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
function formatDateTime(dateStr, timeStr) {
  try {
    const dt = new Date(`${dateStr}T${timeStr}:00`);
    return dt.toLocaleString();
  } catch {
    return `${dateStr} ${timeStr}`;
  }
}

function generateICS(booking) {
  // minimal .ics generator (VEVENT)
  const uid = booking._id || `local-${Date.now()}`;
  const dtStart = (booking.date + "T" + (booking.time || "09:00") + "00").replace(/[^0-9]/g, "");
  // naive end time: +1 hour
  const start = new Date(`${booking.date}T${booking.time}:00`);
  const end = new Date(start.getTime() + (booking.durationMinutes ? booking.durationMinutes * 60000 : 60 * 60000));
  const toICSDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LocalServices//Booking//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${booking.serviceTitle || "Service booking"}`,
    `DESCRIPTION:${(booking.notes || "")} Provider: ${(booking.providerName || "")} — Contact: ${(booking.customer?.phone || "")}`,
    `LOCATION:${booking.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Try to fetch from backend first if bookingId provided
    if (bookingId) {
      axios.get(`http://localhost:5000/bookings/${bookingId}`)
        .then(res => {
          if (!mounted) return;
          if (res?.data) {
            setBooking(res.data);
            // also cache for offline fallback
            localStorage.setItem("last_booking", JSON.stringify(res.data));
          } else {
            // no data — fallback to localStorage
            const cached = localStorage.getItem("last_booking");
            if (cached) setBooking(JSON.parse(cached));
          }
        })
        .catch(err => {
          console.warn("Booking fetch failed:", err?.message || err);
          const cached = localStorage.getItem("last_booking");
          if (cached) setBooking(JSON.parse(cached));
          else setError("Unable to load booking details. Please try again later.");
        })
        .finally(() => mounted && setLoading(false));
    } else {
      // no id — use localStorage fallback
      const cached = localStorage.getItem("last_booking") || localStorage.getItem("ls_last_booking");
      if (cached) setBooking(JSON.parse(cached));
      else setError("No booking found. Maybe your booking didn't complete.");
      setLoading(false);
    }

    return () => (mounted = false);
  }, [bookingId]);

  const handleDownloadICS = () => {
    if (!booking) return;
    const blob = generateICS(booking);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fname = `booking-${booking._id || "local"}.ics`;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse h-6 bg-slate-100 w-1/3 mb-4" />
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="h-40 bg-slate-100 rounded mb-4" />
          <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl p-8 shadow">
            <h2 className="text-xl font-semibold mb-2">Booking not found</h2>
            <p className="text-sm text-slate-500 mb-4">{error || "We couldn't find your booking. Try again or check your email for confirmation."}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => navigate("/services")} className="px-4 py-2 rounded-md bg-emerald-500 text-white">Browse services</button>
              <button onClick={() => navigate("/")} className="px-4 py-2 rounded-md border">Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // presentation values
  const when = formatDateTime(booking.date, booking.time);
  const bookingRef = booking._id || booking.bookingId || `local-${Date.now()}`;

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-6 print:shadow-none">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
              {booking.image ? <img src={booking.image} alt={booking.serviceTitle} className="w-full h-full object-cover" /> : null}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">Booking confirmed</div>
                  <h2 className="text-2xl font-semibold text-slate-900">{booking.serviceTitle}</h2>
                  <div className="text-sm text-slate-600">{booking.providerName}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Ref</div>
                  <div className="font-mono text-slate-800">{bookingRef}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">When</div>
                  <div className="font-medium">{when}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Price</div>
                  <div className="font-medium">₹{booking.price ?? "Contact"}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Customer</div>
                  <div className="font-medium">{booking.customer?.name || booking.customerName || "—"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-700">
            <strong>Notes:</strong> {booking.notes || "No additional notes."}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleDownloadICS} className="px-4 py-2 rounded-md bg-emerald-500 text-white">Download .ics</button>
            <button onClick={handlePrint} className="px-4 py-2 rounded-md border">Print</button>
            <button onClick={() => navigate("/services")} className="px-4 py-2 rounded-md bg-slate-50 border">Browse more services</button>
          </div>
        </div>

        {/* details panel */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3">Booking details</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <div className="text-slate-500">Service</div>
              <div className="font-medium text-slate-900">{booking.serviceTitle}</div>
            </div>

            <div className="flex justify-between">
              <div className="text-slate-500">Provider</div>
              <div className="font-medium">{booking.providerName}</div>
            </div>

            <div className="flex justify-between">
              <div className="text-slate-500">Date & time</div>
              <div>{when}</div>
            </div>

            <div className="flex justify-between">
              <div className="text-slate-500">Contact</div>
              <div>{booking.customer?.phone || booking.customerPhone || "—"}</div>
            </div>

            <div className="flex justify-between">
              <div className="text-slate-500">Price</div>
              <div>₹{booking.price ?? "Contact"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
