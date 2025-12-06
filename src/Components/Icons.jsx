// simple icon helper - import specific icons by name
import React from "react";

export default function Icon({ name, className = "w-5 h-5" }) {
  const icons = {
    menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>,
    search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><circle cx="11" cy="11" r="6" strokeWidth="2"/><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" strokeWidth="2"/></svg>,
    bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="1.5"/></svg>
  };
  return icons[name] || null;
}
