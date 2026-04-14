import { motion } from "framer-motion";
import { Zap, MapPin, Heart, Users, Clock } from "lucide-react";
import heroLabImg from "../../assets/hero-lab.jpg"; // adjust path if needed

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-8 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-accent-foreground rounded-full text-[11px] font-bold uppercase tracking-widest mb-8 border border-primary/20">
            <Zap size={14} className="text-primary" />
            Live Donor Network 2026
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[0.92] mb-6 text-foreground">
            Save Lives{" "}
            <span className="text-primary italic">With One Tap.</span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mb-10">
            Join the world's most advanced blood donation ecosystem. We combine
            clinical precision with real-time emergency routing.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button className="btn-primary flex items-center gap-2 shadow-primary/25">
              Donate Now <Zap size={16} />
            </button>

            <button className="btn-outline flex items-center gap-2">
              Find Centers <MapPin size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-clinical-success animate-pulse" />
              <span className="text-muted-foreground">
                <span className="font-bold text-foreground tabular-nums">
                  2,847
                </span>{" "}
                Active Donors
              </span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Heart size={14} className="text-primary" />
              <span className="text-muted-foreground">
                <span className="font-bold text-foreground tabular-nums">
                  18
                </span>{" "}
                Lives Saved Today
              </span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border aspect-square max-h-[520px] relative">
            <img
              src={heroLabImg}
              alt="Medical Laboratory"
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Bottom text */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">
                Medical Laboratory
              </p>
              <p className="text-white/70 text-[11px] mt-1">
                ISO 9001 Certified Blood Processing Facility
              </p>
            </div>
          </div>

          {/* Floating Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-8 -left-4 bg-card border border-border rounded-2xl p-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">842K+</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Units Collected
                </p>
              </div>
            </div>
          </motion.div>

          {/* Floating Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl p-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-clinical-success/10 flex items-center justify-center">
                <Clock size={18} className="text-clinical-success" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">4 min</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Avg Response
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}