import { useEffect, useState } from "react";
import API from "../services/api";
import { 
  Droplet, 
  MessageCircle, 
  ClipboardList, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Phone, 
  Clock,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Activity
} from "lucide-react";

function MyRequests() {
  const [bloodRequests, setBloodRequests] = useState([]);
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    fetchBloodRequests();
    fetchQueries();
  }, []);

  const fetchBloodRequests = async () => {
    try {
      const res = await API.get("/request/my");
      setBloodRequests(res.data);
    } catch (err) {
      // silently ignore
    }
  };

  const fetchQueries = async () => {
    try {
      const res = await API.get("/contact/my");
      if (res.data.success) {
        setQueries(res.data.queries);
      }
    } catch (err) {
      // silently ignore
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-orange-50 text-orange-600 border-orange-100 ring-4 ring-orange-50/50";
      case "Approved":
        return "bg-blue-50 text-blue-600 border-blue-100 ring-4 ring-blue-50/50";
      case "Assigned":
        return "bg-indigo-50 text-indigo-600 border-indigo-100 ring-4 ring-indigo-50/50";
      case "Completed":
      case "Resolved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 ring-4 ring-emerald-50/50";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-red-100">
      {/* MODERN HERO HEADER */}
      <div className="relative bg-slate-950 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,#450a0a,transparent)] opacity-70"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
                <Activity size={14} className="animate-pulse" /> User Dashboard
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-300">REQUESTS</span>
              </h1>
              <p className="text-slate-400 max-w-md font-medium text-lg leading-relaxed">
                Centralized monitoring for your lifesaving blood requisitions and support tickets.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 relative z-20">
        {/* STATS GRID - NEOMORPHIC STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <StatCard 
            label="Blood Requisitions" 
            count={bloodRequests.length} 
            color="text-red-600" 
            icon={<Droplet size={24} />}
            targetId="blood-section"
            gradient="from-red-50 to-white"
          />
          <StatCard 
            label="Support Tickets" 
            count={queries.length} 
            color="text-blue-600" 
            icon={<MessageCircle size={24} />}
            targetId="query-section"
            gradient="from-blue-50 to-white"
          />
          <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Interactions</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">
              {bloodRequests.length + queries.length}
            </p>
          </div>
        </div>

        {/* BLOOD REQUESTS SECTION */}
        <section id="blood-section" className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-10 w-2 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Active Requisitions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bloodRequests.length > 0 ? (
              bloodRequests.map((req) => (
                <div key={req._id} className="group bg-white rounded-[2.5rem] border border-slate-100 p-2 hover:border-red-100 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]">
                  <div className="bg-slate-50/50 rounded-[2.2rem] p-6 h-full border border-transparent group-hover:bg-white transition-colors">
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform duration-500 border border-slate-50">
                        <Droplet size={28} fill="currentColor" />
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${statusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-red-600 transition-colors tracking-tight">
                      {req.patientName}
                    </h3>

                    <div className="space-y-4 mb-8">
                      <DataRow icon={<Activity size={16}/>} label="Type" value={req.bloodGroup} highlight />
                      <DataRow icon={<Clock size={16}/>} label="Volume" value={`${req.units} Units`} />
                      <DataRow icon={<MapPin size={16}/>} label="Facility" value={req.hospital} />
                      <DataRow icon={<Calendar size={16}/>} label="Deadline" value={req.requiredDate ? new Date(req.requiredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Immediate"} />
                    </div>

                    {req.assignedDonor ? (
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.5rem] p-5 text-white shadow-lg shadow-emerald-200/50">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] opacity-80 mb-3">
                          <UserCheck size={14}/> Donor Secured
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="font-bold text-lg leading-none">{req.assignedDonor.name}</p>
                            <p className="text-xs text-emerald-100 mt-1">{req.assignedDonor.mobile}</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Phone size={16} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 group-hover:text-red-500 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest">Searching Network</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No active requisitions found" />
            )}
          </div>
        </section>

        {/* SUPPORT QUERIES SECTION */}
        <section id="query-section">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-10 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Support Desk</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {queries.length > 0 ? (
              queries.map((q) => (
                <div key={q._id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors"></div>
                  
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                      #{q._id.slice(-6).toUpperCase()}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${statusColor(q.status)}`}>
                      {q.status}
                    </span>
                  </div>

                  <div className="flex-1 relative z-10">
                    <p className="text-slate-600 font-medium leading-relaxed mb-8 text-lg">
                      "{q.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-8 font-bold uppercase tracking-tight">
                    <Calendar size={14} className="text-blue-500"/> Submitted: {new Date(q.createdAt).toLocaleDateString()}
                  </div>

                  {q.adminReply && (
                    <div className="bg-slate-900 rounded-[1.5rem] p-6 relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
                      <ShieldCheck className="absolute -right-4 -bottom-4 opacity-10 text-white" size={80} />
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        Admin Response
                      </p>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed relative z-10">
                        {q.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState message="No support tickets found" />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= ENHANCED HELPER COMPONENTS ================= */

function StatCard({ label, count, color, icon, targetId, gradient }) {
  return (
    <div 
      onClick={() => document.getElementById(targetId).scrollIntoView({ behavior: "smooth" })}
      className={`bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 cursor-pointer hover:translate-y-[-6px] transition-all duration-300 group relative overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
          <div className={`${color} p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors`}>
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className={`text-5xl font-black ${color} tracking-tighter`}>{count}</p>
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-slate-300 group-hover:text-slate-600 transition-all">
            <ChevronRight size={20}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataRow({ icon, label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-sm group/row">
      <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-widest">
        <span className="text-slate-300 group-hover/row:text-red-400 transition-colors">{icon}</span>
        {label}
      </div>
      <div className={`font-black tracking-tight ${highlight ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md' : 'text-slate-700'}`}>
        {value}
      </div>
    </div>
  );
}

function HeartPulse({ size }) {
  return <Droplet size={size} />;
}

function EmptyState({ message }) {
  return (
    <div className="col-span-full py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
        <ClipboardList size={32} className="opacity-20" />
      </div>
      <p className="font-black uppercase tracking-[0.3em] text-[10px]">{message}</p>
    </div>
  );
}

export default MyRequests;