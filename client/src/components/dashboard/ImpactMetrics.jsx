import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Users, Heart, ShieldCheck } from "lucide-react";
import API from "../../services/api.jsx";

export default function ImpactMetrics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/public/stats")
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  const metrics = [
    {
      label: "Blood Units Collected",
      val: stats ? (stats.totalUnits >= 1000 ? `${(stats.totalUnits / 1000).toFixed(1)}K` : stats.totalUnits) : "—",
      icon: Droplets
    },
    {
      label: "Registered Donors",
      val: stats ? stats.totalDonors.toLocaleString() : "—",
      icon: Users
    },
    {
      label: "Lives Saved",
      val: stats ? (stats.livesSaved >= 1000 ? `${(stats.livesSaved / 1000).toFixed(1)}K` : stats.livesSaved) : "—",
      icon: Heart
    },
    {
      label: "Total Requests",
      val: stats ? stats.totalRequests.toLocaleString() : "—",
      icon: ShieldCheck
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-[#0F172A] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {metrics.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <stat.icon size={22} className="text-rose-400" />
            </div>
            <p className="text-3xl md:text-4xl font-black tracking-tight">{stat.val}</p>
            <p className="text-xs opacity-60 uppercase tracking-widest font-semibold mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
