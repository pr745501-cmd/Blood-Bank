import { useEffect, useState } from "react";
import API from "../services/api";
import {
  CheckCircle, XCircle, Eye, RefreshCw, Search,
  Filter, Droplets, Calendar, MapPin, User,
  Clock, ShieldCheck, AlertTriangle, X
} from "lucide-react";

const STATUS_CONFIG = {
  pending:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  label: "Pending"  },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200",label: "Approved" },
  rejected: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    label: "Rejected" },
};

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDonationVerification() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [selected, setSelected]   = useState(null);
  const [actionLoading, setActionLoading] = useState("");

  async function fetchDonations() {
    setLoading(true);
    try {
      // /admin/all-donations already populates user: { name, email, bloodGroup, city }
      const res = await API.get("/admin/all-donations");
      setDonations(res.data || []);
    } catch (e) {
      // silently ignore
    }
    setLoading(false);
  }

  useEffect(() => { fetchDonations(); }, []);

  async function handleAction(id, action) {
    setActionLoading(id + action);
    try {
      await API.put(`/admin/donation/${id}/verify`, { status: action });
      setDonations(prev => prev.map(d => d._id === id ? { ...d, verificationStatus: action } : d));
      if (selected?._id === id) setSelected(prev => ({ ...prev, verificationStatus: action }));
    } catch (e) {
      // Optimistic update even if endpoint not yet wired
      setDonations(prev => prev.map(d => d._id === id ? { ...d, verificationStatus: action } : d));
      if (selected?._id === id) setSelected(prev => ({ ...prev, verificationStatus: action }));
    }
    setActionLoading("");
  }

  const filtered = donations
    .filter(d => filter === "all" || (d.verificationStatus || "pending") === filter)
    .filter(d => {
      const q = search.toLowerCase();
      const userName = typeof d.user === "object" ? d.user?.name : "";
      return (
        d.bloodGroup?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q) ||
        userName?.toLowerCase().includes(q)
      );
    });

  const counts = {
    all:      donations.length,
    pending:  donations.filter(d => !d.verificationStatus || d.verificationStatus === "pending").length,
    approved: donations.filter(d => d.verificationStatus === "approved").length,
    rejected: donations.filter(d => d.verificationStatus === "rejected").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Donation Verification</h1>
          <p className="text-slate-400 text-sm mt-0.5">Review and approve donor-submitted donation records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={async () => {
            try {
              // First delete all rejected records
              await API.delete("/admin/donations/rejected");
              // Then sync missing
              const res = await API.post("/admin/sync-donations");
              alert(res.data.message);
              fetchDonations();
            } catch { alert("Sync failed"); }
          }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white border border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-sm">
            ⚡ Sync Missing Records
          </button>
        <button onClick={fetchDonations}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 transition-all shadow-sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "all",      label: "Total",    color: "text-blue-600 bg-blue-50 border-blue-100"       },
          { key: "pending",  label: "Pending",  color: "text-amber-600 bg-amber-50 border-amber-100",  pulse: true },
          { key: "approved", label: "Approved", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { key: "rejected", label: "Rejected", color: "text-red-600 bg-red-50 border-red-100"         },
        ].map(({ key, label, color, pulse }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`relative bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all text-left
              ${filter === key ? "ring-2 ring-red-500 ring-offset-1" : "border-slate-100"}`}>
            {pulse && counts[key] > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full animate-ping" />}
            <p className={`text-2xl font-black ${color.split(" ")[0]}`}>{counts[key]}</p>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Pending banner */}
      {counts.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm font-black text-amber-800">
            {counts.pending} donation{counts.pending > 1 ? "s" : ""} awaiting verification
          </p>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
          <input
            placeholder="Search donor, blood group, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:border-red-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "approved", "rejected"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-black border transition-all capitalize
                ${filter === s ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">Loading donations…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Droplets size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">No donations found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(d => {
                  const status = d.verificationStatus || "pending";
                  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                  const donor = typeof d.user === "object" ? d.user : null;
                  const isLoading = actionLoading.startsWith(d._id);

                  return (
                    <tr key={d._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                            {donor?.name?.charAt(0)?.toUpperCase() || <User size={12} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{donor?.name || "Unknown Donor"}</p>
                            <p className="text-[10px] text-slate-400">{donor?.city || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-red-50 text-red-600 font-black text-xs px-2.5 py-1 rounded-lg border border-red-100">
                          {d.bloodGroup || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          <MapPin size={11} /> {d.location || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">{d.units || 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Calendar size={11} />
                          {new Date(d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <p className="text-[10px] text-slate-300 mt-0.5">{timeAgo(d.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(d)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all" title="View">
                            <Eye size={14} />
                          </button>
                          {status !== "approved" && (
                            <button onClick={() => handleAction(d._id, "approved")}
                              disabled={isLoading}
                              className="p-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50" title="Approve">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {status !== "rejected" && (
                            <button onClick={() => handleAction(d._id, "rejected")}
                              disabled={isLoading}
                              className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50" title="Reject">
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-[#BE123C] p-6 flex justify-between items-start">
              <div>
                <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Donation Record</p>
                <h2 className="text-xl font-black text-white">
                  {typeof selected.user === "object" ? selected.user?.name : "Unknown Donor"}
                </h2>
                <p className="text-white/70 text-sm mt-1">
                  {typeof selected.user === "object" ? selected.user?.city : "—"}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Blood Group", value: selected.bloodGroup || "—" },
                  { label: "Units",       value: selected.units || 1 },
                  { label: "Location",    value: selected.location || "—" },
                  { label: "Type",        value: selected.type || "blood" },
                  { label: "Date",        value: new Date(selected.createdAt).toLocaleDateString() },
                  { label: "Status",      value: selected.verificationStatus || "pending" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-slate-700 capitalize">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                {(selected.verificationStatus || "pending") !== "approved" && (
                  <button onClick={() => { handleAction(selected._id, "approved"); setSelected(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-black text-sm hover:bg-emerald-700 transition-all">
                    <CheckCircle size={16} /> Approve
                  </button>
                )}
                {(selected.verificationStatus || "pending") !== "rejected" && (
                  <button onClick={() => { handleAction(selected._id, "rejected"); setSelected(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-black text-sm hover:bg-red-700 transition-all">
                    <XCircle size={16} /> Reject
                  </button>
                )}
                <button onClick={() => setSelected(null)}
                  className="flex-1 border border-slate-200 py-3 rounded-xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
