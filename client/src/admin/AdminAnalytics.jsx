import { useEffect, useState } from "react";
import API from "../services/api";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, Droplets, Users, HeartPulse, Award,
  RefreshCw, Download, Activity, Calendar, ArrowUpRight,
  ArrowDownRight, Minus
} from "lucide-react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS  = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-bold text-slate-600 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-black" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [range, setRange]     = useState(6); // months

  async function fetchAll(spin = false) {
    if (spin) setSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const h = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("http://localhost:5000/api/admin/stats", h);
      setStats(res.data);
    } catch (e) { }
    finally { setLoading(false); setSyncing(false); }
  }

  useEffect(() => { fetchAll(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin" />
      <p className="text-slate-400 font-semibold">Loading analytics…</p>
    </div>
  );

  // Build monthly chart with full window
  const monthlyChart = (() => {
    const now = new Date();
    return Array.from({ length: range }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (range - 1 - i), 1);
      const found = (stats?.monthlyDonations || []).find(
        m => m._id?.year === d.getFullYear() && m._id?.month === d.getMonth() + 1
      );
      return { month: MONTH_NAMES[d.getMonth()], donations: found?.total || 0 };
    });
  })();

  // Request status data
  const statusData = (stats?.requestStatusStats || []).map(s => ({ name: s._id, value: s.count }));

  // Blood group data
  const bloodData = (stats?.bloodStats || []).map(s => ({ group: s._id, donors: s.count }));

  // Urgency data
  const urgencyData = (stats?.urgencyStats || []).map(s => ({ name: s._id, value: s.count }));

  // KPI cards
  const kpis = [
    {
      label: "Total Donations",
      value: stats?.totalDonations || 0,
      sub: `${stats?.totalUnitsDonated || 0} units`,
      icon: HeartPulse,
      color: "text-red-600", bg: "bg-red-50", border: "border-red-100",
      trend: "up"
    },
    {
      label: "Active Donors",
      value: stats?.totalDonors || 0,
      sub: "registered donors",
      icon: Droplets,
      color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100",
      trend: "up"
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      sub: "registered accounts",
      icon: Users,
      color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100",
      trend: "up"
    },
    {
      label: "Lives Saved",
      value: stats?.livesSaved || 0,
      sub: "estimated impact",
      icon: Award,
      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
      trend: "up"
    },
    {
      label: "Blood Requests",
      value: stats?.totalRequests || 0,
      sub: `${stats?.pendingRequests || 0} pending`,
      icon: Activity,
      color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100",
      trend: stats?.pendingRequests > 5 ? "down" : "neutral"
    },
    {
      label: "Certificates",
      value: stats?.totalCertificates || 0,
      sub: "issued total",
      icon: Award,
      color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100",
      trend: "up"
    },
  ];

  const TrendIcon = ({ t }) => {
    if (t === "up")      return <ArrowUpRight size={14} className="text-emerald-500" />;
    if (t === "down")    return <ArrowDownRight size={14} className="text-red-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Platform-wide performance overview</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* Range selector */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {[3, 6, 12].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all
                  ${range === r ? "bg-red-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}>
                {r}M
              </button>
            ))}
          </div>
          <button onClick={() => fetchAll(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 transition-all shadow-sm">
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg, border, trend }) => (
          <div key={label} className={`bg-white rounded-2xl p-4 border ${border} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
              <TrendIcon t={trend} />
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none">{value.toLocaleString()}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mt-1">{label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Donation Trend + Blood Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-slate-800">Donation Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Units donated — last {range} months</p>
            </div>
            <span className="text-xs bg-red-50 text-red-500 font-bold px-3 py-1 rounded-full border border-red-100">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="donations" name="Donations" stroke="#ef4444" strokeWidth={2.5} fill="url(#grad1)"
                dot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-black text-slate-800">Blood Group Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">Donors by blood type</p>
          </div>
          {!bloodData.length ? (
            <div className="flex items-center justify-center h-48 text-slate-300 flex-col gap-2">
              <Droplets size={32} /><p className="text-sm">No data</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={bloodData} dataKey="donors" nameKey="group" innerRadius={45} outerRadius={70} paddingAngle={3} stroke="none">
                    {bloodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-3">
                {bloodData.map((s, i) => (
                  <div key={s.group} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="font-bold text-slate-700">{s.group}</span>
                    <span className="text-slate-400 ml-auto">{s.donors}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Request Status + Urgency + Blood Group Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-black text-slate-800">Request Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown by status</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="value" name="Count" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-black text-slate-800">Request Urgency</h2>
            <p className="text-xs text-slate-400 mt-0.5">Critical · Urgent · Normal</p>
          </div>
          <div className="space-y-4 mt-2">
            {urgencyData.map(({ name, value }) => {
              const total = urgencyData.reduce((s, d) => s + d.value, 0) || 1;
              const pct = Math.round((value / total) * 100);
              const colors = { Critical: "#ef4444", Urgent: "#f97316", Normal: "#22c55e" };
              const badges = { Critical: "bg-red-50 text-red-600", Urgent: "bg-orange-50 text-orange-600", Normal: "bg-emerald-50 text-emerald-600" };
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${badges[name] || "bg-slate-100 text-slate-600"}`}>{name}</span>
                    <span className="text-sm font-black text-slate-700">{value} <span className="text-slate-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: colors[name] || "#94a3b8" }} />
                  </div>
                </div>
              );
            })}
            {!urgencyData.length && <p className="text-slate-300 text-sm text-center py-8">No data yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-black text-slate-800">Donors per Blood Group</h2>
            <p className="text-xs text-slate-400 mt-0.5">Supply overview</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bloodData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="donors" name="Donors" radius={[6, 6, 0, 0]} barSize={22}>
                {bloodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-black text-slate-800">Monthly Donation Summary</h2>
          <p className="text-xs text-slate-400 mt-0.5">Last {range} months breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donations</th>
                <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">vs Prev</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyChart.map((row, i) => {
                const prev = monthlyChart[i - 1]?.donations || 0;
                const diff = row.donations - prev;
                const pct = prev > 0 ? Math.round((diff / prev) * 100) : null;
                return (
                  <tr key={row.month} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-700">{row.month}</td>
                    <td className="px-6 py-3.5 text-right font-black text-slate-900">{row.donations}</td>
                    <td className="px-6 py-3.5 text-right">
                      {i === 0 || prev === 0 ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : (
                        <span className={`text-xs font-black ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {diff >= 0 ? "+" : ""}{pct}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[120px]">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min((row.donations / (Math.max(...monthlyChart.map(m => m.donations)) || 1)) * 100, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
