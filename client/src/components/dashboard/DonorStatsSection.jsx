import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Activity,
  ShieldCheck,
  Heart,
  Clock,
  Award,
} from "lucide-react";
import CooldownWidget from "./CooldownWidget.jsx";
import API from "../../services/api.jsx";

export default function DonorStatsSection() {

  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [cooldownData, setCooldownData] = useState(null);
  const [cooldownLoading, setCooldownLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    // guard: only fetch if id looks like a valid MongoDB ObjectId (24 hex chars)
    const id = storedUser?.id;
    if (id && /^[a-f\d]{24}$/i.test(id)) {
      fetchData(id);
      fetchCooldown(id);
    }
  }, []);

  const fetchData = async (userId) => {
    try {
      const res = await API.get(`/dashboard/stats/${userId}`);
      setData(res.data);
    } catch (err) {
      // silently ignore
    }
  };

  const fetchCooldown = async (userId) => {
    setCooldownLoading(true);
    try {
      const res = await API.get(`/cooldown/status/${userId}`);
      setCooldownData(res.data);
    } catch (err) {
      // Donor profile may not exist yet — silently ignore
    } finally {
      setCooldownLoading(false);
    }
  };

  // ✅ Loading / No data State
  if (!data) {
    return (
      <section className="py-20 px-4 md:px-8 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto text-center text-slate-400 font-bold py-10">
          No donation data yet. Complete your first donation to see stats here.
        </div>
      </section>
    );
  }

  // ✅ Safe values
  const bloodGroup = user?.bloodGroup || data?.bloodGroup || "N/A";

  return (
    <section className="py-20 px-4 md:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div className="mb-12">
          <h2 className="text-4xl font-black text-[#0F172A] mb-3">
            Your Donor Overview
          </h2>
          <p className="text-slate-500 text-lg">
            Track your impact and stay on top of your next donation.
          </p>
        </motion.div>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

          {/* Eligibility Card */}
          <motion.div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-lg flex flex-col md:flex-row gap-8 items-center">

            {/* Circle */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#E2E8F0" strokeWidth="10" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E11D48"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={350}
                  strokeDashoffset={350 * (1 - (data.recoveryPercentage || 0) / 100)}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#0F172A]">
                  {data.recoveryPercentage || 0}%
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Ready
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-[10px] font-bold mb-4">
                <Clock size={12} />
                Recovery Phase
              </div>

              <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                Whole Blood Recovery
              </h3>

              <p className="text-slate-500 text-sm max-w-md">
                Eligible again on{" "}
                <span className="font-bold text-[#0F172A]">
                  {data.nextEligibleDate
                    ? new Date(data.nextEligibleDate).toDateString()
                    : "N/A"}
                </span>
              </p>

              {/* Details */}
              <div className="mt-5 flex gap-6 justify-center md:justify-start">

                <div>
                  <p className="text-xs text-slate-400 uppercase">Last</p>
                  <p className="font-bold text-[#0F172A]">
                    {data.lastDonationDate
                      ? new Date(data.lastDonationDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="w-px h-8 bg-slate-200" />

                <div>
                  <p className="text-xs text-slate-400 uppercase">Type</p>
                  <p className="font-bold text-[#0F172A]">
                    {data.donationType || "Whole Blood"}
                  </p>
                </div>

                <div className="w-px h-8 bg-slate-200" />

                <div>
                  <p className="text-xs text-slate-400 uppercase">Group</p>
                  <p className="font-bold text-[#E11D48]">
                    {bloodGroup}
                  </p>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Lives Saved */}
          <motion.div className="bg-[#0F172A] text-white rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Heart size={120} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4">
                <Award size={20} className="text-rose-400" />
              </div>

              <p className="text-sm opacity-70">Total Lives Saved</p>
              <p className="text-5xl font-black mt-2 mb-auto">
                {data.livesSaved || 0}
              </p>

              <p className="text-xs opacity-60 mt-4">
                Based on {data.donationCount || 0} donations
              </p>
            </div>
          </motion.div>

        </div>

        {/* Health Stats — shown only if user has medical data on profile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Hemoglobin", val: null, unit: "g/dL", icon: Droplets },
            { label: "Pulse Rate", val: null, unit: "bpm", icon: Activity },
            { label: "Blood Pressure", val: null, unit: "mmHg", icon: ShieldCheck },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border shadow-sm">
              <div className="flex justify-between mb-4">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <stat.icon size={18} className="text-[#E11D48]" />
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold">
                  Not Recorded
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-slate-300">—</span>
                <span className="text-xs text-slate-300">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cooldown Tracker Widget */}
        <div className="mt-6">
          <CooldownWidget
            isEligible={cooldownData?.isEligible}
            daysRemaining={cooldownData?.daysRemaining}
            nextEligibleDate={cooldownData?.nextEligibleDate}
            lastDonationDate={cooldownData?.lastDonationDate}
            loading={cooldownLoading}
          />
        </div>

      </div>
    </section>
  );
}
