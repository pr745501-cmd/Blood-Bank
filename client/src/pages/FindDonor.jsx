import React, { useState, useEffect } from "react"; // ✅ added useEffect
import API from "../services/api";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Phone, 
  MessageSquare, 
  User, 
  Droplet, 
  Filter, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function FindDonor() {

  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  /* ================= SEARCH FUNCTION ================= */

  const searchDonor = async () => {
    if (!bloodGroup) {
      alert("Please select a blood group to begin your search.");
      return;
    }

    setLoading(true);
    setError("");
    setDonors([]);

    try {
      const res = await API.get(
        `/donor/search/${encodeURIComponent(bloodGroup)}`
      );

      setDonors(res.data);
      setSearched(true);

    } catch (err) {
      setError("Unable to connect to the donor database. Please try again.");
    }

    setLoading(false);
  };

  /* ================= AUTO REFRESH (FINAL FIX) ================= */

useEffect(() => {

  let lastUpdate = localStorage.getItem("donorUpdated");

  const handleUpdate = () => {
    const current = localStorage.getItem("donorUpdated");

    // ✅ prevent unnecessary multiple calls
    if (current !== lastUpdate) {
      lastUpdate = current;

      if (bloodGroup) {
        searchDonor(); // ✅ instant refresh
      }
    }
  };

  // ✅ SAME TAB (manual event)
  window.addEventListener("donorUpdated", handleUpdate);

  // ✅ OTHER TABS (storage event)
  window.addEventListener("storage", handleUpdate);

  // ✅ EXTRA SAFETY (polling fallback)
  const interval = setInterval(handleUpdate, 1000);

  return () => {
    window.removeEventListener("donorUpdated", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    clearInterval(interval);
  };

}, [bloodGroup]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. HERO HEADER SECTION */}
      <div className="bg-[#991b1b] relative overflow-hidden pt-16 pb-28">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top duration-700">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight italic flex items-center gap-4 justify-center sm:justify-start">
                <Search size={40} className="text-red-400" />
                Find a Donor
              </h1>
              <p className="mt-4 text-red-100 text-lg font-medium opacity-80 max-w-xl">
                Real-time access to our verified community of life-savers. Search by blood type to find assistance instantly.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20">
                <Droplet size={80} className="text-white animate-pulse" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH ENGINE PANEL */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                <Filter size={20} />
              </div>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:bg-white focus:border-red-500 outline-none transition-all appearance-none shadow-inner"
              >
                <option value="">Required Blood Group</option>
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>{g} Type</option>
                ))}
              </select>
            </div>

            <button
              onClick={searchDonor}
              disabled={loading}
              className="bg-[#991b1b] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-900/20 hover:bg-red-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Search size={20} />
              )}
              {loading ? "Scanning..." : "Search Database"}
            </button>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        <div className="mt-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 font-bold animate-in fade-in">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {searched && donors.length === 0 && !loading && (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Donors Found</h3>
              <p className="text-slate-500 font-medium mt-2">
                We couldn't find matches for {bloodGroup} in our current active list.
              </p>
            </div>
          )}
        </div>

        {/* 3. DONOR RESULTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 mt-8">
          {donors.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden relative"
            >
              {/* Background Accent */}
            {/* Background Accent */}
<div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-red-100 transition-colors"></div>

<div className="flex justify-between items-start mb-6 relative z-10">
  <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg">
    {d.name?.charAt(0)?.toUpperCase()}
  </div>

  <div className="flex flex-col items-end">
    <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl text-sm font-black border border-red-100 mb-2">
      {d.bloodGroup}
    </span>

    {/* ✅ FIXED AVAILABILITY */}
    <span
      className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
        d.availability ? "text-emerald-600" : "text-red-500"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          d.availability
            ? "bg-emerald-500 animate-pulse"
            : "bg-red-500"
        }`}
      />
      {d.availability ? "Available" : "Unavailable"}
    </span>
  </div>
</div>

<h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight group-hover:text-red-700 transition-colors">
  {d.name}
</h3>

<div className="space-y-4 mb-8">
  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
    <div className="p-2 bg-slate-50 rounded-lg">
      <MapPin size={16} />
    </div>
    {d.city || "Area not specified"}
  </div>

  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
    <div className="p-2 bg-slate-50 rounded-lg">
      <Phone size={16} />
    </div>
    {d.mobile || "Private Listing"}
  </div>
</div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-3 gap-3">
                <a
                  href={`tel:${d.mobile}`}
                  className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  title="Call Donor"
                >
                  <Phone size={20} />
                </a>

                <a
                  href={`https://wa.me/91${d.mobile}?text=Hello%20I%20found%20your%20contact%20on%20BloodConnect.%20Emergency%20needed%20for%20${d.bloodGroup}%20blood.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 text-blue-700 p-3 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title="WhatsApp"
                >
                  <MessageSquare size={20} />
                </a>

                <Link
                  to={`/donor-profile/${d._id}`}
                  className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center hover:bg-red-700 transition-all shadow-md"
                  title="View Profile"
                >
                  <User size={20} />
                </Link>
              </div>

              {/* Verification Badge */}
              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" />
                Identity Verified
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FindDonor;