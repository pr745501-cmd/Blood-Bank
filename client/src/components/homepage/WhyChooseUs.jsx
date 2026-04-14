import { useEffect, useState } from "react";
import { Shield, Heart, Zap, Globe } from "lucide-react";
import API from "../../services/api";

const cards = [
  {
    icon: Shield,
    title: "Safe & Certified",
    desc: "Every donation follows strict WHO medical protocols with full traceability and safety checks.",
    iconBg: "bg-blue-50 border-blue-100 text-blue-600",
    glow: "hover:shadow-blue-100",
    accent: "group-hover:border-blue-200",
  },
  {
    icon: Heart,
    title: "Save 3 Lives",
    desc: "One whole blood donation splits into components — red cells, plasma, platelets — helping up to 3 patients.",
    iconBg: "bg-red-50 border-red-100 text-red-600",
    glow: "hover:shadow-red-100",
    accent: "group-hover:border-red-200",
  },
  {
    icon: Zap,
    title: "30-Minute Process",
    desc: "From check-in to completion, the entire donation experience takes just 30 minutes.",
    iconBg: "bg-amber-50 border-amber-100 text-amber-600",
    glow: "hover:shadow-amber-100",
    accent: "group-hover:border-amber-200",
  },
  {
    icon: Globe,
    title: "Wide Network",
    desc: "Connected with hospitals and certified blood banks across the country for fast delivery.",
    iconBg: "bg-emerald-50 border-emerald-100 text-emerald-600",
    glow: "hover:shadow-emerald-100",
    accent: "group-hover:border-emerald-200",
  },
];

const WhyChooseUs = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/public/stats").then(r => setStats(r.data)).catch(() => {});
  }, []);

  const fmt = (n) => {
    if (!n && n !== 0) return "—";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
    return n + "+";
  };

  const impactStats = [
    { val: "98%",                                label: "Donor Satisfaction",  color: "text-emerald-400" },
    { val: "< 2h",                               label: "Avg. Response Time",  color: "text-blue-400" },
    { val: stats ? fmt(stats.totalDonors) : "—", label: "Registered Donors",  color: "text-violet-400" },
    { val: stats ? fmt(stats.livesSaved) : "—",  label: "Lives Saved",        color: "text-red-400" },
  ];

  return (
    <section id="about" className="relative py-24 bg-white overflow-hidden">
      {/* Background light effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-50 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="text-red-600 text-xs font-bold uppercase tracking-widest">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
            Built for donors, patients,<br />and healthcare teams
          </h2>
          <p className="text-slate-500 mt-4 leading-relaxed">
            BloodConnect removes every barrier between willing donors and patients in critical need — with the reliability and trust of a medical-grade platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ icon: Icon, title, desc, iconBg, glow, accent }) => (
            <div
              key={title}
              className={`group relative bg-white border border-slate-200 ${accent} rounded-xl p-6 hover:shadow-xl ${glow} transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden`}
            >
              {/* Subtle top gradient line on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className={`w-10 h-10 ${iconBg} border rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Impact numbers — dark strip with glows */}
        <div className="relative mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 overflow-hidden">
          {/* Glow orbs inside strip */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-red-600/10 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px]" />

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map(({ val, label, color }) => (
              <div key={label} className="text-center group">
                <p className={`text-3xl font-extrabold ${color} group-hover:scale-105 transition-transform duration-200 inline-block`}>{val}</p>
                <p className="text-slate-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
