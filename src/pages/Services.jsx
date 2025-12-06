import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import axios from "axios";
import ServiceCard from "../components/ServiceCard";
import ServiceDetailModal from "../components/ServiceDetailModal";

/* Keep the demoServices array in this file (same as before) */
const demoServices = [
  { _id: "demo-1", title: "Basic Plumbing Repair", description: "Fix leaking taps, unclog drains, replace washers.", price: 499, providerName: "AquaFix Pros", category: "Plumbing", image: "https://images.unsplash.com/photo-1581578017424-2c1f0f0b8b5b?auto=format&fit=crop&w=900&q=60", duration: "30–60 mins" },
  { _id: "demo-2", title: "AC Service & Gas Top-up", description: "Full AC cleaning, cooling check and gas refill.", price: 999, providerName: "CoolCare", category: "AC Repair", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=60", duration: "1–2 hours" },
  { _id: "demo-3", title: "Home Electrical Repair", description: "Switchboard repairs, wiring checks, fan installation and more.", price: 399, providerName: "BrightWire", category: "Electrician", image: "https://images.unsplash.com/photo-1581091012184-7f7f1b1f5b65?auto=format&fit=crop&w=900&q=60", duration: "45–90 mins" },
  { _id: "demo-4", title: "Maths Tuition (Class 6–12)", description: "Expert home tutors for high-scoring results.", price: 499, providerName: "LearnWell Tutors", category: "Tuition", image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=60", duration: "1 hour" },
  { _id: "demo-5", title: "2BHK Deep Home Cleaning", description: "Complete home deep cleaning — kitchen, bathrooms, floors & dusting.", price: 1499, providerName: "ShineHome", category: "Cleaning", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60", duration: "2–4 hours" },
  { _id: "demo-6", title: "Smartphone Repair", description: "Screen replacement, battery service, diagnostics.", price: 799, providerName: "PhoneFixers", category: "Electronics", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=60", duration: "30–60 mins" }
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("relevance");

  const pageSize = 9;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [selected, setSelected] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ls_favorites") || "[]"); } catch { return []; }
  });

  const sentinelRef = useRef(null);
  const debounceRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get("http://localhost:5000/services")
      .then(res => {
        if (!mounted) return;
        const data = res.data || [];
        setServices((data.length === 0) ? demoServices : data);
      })
      .catch(err => {
        console.warn("Using demo services due to fetch error.", err?.message || err);
        if (mounted) setServices(demoServices);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  // debounce query
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(query.trim().toLowerCase()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // persist favorites
  useEffect(() => {
    localStorage.setItem("ls_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]);
  }, []);

  // categories
  const categories = useMemo(() => {
    const set = new Set(services.map(s => (s.category || "").toLowerCase()).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() => {
    const term = debouncedQ;
    const out = services
      .filter(s => (category === "all" || (s.category || "").toLowerCase() === category))
      .filter(s => {
        if (!term) return true;
        const hay = `${s.title || ""} ${s.description || ""} ${s.providerName || ""}`.toLowerCase();
        return hay.includes(term);
      });

    if (sort === "price-asc") return out.sort((a,b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-desc") return out.sort((a,b) => (b.price || 0) - (a.price || 0));
    return out;
  }, [services, debouncedQ, category, sort]);

  const total = filtered.length;
  const paginated = filtered.slice(0, visibleCount);

  // reset visibleCount when filters change
  useEffect(() => { setVisibleCount(pageSize); }, [debouncedQ, category, sort]);

  // infinite scroll using IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && visibleCount < total) {
          // load next batch
          setVisibleCount(v => Math.min(total, v + pageSize));
        }
      });
    }, { root: null, rootMargin: "200px", threshold: 0.25 });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [sentinelRef.current, visibleCount, total]);

  const openDetail = svc => setSelected(svc);
  const closeDetail = () => setSelected(null);
  const onBook = svc => {
    localStorage.setItem("ls_selected_service", svc._id);
    window.location.href = `/booking/${svc._id}`;
  };

  return (
    <div className="container page-section">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block md:col-span-1 sticky top-20 self-start">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h4 className="text-sm font-semibold mb-3">Filters</h4>

            <div className="mb-3">
              <label className="text-xs text-slate-500">Category</label>
              <select className="input w-full mt-2" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c === "all" ? "All categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="text-xs text-slate-500">Sort</label>
              <select className="input w-full mt-2" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>

            <div className="mt-4">
              <button onClick={() => { setCategory("all"); setSort("relevance"); setQuery(""); }} className="w-full py-2 rounded-md border border-slate-200 text-sm">Reset</button>
            </div>

            {favorites.length > 0 && (
              <>
                <hr className="my-3" />
                <div className="text-xs text-slate-500 mb-2">Favorites</div>
                <div className="space-y-2">
                  {favorites.map(id => {
                    const svc = services.find(s => s._id === id);
                    if (!svc) return null;
                    return (
                      <div key={id} className="text-sm">
                        <button onClick={() => openDetail(svc)} className="text-slate-700 hover:underline">{svc.title}</button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="md:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Services</h1>
              <div className="small-muted">Browse and book trusted local professionals</div>
            </div>

            <div className="flex gap-3 items-center w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services, providers or keywords..."
                  className="input pr-10"
                />
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="6" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="md:hidden">
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c === "all" ? "All categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* content */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({length: 6}).map((_,i) => (
                <div key={i} className="animate-pulse p-4 bg-white rounded-xl">
                  <div className="h-44 bg-slate-100 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="h-9 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : total === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-slate-100">
              <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=60" alt="empty" className="mx-auto mb-6 w-64 h-40 object-cover rounded-lg" />
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-sm text-slate-500 mb-4">Try changing filters, search terms, or seed demo data on the backend.</p>
              <div className="flex justify-center gap-3">
                <a href="http://localhost:5000/services/seed" className="px-4 py-2 rounded-md bg-emerald-500 text-white">Seed demo data</a>
                <button onClick={() => { setCategory("all"); setQuery(""); }} className="px-4 py-2 rounded-md border">Reset filters</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((svc, idx) => (
                  <ServiceCard
                    key={svc._id}
                    service={svc}
                    onOpen={openDetail}
                    isFavorite={favorites.includes(svc._id)}
                    onToggleFavorite={toggleFavorite}
                    index={idx}
                  />
                ))}
              </div>

              {/* sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-8" />

              <div className="mt-6 flex items-center justify-center text-sm text-slate-500">
                {visibleCount < total ? "Scroll to load more" : `Showing all ${total} services`}
              </div>
            </>
          )}
        </main>
      </div>

      <ServiceDetailModal service={selected} onClose={closeDetail} onBook={onBook} />
    </div>
  );
}
