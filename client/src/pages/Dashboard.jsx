import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, Activity, ShieldCheck, Heart, Clock, Award, 
  ArrowRight, Calendar, MapPin, Plus, ListFilter, 
  TrendingUp, Star, Zap, Info, Users, Search, Bell,
  ChevronRight, Bookmark, Share2, Sparkles, Stethoscope,
  HeartPulse, Thermometer, Pill, AlertTriangle, 
  ArrowUpRight, ArrowDownLeft, Target, Globe, Brain
} from "lucide-react";
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, Cell 
} from "recharts";
import API from "../services/api.jsx";

// ── Shared Chart Components ──
const MiniTrendChart = ({ data }) => (
  <div className="h-32 w-full">
    <ResponsiveContainer width="100%" height={128} debounce={50}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="donations" stroke="#E11D48" strokeWidth={2} fillOpacity={1} fill="url(#colorDon)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const InventoryBarChart = ({ data }) => (
  <div className="h-48 w-full">
    <ResponsiveContainer width="100%" height={192} debounce={50}>
      <BarChart data={data}>
        <XAxis dataKey="bloodType" hide={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
        <Bar dataKey="totalUnits" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.status === 'Critical' ? '#E11D48' : entry.status === 'Low' ? '#F59E0B' : '#10B981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [camps, setCamps] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [publicStats, setPublicStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.id) {
       loadAllData(storedUser.id);
    }
  }, []);

  const loadAllData = async (userId) => {
    setLoading(true);
    try {
      const [
        statsRes, 
        donationsRes, 
        requestsRes, 
        campsRes, 
        analyticsRes,
        certsRes,
        userRes,
        inventoryRes,
        publicStatsRes
      ] = await Promise.all([
        API.get(`/dashboard/stats/${userId}`),
        API.get(`/dashboard/donations/${userId}`),
        API.get(`/request/my`),
        API.get(`/camps`),
        API.get(`/analytics/donations`),
        API.get(`/certificates/my`),
        API.get(`/user/profile`),
        API.get(`/blood/inventory`),
        API.get(`/public/stats`)
      ]);

      setStats(statsRes.data || {});
      setCamps(Array.isArray(campsRes.data) ? campsRes.data.filter(c => c.status !== "completed").slice(0, 3) : []);
      setAnalytics(Array.isArray(analyticsRes.data) ? analyticsRes.data : []);
      // getUserCertificates returns { success, certificates: [...] }
      const certsRaw = certsRes.data;
      setCertificates(Array.isArray(certsRaw) ? certsRaw : Array.isArray(certsRaw?.certificates) ? certsRaw.certificates : []);
      setUser(userRes.data || {});
      setPublicStats(publicStatsRes.data || {});
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data.map(i => ({
        ...i,
        totalUnits: (i.wholeBlood || 0) + (i.plasma || 0) + (i.platelets || 0) + (i.rbc || 0)
      })) : []);

      const donations = Array.isArray(donationsRes.data) ? donationsRes.data : [];
      const requests = Array.isArray(requestsRes.data) ? requestsRes.data : [];

      const combined = [
        ...donations.map(d => ({
          ...d,
          uiType: 'Donation',
          title: 'Blood Donation',
          meta: `${d.location || 'Blood Center'} · ${new Date(d.date).toLocaleDateString()}`,
          status: d.verificationStatus || 'Completed',
          icon: Droplets,
          col: "text-rose-600",
          bg: "bg-rose-50",
          ts: new Date(d.date).getTime()
        })),
        ...requests.map(r => ({
          ...r,
          uiType: 'Request',
          title: `Blood Request: ${r.bloodGroup}`,
          meta: `${r.hospital} · ${new Date(r.createdAt).toLocaleDateString()}`,
          status: r.status,
          icon: Activity,
          col: "text-indigo-600",
          bg: "bg-indigo-50",
          ts: new Date(r.createdAt).getTime()
        }))
      ].sort((a, b) => b.ts - a.ts).slice(0, 5);

      setActivities(combined);

    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 tracking-[0.3em] uppercase animate-pulse">Synchronizing Universe...</p>
        </div>
      </div>
    );
  }

  // Compatibility logic
  const compatibility = {
    'A+': { give: ['A+', 'AB+'], receive: ['A+', 'A-', 'O+', 'O-'] },
    'A-': { give: ['A+', 'A-', 'AB+', 'AB-'], receive: ['A-', 'O-'] },
    'B+': { give: ['B+', 'AB+'], receive: ['B+', 'B-', 'O+', 'O-'] },
    'B-': { give: ['B+', 'B-', 'AB+', 'AB-'], receive: ['B-', 'O-'] },
    'AB+': { give: ['AB+'], receive: ['All Groups'] },
    'AB-': { give: ['AB+', 'AB-'], receive: ['AB-', 'A-', 'B-', 'O-'] },
    'O+': { give: ['O+', 'A+', 'B+', 'AB+'], receive: ['O+', 'O-'] },
    'O-': { give: ['All Groups'], receive: ['O-'] },
  };

  const myGroup = stats?.bloodGroup || user?.bloodGroup || 'O+';
  const myCompat = compatibility[myGroup] || { give: [], receive: [] };

  // Derive rank tier from donation count
  const donationCount = stats?.donationCount || 0;
  const rankLabel = donationCount >= 20 ? "National Hero" : donationCount >= 10 ? "Regional Hero" : donationCount >= 5 ? "Local Hero" : donationCount >= 1 ? "Rising Star" : "New Member";
  const rankNum = donationCount >= 20 ? 1 : donationCount >= 10 ? 5 : donationCount >= 5 ? 42 : donationCount >= 1 ? 120 : 999;

  // Points: 100 per donation + 50 per certificate
  const earnedPoints = (donationCount * 100) + (certificates.length * 50);
  const pointLevel = Math.floor(earnedPoints / 200) + 1;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      
      {/* ── Heading Section ── */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-3">
             <div className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">Live</div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Hub Status: Operational</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
            Welcome, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-slate-500 font-bold">
                <Globe size={16} className="text-rose-500" />
                <span className="text-sm">Rank: <span className="text-slate-900">#{rankNum} {rankLabel}</span></span>
             </div>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="flex items-center gap-2 text-slate-500 font-bold">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-sm">Eligibility: <span className={stats?.recoveryPercentage === 100 ? "text-emerald-600" : "text-amber-500"}>{stats?.recoveryPercentage === 100 ? "Active" : "In Recovery"}</span></span>
             </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate("/my-donations")}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-slate-200 hover:-translate-y-1 transition-all"
          >
            <Activity size={18} /> My Donations
          </button>
          <button
            onClick={() => navigate("/request")}
            className="flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-rose-200 hover:-translate-y-1 active:scale-95 transition-all"
          >
            <Plus size={18} /> Request Blood
          </button>
        </motion.div>
      </section>

      {/* ── Statistics Row ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Donations", value: stats?.donationCount || 0, icon: Droplets, color: "text-rose-600", bg: "bg-rose-50", desc: "Lifetime Impact" },
          { label: "Blood Group", value: myGroup, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Profile Verified" },
          { label: "Certificates", value: (certificates?.length || 0).toString().padStart(2, '0'), icon: Award, color: "text-amber-600", bg: "bg-amber-50", desc: "Official Honors" },
          { label: "Daily Points", value: earnedPoints.toLocaleString(), icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50", desc: `Level ${pointLevel} reached` },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
          >
            <div className={`relative z-10 ${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{stat.value}</h3>
              <p className="text-[11px] font-bold text-slate-400">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Main Dashboard Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT: CORE DATA */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Dynamic Recovery Tracker */}
             <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm flex flex-col justify-between h-[22rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                   <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 animate-pulse">
                      <Clock size={24} />
                   </div>
                </div>
                <div>
                   <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2">Recovery <br /> Progress</h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Next Eligibility Window</p>
                </div>
                <div className="flex items-end justify-between">
                   <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-4">
                         <span className="text-6xl font-black text-slate-900 tracking-tighter">{stats?.recoveryPercentage || 0}%</span>
                         <span className="text-xs font-bold text-slate-400 uppercase">Charged</span>
                      </div>
                      <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${stats?.recoveryPercentage || 0}%` }}
                           className={`h-full rounded-full ${stats?.recoveryPercentage === 100 ? 'bg-emerald-500' : 'bg-rose-500 shadow-sm shadow-rose-200'}`}
                         />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest leading-relaxed">
                        Ready officially by:<br />
                        <span className="text-slate-900 font-black">{stats?.nextEligibleDate ? new Date(stats.nextEligibleDate).toDateString() : 'TBD'}</span>
                      </p>
                   </div>
                </div>
             </div>

             {/* Live Analytics Mini Pulse */}
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col h-[22rem] group">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-xl font-black tracking-tight">System Pulse</h4>
                   <div className="p-2 bg-white/10 rounded-xl text-emerald-400">
                      <TrendingUp size={20} />
                   </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">Live Donation Network Flow</p>
                <div className="flex-1 -mx-6">
                   <MiniTrendChart data={analytics} />
                </div>
                <div className="mt-6 flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-500">Network Donations</span>
                      <span className="text-sm font-bold">{publicStats?.totalDonors ?? "—"}</span>
                   </div>
                   <div className="h-8 w-px bg-white/10" />
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-500">Lives Saved</span>
                      <span className="text-sm font-bold text-emerald-400">{publicStats?.livesSaved ?? stats?.livesSaved ?? "—"}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* REAL System Stock Monitoring (New Section) */}
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h4 className="text-2xl font-black text-slate-900 tracking-tight">System Stock Status</h4>
                   <p className="text-sm text-slate-400 font-medium mt-1">Live inventory levels across all centers</p>
                </div>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-600 transition-colors">
                   <ListFilter size={18} />
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                <div className="md:col-span-4 space-y-6">
                   {(() => {
                     const critical = inventory.find(i => i.status === "Critical");
                     const low = inventory.find(i => i.status === "Low");
                     const alert = critical || low;
                     return (
                       <div className={`p-6 border rounded-3xl ${alert ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                         <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${alert ? 'text-rose-600' : 'text-emerald-600'}`}>
                           {alert ? "Status Alert" : "All Stocked"}
                         </p>
                         <h5 className="text-sm font-black text-slate-900 mb-2">
                           {alert ? `${alert.status} Need for ${alert.bloodType}` : "Inventory Levels Normal"}
                         </h5>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium">
                           {alert
                             ? `${alert.bloodType} blood is currently in ${alert.status.toLowerCase()} supply. Please refer donors.`
                             : "All blood types are adequately stocked across centers."}
                         </p>
                       </div>
                     );
                   })()}
                   <button onClick={() => navigate("/my-donations")} className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">View Detailed Report</button>
                </div>
                <div className="md:col-span-8 bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                   <InventoryBarChart data={inventory} />
                </div>
             </div>
          </div>

          {/* Activity Feed Expanded */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-4">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity Archive</h4>
                <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors">Archive View</button>
             </div>
             <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm shadow-slate-100/50">
                <div className="divide-y divide-slate-50">
                   {activities.length === 0 ? (
                     <div className="p-24 text-center text-slate-300">
                        <Activity size={60} className="mx-auto mb-6 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Zero recorded events</p>
                     </div>
                   ) : activities.map((item, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }} 
                       className="group px-10 py-7 flex items-center justify-between hover:bg-slate-50/80 transition-all cursor-pointer"
                     >
                        <div className="flex items-center gap-6">
                           <div className={`${item.bg} ${item.col} p-4 rounded-2xl shadow-sm transition-transform group-hover:rotate-6`}>
                              <item.icon size={24} strokeWidth={2.5} />
                           </div>
                           <div>
                              <p className="text-base font-black text-slate-900 tracking-tight mb-1 group-hover:text-rose-600 transition-colors">{item.title}</p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> {item.meta}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="hidden sm:flex flex-col items-end">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Event Status</span>
                              <span className={`text-[11px] font-black uppercase ${item.status === 'Critical' || item.status === 'Rejected' ? 'text-rose-600' : 'text-emerald-500'}`}>{item.status}</span>
                           </div>
                           <ChevronRight size={20} className="text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: RESOURCES & UTILS */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Medical Pulse Snapshot */}
           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Health Profile</h4>
                <Stethoscope size={22} className="text-rose-600" />
             </div>
             
             <div className="space-y-6">
                {[
                  { label: "Medications", value: user?.medications, icon: Pill, color: "indigo" },
                  { label: "Conditions", value: user?.conditions, icon: HeartPulse, color: "rose" },
                  { label: "Allergies", value: user?.allergies, icon: AlertTriangle, color: "amber" },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-4">
                     <div className={`p-3 bg-${m.color}-50 text-${m.color}-600 rounded-xl`}>
                        <m.icon size={18} strokeWidth={2.5} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{m.label}</p>
                        <p className="text-sm font-bold text-slate-900 leading-snug">{m.value || 'None Found'}</p>
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-10 p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Daily Status</p>
                   <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{user?.availability ? 'Available for Help' : 'Resting Mode'}</p>
                </div>
             </div>
          </div>

          {/* Compatibility Master Class */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                <Brain size={120} />
             </div>
             <div className="relative z-10">
                <h4 className="text-2xl font-black tracking-tight mb-8">Compatibility <br /> Guide</h4>
                
                <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase text-indigo-300">
                         <ArrowUpRight size={14} /> You Can Give To
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {myCompat.give.map(g => (
                           <span key={g} className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl text-xs font-black border border-white/10 hover:bg-white/20 transition-colors cursor-default">{g}</span>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase text-indigo-300">
                         <ArrowDownLeft size={14} /> You Can Receive From
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {myCompat.receive.map(r => (
                           <span key={r} className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl text-xs font-black border border-white/10 hover:bg-white/20 transition-colors cursor-default">{r}</span>
                         ))}
                      </div>
                   </div>
                </div>
                <button onClick={() => navigate("/compatibility")} className="w-full mt-10 py-5 bg-white text-indigo-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 active:scale-95 transition-all">Deep Analysis</button>
             </div>
          </div>

          {/* Quick Find Widgets */}
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm shadow-slate-100/50">
             <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">Global Discovery</h4>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-rose-600">
                   <MapPin size={18} />
                </div>
             </div>
             <div className="space-y-8">
                {camps.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-bold uppercase">No camps hosted today</p>
                ) : camps.map((camp, i) => (
                  <div key={i} className="group cursor-pointer">
                     <div className="flex items-start gap-5 mb-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                           <MapPin size={22} />
                        </div>
                        <div className="min-w-0">
                           <h5 className="text-base font-black text-slate-900 truncate tracking-tight group-hover:text-rose-600 transition-colors">{camp.title}</h5>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{camp.location?.city || 'Local Area'}</p>
                        </div>
                     </div>
                     <div className="pl-16 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                           <Calendar size={12} /> {new Date(camp.startDate).toLocaleDateString()}
                        </div>
                        <button onClick={() => navigate(`/camps`)} className="text-[10px] font-black text-rose-600 uppercase tracking-[0.1em] hover:underline underline-offset-4">Join Hub →</button>
                     </div>
                  </div>
                ))}
             </div>
             <button onClick={() => navigate("/camps")} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all">View Ecosystem</button>
          </div>

        </div>
      </div>
    </div>
  );
}