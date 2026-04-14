import { motion } from "framer-motion";
import {
  Pill,
  Droplets,
  Utensils,
  Calendar,
  Globe,
  ArrowUpRight,
  Activity,
  TrendingUp,
} from "lucide-react";

export default function NutritionGrid() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-rose-600 text-sm font-bold uppercase tracking-widest mb-2">
            Recovery & Health
          </p>
          <h2 className="text-4xl font-black text-[#0F172A]">
            Fuel Your Recovery
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT BIG CARD */}
          <motion.div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">

            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold uppercase">
              <Activity size={12} />
              Pro Tip
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-3">
              Optimized <span className="text-[#E11D48]">Regeneration.</span>
            </h3>

            <p className="text-slate-500 text-sm max-w-md mb-8">
              Fuel your body before and after donation to recover faster.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {[
                { icon: <Pill size={18} />, title: "Iron", desc: "Spinach & Meat", val: "18mg/day" },
                { icon: <Droplets size={18} />, title: "Water", desc: "+2L Daily", val: "2.5L ideal" },
                { icon: <Utensils size={18} />, title: "Energy", desc: "Carbs", val: "300g/day" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#F8FAFC] rounded-2xl p-5 text-center border border-slate-200 hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 mx-auto flex items-center justify-center text-[#E11D48] mb-3">
                    {item.icon}
                  </div>

                  <p className="text-sm font-bold text-[#0F172A]">
                    {item.title}
                  </p>

                  <p className="text-[10px] text-slate-500 mt-1">
                    {item.desc}
                  </p>

                  <p className="text-[10px] font-bold text-rose-600 mt-2">
                    {item.val}
                  </p>
                </div>
              ))}

            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* Card 1 */}
            <motion.div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                <Calendar size={20} className="text-[#E11D48]" />
              </div>

              <h4 className="font-bold text-[#0F172A] text-lg">
                Cycle Tracker
              </h4>

              <p className="text-sm text-slate-500 mt-1 mb-4">
                Next donation in <span className="font-bold text-[#0F172A]">42 days</span>
              </p>

              {/* Progress */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div className="bg-[#E11D48] h-2 rounded-full" style={{ width: "58%" }} />
              </div>

              <button className="text-xs font-bold text-rose-600 flex items-center gap-1 hover:gap-2 transition">
                Set Alert <ArrowUpRight size={14} />
              </button>
            </motion.div>

            {/* Card 2 */}
            <motion.div className="bg-[#0F172A] text-white rounded-3xl p-6 relative overflow-hidden">

              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center mb-4">
                  <Globe size={20} className="text-rose-400" />
                </div>

                <h4 className="font-bold text-lg">Global Impact</h4>

                <p className="text-xs opacity-70 mt-1 mb-4">
                  You saved <span className="font-bold">12 lives</span>
                </p>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px] font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <span className="text-xs opacity-60">+9k donors</span>
                </div>
              </div>

              <TrendingUp className="absolute -bottom-6 -right-6 opacity-10" size={120} />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}