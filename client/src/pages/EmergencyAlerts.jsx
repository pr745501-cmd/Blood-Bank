import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Phone, MapPin, Clock,
  Navigation, Activity, Zap, Bell,
  ShieldCheck, Heart, Droplets, Users,
  CheckCircle2, XCircle, Filter, Search,
  ChevronDown, Radio, Siren, Share2,
  Info, Sparkles, Flame, HeartPulse,
  ArrowRight, ShieldAlert, X, CheckSquare,
  Square, BookOpen, Thermometer, Utensils,
  BedDouble, Car, FileText, AlertCircle
} from "lucide-react";
import API from "../services/api.jsx";

// ── Preparedness Kit Modal ──
const KIT_SECTIONS = [
  {
    title: "Before You Leave",
    icon: Car,
    color: "rose",
    steps: [
      { id: "hydrate", label: "Drink at least 500ml of water", detail: "Proper hydration prevents dizziness and speeds recovery after donation." },
      { id: "eat", label: "Eat a light iron-rich meal", detail: "Avoid fatty foods. Opt for spinach, lentils, or eggs 2–3 hours before." },
      { id: "sleep", label: "Ensure 6+ hours of sleep", detail: "Fatigue can disqualify you on arrival. Rest is critical." },
      { id: "id", label: "Carry your digital donor ID", detail: "Open the app and screenshot your profile for fast-track intake." },
    ]
  },
  {
    title: "Health Self-Screen",
    icon: Thermometer,
    color: "amber",
    steps: [
      { id: "fever", label: "No fever in the last 24 hours", detail: "Temperature above 37.5°C disqualifies you temporarily." },
      { id: "meds", label: "Not on blood thinners or antibiotics", detail: "Inform staff of any medications. Some require a 48h wait." },
      { id: "tattoo", label: "No tattoo/piercing in last 6 months", detail: "Recent skin procedures require a deferral period." },
      { id: "travel", label: "No travel to malaria zones recently", detail: "International travel may require a 28-day deferral." },
    ]
  },
  {
    title: "At the Donation Center",
    icon: FileText,
    color: "indigo",
    steps: [
      { id: "register", label: "Show digital ID at rapid intake desk", detail: "Skip the queue — emergency donors get priority processing." },
      { id: "form", label: "Complete the health questionnaire honestly", detail: "Accurate answers protect both you and the recipient." },
      { id: "relax", label: "Stay calm and breathe normally during donation", detail: "The process takes 8–10 minutes. Tensing muscles slows flow." },
      { id: "rest", label: "Rest for 15 minutes post-donation", detail: "Do not rush out. Eat the provided snack and drink juice." },
    ]
  },
  {
    title: "After Donation",
    icon: BedDouble,
    color: "emerald",
    steps: [
      { id: "fluids", label: "Drink extra fluids for 24 hours", detail: "Avoid alcohol for at least 24 hours after donating." },
      { id: "activity", label: "Avoid heavy exercise for 12 hours", detail: "Light walking is fine. No gym, running, or heavy lifting." },
      { id: "bandage", label: "Keep the bandage on for 4–5 hours", detail: "Removing it early can cause bruising at the puncture site." },
      { id: "monitor", label: "Monitor for dizziness or nausea", detail: "If you feel unwell, sit or lie down and call the center." },
    ]
  }
];

const COLOR_MAP = {
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100",    check: "text-rose-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-100",   check: "text-amber-500" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-100",  check: "text-indigo-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", check: "text-emerald-500" },
};

function PrepKitModal({ onClose }) {
  const allIds = KIT_SECTIONS.flatMap(s => s.steps.map(st => st.id));
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("prepKit") || "[]"); } catch { return []; }
  });
  const [expandedStep, setExpandedStep] = useState(null);

  const toggle = (id) => {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("prepKit", JSON.stringify(next));
      return next;
    });
  };

  const progress = Math.round((checked.length / allIds.length) * 100);
  const isReady = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Full Preparedness Kit</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency Donor Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Readiness Score</span>
            <span className={`text-sm font-black ${isReady ? 'text-emerald-600' : 'text-slate-900'}`}>{progress}%</span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", damping: 20 }}
              className={`h-full rounded-full ${isReady ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
          </div>
          {isReady && (
            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-1">
              <CheckCircle2 size={12} /> You are fully prepared to respond
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">
          {KIT_SECTIONS.map((section) => {
            const c = COLOR_MAP[section.color];
            return (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
                    <section.icon size={16} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{section.title}</h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    {section.steps.filter(s => checked.includes(s.id)).length}/{section.steps.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {section.steps.map((step) => {
                    const done = checked.includes(step.id);
                    const open = expandedStep === step.id;
                    return (
                      <div key={step.id} className={`rounded-2xl border transition-all ${done ? `${c.bg} ${c.border}` : 'bg-slate-50 border-slate-100'}`}>
                        <button
                          className="w-full flex items-center gap-4 p-4 text-left"
                          onClick={() => setExpandedStep(open ? null : step.id)}
                        >
                          <button
                            onClick={e => { e.stopPropagation(); toggle(step.id); }}
                            className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${done ? c.text : 'text-slate-300'}`}
                          >
                            {done ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>
                          <span className={`flex-1 text-sm font-bold ${done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {step.label}
                          </span>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="px-14 pb-4 text-xs text-slate-500 leading-relaxed font-medium">{step.detail}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-8 py-6 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95
              ${isReady
                ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200'
                : 'bg-slate-900 text-white shadow-xl shadow-slate-200'
              }`}
          >
            {isReady ? "✓ Ready to Respond — Close" : `Complete Checklist (${allIds.length - checked.length} remaining)`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const URGENCY_CONFIG = {
  Critical: {
    bar: "bg-rose-600",
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    glow: "shadow-rose-100",
    icon: <Siren size={20} className="animate-pulse" />,
    label: "Critical Response Required"
  },
  Urgent: {
    bar: "bg-amber-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    glow: "shadow-amber-100",
    icon: <Flame size={20} />,
    label: "Urgent Need"
  },
  Normal: {
    bar: "bg-indigo-500",
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    glow: "shadow-indigo-100",
    icon: <Activity size={20} />,
    label: "Routine Request"
  },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all"); 
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [showPrepKit, setShowPrepKit] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const matchedCount = alerts.filter(a => a.bloodGroup === user.bloodGroup).length;
  const criticalCount = alerts.filter(a => a.urgency === "Critical").length;
  const respondedCount = alerts.filter(a => a.hasResponded).length;

  useEffect(() => {
    fetchAlerts();
    const socket = io("http://localhost:5000");

    socket.on("newAlert", (alert) => {
      alert.hasResponded = false;
      setAlerts(prev => [alert, ...prev]);
      setToast(alert);
      setTimeout(() => setToast(null), 8000);
    });

    socket.on("alertResolved", (id) => {
      setAlerts(prev => prev.filter(a => a._id !== id));
    });

    return () => socket.disconnect();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await API.get("/alerts");
      setAlerts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRespond = async (alertId) => {
    try {
      setLoadingId(alertId);
      await API.post(`/alerts/respond/${alertId}`, {});
      fetchAlerts();
    } catch { /* error */ }
    setLoadingId(null);
  };

  const handleDirections = (loc) =>
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, "_blank");

  const visible = alerts.filter(a => {
    if (filter === "matched" && a.bloodGroup !== user.bloodGroup) return false;
    if (filter === "critical" && a.urgency !== "Critical") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.hospital?.toLowerCase().includes(q) ||
        a.bloodGroup?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      
      {/* ── Dynamic Hero Section ── */}
      <section className="relative rounded-[3rem] bg-slate-900 overflow-hidden text-white p-10 lg:p-16">
         {/* Background elements */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-600/20 to-transparent pointer-events-none" />
         <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
         
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Radio size={10} /> Live
                  </div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{alerts.length} Active Emergencies</span>
               </div>
               
               <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
                  Rapid <br /> <span className="text-rose-500">Response</span>
               </h1>
               
               <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                 Real-time life-saving alerts verified by the central health network. Your immediate action can bridge the gap in critical care.
               </p>

               <div className="flex flex-wrap gap-3 pt-4">
                  <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center min-w-[120px]">
                     <span className="text-2xl font-black text-rose-500">{matchedCount}</span>
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Matched</span>
                  </div>
                  <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center min-w-[120px]">
                     <span className="text-2xl font-black text-amber-500">{criticalCount}</span>
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Critical</span>
                  </div>
                  <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center min-w-[120px]">
                     <span className="text-2xl font-black text-emerald-500">{respondedCount}</span>
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Responded</span>
                  </div>
               </div>
            </div>

            <div className="hidden lg:block relative">
               <div className="absolute inset-0 bg-rose-500 blur-[100px] opacity-20" />
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="relative p-8 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 space-y-6 shadow-2xl"
               >
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-900/40">
                           <Heart size={24} fill="currentColor" />
                        </div>
                        <span className="text-lg font-black tracking-tight">Personal Impact</span>
                     </div>
                     <Sparkles size={20} className="text-amber-400" />
                  </div>
                  <div className="space-y-4">
                     <p className="text-sm text-slate-400 italic">"The donor community has already filled 42 urgent units this week. Your contributions are vital."</p>
                     <div className="flex -space-x-3">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 88}`} alt="avatar" />
                          </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-4 border-slate-900 bg-rose-500 flex items-center justify-center text-[10px] font-black">+2k</div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* ── Filters & Search ── */}
      <section className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm flex flex-col lg:flex-row items-center gap-6">
         <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Broad Alerts" },
              { id: "matched", label: "Matched For Me" },
              { id: "critical", label: "High Urgency" }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${filter === f.id ? 'bg-white text-slate-900 shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f.label}
              </button>
            ))}
         </div>

         <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by Hospital, Area or Blood Group..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-rose-200 focus:outline-none transition-all"
            />
         </div>
      </section>

      {/* ── Alert Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
               {visible.length === 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-100 rounded-[3rem] p-24 text-center">
                    <ShieldAlert size={60} className="mx-auto text-slate-100 mb-6" />
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Active Threats</h3>
                    <p className="text-sm text-slate-300 font-medium mt-2">All networks are currently stable. We will notify you when a match arrives.</p>
                 </motion.div>
               ) : visible.map((alert) => {
                 const cfg = URGENCY_CONFIG[alert.urgency] || URGENCY_CONFIG.Normal;
                 const isMatch = alert.bloodGroup === user.bloodGroup;
                 const isExpanded = expanded === alert._id;
                 const respCount = alert.responses?.length || 0;

                 return (
                   <motion.div 
                     key={alert._id}
                     layout
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className={`group relative bg-white border rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isMatch ? 'border-rose-100 shadow-xl shadow-rose-100/20' : 'border-slate-100 shadow-sm'}`}
                   >
                     {/* Left indicator bar */}
                     <div className={`absolute left-0 top-0 bottom-0 w-2 ${cfg.bar}`} />
                     
                     <div className="p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                           {/* Icon Wrapper */}
                           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${cfg.bg} ${cfg.text}`}>
                              {cfg.icon}
                           </div>

                           {/* Content */}
                           <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight truncate">{alert.hospital}</h3>
                                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                                   {alert.urgency}
                                 </span>
                                 {isMatch && (
                                   <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                      <Zap size={10} fill="currentColor" /> Match
                                   </div>
                                 )}
                              </div>

                              <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-400 font-bold uppercase tracking-wider mb-5">
                                 <div className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-500" /> {alert.location}</div>
                                 <div className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-400" /> {timeAgo(alert.createdAt)}</div>
                                 <div className="flex items-center gap-1.5"><Users size={14} className="text-amber-400" /> {respCount} Responses</div>
                              </div>

                              <div className="flex items-center gap-3">
                                 <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border ${isMatch ? 'bg-rose-600 text-white border-transparent shadow-lg shadow-rose-200' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}>
                                    <Droplets size={16} fill={isMatch ? "white" : "currentColor"} /> {alert.bloodGroup}
                                 </div>
                                 <div className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-black text-slate-600 border border-slate-100">
                                    {alert.units} Units
                                 </div>
                              </div>
                           </div>

                           {/* Actions */}
                           <div className="flex items-center gap-2 self-stretch md:self-center">
                              <button 
                                onClick={() => handleDirections(alert.location)}
                                className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                              >
                                 <Navigation size={22} />
                              </button>
                              <button 
                                onClick={() => handleRespond(alert._id)}
                                disabled={alert.hasResponded || loadingId === alert._id}
                                className={`flex-1 md:flex-none h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50
                                  ${alert.hasResponded ? 'bg-emerald-50 text-emerald-600 shadow-none border border-emerald-100' : 'bg-slate-900 text-white shadow-slate-200'}
                                `}
                              >
                                {loadingId === alert._id ? <Activity size={20} className="animate-spin" /> : alert.hasResponded ? 'Committed' : 'Respond Ahora'}
                              </button>
                              <button 
                                onClick={() => setExpanded(isExpanded ? null : alert._id)}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}
                              >
                                 <ChevronDown size={22} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                           </div>
                        </div>

                        {/* Collapsible Detail */}
                        <AnimatePresence>
                           {isExpanded && (
                             <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="overflow-hidden"
                             >
                                <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-4">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Context</p>
                                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {alert.description || "The medical team requiring this blood has specified it for an immediate surgical procedure. Verified by central emergency routing."}
                                      </p>
                                   </div>
                                   <div className="space-y-6">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource Fulfillment</p>
                                      <div className="space-y-3">
                                         <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-slate-500">{respCount} / {Math.max(alert.units * 3, 10)} Potential Donors</span>
                                            <span className="text-lg font-black text-slate-900">{Math.round((respCount/(alert.units * 3))*100) || 0}%</span>
                                         </div>
                                         <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${Math.min((respCount/(alert.units * 3))*100, 100) || 5}%` }}
                                              className={`h-full rounded-full ${cfg.bar}`}
                                            />
                                         </div>
                                         <p className="text-[10px] text-slate-400 italic">Expected time to fulfillment: <span className="font-bold">45 mins</span></p>
                                      </div>
                                   </div>
                                </div>
                             </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                   </motion.div>
                 );
               })}
            </AnimatePresence>
         </div>

         {/* RIGHT COLUMN: GUIDELINES & CONTEXT */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                     <HeartPulse size={24} />
                  </div>
                  <div>
                     <h4 className="text-lg font-black text-slate-900">Donor Safety</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Emergency Protocols</p>
                  </div>
               </div>

               <div className="space-y-6">
                  {[
                    { title: "Rapid Intake", desc: "Show your digital ID for fast-track processing.", icon: ShieldCheck, col: "emerald" },
                    { title: "Hydration Focus", desc: "Drink 500ml water before responding.", icon: Droplets, col: "indigo" },
                    { title: "Health Screen", desc: "Self-check for fevers or fatigue before travel.", icon: Info, col: "amber" },
                  ].map((guide, i) => (
                    <div key={i} className="flex items-start gap-4">
                       <div className={`mt-1 p-2 bg-${guide.col}-50 text-${guide.col}-600 rounded-lg`}>
                          <guide.icon size={16} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{guide.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{guide.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <button onClick={() => setShowPrepKit(true)} className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                  Full Preparedness Kit <ArrowRight size={14} className="inline ml-1" />
               </button>
            </div>

            {/* IMPACT STORY CARD */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Heart size={120} fill="white" />
               </div>
               <div className="relative z-10">
                  <h4 className="text-2xl font-black tracking-tight mb-6">Seconds <br /> Matter.</h4>
                  <p className="text-sm text-rose-100/80 leading-relaxed mb-10 font-medium">
                    "I was on my way home when I saw a Critical match. 30 mins later, I was giving. It felt amazing to know someone's crisis was solved by me."
                  </p>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">PK</div>
                     <div>
                        <p className="text-xs font-black">Pankaj Katal</p>
                        <p className="text-[10px] text-rose-200 uppercase font-bold tracking-widest">A+ Verified Donor</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ── Preparedness Kit Modal ── */}
      <AnimatePresence>
        {showPrepKit && <PrepKitModal onClose={() => setShowPrepKit(false)} />}
      </AnimatePresence>

      {/* ── Live Toast Feedback ── */}
      <AnimatePresence>
         {toast && (
           <motion.div 
             initial={{ opacity: 0, y: 100, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9, y: 100 }}
             className="fixed bottom-10 right-10 z-[100] w-full max-w-sm"
           >
              <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-5">
                 <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-900/40 shrink-0">
                    <Siren size={24} className="animate-bounce" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5">New Active Emergency</p>
                    <p className="text-lg font-black tracking-tight truncate leading-none">{toast.hospital}</p>
                    <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-wider">Type {toast.bloodGroup} Needed</p>
                 </div>
                 <button onClick={() => setToast(null)} className="text-slate-600 hover:text-white transition-colors">
                    <XCircle size={24} />
                 </button>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
