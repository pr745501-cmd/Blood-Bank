import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, Search, User, ShieldCheck, Mail, Users, 
  ChevronLeft, ChevronRight, MoreHorizontal, Filter, Download 
} from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const usersPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      // silently ignore
    } finally {
      setTimeout(() => setIsLoading(false), 600); // Smooth transition
    }
  };

  const deleteUser = async (id) => {
    const token = localStorage.getItem("token");
    // Using a more modern confirm or you could integrate a modal here
    if (!window.confirm("Archiving user. Confirm action?")) return;
    
    await axios.delete(`http://localhost:5000/api/admin/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage, 
    currentPage * usersPerPage
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 lg:p-10 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR / STATS */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-tight mb-1">
              <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              ADMIN PORTAL
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              User Directories
            </h1>
            <p className="text-slate-500 font-medium">Manage and audit {users.length} registered accounts.</p>
          </motion.div>

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Download size={18} /> Export
             </button>
             <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                <Users size={18} /> Add User
             </button>
          </div>
        </header>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={19} />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-0 ring-1 ring-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="px-5 py-3.5 bg-white ring-1 ring-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">User Identity</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Access Level</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  /* Skeleton Loader Rows */
                  [...Array(usersPerPage)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-6 flex gap-4"><div className="w-12 h-12 bg-slate-100 rounded-full"/><div className="space-y-2 py-2"><div className="h-3 w-32 bg-slate-100 rounded"/><div className="h-2 w-24 bg-slate-50 rounded"/></div></td>
                      <td className="px-8 py-6"><div className="h-6 w-20 bg-slate-100 rounded-full"/></td>
                      <td className="px-8 py-6"><div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto"/></td>
                    </tr>
                  ))
                ) : (
             <AnimatePresence>
  {currentUsers.map((user, idx) => (
    <motion.tr
      key={user._id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
    >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100 uppercase">
                              {user.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-base">{user.name}</div>
                              <div className="text-sm text-slate-400 font-medium flex items-center gap-1.5 leading-none mt-1">
                                <Mail size={13} /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            user.role === "admin" 
                            ? "bg-rose-50 text-rose-600 ring-1 ring-rose-100" 
                            : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${user.role === "admin" ? "bg-rose-500" : "bg-emerald-500"}`} />
                            {user.role.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                                <MoreHorizontal size={18} />
                             </button>
                             {user.role !== "admin" && (
                               <button
                                 onClick={() => deleteUser(user._id)}
                                 className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                               >
                                 <Trash2 size={18} />
                               </button>
                             )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL */}
          <footer className="px-8 py-6 bg-white border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;