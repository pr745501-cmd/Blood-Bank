import { MapPin, Calendar, Clock, X, ShieldCheck, Zap, Building2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function CampDetailsModal({ camp, onClose }) {
  // ✅ Safety (prevents unwanted render)
  if (!camp) return null;
  if (typeof document === "undefined") return null;

  // ✅ ESC key close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="bg-slate-900 p-10 relative shrink-0 overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 blur-[60px] rounded-full" />
          
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all z-20"
          >
            <X size={20} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Mission Specifications
              </span>
            </div>

            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight">
              {camp.title}
            </h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar bg-[#FDFDFD]">
          
          {/* ABOUT */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-red-600 fill-red-600" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Event Briefing
              </h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium text-sm border-l-2 border-red-100 pl-6">
              {camp.description || "System overview: This mission is focused on direct blood donation to replenish regional reserves."}
            </p>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem 
              icon={<MapPin size={18}/>} 
              label="Deployment Sector" 
              value={camp.location?.city} 
            />
            <DetailItem 
              icon={<Calendar size={18}/>} 
              label="Deployment Date" 
              value={new Date(camp.startDate).toDateString()} 
            />
            <DetailItem 
              icon={<Clock size={18}/>} 
              label="Active Hours" 
              value={camp.time} 
            />
            <DetailItem 
              icon={<Building2 size={18}/>} 
              label="Mission Organizer" 
              value={camp.organizer || "Health Department"} 
            />
          </div>

          {/* BUTTON */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-red-600 text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 hover:shadow-red-200 active:scale-[0.98]"
            >
              Acknowledged
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

// Sub-component
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-slate-100 p-5 rounded-3xl hover:border-red-100 transition-colors shadow-sm">
      <div className="bg-slate-50 p-3 rounded-xl text-red-600">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="font-bold text-slate-900 text-sm">
          {value}
        </p>
      </div>
    </div>
  );
}