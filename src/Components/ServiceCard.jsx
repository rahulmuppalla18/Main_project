import React from "react";
export default function ServiceCard({ service, onOpen, isFavorite, onToggleFavorite, index = 0 }) {
  const title = service.title || "Service";
  const price = service.price ?? "Contact";
  const provider = service.providerName || "Verified Pro";
  const categoryRaw = (service.category || "General");
  const category = categoryRaw.toUpperCase();

  // small icon mapping for categories
  const iconMap = {
    plumbing: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 3v6a4 4 0 0 1-4 4h-1M7 13V7a4 4 0 0 1 4-4h2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 21v-2a4 4 0 0 1 4-4h10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    "ac repair": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M12 9v6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 9l1 1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    electrician: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tuition: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2l8 4-8 4-8-4 8-4z" />
        <path d="M4 10v6a2 2 0 0 0 2 2h12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    cleaning: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 21s4-3 9-3 9 3 9 3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 6l3 3M17 3l-1 4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    electronics: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 20h8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    general: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  };

  const iconKey = (categoryRaw || "general").toLowerCase();
  const Icon = iconMap[iconKey] || iconMap.general;

  return (
    <article
      className="bg-white rounded-xl shadow-sm transform transition duration-450 ease-out hover:-translate-y-2 hover:shadow-2xl overflow-hidden opacity-0 animate-fade-in"
      onClick={() => onOpen(service)}
      role="button"
      aria-label={`Open ${title}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-44">
        {service.image ? (
          <img
            src={service.image}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold text-lg">
            {title.split(" ").slice(0,2).join(" ")}
          </div>
        )}

        <div className="absolute left-3 top-3 bg-white/90 px-2 py-1 rounded-md flex items-center gap-2 shadow">
          <div className="text-slate-800">{Icon}</div>
          <div className="text-xs text-slate-800 font-medium">{category}</div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(service._id); }}
          className="absolute right-3 top-3 bg-white/90 p-1 rounded-md shadow hover:bg-white"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 21s-7-4.35-9.5-7.03C-0.1 10.6 3.2 6 7.5 7.5 9.2 8.2 10 9.6 12 11c2-1.4 2.8-2.8 4.5-3.5 4.3-1.5 7.6 3.1 4.9 6.97C19 16.65 12 21 12 21z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{title}</h3>
        <p className="text-sm text-slate-500 line-clamp-3">{service.description || "No description available."}</p>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="text-sm text-slate-600">Provider</div>
            <div className="font-medium text-slate-900 text-sm">{provider}</div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-slate-900">₹{price}</div>
            <div className="text-xs text-slate-400">Est.</div>
          </div>
        </div>

        <div className="mt-3 flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(service); }}
            className="flex-1 py-2 rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-sm font-medium shadow"
          >
            Book
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(service); }}
            className="py-2 px-3 rounded-md border border-slate-200 text-sm text-slate-700"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}
