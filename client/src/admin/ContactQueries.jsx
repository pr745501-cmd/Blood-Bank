import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  Filter, 
  AlertCircle,
  Mail,
  User 
} from "lucide-react";
import API from "../services/api";

function ContactQueries() {
  const [contacts, setContacts] = useState([]);
  const [reply, setReply] = useState({});

  const fetchContacts = async () => {
    try {
      const res = await API.get("/contact");
      if (res.data.success) {
        setContacts(res.data.contacts);
      }
    } catch (err) {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const resolveQuery = async (id) => {
    try {
      await API.put(`/contact/reply/${id}`, {
        reply: reply[id],
      });
      // A toast would be better here, but keeping your logic flow
      alert("Query resolved successfully");
      fetchContacts();
    } catch (err) {
      // silently ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Support Center
              <span className="bg-indigo-100 text-indigo-600 text-xs px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">
                Admin
              </span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Manage user inquiries and technical support tickets.
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending</span>
                <span className="text-lg font-bold text-rose-500">
                  {contacts.filter(c => c.status !== "Resolved").length}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                <span className="text-lg font-bold text-slate-800">{contacts.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Query Container */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Details</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Resolution</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {contacts.length > 0 ? (
                    contacts.map((c, i) => (
                      <motion.tr 
                        key={c._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-slate-50/50 transition-all"
                      >
                        {/* User Identity */}
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              <User size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 leading-tight">{c.name}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <Mail size={12} /> {c.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Subject/Category */}
                        <td className="px-6 py-6">
                          <div className="text-sm font-bold text-slate-700 leading-tight">{c.subject}</div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                            {c.category}
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="px-6 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            c.priority === "High"
                              ? "bg-rose-50 text-rose-600 ring-1 ring-rose-100"
                              : c.priority === "Medium"
                              ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                              : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                          }`}>
                            <AlertCircle size={10} strokeWidth={3} />
                            {c.priority}
                          </span>
                        </td>

                        {/* Message Content */}
                        <td className="px-6 py-6 max-w-[280px]">
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed italic group-hover:text-slate-700 transition-colors">
                            "{c.message}"
                          </p>
                        </td>

                        {/* Actions & Status */}
                        <td className="px-6 py-6">
                          <div className="flex flex-col items-center justify-center gap-3">
                            {c.status === "Resolved" ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="text-emerald-500 flex items-center gap-1.5 font-bold text-sm">
                                  <CheckCircle2 size={16} /> Resolved
                                </div>
                                <p className="text-[11px] text-slate-400 max-w-[150px] text-center italic">
                                  "{c.adminReply}"
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="relative group/input">
                                  <input
                                    type="text"
                                    placeholder="Type response..."
                                    className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all w-44 shadow-inner"
                                    onChange={(e) =>
                                      setReply({
                                        ...reply,
                                        [c._id]: e.target.value,
                                      })
                                    }
                                  />
                                  <MessageSquare size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                                <button
                                  onClick={() => resolveQuery(c._id)}
                                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
                                  title="Send Reply"
                                >
                                  <Send size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="text-slate-200" size={48} />
                          <p className="text-slate-400 font-medium italic">No active queries found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactQueries;