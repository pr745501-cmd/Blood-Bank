import { motion } from "framer-motion";
import { Shield, Stethoscope, Droplets, Heart, ArrowRight } from "lucide-react";
import donationProcessImg from "../../assets/donation-process.jpg";

const STEPS = [
  {
    title: "Verification",
    desc: "ID check and donor registration with secure verification.",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070",
    icon: Shield,
    step: "01",
  },
  {
    title: "Screening",
    desc: "Health check including vitals and hemoglobin testing.",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080",
    icon: Stethoscope,
    step: "02",
  },
  {
    title: "Collection",
    desc: "Safe blood collection by certified professionals.",
    icon: Droplets,
    step: "03",
    useLocal: true,
  },
  {
    title: "Recovery",
    desc: "Rest and refreshments after donation.",
    img: "https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2014",
    icon: Heart,
    step: "04",
  },
];

export default function ClinicalWorkflow() {
  return (
    <section className="py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-rose-600 text-sm font-bold uppercase tracking-widest mb-2">
            How It Works
          </p>

          <h2 className="text-4xl font-black text-[#0F172A] mb-3">
            The Clinical Loop
          </h2>

          <p className="text-slate-500 max-w-xl mx-auto">
            Four simple steps ensuring safe and effective blood donation.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {STEPS.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl transition hover:-translate-y-1"
            >
              
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={step.useLocal ? donationProcessImg : step.img}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Step Badge */}
                <div className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-xs font-black text-[#0F172A] shadow">
                  {step.step}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">

                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-[#E11D48] mb-3">
                  <step.icon size={20} />
                </div>

                <h3 className="font-bold text-[#0F172A] text-lg">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2">
                  {step.desc}
                </p>

                <button className="mt-4 text-xs font-bold text-rose-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  Learn More <ArrowRight size={12} />
                </button>

              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}