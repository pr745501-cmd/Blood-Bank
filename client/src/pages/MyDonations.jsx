import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  Droplets, Heart, Clock, RefreshCw,
  Calendar, MapPin, CheckCircle2,
  Activity, Award, Zap,
  ChevronRight, Stethoscope, ClipboardCheck,
  FileText, Info, AlertCircle, Medal, HeartPulse, Microscope,
  TrendingUp, Target, ShieldCheck, Flame, BarChart2, PieChart as PieIcon
} from "lucide-react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-slate-900 text-lg font-black italic">
          {payload[0].value} <span className="text-red-500 italic">{payload[0].name?.toUpperCase()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const STATUS_COLORS = { approved: "#10b981", pending: "#f59e0b", rejected: "#ef4444" };
const PIE_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];

export default function MyDonations() {
  const [stats,     setStats]     = useState(null);
  const [history,   setHistory]   = useState([]);
  const [monthly,   setMonthly]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("overview");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id || user?.id;
      if (!userId) throw new Error("Not logged in");

      const [sR, hR, mR, aR] = await Promise.all([
        API.get(`/dashboard/stats/${userId}`),
        API.get(`/donations/history/${userId}`),
        API.get(`/donations/monthly/${userId}`),
        API.get(`/donations/analytics/${userId}`)
      ]);

      setStats(sR.data);
      setHistory(hR.data || []);
      setAnalytics(aR.data || null);

      const processedMonthly = (mR.data || []).map(d => ({
        month: MONTH_NAMES[(d._id?.month ?? d._id) - 1] || "—",
        donations: d.total || 0
      }));
      setMonthly(processedMonthly);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const daysUntil = (d) => d ? Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000)) : null;

  const count      = stats?.donationCount ?? 0;
  const daysLeft   = daysUntil(stats?.nextEligibleDate);
  const bloodGroup = stats?.bloodGroup || "—";

  // Analytics derived values
  const analyticsMonthly   = analytics?.monthly || [];
  const statusBreakdown    = analytics?.statusBreakdown || [];
  const totalUnits         = analytics?.totalUnits || stats?.totalUnitsDonated || 0;
  const approvedCount      = statusBreakdown.find(s => s.status === "approved")?.count || 0;
  const pendingCount       = statusBreakdown.find(s => s.status === "pending")?.count || 0;
  const rejectedCount      = statusBreakdown.find(s => s.status === "rejected")?.count || 0;
  const successRate        = count > 0 ? Math.round((approvedCount / count) * 100) : 0;
  const peakMonth          = analyticsMonthly.reduce((a, b) => (b.units > (a?.units || 0) ? b : a), null);
  const avgUnitsPerDonation = count > 0 ? (totalUnits / count).toFixed(1) : 0;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Clinical Syncing...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100 shadow-sm">
              <HeartPulse size={20} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none mb-1 uppercase">
                Health <span className="text-red-600 italic">Passport</span>
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Certified Donation Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-8">
              {[
                { label: "Blood Group", val: bloodGroup, icon: <Droplets size={12} /> },
                { label: "Success Rate", val: count > 0 ? `${successRate}%` : "—", icon: <CheckCircle2 size={12} /> },
                { label: "Status", val: daysLeft === 0 ? "PRIMED" : "RECOVERING", icon: <Activity size={12} /> },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                    {item.icon} {item.label}
                  </div>
                  <span className="text-xs font-black italic uppercase leading-none">{item.val}</span>
                </div>
              ))}
            </div>
            <button onClick={fetchAll} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm active:scale-95">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-8 space-y-10">

            {/* VITAL SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Units Logged",      val: totalUnits || count,          unit: "BAGS",  color: "bg-red-50 text-red-600 border-red-100",     icon: <Droplets /> },
                { label: "Missions",          val: count,                         unit: "OPS",   color: "bg-blue-50 text-blue-600 border-blue-100",   icon: <ClipboardCheck /> },
                { label: "Lives Influenced",  val: stats?.livesSaved ?? 0,        unit: "SOULS", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <Heart /> },
                { label: "Eligibility",       val: daysLeft ?? 0,                 unit: "DAYS",  color: "bg-amber-50 text-amber-600 border-amber-100", icon: <Clock /> },
              ].map(s => (
                <div key={s.label} className={`p-6 rounded-[2rem] border transition-all hover:shadow-lg hover:shadow-slate-200/50 ${s.color}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="opacity-60">{s.icon}</div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 italic">Clinical Verified</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <p className="text-3xl font-black italic leading-none">{s.val}</p>
                    <p className="text-[9px] font-black opacity-60 leading-none">{s.unit}</p>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{s.label}</p>
                </div>
              ))}
            </div>

            {/* ANALYTICS HUB — TABS */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-1 leading-none">
                    Biological <span className="text-red-600">Distribution</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Clinical Output Log</p>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  {["OVERVIEW", "ANALYTICS"].map(t => (
                    <button key={t} onClick={() => setTab(t.toLowerCase())}
                      className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all ${
                        tab === t.toLowerCase() ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {tab === "overview" ? (
                  <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    {/* Overview: bar chart of monthly donations */}
                    <div className="h-[260px] w-full" style={{ minHeight: 260 }}>
                      <ResponsiveContainer width="100%" height="100%" minHeight={260} debounce={50}>
                        <BarChart data={monthly.length ? monthly : analyticsMonthly.map(m => ({ month: m.month, donations: m.count }))} barGap={12}>
                          <defs>
                            <linearGradient id="medicalGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"  stopColor="#ef4444" stopOpacity={0.85} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="6 6" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                          <Bar dataKey="donations" name="Donations" radius={[8, 8, 0, 0]} barSize={28} fill="url(#medicalGrad)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Overview summary stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                      {[
                        { label: "Total Units",    val: totalUnits,           icon: <Droplets size={14} />,   color: "text-red-600" },
                        { label: "Avg / Donation", val: avgUnitsPerDonation,  icon: <BarChart2 size={14} />,  color: "text-blue-600" },
                        { label: "Peak Month",     val: peakMonth?.month || "—", icon: <TrendingUp size={14} />, color: "text-emerald-600" },
                      ].map(s => (
                        <div key={s.label} className="text-center p-4 bg-slate-50 rounded-2xl">
                          <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
                          <p className="text-xl font-black text-slate-900">{s.val}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">

                    {/* Analytics: units over 12 months area chart */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Units Donated — Last 12 Months</p>
                      <div className="h-[200px] w-full" style={{ minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%" minHeight={200} debounce={50}>
                          <AreaChart data={analyticsMonthly}>
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="units" name="Units" stroke="#ef4444" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Verification status breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Verification Status</p>
                        {statusBreakdown.length === 0 ? (
                          <p className="text-sm text-slate-300 font-bold italic">No data yet</p>
                        ) : (
                          <div className="space-y-3">
                            {statusBreakdown.map(s => {
                              const pct = count > 0 ? Math.round((s.count / count) * 100) : 0;
                              const col = STATUS_COLORS[s.status] || "#94a3b8";
                              return (
                                <div key={s.status}>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 capitalize">{s.status}</span>
                                    <span className="text-[10px] font-black text-slate-400">{s.count} ({pct}%)</span>
                                  </div>
                                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: col }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Key Metrics</p>
                        <div className="space-y-4">
                          {[
                            { label: "Approval Rate",      val: count > 0 ? `${successRate}%` : "—",       icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
                            { label: "Pending Review",     val: pendingCount,                               icon: <Clock size={14} className="text-amber-500" /> },
                            { label: "Rejected",           val: rejectedCount,                              icon: <AlertCircle size={14} className="text-red-500" /> },
                            { label: "Total Units Given",  val: totalUnits,                                 icon: <Droplets size={14} className="text-blue-500" /> },
                          ].map(m => (
                            <div key={m.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                {m.icon}
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{m.label}</span>
                              </div>
                              <span className="text-sm font-black text-slate-900">{m.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Donation frequency heatmap-style */}
                    <div className="pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Monthly Frequency (Last 12 Months)</p>
                      <div className="grid grid-cols-12 gap-1.5">
                        {analyticsMonthly.map((m, i) => {
                          const intensity = m.count === 0 ? 0 : m.count === 1 ? 1 : m.count <= 2 ? 2 : 3;
                          const bg = ["bg-slate-100", "bg-red-200", "bg-red-400", "bg-red-600"][intensity];
                          return (
                            <div key={i} title={`${m.month}: ${m.count} donation(s)`} className={`h-8 rounded-lg ${bg} transition-all hover:scale-110 cursor-default`} />
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 mt-3 justify-end">
                        <span className="text-[9px] text-slate-400 font-bold">Less</span>
                        {["bg-slate-100","bg-red-200","bg-red-400","bg-red-600"].map((c,i) => (
                          <div key={i} className={`w-4 h-4 rounded ${c}`} />
                        ))}
                        <span className="text-[9px] text-slate-400 font-bold">More</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DETAILED LEDGER */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-lg font-black italic uppercase tracking-tighter border-l-4 border-red-600 pl-4 leading-none">Authentication Ledger</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.length} Records</span>
              </div>

              {history.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-16 text-center">
                  <Droplets size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No donations recorded yet</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">#</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Location</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Group</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Units</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.map((d, i) => {
                        const statusCol = d.verificationStatus === "approved" ? "text-emerald-600 bg-emerald-50" : d.verificationStatus === "rejected" ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50";
                        return (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-8 py-6 text-[10px] font-black text-slate-300 italic">#{String(history.length - i).padStart(2, "0")}</td>
                            <td className="px-8 py-6">
                              <p className="text-sm font-black text-slate-900 italic leading-none mb-1 uppercase">{fmt(d.createdAt || d.date)}</p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-sm font-bold text-slate-700 leading-none mb-1">{d.location || "Unified Hub"}</p>
                              <div className="flex items-center gap-1 text-[9px] text-slate-400 italic">
                                <MapPin size={8} /> Sector Auth 00{i + 1}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 font-black italic text-[10px] border border-red-100 uppercase">
                                {d.bloodGroup || bloodGroup}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="text-sm font-black text-slate-900">{d.units || 1}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${statusCol}`}>
                                {d.verificationStatus || "pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-4 space-y-8">

            {/* MEDICAL CLEARANCE MODULE */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                <Stethoscope size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/50">
                    <Microscope size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-0.5">Clinical Clearance</p>
                    <p className="text-lg font-black italic uppercase leading-none">Bio-Restoration</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 mb-8">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recuperation Level</span>
                    <span className="text-3xl font-black italic leading-none">{stats?.recoveryPercentage ?? 100}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.recoveryPercentage ?? 100}%` }}
                      className="h-full bg-red-600 rounded-full"
                    />
                  </div>
                </div>

                {daysLeft && daysLeft > 0 ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Clock size={18} className="text-slate-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Authorization Countdown</p>
                        <p className="text-sm font-black italic text-red-500">{daysLeft} Days Remaining</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Calendar size={18} className="text-slate-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Scheduled Maturity</p>
                        <p className="text-sm font-black italic">{fmt(stats?.nextEligibleDate)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-red-600 rounded-2xl text-center shadow-xl shadow-red-900/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2 italic">Physiological Readiness</p>
                    <p className="text-sm font-black italic uppercase">Authorized for Deployment</p>
                  </div>
                )}
              </div>
            </div>

            {/* IMPACT SCORE CARD */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Target size={18} className="text-rose-600" />
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-none">Impact Score</h3>
              </div>
              <div className="space-y-5">
                {[
                  { label: "Donations",    val: count,                  max: 10,  color: "bg-red-500" },
                  { label: "Lives Saved",  val: stats?.livesSaved ?? 0, max: 30,  color: "bg-emerald-500" },
                  { label: "Units Given",  val: totalUnits,             max: 15,  color: "bg-blue-500" },
                  { label: "Approval %",   val: successRate,            max: 100, color: "bg-amber-500" },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                      <span className="text-xs font-black text-slate-900">{m.val}{m.label === "Approval %" ? "%" : ""}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((m.val / m.max) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${m.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MEDICAL GUIDE */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Info size={18} className="text-blue-600" />
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-none">Medical Guide</h3>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Hydration Protocol",  desc: "Consume 500ml pure water 30min prior to clinical entry.", icon: "💧" },
                  { title: "Nutritional Support",  desc: "Prioritize iron-rich nutrients: spinach and legumes.", icon: "🥗" },
                  { title: "Restoration Phase",    desc: "Observe 24h rest post-op; avoid rigorous activity.", icon: "😴" },
                  { title: "Bio-Response",         desc: "Monitor for lightheadedness; maintain sugar homeostasis.", icon: "🧪" },
                ].map(tip => (
                  <div key={tip.title} className="flex gap-4 group cursor-help">
                    <span className="text-2xl pt-1 grayscale hover:grayscale-0 transition-all">{tip.icon}</span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 group-hover:text-red-600 transition-colors italic">{tip.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CREDENTIALS */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Medal size={20} className="text-slate-900" />
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-none">Credentials</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 5, 10, 25, 50].map(m => (
                  <div key={m} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    count >= m ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-transparent opacity-20 grayscale"
                  }`}>
                    <span className="text-xs font-black italic">{m}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">BAGS</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[9px] font-medium text-slate-400 text-center italic uppercase">
                Unlock higher credentials through consistent medical altruism.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
