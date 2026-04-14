import { Clock, CheckCircle } from "lucide-react";

const COOLDOWN_DAYS = 90;
const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40

export default function CooldownWidget({ isEligible, daysRemaining, nextEligibleDate, lastDonationDate, loading }) {

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-8 bg-slate-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
      </div>
    );
  }

  // Eligible state
  if (isEligible || !lastDonationDate) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Donation Status</p>
            <p className="text-sm font-bold text-green-600">You are eligible to donate!</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          You can schedule your next donation today. Every donation saves up to 3 lives.
        </p>
      </div>
    );
  }

  // In-cooldown state
  const elapsed = COOLDOWN_DAYS - daysRemaining;
  const progressPercent = Math.round((elapsed / COOLDOWN_DAYS) * 100);
  const strokeOffset = CIRCUMFERENCE * (1 - elapsed / COOLDOWN_DAYS);

  return (
    <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
      <div className="flex items-center gap-4">

        {/* Circular progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#FEF3C7" strokeWidth="10" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#F59E0B"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-[#0F172A]">{progressPercent}%</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-500" />
            <p className="text-xs text-amber-600 font-bold uppercase">In Cooldown</p>
          </div>
          <p className="text-2xl font-black text-[#0F172A]">
            {daysRemaining} <span className="text-sm font-normal text-slate-500">days left</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Eligible again on{" "}
            <span className="font-bold text-[#0F172A]">
              {nextEligibleDate ? new Date(nextEligibleDate).toDateString() : "N/A"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
