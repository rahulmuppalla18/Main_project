// frontend/src/components/AvailabilityManager.jsx
import React, { useEffect, useState } from "react";
import api from "../api";


export default function AvailabilityManager({ providerId, serviceId, onLock }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/provider/${providerId}/availability?serviceId=${serviceId}`);
      // expected: [{ id, date, time, available }]
      setSlots(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("availability fetch failed", err);
      setError("Could not load slots (backend may not be implemented).");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [providerId, serviceId]);

  const lockSlot = async (slot) => {
    if (!confirm(`Lock slot ${slot.date} ${slot.time} for 10 minutes?`)) return;
    setActionLoading(true);
    try {
      const res = await api.post("/provider/slots/lock", { slotId: slot.id, serviceId });
      // res.data expected { lockToken, expiresAt }
      onLock && onLock({ slot, lock: res.data });
      alert("Locked (demo): " + JSON.stringify(res.data || {}));
    } catch (err) {
      alert("Lock failed: " + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Manage availability</h4>
        <button onClick={load} className="px-2 py-1 border rounded text-sm">Refresh</button>
      </div>

      {loading ? <div>Loading slots…</div> :
        error ? <div className="text-sm text-red-600">{error}</div> :
          slots.length === 0 ? <div className="text-sm text-slate-500">No slots available. You can seed slots from backend.</div> :
            <div className="grid gap-2">
              {slots.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                  <div>
                    <div className="text-sm font-medium">{s.date} • {s.time}</div>
                    <div className="text-xs text-slate-500">{s.note || (s.available ? "Available" : "Unavailable")}</div>
                  </div>
                  <div>
                    <button
                      className="px-3 py-1 rounded bg-emerald-500 text-white text-sm"
                      onClick={() => lockSlot(s)}
                      disabled={actionLoading || !s.available}
                    >
                      Lock slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
      }
    </div>
  );
}
