import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Filter, Tent, Calendar, Clock,
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Stethoscope, LayoutGrid, ListChecks, Droplets,
  Flame, Users, X, Info, ArrowRight, Activity
} from "lucide-react";
import CampCard from "../components/CampCard";
import CampRegisterModal from "../components/CampRegisterModal";
import CampDetailsModal from "../components/CampDetailsModal";
import API from "../services/api";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function countdown(startDate) {
  if (!startDate) return null;
  const diff = Math.ceil((new Date(startDate) - new Date()) / 86400000);
  if (diff < 0)   return null;
  if (diff === 0) return { label: "Today!", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: "🟢" };
  if (diff <= 3)  return { label: `${diff}d left`, color: "text-rose-600 bg-rose-50 border-rose-100", icon: "🔥" };
  if (diff <= 7)  return { label: `${diff}d away`, color: "text-amber-600 bg-amber-50 border-amber-100", icon: "⏰" };
  return { label: `${diff} days`, color: "text-slate-500 bg-slate-50 border-slate-100", icon: "📅" };
}

const REG_STYLE = {
  registered: { pill: "bg-blue-50 text-blue-700 border-blue-100",   dot: "bg-blue-500",  label: "Registered" },
  attended:   { pill: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", label: "Attended ✓" },
  cancelled:  { pill: "bg-slate-50 text-slate-500 border-slate-100",     dot: "bg-slate-400",   label: "Cancelled"  },
};

const CAMP_STYLE = {
  upcoming:  "bg-amber-50 text-amber-700 border-amber-100",
  ongoing:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
};

function MyRegCard({ reg, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const camp = reg.campId;
  if (!camp) return null;

  const rs = REG_STYLE[reg.status] || REG_STYLE.registered;
  const cd = countdown(camp.startDate);
  const canCancel = reg.status === "registered" && camp.status !== "completed";
  const registered = camp.registeredCount || 0;
  const capacity   = camp.capacity || 1;
  const percent    = Math.min((registered / capacity) * 100, 100);

  const handleCancel = async () => {
    if (!window.confirm("Cancel your registration for this camp?")) return;
    setCancelling(true);
    try {
      await API.patch(`/camps/cancel/${reg._id}`);
      onCancel(reg._id);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className={`h-1.5 w-full ${reg.status === "attended" ? "bg-emerald-500" : reg.status === "cancelled" ? "bg-slate-300" : "bg-red-500"}`} />
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-500 transition-colors duration-300">
              <Tent size={22} className="text-red-500 group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-800 text-base leading-tight truncate group-hover:text-red-700 transition-colors">{camp.title}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">{camp.organizer}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${rs.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${rs.dot} animate-pulse`} />{rs.label}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${CAMP_STYLE[camp.status] || CAMP_STYLE.upcoming}`}>
              {camp.status}
            </span>
          </div>
        </div>

        {cd && reg.status === "registered" && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border mb-4 w-fit ${cd.color}`}>
            <span>{cd.icon}</span> {cd.label}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Deployment Date</p>
            <p className="font-bold text-slate-700 text-sm italic">{fmt(camp.startDate)}</p>
          </div>
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Active Hours</p>
            <p className="font-bold text-slate-700 text-sm italic">{camp.time || "—"}</p>
          </div>
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50 col-span-2">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Operational Sector</p>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-red-400" />
              <p className="font-bold text-slate-700 text-sm italic truncate">{camp.location?.city}{camp.location?.address ? ` · ${camp.location.address}` : ""}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 space-y-3 overflow-hidden"
            >
              <div className="bg-slate-900 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Capacity</span>
                  <span className={`font-black text-xs italic ${percent >= 80 ? "text-red-400" : "text-emerald-400"}`}>{Math.round(percent)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={`h-full rounded-full ${percent >= 90 ? "bg-red-500" : percent >= 60 ? "bg-amber-400" : "bg-emerald-500"}`} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{registered} units registered / {capacity} total</p>
              </div>
              
              {camp.doctors?.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Assigned Medical Officers</p>
                  <div className="flex flex-wrap gap-2">
                    {camp.doctors.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl text-[10px] text-slate-600 font-black uppercase border border-slate-100 shadow-sm">
                        <Stethoscope size={12} className="text-red-500" />{d.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-4 border-t border-slate-50 flex gap-3">
          <button 
            onClick={() => setExpanded(v => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95"
          >
            {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            {expanded ? "Collapse" : "Tactical Brief"}
          </button>
          {canCancel && (
            <button 
              onClick={handleCancel} 
              disabled={cancelling}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 hover:bg-red-500 hover:text-white text-red-600 text-[10px] font-black uppercase tracking-[0.15em] transition-all disabled:opacity-50 active:scale-95"
            >
              <X size={16}/> {cancelling ? "Aborting…" : "Abort Mission"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CampsPage() {
  const [camps, setCamps]               = useState([]);
  const [myRegs, setMyRegs]             = useState([]);
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab]                   = useState("browse");
  const [regFilter, setRegFilter]       = useState("all");
  const [selectedCamp, setSelectedCamp]       = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loading, setLoading]           = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:5000/api/camps"),
      API.get("/camps/my"),
    ])
      .then(([c, m]) => { 
        setCamps(c.data); 
        setMyRegs(m.data || []); 
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = (regId) => {
    setMyRegs(prev => prev.map(r => r._id === regId ? { ...r, status: "cancelled" } : r));
  };

  const cities = ["All Cities", ...new Set(camps.map(c => c.location?.city).filter(Boolean))];

  const filteredCamps = camps.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCity   = selectedCity === "All Cities" || c.location?.city === selectedCity;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchCity && matchStatus;
  });

  const regCounts = {
    all:        myRegs.length,
    registered: myRegs.filter(r => r.status === "registered").length,
    attended:   myRegs.filter(r => r.status === "attended").length,
    cancelled:  myRegs.filter(r => r.status === "cancelled").length,
  };

  const filteredRegs = [...myRegs]
    .filter(r => regFilter === "all" || r.status === regFilter)
    .sort((a, b) => {
      const order = { registered: 0, attended: 1, cancelled: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  return (
    <div className="min-h-screen bg-white">

      {/* Refined Clinical Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
                  <Activity size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">BloodConnect Ecosystem</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                Blood Donation <span className="text-red-600 italic">Camps</span>
              </h1>
              <p className="text-slate-500 text-base font-medium leading-relaxed">
                Explore a network of verified donation centers across your region. 
                Register for scheduled deployments and track your contribution to the emergency grid.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "Active Centers", val: camps.filter(c => c.status !== "completed").length, color: "text-emerald-600 bg-emerald-50" },
                { label: "Regional Hubs", val: cities.length - 1, color: "text-blue-600 bg-blue-50" },
                { label: "Your Registrations", val: myRegs.length, color: "text-red-600 bg-red-50" },
              ].map((s) => (
                <div key={s.label} className={`px-6 py-3 rounded-2xl border border-white shadow-sm flex flex-col ${s.color}`}>
                  <span className="text-2xl font-black italic leading-none mb-1">{s.val}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interface Area */}
      <div className="max-w-7xl mx-auto px-6 pt-10 relative z-20 pb-24">
        
        {/* Navigation Interface - Refined */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {[
              { key: "browse", icon: <LayoutGrid size={16}/>, label: "Global Grid" },
              { key: "mine",   icon: <ListChecks size={16}/>, label: "Mission Log", badge: regCounts.registered },
            ].map(t => (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  tab === t.key ? "text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === t.key && (
                  <motion.div 
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-slate-900"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t.icon}</span>
                <span className="relative z-10">{t.label}</span>
                {t.badge > 0 && (
                  <span className={`relative z-10 text-[9px] px-2 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-red-50 text-red-600 border border-red-100"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "browse" && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-wrap items-center gap-3 w-full md:w-auto"
              >
                <div className="relative flex-1 md:w-80 group">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search regional centers…"
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-sm"
                  />
                </div>
                
                <div className="flex gap-3">
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={selectedCity} 
                      onChange={e => setSelectedCity(e.target.value)}
                      className="bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-10 text-xs font-black uppercase tracking-wider text-slate-700 appearance-none focus:outline-none focus:border-red-500 cursor-pointer shadow-sm min-w-[160px]"
                    >
                      {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-10 text-xs font-black uppercase tracking-wider text-slate-700 appearance-none focus:outline-none focus:border-red-500 cursor-pointer shadow-sm min-w-[160px]"
                    >
                      <option value="all">Status: All</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === "browse" ? (
            <motion.div 
              key="browse-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {filteredCamps.some(c => {
                const diff = Math.ceil((new Date(c.startDate) - new Date()) / 86400000);
                return diff >= 0 && diff <= 3 && c.status !== "completed";
              }) && (
                <motion.div 
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl mb-8 text-[11px] text-rose-700 font-bold italic"
                >
                  <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center animate-pulse">
                    <Flame size={14} className="text-rose-600" />
                  </div>
                  System Alert: Immediate deployment required for high-priority centers soon.
                </motion.div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-20">
                  <div className="w-16 h-16 border-8 border-slate-100 border-t-red-600 rounded-full animate-spin mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">Synchronizing Grid...</p>
                </div>
              ) : filteredCamps.length === 0 ? (
                <div className="flex flex-col items-center py-32 gap-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
                    <Tent size={40} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 font-black text-xl italic uppercase tracking-tighter">No Active Nodes Detected</p>
                    <p className="text-slate-400 text-sm font-medium mt-1">Adjust search parameters to sync with broader grid.</p>
                  </div>
                  <button 
                    onClick={() => { setSearchQuery(""); setSelectedCity("All Cities"); setStatusFilter("all"); }}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-red-500 hover:border-red-200 transition-all active:scale-95"
                  >
                    Reset Visuals
                  </button>
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence>
                    {filteredCamps.map(camp => (
                      <CampCard 
                        key={camp._id} 
                        camp={camp}
                        onRegister={c => setSelectedCamp(c)}
                        onDetails={c => setSelectedDetails(c)} 
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="mine-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { key:"all",        label:"Fleet Total",  color: "from-slate-800 to-slate-950", icon:<ListChecks size={22}/> },
                  { key:"registered", label:"Deployment",   color: "from-blue-600 to-blue-800",  icon:<Calendar size={22}/>   },
                  { key:"attended",   label:"Secured",      color: "from-emerald-600 to-emerald-800", icon:<CheckCircle2 size={22}/> },
                  { key:"cancelled",  label:"Aborted",      color: "from-rose-600 to-rose-800",   icon:<XCircle size={22}/>    },
                ].map(s => (
                  <button 
                    key={s.key} 
                    onClick={() => setRegFilter(s.key)}
                    className={`relative overflow-hidden bg-gradient-to-br ${s.color} text-white rounded-[1.5rem] p-6 shadow-lg text-left transition-all duration-300 active:scale-95 group ${
                      regFilter === s.key ? "ring-4 ring-red-500/20 shadow-red-500/10" : ""
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all" />
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                        {s.icon}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 italic">{s.label}</span>
                    </div>
                    <p className="text-3xl font-black italic tracking-tighter">{regCounts[s.key]}</p>
                    {regFilter === s.key && (
                      <motion.div 
                        layoutId="active-dot"
                        className="absolute bottom-6 right-6 w-3 h-3 bg-white rounded-full animate-pulse"
                      />
                    )}
                  </button>
                ))}
              </div>

              {filteredRegs.length === 0 ? (
                <div className="flex flex-col items-center py-32 gap-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                    <Info size={40} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 font-black text-xl italic uppercase tracking-tighter">No Archive Found</p>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                      {regFilter === "all" ? "Awaiting your first deployment authorization." : `No records found for ${regFilter} missions.`}
                    </p>
                  </div>
                  {regFilter === "all" && (
                    <button 
                      onClick={() => setTab("browse")}
                      className="px-10 py-4 bg-red-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-900/20"
                    >
                      Authorize First Mission →
                    </button>
                  )}
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence>
                    {filteredRegs.map(reg => (
                      <MyRegCard key={reg._id} reg={reg} onCancel={handleCancel} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals with Higher Z-Index */}
      <AnimatePresence>
        {selectedCamp && (
          <CampRegisterModal 
            camp={selectedCamp} 
            onClose={() => { 
              setSelectedCamp(null); 
              fetchData(); 
            }} 
          />
        )}
        {selectedDetails && (
          <CampDetailsModal 
            camp={selectedDetails} 
            onClose={() => setSelectedDetails(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
