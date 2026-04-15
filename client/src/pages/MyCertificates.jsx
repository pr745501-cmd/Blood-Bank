import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CertificateTemplate from "../components/CertificateTemplate";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Heart, Award, Calendar, TrendingUp, ShieldCheck, Star, Target, Users, Zap, Clock, CheckCircle2, Medal, BarChart2, Globe } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from "recharts";

const RANK_TIERS = [
  { label: "New Member",  min: 0,  color: "text-slate-500",  bg: "bg-slate-100", icon: "??" },
  { label: "Rising Star", min: 1,  color: "text-blue-600",   bg: "bg-blue-50",   icon: "?" },
  { label: "Local Hero",  min: 3,  color: "text-indigo-600", bg: "bg-indigo-50", icon: "??" },
  { label: "Elite",       min: 5,  color: "text-amber-600",  bg: "bg-amber-50",  icon: "??" },
  { label: "Champion",    min: 10, color: "text-rose-600",   bg: "bg-rose-50",   icon: "??" },
  { label: "Legend",      min: 25, color: "text-purple-600", bg: "bg-purple-50", icon: "??" },
];
function getRank(count) { return [...RANK_TIERS].reverse().find(r => count >= r.min) || RANK_TIERS[0]; }
const MILESTONE_STEPS = [1, 3, 5, 10, 25, 50];
const CHART_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6"];

function StatCard({ title, value, icon, trend, trendColor = "text-green-500" }) {
  return (
    <div className="relative group p-5 md:p-7 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
      <div className={`absolute top-4 right-4 text-[10px] font-black ${trendColor} bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter`}>{trend}</div>
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tighter">{value}</h3>
    </div>
  );
}

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [selected, setSelected]         = useState(null);
  const [stats, setStats]               = useState(null);
  const [analytics, setAnalytics]       = useState(null);
  const [tab, setTab]                   = useState("certificates");
  const [search, setSearch]             = useState("");
  const certRef = useRef();

  const fetchAll = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id || user?.id;
      if (!userId) return;

      const [sRes, cRes, aRes] = await Promise.all([
        API.get(`/dashboard/stats/${userId}`),
        API.get("/certificates/my"),
        API.get(`/donations/analytics/${userId}`)
      ]);
      setStats(sRes.data);
      setCertificates(cRes.data?.certificates || []);
      setAnalytics(aRes.data || null);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAll();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;
    if (!userId) return;
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.on("donationUpdated", (d) => { if (d.userId === userId) fetchAll(); });
    socket.on("certificateIssued", (d) => { if (d.donorId === userId) fetchAll(); });
    return () => socket.disconnect();
  }, []);

  const count    = stats?.donationCount ?? 0;
  const lives    = stats?.livesSaved ?? count * 3;
  const rank     = getRank(count);
  const nextDate = stats?.nextEligibleDate
    ? new Date(stats.nextEligibleDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : stats ? "Ready Now" : "...";

  const filtered = certificates.filter(c =>
    !search.trim() ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase()) ||
    c.donorName?.toLowerCase().includes(search.toLowerCase()) ||
    c.bloodGroup?.toLowerCase().includes(search.toLowerCase())
  );

  const downloadCertificate = async () => {
    const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true });
    const pdf = new jsPDF("landscape", "px", [1100, 750]);
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 1100, 750);
    pdf.save(`bloodconnect-cert-${selected.certificateId}.pdf`);
  };

  // -- analytics derived --
  const monthly       = analytics?.monthly || [];
  const statusBreak   = analytics?.statusBreakdown || [];
  const totalUnits    = analytics?.totalUnits || 0;
  const approvedCount = statusBreak.find(s => s.status === "approved")?.count || 0;
  const successRate   = count > 0 ? Math.round((approvedCount / count) * 100) : 0;
  const nextMilestone = MILESTONE_STEPS.find(m => m > count) || MILESTONE_STEPS[MILESTONE_STEPS.length - 1];
  const milestoneProgress = Math.min(Math.round((count / nextMilestone) * 100), 100);

  return (
    <div className="min-h-screen bg-[#fcfcfd] relative overflow-x-hidden font-sans pb-20">
      {/* ambient bg */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-red-100/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">

        {/* -- HEADER -- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.15em]">Donor Recognition</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Hero <span className="text-transparent bg-clip-text bg-gradient-to-tr from-red-600 to-rose-400">Archive.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
              Your compassion flows through the community. Manage your official donation credentials and track your life-saving milestones.
            </p>
          </div>
          <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {["certificates","impact"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800"}`}>
                {t}
              </button>
            ))}
          </div>
        </header>

        {/* -- STATS GRID -- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <StatCard title="Total Donations" value={count}      icon="??" trend="Active" />
          <StatCard title="Lives Saved"     value={lives}      icon="?" trend={`+${Math.max(lives,0)} Total`} />
          <StatCard title="Donor Rank"      value={rank.label} icon={rank.icon} trend="Earned" />
          <StatCard title="Eligibility"     value={nextDate}   icon="???" trend="Ready soon" />
        </div>

        <AnimatePresence mode="wait">
        {tab === "certificates" ? (
          <motion.div key="certs" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>

            {/* certificates table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-red-500/5 transition-all">
              <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Recognition</h2>
                  {certificates.length > 0 && (
                    <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full border border-red-100">{certificates.length}</span>
                  )}
                </div>
                <div className="relative w-full md:w-72">
                  <input type="text" placeholder="Search certificate ID..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none" />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] tracking-[0.2em] font-black">
                      <th className="px-8 py-5">Document Name</th>
                      <th className="px-8 py-5 text-center">Group</th>
                      <th className="px-8 py-5">Verified Date</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((cert) => (
                      <tr key={cert._id} className="group/row hover:bg-slate-50/80 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-xl shadow-lg shadow-slate-200 group-hover/row:scale-110 transition-transform">
                              <span className="grayscale brightness-200">??</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">Donation Certificate</p>
                              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">ID: {cert.certificateId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="inline-flex px-3 py-1 rounded-lg bg-red-600 text-white text-[11px] font-black ring-4 ring-red-50 shadow-lg">{cert.bloodGroup}</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-600">
                            {new Date(cert.donationDate).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => setSelected(cert)}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-red-600 hover:shadow-xl hover:shadow-red-200 transition-all active:scale-95">
                            View & Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">??</div>
                  <h3 className="text-2xl font-black text-slate-900">{search ? "No matches found" : "No Records Found"}</h3>
                  <p className="text-slate-400 mt-2 font-medium">{search ? "Try a different search term." : "Your first donation will unlock exclusive rewards."}</p>
                </div>
              )}
            </div>

            {/* milestone progress */}
            <div className="mt-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Milestone Progress</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Next target: {nextMilestone} donations</p>
                </div>
                <span className="text-2xl font-black text-slate-900">{count} / {nextMilestone}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                <motion.div initial={{ width:0 }} animate={{ width:`${milestoneProgress}%` }} transition={{ duration:1, ease:"easeOut" }}
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full" />
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {MILESTONE_STEPS.map(m => {
                  const done = count >= m;
                  return (
                    <div key={m} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${done ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-transparent text-slate-300"}`}>
                      <span className="text-lg">{done ? "?" : "??"}</span>
                      <span className="text-xs font-black mt-1">{m}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest">bags</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        ) : (
          <motion.div key="impact" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="space-y-8">

            {/* rank card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-10 text-[10rem] leading-none select-none">{rank.icon}</div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                <div className="md:col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Your Donor Rank</p>
                  <h2 className="text-5xl font-black tracking-tight mb-4">{rank.icon} {rank.label}</h2>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                    You have completed <span className="text-white font-black">{count} donation{count !== 1 ? "s" : ""}</span> and saved an estimated <span className="text-red-400 font-black">{lives} lives</span>. Keep going to reach the next tier.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {RANK_TIERS.map(r => (
                      <span key={r.label} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${count >= r.min ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-white/20"}`}>
                        {r.icon} {r.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { label:"Donations",    val: count,        icon: <Droplets size={16}/> },
                    { label:"Lives Saved",  val: lives,        icon: <Heart size={16}/> },
                    { label:"Certificates", val: certificates.length, icon: <Award size={16}/> },
                    { label:"Success Rate", val: `${successRate}%`, icon: <CheckCircle2 size={16}/> },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between bg-white/5 rounded-2xl px-5 py-3 border border-white/10">
                      <div className="flex items-center gap-3 text-slate-400">{m.icon}<span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span></div>
                      <span className="text-lg font-black">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* lives saved + units chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Units Donated — Last 12 Months</p>
                <p className="text-2xl font-black text-slate-900 mb-6">{totalUnits} <span className="text-sm font-bold text-slate-400">total units</span></p>
                <div className="h-[180px]" style={{ minHeight: 180 }}>
                  <ResponsiveContainer width="100%" height="100%" minHeight={180} debounce={50}>
                    <AreaChart data={monthly}>
                      <defs>
                        <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:9, fontWeight:900, fill:"#94a3b8" }} dy={6}/>
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:9, fontWeight:900, fill:"#94a3b8" }} allowDecimals={false}/>
                      <Tooltip contentStyle={{ borderRadius:"12px", border:"none", boxShadow:"0 10px 30px rgba(0,0,0,0.1)" }}/>
                      <Area type="monotone" dataKey="units" stroke="#ef4444" strokeWidth={2.5} fill="url(#impactGrad)" dot={{ r:4, fill:"#ef4444", stroke:"#fff", strokeWidth:2 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Donation Frequency</p>
                <p className="text-2xl font-black text-slate-900 mb-6">{count} <span className="text-sm font-bold text-slate-400">total donations</span></p>
                <div className="h-[180px]" style={{ minHeight: 180 }}>
                  <ResponsiveContainer width="100%" height="100%" minHeight={180} debounce={50}>
                    <BarChart data={monthly}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:9, fontWeight:900, fill:"#94a3b8" }} dy={6}/>
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:9, fontWeight:900, fill:"#94a3b8" }} allowDecimals={false}/>
                      <Tooltip contentStyle={{ borderRadius:"12px", border:"none", boxShadow:"0 10px 30px rgba(0,0,0,0.1)" }}/>
                      <Bar dataKey="count" radius={[6,6,0,0]} barSize={20}>
                        {monthly.map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* verification breakdown + impact metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Verification Breakdown</p>
                <div className="space-y-4">
                  {[
                    { label:"Approved", count: statusBreak.find(s=>s.status==="approved")?.count||0, color:"bg-emerald-500", text:"text-emerald-600" },
                    { label:"Pending",  count: statusBreak.find(s=>s.status==="pending")?.count||0,  color:"bg-amber-400",  text:"text-amber-600" },
                    { label:"Rejected", count: statusBreak.find(s=>s.status==="rejected")?.count||0, color:"bg-red-500",    text:"text-red-600" },
                  ].map(s => {
                    const pct = count > 0 ? Math.round((s.count/count)*100) : 0;
                    return (
                      <div key={s.label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${s.text}`}>{s.label}</span>
                          <span className="text-[10px] font-black text-slate-400">{s.count} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,ease:"easeOut"}}
                            className={`h-full rounded-full ${s.color}`}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-3 gap-4">
                  {[
                    { label:"Avg Units/Donation", val: count>0?(totalUnits/count).toFixed(1):"—" },
                    { label:"Certificates Earned", val: certificates.length },
                    { label:"Success Rate", val: count>0?`${successRate}%`:"—" },
                  ].map(m => (
                    <div key={m.label} className="text-center p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xl font-black text-slate-900">{m.val}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-rose-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-[8rem] leading-none select-none">??</div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-200 mb-4">Community Impact</p>
                  <div className="space-y-6">
                    {[
                      { label:"Lives Saved",    val: lives,        icon:"??" },
                      { label:"Units Donated",  val: totalUnits,   icon:"??" },
                      { label:"Certs Earned",   val: certificates.length, icon:"??" },
                      { label:"Donor Since",    val: certificates.length > 0
                          ? new Date(certificates[certificates.length-1]?.donationDate).toLocaleDateString("en-IN",{month:"short",year:"numeric"})
                          : "—",                                   icon:"??" },
                    ].map(m => (
                      <div key={m.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{m.icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-200">{m.label}</span>
                        </div>
                        <span className="text-lg font-black">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* activity heatmap */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Monthly Activity Heatmap</p>
              <div className="grid grid-cols-12 gap-2">
                {monthly.map((m,i) => {
                  const intensity = m.count===0?0:m.count===1?1:m.count<=2?2:3;
                  const bg = ["bg-slate-100","bg-red-200","bg-red-400","bg-red-600"][intensity];
                  return (
                    <div key={i} title={`${m.month}: ${m.count} donation(s)`}
                      className={`h-10 rounded-xl ${bg} flex items-end justify-center pb-1 transition-all hover:scale-110 cursor-default`}>
                      <span className="text-[8px] font-black text-white/70">{m.month.slice(0,1)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[9px] text-slate-400 font-bold">Less</span>
                {["bg-slate-100","bg-red-200","bg-red-400","bg-red-600"].map((c,i)=>(
                  <div key={i} className={`w-4 h-4 rounded ${c}`}/>
                ))}
                <span className="text-[9px] text-slate-400 font-bold">More</span>
              </div>
            </div>

          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* -- CERTIFICATE MODAL -- */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setSelected(null)}/>
          <div className="relative w-full max-w-5xl bg-[#f8fafc] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
            <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"/>
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Official Verification System</span>
              </div>
              <button onClick={() => setSelected(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all">?</button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-12 bg-slate-200/50 flex flex-col items-center">
              <div className="bg-white p-2 shadow-2xl rounded-sm">
                <div ref={certRef} className="origin-top scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 transition-all">
                  <CertificateTemplate cert={selected}/>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <p className="text-slate-900 font-black tracking-tight">Verified Document</p>
                  <p className="text-xs font-bold text-slate-400">PDF Format • 300 DPI High Res</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => setSelected(null)} className="flex-1 sm:px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Close</button>
                <button onClick={downloadCertificate} className="flex-1 sm:px-10 py-4 rounded-2xl font-black bg-red-600 text-white shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3">
                  <span>Download PDF</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
