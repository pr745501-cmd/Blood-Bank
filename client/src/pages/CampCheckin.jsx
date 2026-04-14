import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, XCircle, Clock, MapPin, Calendar, Droplets, User, Tent } from "lucide-react";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS = {
  registered: { icon: <Clock size={40} className="text-blue-500"/>,   bg: "from-blue-500 to-blue-700",   label: "Registered",  sub: "Valid registration — not yet attended" },
  attended:   { icon: <CheckCircle2 size={40} className="text-white"/>, bg: "from-green-500 to-green-700", label: "Attended ✓",  sub: "This donor has already checked in"      },
  cancelled:  { icon: <XCircle size={40} className="text-white"/>,      bg: "from-red-500 to-red-700",     label: "Cancelled",   sub: "This registration has been cancelled"   },
};

export default function CampCheckin() {
  const { regId } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    // Use IP-aware base URL so API calls work from mobile devices
    const apiBase = window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : `http://${window.location.hostname}:5000/api`;

    axios.get(`${apiBase}/camps/checkin/${regId}`)
      .then(r => setData(r.data.registration))
      .catch(e => setError(e.response?.data?.message || "Registration not found"))
      .finally(() => setLoading(false));
  }, [regId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col items-center justify-center gap-4 p-6">
      <XCircle size={64} className="text-red-400" />
      <h1 className="text-2xl font-black text-slate-800">Invalid QR Code</h1>
      <p className="text-slate-500 text-center">{error}</p>
    </div>
  );

  const s = STATUS[data.status] || STATUS.registered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* BloodConnect brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
            <Droplets size={16} className="text-white" />
          </div>
          <span className="text-white font-black text-lg">Blood<span className="text-red-400">Connect</span></span>
        </div>

        {/* status card */}
        <div className={`bg-gradient-to-br ${s.bg} rounded-3xl p-6 text-white text-center mb-4 shadow-2xl`}>
          <div className="flex justify-center mb-3">{s.icon}</div>
          <h2 className="text-2xl font-black">{s.label}</h2>
          <p className="text-sm opacity-80 mt-1">{s.sub}</p>
        </div>

        {/* donor info */}
        <div className="bg-white rounded-3xl p-5 mb-4 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Donor</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
              <User size={18} className="text-red-500" />
            </div>
            <div>
              <p className="font-black text-slate-800">{data.donor?.name || "—"}</p>
              <p className="text-xs text-slate-400">{data.donor?.email || "—"}</p>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-red-50 text-red-600 text-xs font-black rounded-full border border-red-100">
              {data.bloodGroup || data.donor?.bloodGroup || "—"}
            </span>
          </div>
          {data.phone && (
            <p className="text-xs text-slate-500 font-medium">📞 {data.phone}</p>
          )}
        </div>

        {/* camp info */}
        <div className="bg-white rounded-3xl p-5 mb-4 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Camp</p>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Tent size={18} className="text-red-500" />
            </div>
            <div>
              <p className="font-black text-slate-800 leading-tight">{data.camp?.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{data.camp?.organizer}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><Calendar size={11}/><span className="text-[9px] font-bold uppercase tracking-wide">Date</span></div>
              <p className="text-xs font-bold text-slate-700">{fmt(data.camp?.startDate)}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><MapPin size={11}/><span className="text-[9px] font-bold uppercase tracking-wide">City</span></div>
              <p className="text-xs font-bold text-slate-700">{data.camp?.location?.city || "—"}</p>
            </div>
          </div>
        </div>

        {/* registration meta */}
        <div className="bg-white/10 rounded-2xl p-4 text-center">
          <p className="text-white/50 text-[10px] font-mono">REG ID: {data._id}</p>
          <p className="text-white/40 text-[10px] mt-1">Registered {fmt(data.createdAt)}</p>
          {data.attendedAt && <p className="text-green-400 text-[10px] mt-1 font-bold">Attended {fmt(data.attendedAt)}</p>}
        </div>

      </div>
    </div>
  );
}
