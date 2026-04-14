import { motion } from "framer-motion";
import { 
  MapPin, CalendarDays, Clock, Users, ArrowRight, 
  Droplets, Flame, AlertTriangle, ShieldCheck, Target 
} from "lucide-react";

const STATUS_COLORS = {
  upcoming:  { pill: "bg-amber-50 text-amber-700 border-amber-100",  dot: "bg-amber-400" },
  ongoing:   { pill: "bg-emerald-50 text-emerald-700 border-emerald-100",  dot: "bg-emerald-500" },
  completed: { pill: "bg-slate-100 text-slate-500 border-slate-200",  dot: "bg-slate-400" },
};

const PROGRESS_COLOR = (p) => {
  if (p >= 90) return "bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]";
  if (p >= 60) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
  return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
};

function TacticalCountdown({ startDate }) {
  if (!startDate) return null;
  const diff = Math.ceil((new Date(startDate) - new Date()) / 86400000);
  if (diff < 0) return null;
  
  const baseClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border whitespace-nowrap";
  
  if (diff === 0) return (
    <span className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse`}>
      <Target size={10} className="animate-spin" /> Deployment: Active
    </span>
  );
  if (diff <= 3) return (
    <span className={`${baseClass} bg-rose-50 text-rose-600 border-rose-100`}>
      <Flame size={10}/> Priority: {diff}d
    </span>
  );
  if (diff <= 7) return (
    <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-100`}>
      <Clock size={10}/> Imminent: {diff}d
    </span>
  );
  return (
    <span className={`${baseClass} bg-slate-50 text-slate-500 border-slate-100`}>
      <CalendarDays size={10}/> Window: {diff}d
    </span>
  );
}

export default function CampCard({ camp, disabled = false, onRegister = () => {}, onDetails = () => {} }) {
  const registered = camp?.registeredCount || 0;
  const capacity   = camp?.capacity || 1;
  const percent    = Math.min((registered / capacity) * 100, 100);
  const sc         = STATUS_COLORS[camp?.status] || STATUS_COLORS.upcoming;
  const full       = percent >= 100;
  const urgent     = percent >= 80 && !full;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all duration-500 overflow-hidden flex flex-col"
    >
      {/* Top Banner Status */}
      <div className="absolute top-4 right-4 z-10">
        <TacticalCountdown startDate={camp?.startDate} />
      </div>

      <div className="p-6 flex flex-col flex-1">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors duration-500 shadow-lg shadow-slate-200 group-hover:shadow-red-200">
            <Droplets size={20} className="text-red-500 group-hover:text-white transition-colors duration-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${sc.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${camp?.status === "ongoing" ? "animate-ping" : ""}`} />
                {camp?.status || "upcoming"}
              </span>
              {full && <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100">Capacity Reached</span>}
            </div>
            <h2 className="font-black text-slate-900 text-xl leading-tight group-hover:text-red-600 transition-colors duration-300 truncate italic italic uppercase tracking-tighter">
              {camp?.title}
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed h-[2.5rem]">
          {camp?.description || "Strategic blood acquisition mission to fortify regional reserves and ensure medical readiness."}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational Sector</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapPin size={14} className="text-red-500" />
              <span className="truncate italic">{camp?.location?.city || "—"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Frequency</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 justify-end">
              <Clock size={14} className="text-red-500" />
              <span className="italic">{camp?.time || "—"}</span>
            </div>
          </div>
        </div>

        {/* Capacity Visualization */}
        <div className="mt-auto mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-red-100 transition-all duration-500">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                <Users size={12} className="text-white" />
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                {registered} / {capacity} <span className="text-slate-400 italic font-medium ml-1">Reg.</span>
              </span>
            </div>
            <span className={`font-black italic text-sm ${percent >= 80 ? "text-rose-600" : "text-emerald-600"}`}>
              {Math.round(percent)}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full transition-all duration-700 ${PROGRESS_COLOR(percent)}`} 
            />
          </div>
          {urgent && (
            <div className="flex items-center gap-1.5 mt-3 text-[10px] font-black text-amber-600 uppercase tracking-tight animate-pulse">
              <AlertTriangle size={12}/> Critical: Efficiency exceeding 80%
            </div>
          )}
        </div>

        {/* Tactical Actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => onDetails?.(camp)}
            className="flex-1 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ShieldCheck size={16}/> Briefing
          </button>
          <button
            disabled={disabled || full || camp?.status === "completed"}
            onClick={() => onRegister?.(camp)}
            className={`flex-[1.5] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl ${
              disabled || full || camp?.status === "completed"
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20"
            }`}
          >
            {full || camp?.status === "completed" ? (
              "Node Locked"
            ) : (
              <><span>Authorize</span><ArrowRight size={16}/></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
