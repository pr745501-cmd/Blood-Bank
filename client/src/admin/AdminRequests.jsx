import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Trash2, Mail, Phone, Calendar, MessageSquare, 
  CheckCircle2, Clock, ChevronLeft, ChevronRight, 
  Search, Filter, Inbox, ArrowUpRight, User, Hash
} from "lucide-react";

function AdminRequests() {
  const [queries, setQueries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHovered, setIsHovered] = useState(null);
  const perPage = 5;

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/admin/queries", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setQueries(res.data);
  };

  const deleteQuery = async (id) => {
    if (!window.confirm("CRITICAL: Deleting this communication will wipe it from the medical archive. Proceed?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/admin/query/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchQueries();
  };

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = queries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(queries.length / perPage);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* ─── TERMINAL DASHBOARD HEADER ─── */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 shadow-2xl">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-900/40">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Query Intelligence</h2>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Inbound Active
              </span>
              <span className="h-4 w-[1px] bg-slate-700"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{queries.length} Total Logs</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search encrypted logs..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-sm font-bold focus:ring-4 focus:ring-red-500/20 focus:border-red-500/50 transition-all outline-none placeholder:text-slate-600"
              />
            </div>
            <button className="p-4 bg-slate-800 border border-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── DATA GRID ─── */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Index</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Origin/Sender</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Dispatch Content</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Timestamp</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Action</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {currentData.map((q, index) => (
                <tr 
                  key={q._id} 
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                  className="group hover:bg-slate-50/80 transition-all duration-500"
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <Hash size={14} className="text-slate-200 group-hover:text-red-500 transition-colors" />
                      <span className="text-sm font-black text-slate-300">{(indexOfFirst + index + 1).toString().padStart(2, '0')}</span>
                    </div>
                  </td>

                  <td className="px-10 py-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:border-red-200 group-hover:text-red-600 transition-all shadow-sm">
                          <User size={18} />
                        </div>
                        <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{q.name}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 pl-1">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Mail size={12} className="text-slate-300" /> {q.email}
                        </span>
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Phone size={12} className="text-slate-300" /> {q.mobile}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-10 py-8 max-w-lg">
                    <div className={`relative p-6 rounded-[2rem] border transition-all duration-500 ${
                      isHovered === index 
                      ? "bg-white border-red-100 shadow-xl shadow-red-500/5 translate-x-2" 
                      : "bg-slate-50/50 border-slate-100"
                    }`}>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed italic pr-4">
                        "{q.message}"
                      </p>
                      <ArrowUpRight className={`absolute top-4 right-4 text-red-500 transition-all duration-500 ${isHovered === index ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} size={16} />
                    </div>
                  </td>

                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full w-fit border border-amber-100 shadow-sm shadow-amber-100/50">
                        <Clock size={12} strokeWidth={3} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Pending Review</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-tighter px-1">
                        <Calendar size={12} />
                        {new Date(q.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </td>

                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <button className="flex-1 p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-2xl transition-all active:scale-95 shadow-sm">
                        <CheckCircle2 size={20} />
                      </button>
                      <button
                        onClick={() => deleteQuery(q._id)}
                        className="flex-1 p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-2xl transition-all active:scale-95 shadow-sm"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── ELITE FOOTER ─── */}
        <div className="bg-slate-50/80 px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Navigation Protocol</p>
              <p className="text-sm font-black text-slate-800 italic">Page {currentPage} of {totalPages}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-[1.25rem] hover:text-red-600 hover:border-red-500 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`min-w-[56px] h-14 rounded-[1.25rem] text-sm font-black transition-all ${
                    currentPage === i + 1 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40 translate-y-[-2px]" 
                    : "bg-white text-slate-400 border border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-[1.25rem] hover:text-red-600 hover:border-red-500 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRequests;