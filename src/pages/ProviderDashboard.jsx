// frontend/src/pages/ProviderDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import ServiceFormModal from "../components/ServiceFormModal";
import AvailabilityManager from "../components/AvailabilityManager";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [availabilityFor, setAvailabilityFor] = useState(null); // service object for which availability modal opens
  const [error, setError] = useState("");

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      // expected: server returns services for authenticated provider
      const res = await api.get("/provider/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError(err?.response?.data?.message || "Failed to load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (s) => {
    setEditing(s);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service? This action cannot be undone.")) return;
    try {
      await api.delete(`/provider/services/${id}`);
      loadServices();
    } catch (err) {
      alert("Delete failed: " + (err?.response?.data?.message || err.message));
    }
  };

  const onFormSaved = () => {
    setShowForm(false);
    setEditing(null);
    loadServices();
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Provider Dashboard</h1>
          <div className="text-sm text-slate-500">
            Manage your services and availability. Signed in as{" "}
            <span className="font-medium text-slate-700">{user?.name || user?.email || "you"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-md bg-emerald-500 text-white shadow"
          >
            + Add service
          </button>
          <button
            onClick={loadServices}
            className="px-3 py-2 rounded-md border"
            title="Reload"
          >
            Reload
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-28 bg-slate-100 rounded animate-pulse" />
            <div className="h-28 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded p-6 shadow text-center">
          <div className="text-lg font-medium mb-2">No services yet</div>
          <div className="text-sm text-slate-500 mb-4">Add your first service to start receiving bookings.</div>
          <button onClick={handleAdd} className="px-4 py-2 rounded bg-emerald-500 text-white">Add service</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {services.map(s => (
            <div key={s._id} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-24 h-20 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                  {s.image ? <img src={s.image} alt={s.title} className="w-full h-full object-cover" /> : null}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{s.title}</div>
                      <div className="text-xs text-slate-500">{s.category} • {s.duration || "Est: 1h"}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">₹{s.price ?? "Contact"}</div>
                      <div className="text-xs text-slate-500">{s.active ? "Active" : "Disabled"}</div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-3">{s.description}</p>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleEdit(s)} className="px-3 py-1 rounded border">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="px-3 py-1 rounded border text-red-600">Delete</button>
                    <button onClick={() => setAvailabilityFor(s)} className="px-3 py-1 rounded bg-slate-50 border">Availability</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ServiceFormModal
          existing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={onFormSaved}
        />
      )}

      {availabilityFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAvailabilityFor(null)} />
          <div className="bg-white rounded-xl shadow p-6 max-w-3xl w-full z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg">{availabilityFor.title}</div>
                <div className="text-sm text-slate-500">{availabilityFor.category}</div>
              </div>
              <button className="px-3 py-1 border rounded" onClick={() => setAvailabilityFor(null)}>Close</button>
            </div>

            <AvailabilityManager
              providerId={user?.id || user?._id}
              serviceId={availabilityFor._id}
              onLock={(payload) => {
                alert("Slot locked (demo). Server response:\n" + JSON.stringify(payload, null, 2));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
