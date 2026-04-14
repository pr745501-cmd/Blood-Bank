import { motion } from "framer-motion";
import { Heart, ArrowRight, Droplets, Shield } from "lucide-react";
import bloodBagImg from "../../assets/blood-bag-hero.jpg";
import communityImg from "../../assets/community-donors.jpg";
import heroLabImg from "../../assets/hero-lab.jpg";

const BLOOD_FACTS = [
  { number: "4.5M", label: "People need blood transfusions each year" },
  { number: "43K", label: "Pints of donated blood used every single day" },
  { number: "1", label: "Donation can save up to 3 lives" },
];

export default function PromoBanners() {
  return (
   <section className="py-16 bg-background">
   <div className="max-w-6xl mx-auto px-2 md:px-4 space-y-8">

        {/* 🔴 MARQUEE FIX */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-primary overflow-hidden py-4"
        >
          <div className="flex gap-12 whitespace-nowrap animate-marquee w-max">
            {[...Array(2)].flatMap((_, j) =>
              ["DONATE BLOOD", "SAVE LIVES", "BE A HERO", "EVERY DROP MATTERS", "GIVE HOPE"].map((text, i) => (
                <span
                  key={`${j}-${i}`}
                  className="text-primary-foreground/90 text-sm font-black uppercase tracking-[0.3em] flex items-center gap-4"
                >
                  <Heart size={12} className="text-primary-foreground/50" />
                  {text}
                </span>
              ))
            )}
          </div>
        </motion.div>

        {/* 🔴 HERO + FACTS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">

          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 relative rounded-2xl overflow-hidden min-h-[380px] flex items-end group"
            
          >
            <img
              src={bloodBagImg}
              alt="Blood donation bag"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* FIXED OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="relative z-10 p-8 md:p-10">
              <p className="text-primary text-[10px] font-bold uppercase tracking-[0.25em] mb-3">
                World Blood Donor Day
              </p>

              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight max-w-md mb-4">
                Your Blood Type Is Someone's{" "}
                <span className="text-primary italic">Last Hope.</span>
              </h2>

              <button className="btn-primary flex items-center gap-2 w-fit text-xs">
                Donate Today <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>

          {/* FACTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {BLOOD_FACTS.map((fact, i) => (
              <div key={i} className="stat-card flex items-center gap-5 h-full">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                  <span className="text-xl font-black text-primary">{fact.number}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {fact.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 🔴 TWO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

          {/* COMMUNITY */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-end group cursor-pointer"
          >
            <img
              src={communityImg}
              alt="Community"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* FIXED OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="relative z-10 p-8">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                  2,847 Active This Week
                </span>
              </div>

              <h3 className="text-2xl font-black text-white leading-tight">
                Join The Movement. <br />
                <span className="text-white/70">Be Someone's Hero.</span>
              </h3>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-primary p-10 flex flex-col justify-between min-h-[300px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <Droplets size={32} className="text-white/30 mb-4" />
              <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                It Takes <span className="italic">30 Minutes</span> To Save A Life.
              </h3>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-4 mt-6">
              <button className="bg-white text-primary font-bold rounded-xl px-6 py-3 text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                Find Nearest Center <ArrowRight size={14} />
              </button>

              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Shield size={14} />
                <span>100% Safe & Sterile</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🔴 QUOTE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden min-h-[200px] flex items-center"
        >
          <img
            src={heroLabImg}
            alt="Lab"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* FIXED OVERLAY */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="relative z-10 p-10 md:p-14 text-center w-full">
            <p className="text-2xl md:text-3xl font-black text-white leading-snug max-w-3xl mx-auto">
              "The blood running through your veins could be the{" "}
              <span className="text-primary italic">miracle</span> someone is praying for."
            </p>

            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-5">
              — Every Donor Is A Hero
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}