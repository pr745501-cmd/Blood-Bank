import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Activity, ChevronRight, MapPin, Calendar } from "lucide-react";
import API from "../../services/api.jsx";

export default function RecentActivity() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser?.id) { setLoading(false); return; }

    Promise.all([
      API.get(`/dashboard/donations/${storedUser.id}`),
      API.get(`/request/my`)
    ])
      .then(([donRes, reqRes]) => {
        const donations = Array.isArray(donRes.data) ? donRes.data : [];
        const requests = Array.isArray(reqRes.data) ? reqRes.data : [];

        const combined = [
          ...donations.map(d => ({
            type: "Donation",
            label: `${d.bloodGroup || "Blood"} Donation`,
            location: d.location || "Blood Center",
            date: new Date(d.date || d.createdAt).toLocaleDateString(),
            status: d.verificationStatus || "pending",
            icon: Droplets,
            ts: new Date(d.date || d.createdAt).getTime()
          })),
          ...requests.map(r => ({
            type: "Request",
            label: `Blood Request: ${r.bloodGroup}`,
            location: r.hospital || "Hospital",
            date: new Date(r.createdAt).toLocaleDateString(),
            status: r.status,
            icon: Activity,
            ts: new Date(r.createdAt).getTime()
          }))
        ].sort((a, b) => b.ts - a.ts).slice(0, 6);

        setActivities(combined);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => {
    const v = (s || "").toLowerCase();
    if (v === "approved" || v === "completed") return "text-emerald-600";
    if (v === "rejected" || v === "critical") return "text-rose-600";
    return "text-amber-500";
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-rose-600 text-sm font-bold uppercase tracking-widest mb-2">History</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A]">Recent Activity</h2>
          </div>
          <button
            onClick={() => navigate("/my-donations")}
            className="hidden md:flex items-center gap-1 text-xs font-bold text-rose-600 hover:gap-2 transition-all"
          >
            VIEW ALL <ChevronRight size={14} />
          </button>
        </motion.div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-40 gap-3">
              <div className="w-7 h-7 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
              <p className="text-slate-400 font-semibold text-sm">Loading activity…</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-16 text-center text-slate-300">
              <Activity size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm font-bold text-slate-400">No activity recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition
                      ${row.type === "Donation" ? "bg-rose-50 text-rose-500 group-hover:bg-rose-100" : "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100"}`}>
                      <row.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">{row.label}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {row.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A] flex items-center gap-1 justify-end">
                        <Calendar size={11} className="text-slate-400" /> {row.date}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${statusColor(row.status)}`}>
                        {row.status}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
