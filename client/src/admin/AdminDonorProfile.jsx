import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Phone, Mail, MapPin, Droplets, Calendar, Award,
  ArrowLeft, CheckCircle, XCircle, Clock, Activity,
  ShieldCheck, Heart, FileText
} from "lucide-react";

const BLOOD_COLORS = {
  "A+": "bg-red-500", "A-": "bg-red-400",
  "B+": "bg-blue-500", "B-": "bg-blue-400",
  "O+": "bg-green-500", "O-": "bg-green-400",
  "AB+": "bg-purple-500", "AB-": "bg-purple-400"
};

export default function AdminDonorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/admin/donor-profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (e) {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <XCircle size={40} className="text-red-400" />
      <p className="text-slate-500 font-bold">Donor not found</p>
      <button onClick={() => navigate(-1)} className="text-sm text-red-600 font-bold hover:underline">Go Back</button>
    </div>
  );

  const { donor, donations, certificates } = data;
  const bloodColor = BLOOD_COLORS[donor.bloodGroup] || "bg-slate-500";
  const isEligible = donor.availability;

  /* next eligible date */
  let nextEligible = null;
  if (donor.lastDonationDate) {
    const d = new Date(donor.lastDonationDate);
    d.setDate(d.getDate() + 42);
    nextEligible = d;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* BACK */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Donor Archive
        </button>

        {/* HERO CARD */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-red-600 to-red-400" />
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-10 mb-6">
              <div className={`w-20 h-20 rounded-2xl ${bloodColor} flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-white`}>
                {donor.bloodGroup || <User size={28} />}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-black text-slate-900">{donor.name}</h1>
                <p className="text-slate-400 text-sm font-medium">{donor.email || "No email"} · {donor.mobile || "No phone"}</p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-xs font-black border ${isEligible ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                {isEligible ? "✅ Available to Donate" : "⏳ Not Available"}
              </span>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={<Droplets size={16} className="text-red-500"/>} label="Blood Group" value={donor.bloodGroup || "—"} />
              <InfoCard icon={<User size={16} className="text-slate-400"/>} label="Gender / Age" value={`${donor.gender || "—"} · ${donor.age || "—"} yrs`} />
              <InfoCard icon={<MapPin size={16} className="text-slate-400"/>} label="Address" value={donor.address || donor.city || "—"} />
              <InfoCard icon={<Phone size={16} className="text-slate-400"/>} label="Mobile" value={donor.mobile || "—"} />
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Heart size={20}/>}       value={donor.donationCount || 0}  label="Total Donations"  color="text-red-600 bg-red-50" />
          <StatCard icon={<Award size={20}/>}        value={certificates.length}        label="Certificates"     color="text-purple-600 bg-purple-50" />
          <StatCard icon={<Activity size={20}/>}     value={(donor.donationCount || 0) * 3} label="Lives Impacted" color="text-emerald-600 bg-emerald-50" />
          <StatCard icon={<Clock size={20}/>}        value={nextEligible ? nextEligible.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Now"} label="Next Eligible" color="text-blue-600 bg-blue-50" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* DONATION HISTORY */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center gap-2">
              <FileText size={16} className="text-red-500" />
              <h2 className="font-black text-slate-800">Donation History</h2>
              <span className="ml-auto text-xs text-slate-400 font-bold">{donations.length} records</span>
            </div>
            {donations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-bold">No donations recorded yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {donations.slice(0, 8).map(d => (
                  <div key={d._id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${bloodColor} flex items-center justify-center text-white text-xs font-black`}>
                        {d.bloodGroup}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{d.location || "Blood Bank"}</p>
                        <p className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+{d.units || 1} unit</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CERTIFICATES */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center gap-2">
              <Award size={16} className="text-purple-500" />
              <h2 className="font-black text-slate-800">Certificates</h2>
              <span className="ml-auto text-xs text-slate-400 font-bold">{certificates.length} issued</span>
            </div>
            {certificates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-bold">No certificates issued yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {certificates.map(c => (
                  <div key={c._id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Award size={14} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{c.certificateId}</p>
                        <p className="text-xs text-slate-400">{new Date(c.donationDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{c.bloodGroup}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LINKED USER ACCOUNT */}
        {donor.user && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h2 className="font-black text-slate-800">Linked User Account</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={<User size={14} className="text-slate-400"/>}    label="Name"       value={donor.user.name} />
              <InfoCard icon={<Mail size={14} className="text-slate-400"/>}    label="Email"      value={donor.user.email} />
              <InfoCard icon={<Phone size={14} className="text-slate-400"/>}   label="Phone"      value={donor.user.phone || "—"} />
              <InfoCard icon={<Calendar size={14} className="text-slate-400"/>} label="Joined"    value={new Date(donor.user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
            </div>
          </div>
        )}

        {!donor.user && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <XCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm font-bold text-amber-700">No linked user account. This donor was added without an email or the account was not created.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="flex items-center gap-1.5 mb-1">{icon}<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p></div>
      <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
