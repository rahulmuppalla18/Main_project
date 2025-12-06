// frontend/src/components/ServiceFormModal.jsx
import React, { useEffect, useState } from "react";
import api from "../api";


export default function ServiceFormModal({ existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    price: "",
    duration: "",
    description: "",
    image: null, // file or url
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        category: existing.category || "",
        price: existing.price || "",
        duration: existing.duration || "",
        description: existing.description || "",
        image: existing.image || null,
      });
    } else {
      setForm({
        title: "",
        category: "",
        price: "",
        duration: "",
        description: "",
        image: null,
      });
    }
  }, [existing]);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    // minimal validation
    if (!form.title || !form.category) {
      setError("Title and category required.");
      return;
    }

    setSaving(true);
    try {
      // if image is a File, send multipart form
      if (form.image && form.image instanceof File) {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("category", form.category);
        fd.append("price", form.price);
        fd.append("duration", form.duration);
        fd.append("description", form.description);
        fd.append("image", form.image);

        if (existing && existing._id) {
          await api.put(`/provider/services/${existing._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await api.post("/provider/services", fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
      } else {
        // send JSON body
        const payload = {
          title: form.title,
          category: form.category,
          price: Number(form.price) || 0,
          duration: form.duration,
          description: form.description,
          image: typeof form.image === "string" ? form.image : null,
        };
        if (existing && existing._id) {
          await api.put(`/provider/services/${existing._id}`, payload);
        } else {
          await api.post("/provider/services", payload);
        }
      }

      onSaved();
    } catch (err) {
      console.error("save error", err);
      setError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 w-full max-w-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{existing ? "Edit service" : "Add service"}</h3>
          <button type="button" onClick={onClose} className="px-2 py-1 border rounded">Close</button>
        </div>

        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <div className="grid gap-3">
          <input className="input" placeholder="Title" value={form.title} onChange={e => handleChange("title", e.target.value)} />
          <input className="input" placeholder="Category" value={form.category} onChange={e => handleChange("category", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Price (₹)" value={form.price} onChange={e => handleChange("price", e.target.value)} />
            <input className="input" placeholder="Duration (e.g. 30-60 mins)" value={form.duration} onChange={e => handleChange("duration", e.target.value)} />
          </div>
          <textarea className="input" placeholder="Short description" value={form.description} onChange={e => handleChange("description", e.target.value)} />
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Image (optional)</label>
            <input type="file" accept="image/*" onChange={e => handleChange("image", e.target.files[0])} />
            {form.image && typeof form.image === "string" && (
              <div className="mt-2 text-sm text-slate-500">Using image URL</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-500 text-white">
              {saving ? "Saving..." : "Save service"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
