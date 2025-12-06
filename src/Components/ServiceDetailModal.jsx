import React from "react";

/**
 * ServiceDetailModal
 * props:
 *  - service: object | null
 *  - onClose: () => void
 *  - onBook: (service) => void
 */
export default function ServiceDetailModal({ service, onClose, onBook }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-70 w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-3">
          <div className="md:col-span-2 p-6">
            <div className="rounded-lg overflow-hidden mb-4 h-60 bg-slate-100">
              {service.image ? (
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
              )}
            </div>

            <h3 className="text-2xl font-semibold text-slate-900">{service.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{service.category || "General"}</p>

            <div className="mt-4 text-slate-700 leading-relaxed text-sm">
              {service.description || "No detailed description available for this service."}
            </div>

            <div className="mt-6 text-sm small-muted">
              Provider: <span className="text-slate-900 font-medium">{service.providerName || "Verified Pro"}</span>
            </div>
          </div>

          <aside className="p-6 border-l border-slate-100 flex flex-col gap-4">
            <div>
              <div className="text-sm text-slate-500">Price</div>
              <div className="text-2xl font-bold text-slate-900">₹{service.price}</div>
            </div>

            <div>
              <div className="text-sm text-slate-500">Duration</div>
              <div className="text-sm text-slate-800">{service.duration || "Estimate: 1 hour"}</div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => onBook(service)}
                className="w-full py-3 rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow"
              >
                Book this service
              </button>

              <button onClick={onClose} className="w-full mt-2 py-2 rounded-md border border-slate-200 text-sm text-slate-700">
                Close
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
