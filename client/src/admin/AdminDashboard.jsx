import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users, Droplets, FileText, Award, AlertTriangle,
  HeartPulse, RefreshCw, Download, TrendingUp,
  CheckCircle, Activity, MapPin, ArrowUpRight, X,
  Clock, ShieldAlert, Bell, Tent, ClipboardList,
  GitMerge, BarChart2, ChevronRight, Zap, Package,
  UserCheck, Calendar
} from "lucide-react";

const URGENCY_COLOR = {
  Critical: "bg-red-100 text-red-700",
  Urgent:   "bg-amber-100 text-amber-700",
  Normal:   "bg-green-100 text-green-700"
};
const STATUS_COLOR = {
  Pending:   "bg-amber-50 text-amber-600 border-amber-200",
  Approved:  "bg-blue-50 text-blue-600 border-blue-200",
  Assigned:  "bg-purple-50 text-purple-600 border-purple-200",
  Completed: "bg-green-50 text-green-600 border-green-200",
  Rejected:  "bg-red-50 text-red-600 border-red-200",
};

function fmt(n) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n; }
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(false);
  const [lastSync, setLastSync]   = useState("");
  const [lowStock, setLowStock]   = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchStats = useCallback(async (spin = false) => {
    if (spin) setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const h = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, invRes, thrRes] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/admin/stats", h),
        axios.get("http://localhost:5000/api/blood/inventory"),
        axios.get("http://localhost:5000/api/blood/thresholds", h),
      ]);
      if (statsRes.status === "fulfilled") setData(statsRes.value.data);
      if (invRes.status === "fulfilled" && thrRes.status === "fulfilled") {
        const inv = invRes.value.data;
        const tMap = {};
        thrRes.value.data.forEach(t => { tMap[t.bloodGroup] = t.threshold; });
        setLowStock(inv.map(item => {
          const total = (item.wholeBlood||0)+(item.plasma||0)+(item.platelets||0)+(item.rbc||0);
          return { bloodGroup: item.bloodType, units: total, threshold: tMap[item.bloodType] ?? 10 };
        }).filter(i => i.units < i.threshold));
        setDismissed(false);
      }
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) { }
    finally { setLoading(false); setSyncing(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const exportDonors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/export-donors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "donors.csv"; a.click();
    } catch { alert("Export failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin" />
      <p className="text-slate-400 font-semibold">Loading…</p>
    </div>
  );

  const pendingRequests  = data?.pendingRequests || 0;
  const activeAlerts     = data?.activeAlerts || 0;
  const criticalRequests = data?.urgencyStats?.find(u => u._id === "Critical")?.count || 0;
  const pendingDonations = 0; // placeholder — can wire to donation verification count

  // Quick action cards
  const quickActions = [
    { label: "Blood Requests",      sub: `${pendingRequests} pending`,    icon: FileText,    color: "text-amber-600 bg-amber-50 border-amber-200",   alert: pendingRequests > 0,  path: "/admin/blood-requests"      },
    { label: "Emergency Alerts",    sub: `${activeAlerts} active`,        icon: Bell,        color: "text-red-600 bg-red-50 border-red-200",         alert: activeAlerts > 0,     path: "/admin/alerts"              },
    { label: "Donation Verify",     sub: "Review pending",                icon: ClipboardList,color:"text-blue-600 bg-blue-50 border-blue-200",      alert: false,                path: "/admin/donation-verification"},
    { label: "Request Matching",    sub: `${criticalRequests} critical`,  icon: GitMerge,    color: "text-purple-600 bg-purple-50 border-purple-200", alert: criticalRequests > 0, path: "/admin/request-matching"    },
    { label: "Blood Inventory",     sub: `${lowStock.length} low stock`,  icon: Package,     color: "text-emerald-600 bg-emerald-50 border-emerald-200", alert: lowStock.length > 0, path: "/admin/inventory"          },
    { label: "Certificates",        sub: `${data?.totalCertificates||0} issued`, icon: Award, color: "text-violet-600 bg-violet-50 border-violet-200", alert: false,              path: "/admin/certificates"        },
    { label: "Blood Camps",         sub: "Manage camps",                  icon: Tent,        color: "text-teal-600 bg-teal-50 border-teal-200",       alert: false,                path: "/admin/camps"               },
    { label: "Analytics",           sub: "View trends",                   icon: BarChart2,   color: "text-slate-600 bg-slate-50 border-slate-200",    alert: false,                path: "/admin/analytics"           },
  ];

  // KPI cards
  const kpis = [
    { icon: Users,      label: "Total Users",   value: data?.totalUsers || 0,      sub: "registered",          color: "text-blue-600",    bg: "bg-blue-50"    },
    { icon: Droplets,   label: "Active Donors", value: data?.totalDonors || 0,     sub: "verified donors",     color: "text-red-600",     bg: "bg-red-50"     },
    { icon: HeartPulse, label: "Donations",     value: data?.totalDonations || 0,  sub: `${data?.totalUnitsDonated||0} units`, color: "text-rose-600", bg: "bg-rose-50" },
    { icon: TrendingUp, label: "Lives Saved",   value: fmt(data?.livesSaved || 0), sub: "people helped",       color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">

      {/* Low stock banner */}
      {!dismissed && lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-black text-amber-800 mb-1">⚠️ Low Blood Stock</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {lowStock.map(g => (
                <span key={g.bloodGroup} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-black border border-amber-200">
                  {g.bloodGroup} — {g.units} units
                </span>
              ))}
            </div>
            <a href="/admin/inventory" className="inline-block mt-2 text-xs font-bold text-amber-700 underline">Go to Inventory →</a>
          </div>
          <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-700"><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · Last synced: <span className="text-slate-600 font-semibold">{lastSync || "—"}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchStats(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 transition-all shadow-sm">
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={exportDonors}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">{label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-slate-800">Quick Actions</h2>
          <span className="text-xs text-slate-400 font-medium">Click to navigate</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ label, sub, icon: Icon, color, alert, path }) => {
            const [textColor, bgColor, borderColor] = color.split(" ");
            return (
              <button key={label} onClick={() => navigate(path)}
                className={`relative bg-white rounded-2xl p-4 border-2 ${borderColor} hover:shadow-md transition-all text-left group`}>
                {alert && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={textColor} />
                </div>
                <p className="text-sm font-black text-slate-800 group-hover:text-red-600 transition-colors">{label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                <ChevronRight size={14} className="absolute bottom-4 right-4 text-slate-300 group-hover:text-red-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending tasks + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pending tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-black text-slate-800">Needs Attention</h2>
            <p className="text-xs text-slate-400 mt-0.5">Items requiring action</p>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { label: "Pending Blood Requests", value: pendingRequests, color: "text-amber-600 bg-amber-50", icon: Clock, path: "/admin/blood-requests" },
              { label: "Active Emergency Alerts", value: activeAlerts, color: "text-red-600 bg-red-50", icon: ShieldAlert, path: "/admin/alerts" },
              { label: "Critical Requests", value: criticalRequests, color: "text-red-700 bg-red-100", icon: AlertTriangle, path: "/admin/request-matching" },
              { label: "Low Stock Groups", value: lowStock.length, color: "text-amber-700 bg-amber-100", icon: Package, path: "/admin/inventory" },
              { label: "Certificates Issued", value: data?.totalCertificates || 0, color: "text-violet-600 bg-violet-50", icon: Award, path: "/admin/certificates" },
            ].map(({ label, value, color, icon: Icon, path }) => (
              <button key={label} onClick={() => navigate(path)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group text-left">
                <div className={`w-8 h-8 ${color.split(" ")[1]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={color.split(" ")[0]} />
                </div>
                <p className="flex-1 text-sm font-semibold text-slate-700 group-hover:text-slate-900">{label}</p>
                <span className={`text-sm font-black px-2.5 py-0.5 rounded-full ${color.split(" ")[1]} ${color.split(" ")[0]}`}>{value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div>
              <h2 className="font-black text-slate-800">Recent Requests</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest blood requests</p>
            </div>
            <button onClick={() => navigate("/admin/blood-requests")}
              className="flex items-center gap-1 text-xs text-red-500 font-bold hover:text-red-700">
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {!(data?.recentRequests?.length) ? (
              <p className="text-slate-300 text-sm text-center py-10">No requests yet</p>
            ) : data.recentRequests.map(r => (
              <div key={r._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xs font-black">{r.bloodGroup}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{r.patientName}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {r.hospital} · {r.city}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${STATUS_COLOR[r.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>{r.status}</span>
                  <span className="text-[10px] text-slate-300">{timeAgo(r.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent donors */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div>
              <h2 className="font-black text-slate-800">Recent Donors</h2>
              <p className="text-xs text-slate-400 mt-0.5">Newly registered</p>
            </div>
            <button onClick={() => navigate("/admin/donors")}
              className="flex items-center gap-1 text-xs text-red-500 font-bold hover:text-red-700">
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {!(data?.recentDonors?.length) ? (
              <p className="text-slate-300 text-sm text-center py-10">No donors yet</p>
            ) : data.recentDonors.map(d => (
              <div key={d._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {d.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{d.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {d.city || "—"} · {d.donationCount || 0} donations
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">{d.bloodGroup}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.availability ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {d.availability ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blood group urgency summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Urgency breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-black text-slate-800">Request Urgency Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Current open requests by priority</p>
          </div>
          <div className="space-y-4">
            {(data?.urgencyStats || []).map(({ _id, count }) => {
              const pct = Math.round((count / (data?.totalRequests || 1)) * 100);
              const cfg = {
                Critical: { bar: "#ef4444", badge: "bg-red-50 text-red-700" },
                Urgent:   { bar: "#f97316", badge: "bg-orange-50 text-orange-700" },
                Normal:   { bar: "#22c55e", badge: "bg-emerald-50 text-emerald-700" },
              };
              return (
                <div key={_id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${cfg[_id]?.badge || "bg-slate-100 text-slate-600"}`}>{_id}</span>
                    <span className="text-sm font-black text-slate-700">{count} <span className="text-slate-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg[_id]?.bar || "#94a3b8" }} />
                  </div>
                </div>
              );
            })}
            {!data?.urgencyStats?.length && <p className="text-slate-300 text-sm text-center py-8">No request data yet</p>}
          </div>
        </div>

        {/* Blood group donor count */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-black text-slate-800">Donor Blood Group Summary</h2>
            <p className="text-xs text-slate-400 mt-0.5">How many donors per blood type</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(data?.bloodStats || []).map((s, i) => {
              const colors = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];
              return (
                <div key={s._id} className="flex flex-col items-center p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black mb-2 shadow-sm"
                    style={{ background: colors[i % colors.length] }}>
                    {s._id}
                  </div>
                  <p className="text-lg font-black text-slate-800">{s.count}</p>
                  <p className="text-[10px] text-slate-400 font-bold">donors</p>
                </div>
              );
            })}
            {!data?.bloodStats?.length && <p className="text-slate-300 text-sm text-center py-8 col-span-4">No donor data yet</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
