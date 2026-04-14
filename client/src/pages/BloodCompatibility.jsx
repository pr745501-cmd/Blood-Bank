import { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  Droplet, 
  ArrowRightLeft, 
  Activity,
  Target,
  MessageCircle,
  ShieldCheck,
  Zap,
  Microscope,
  Database
} from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const compatibilityMatrix = {
  "A+": { canDonateTo: ["A+", "AB+"], canReceiveFrom: ["A+", "A-", "O+", "O-"] },
  "A-": { canDonateTo: ["A+", "A-", "AB+", "AB-"], canReceiveFrom: ["A-", "O-"] },
  "B+": { canDonateTo: ["B+", "AB+"], canReceiveFrom: ["B+", "B-", "O+", "O-"] },
  "B-": { canDonateTo: ["B+", "B-", "AB+", "AB-"], canReceiveFrom: ["B-", "O-"] },
  "AB+": { canDonateTo: ["AB+"], canReceiveFrom: bloodGroups },
  "AB-": { canDonateTo: ["AB+", "AB-"], canReceiveFrom: ["A-", "B-", "AB-", "O-"] },
  "O+": { canDonateTo: ["A+", "B+", "AB+", "O+"], canReceiveFrom: ["O+", "O-"] },
  "O-": { canDonateTo: bloodGroups, canReceiveFrom: ["O-"] },
};

function BloodCompatibility() {
  const [selected, setSelected] = useState("O+");
  const data = compatibilityMatrix[selected];

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans selection:bg-red-100 overflow-x-hidden">
      
      {/* ANIMATION ENGINE */}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 1.2s ease forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>

      {/* 1. ARCHIVE STYLE HEADER */}
      <div className="relative h-72 md:h-96 bg-[#881337] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-6 pt-20 relative z-10">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-red-400" size={20} />
              <span className="text-red-300 font-black tracking-[0.4em] text-[10px] uppercase">Centralized Hematology Matrix</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl flex items-center gap-5">
              Compatibility <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Checker</span>
            </h1>
            <p className="text-red-100/70 text-lg font-medium mt-4 max-w-2xl border-l-2 border-red-500/30 pl-6">
              Cross-reference biological markers and Rh factors to verify safe transfusion protocols and donor-recipient eligibility.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 md:-mt-28 relative z-20 pb-24">
        
        {/* SELECTOR PANEL */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-slate-200 p-6 md:p-10 mb-10 animate-slide-up delay-100 opacity-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-rose-900 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3">
                <Droplet size={32} fill="currentColor"/>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Target Phenotype</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Biological Record Analysis</p>
              </div>
            </div>
            
            <div className="relative w-full md:w-80 group">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-3xl p-6 font-black text-xl text-slate-900 focus:bg-white focus:border-red-600 outline-none transition-all shadow-inner appearance-none cursor-pointer"
              >
                {bloodGroups.map((g) => <option key={g} value={g}>{g} Blood Type</option>)}
              </select>
              <Zap className="absolute right-6 top-1/2 -translate-y-1/2 text-red-600" size={20} />
            </div>
          </div>
        </div>

        {/* RESULTS GRID (HIGH CONTRAST) */}
        <div className="grid md:grid-cols-2 gap-10 mb-16 animate-slide-up delay-200 opacity-0">
          <ResultCard title="Safe Donation Matrix" icon={<Target size={22}/>} color="emerald" list={data.canDonateTo} subtitle="Outbound Eligibility" />
          <ResultCard title="Safe Receipt Matrix" icon={<MessageCircle size={22}/>} color="blue" list={data.canReceiveFrom} subtitle="Inbound Compatibility" />
        </div>

        {/* CLINICAL MATRIX (IMPROVED VISIBILITY) */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl p-8 md:p-12 mb-16 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
            <Microscope size={250} className="text-slate-900" />
          </div>
          
          <h2 className="text-3xl font-black mb-12 text-slate-900 uppercase tracking-tighter flex items-center gap-4 relative z-10">
            <div className="w-2 h-10 bg-red-600 rounded-full italic"/> Clinical Transfusion Matrix
          </h2>
          
          <div className="overflow-x-auto rounded-[2.5rem] border border-slate-300 bg-white shadow-sm relative z-10">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left p-6 font-black uppercase tracking-widest text-slate-400 text-[10px]">Donor → Recipient</th>
                  {bloodGroups.map((g) => (
                    <th key={g} className="p-6 font-black text-red-400 text-center text-lg">{g}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bloodGroups.map((recipient) => (
                  <tr key={recipient} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6 font-black text-slate-900 bg-slate-100 border-r border-slate-200 text-lg italic">{recipient}</td>
                    {bloodGroups.map((donor) => (
                      <td key={donor} className="text-center p-6 transition-all group-hover:scale-105">
                        {compatibilityMatrix[donor].canDonateTo.includes(recipient) ? 
                          <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-2xl mx-auto shadow-lg shadow-emerald-200">
                            <CheckCircle size={24} className="text-white" /> 
                          </div> : 
                          <div className="flex items-center justify-center w-12 h-12 bg-slate-200 border border-slate-300 rounded-2xl mx-auto">
                            <XCircle size={24} className="text-slate-400" />
                          </div>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DONOR FLOW DIAGRAM */}
        <div className="bg-[#0F172A] rounded-[4rem] shadow-2xl p-10 md:p-16 mb-16 border border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-transparent opacity-50"></div>
          <h2 className="text-2xl font-black mb-12 text-white uppercase tracking-widest flex items-center gap-4 relative z-10">
            <div className="w-2 h-8 bg-blue-500 rounded-full"/> Match Flow Dynamics
          </h2>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10">
            <FlowBox label="Archive Source" value={selected} icon="🩸" color="from-red-500 to-rose-700" />
            <div className="flex flex-col items-center gap-2">
              <ArrowRightLeft className="text-slate-600" size={48} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Link</span>
            </div>
            <FlowBox label="Primary Recipient" value={data.canDonateTo[0]} icon="🎯" color="from-blue-500 to-indigo-700" />
          </div>
        </div>

        {/* BLOOD TYPE INTELLIGENCE CARDS */}
        <div className="bg-white rounded-[4rem] shadow-xl border border-slate-200 p-10 md:p-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-4xl font-black flex items-center gap-4 uppercase tracking-tighter italic">
              <div className="p-4 bg-red-100 rounded-3xl"><ShieldCheck className="text-red-600" size={32}/></div> 
              Hematology Intelligence
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] border-b-2 border-red-600 pb-2">Technical Analysis 2.0</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FactCard title="O Negative" subtitle="Universal Donor" desc="O- can donate red blood cells to any other blood type, making it vital in emergencies." icon="🌍" />
            <FactCard title="AB Positive" subtitle="Universal Recipient" desc="AB+ individuals can safely receive red blood cells from any blood type." icon="🎯" />
            <FactCard title="O Positive" subtitle="Highest Demand" desc="The most common type (37%). It is frequently required for trauma and surgeries." icon="📊" />
            <FactCard title="AB Negative" subtitle="Rare Biological Profile" desc="The rarest blood type, occurring in only 1% of the global population." icon="💎" />
            <FactCard title="Rh Factor" subtitle="Protein Presence" desc="The '+' or '-' indicates the presence of the Rhesus D antigen on your cells." icon="🧬" />
            <FactCard title="Clinical Use" subtitle="Safe Transfusions" desc="Compatibility is critical to prevent dangerous hemolytic transfusion reactions." icon="🔬" />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function ResultCard({ title, subtitle, icon, color, list }) {
  const textColor = color === 'emerald' ? 'text-emerald-700' : 'text-blue-700';
  const bgColor = color === 'emerald' ? 'bg-emerald-600' : 'bg-blue-600';

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.05)] border-2 border-slate-200 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-2 h-full ${bgColor}`}></div>
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{subtitle}</p>
          <h2 className={`text-2xl font-black ${textColor} uppercase tracking-tighter flex items-center gap-3`}>
            {icon} {title}
          </h2>
        </div>
        <div className={`p-3 rounded-2xl ${color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'} border border-current/20`}>
          <ShieldCheck size={20} />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 relative z-10">
        {bloodGroups.map((g) => (
          <Badge key={g} label={g} active={list.includes(g)} color={color} />
        ))}
      </div>
    </div>
  );
}

function Badge({ label, active, color }) {
  const activeStyles = color === 'emerald' 
    ? "bg-emerald-600 border-emerald-700 text-white shadow-lg" 
    : "bg-blue-600 border-blue-700 text-white shadow-lg";
  
  // High-contrast inactive style: No opacity, solid slate gray
  const inactiveStyles = "bg-slate-100 border-slate-300 text-slate-600 opacity-100";

  return (
    <div className={`p-5 rounded-2xl flex flex-col items-center border-2 transition-all duration-300 ${active ? `${activeStyles} scale-105` : inactiveStyles}`}>
      <span className="font-black text-xl mb-1">{label}</span>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${active ? 'bg-white/20' : 'bg-slate-300'}`}>
        {active ? <CheckCircle size={16} className="text-white" /> : <XCircle size={16} className="text-slate-500" />}
      </div>
    </div>
  );
}

function FlowBox({ label, value, icon, color }) {
  return (
    <div className="relative group p-[2px] rounded-[2.5rem] bg-slate-700 overflow-hidden shadow-2xl w-full lg:w-80">
      <div className="bg-[#0F172A] rounded-[2.5rem] p-10 text-center relative z-10">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
          {icon}
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">{label}</h3>
        <p className={`text-6xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent tracking-tighter italic`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function FactCard({ title, subtitle, desc, icon }) {
  return (
    <div className="p-8 rounded-[2.5rem] border-2 border-slate-200 bg-slate-50 hover:border-red-600 hover:bg-white transition-all duration-500 cursor-default">
      <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{title}</h3>
      <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">{subtitle}</p>
      <p className="text-slate-600 font-medium leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

export default BloodCompatibility;