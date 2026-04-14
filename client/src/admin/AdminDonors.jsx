import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Trash2, Search, ChevronLeft, ChevronRight, Filter, 
  User, Phone, Mail, MapPin, Droplet, ShieldCheck, 
  Download, MoreHorizontal, Calendar, Info
} from "lucide-react";

function AdminDonors() {
  const [donors, setDonors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownFilter, setCooldownFilter] = useState("All");
  const donorsPerPage = 7;
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/admin/donors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors(res.data);
    } catch (err) {
      // silently ignore
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const deleteDonor = async (id) => {
    if (!window.confirm("CRITICAL: Permanent removal of donor from archive?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/admin/donor/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDonors();
  };

  const indexOfLast = currentPage * donorsPerPage;
  const indexOfFirst = indexOfLast - donorsPerPage;
  const filteredDonors = cooldownFilter === "All"
    ? donors
    : cooldownFilter === "Eligible"
      ? donors.filter(d => d.isEligible !== false)
      : donors.filter(d => d.isEligible === false);
  const currentDonors = filteredDonors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ─── SYSTEM ACTION BAR ─── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl">
              <ShieldCheck className="text-red-500" size={20} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Donor Archive</h2>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Real-time Database: {donors.length} Verified Records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 md:min-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Query by name, group, or ID..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 border border-slate-200/60 rounded-2xl focus:bg-white focus:ring-8 focus:ring-red-500/5 focus:border-red-500/50 transition-all outline-none text-sm font-bold placeholder:text-slate-400"
            />
          </div>
          <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-red-500 hover:text-red-600 transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* Cooldown Status Filter */}
        <div className="flex items-center gap-2 w-full xl:w-auto">
          {["All", "Eligible", "In Cooldown"].map(f => (
            <button
              key={f}
              onClick={() => { setCooldownFilter(f); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                cooldownFilter === f
                  ? f === "Eligible" ? "bg-green-600 text-white" : f === "In Cooldown" ? "bg-amber-500 text-white" : "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MEDICAL DATA GRID ─── */}
      <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Vault...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Registry ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Donor Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Encrypted Contact</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Medical Archetype</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Operational Area</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Cooldown Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-center">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {currentDonors.map((donor, index) => (
                <tr key={donor._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-red-500 transition-colors"></div>
                      <span className="text-xs font-black text-slate-400">BC-{1000 + indexOfFirst + index + 1}</span>
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 group-hover:rotate-6 transition-transform">
                          <User size={20} />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-none mb-1 group-hover:text-red-600 transition-colors">{donor.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{donor.gender}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age: {donor.age}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 w-fit px-2 py-1 rounded-lg">
                        <Phone size={12} className="text-slate-400" /> {donor.mobile}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 px-2">
                        <Mail size={12} /> {donor.email}
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-2xl group-hover:border-red-100 transition-colors shadow-sm">
                      <Droplet size={14} className="text-red-600" fill="#ef4444" />
                      <span className="text-lg font-black text-slate-800 tracking-tighter">{donor.bloodGroup}</span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-start gap-2 max-w-[180px]">
                      <MapPin size={14} className="text-slate-300 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">{donor.address}</span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    {donor.isEligible === false ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">
                        In Cooldown ({donor.daysRemaining} days)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">
                        Eligible
                      </span>
                    )}
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/donor-profile/${donor._id}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="View Profile"
                      >
                        <Info size={18} />
                      </button>
                      <button
                        onClick={() => deleteDonor(donor._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── PAGINATION ENGINE ─── */}
        <div className="bg-slate-900 px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Current View</p>
                <p className="text-white text-xs font-bold">Records {indexOfFirst + 1} — {Math.min(indexOfLast, filteredDonors.length)}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-400 rounded-xl hover:text-white hover:bg-slate-700 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1 
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/40" 
                    : "bg-slate-800 text-slate-500 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-400 rounded-xl hover:text-white hover:bg-slate-700 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDonors;