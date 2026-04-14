import { useEffect, useState } from "react";
import {
  Tent, MapPin, Users, CalendarDays, Plus, Eye, Trash2,
  Clock, Building2, CheckCircle2, Search, X,
  Activity, UserCheck, Stethoscope, FileText,
  RefreshCw, TrendingUp, ChevronRight
} from "lucide-react";
import { createCamp, deleteCamp, getAllCamps } from "../services/campService";

const EMPTY_FORM = {
  title: "", organizer: "", organizerPhone: "", organizerEmail: "",
  city: "", address: "", startDate: "", endDate: "", time: "", endTime: "",
  description: "", capacity: "", doctors: "", bloodGroupsNeeded: [],
  facilities: [], contactPerson: "", contactPhone: "", notes: "",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const FACILITIES   = ["Refreshments", "Parking", "First Aid", "Ambulance", "Lab Testing", "Certificates"];

const STATUS_CONFIG = {
  Upcoming:  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    bar: "bg-blue-500",    dot: "bg-blue-500"    },
  Active:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  Completed: { bg: "bg-slate-100",  text: "text-slate-500",   border: "border-slate-200",   bar: "bg-slate-400",   dot: "bg-slate-400"   },
};

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff < 0) return `In ${Math.abs(diff)} days`;
  return `${diff}d ago`;
}

export default function AdminCamps() {
  const [camps, setCamps]           = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]       = useState(true);

  const fetchCamps = async () => {
    setLoading(true);
    try { const data = await getAllCamps(); setCamps(data); }
    catch (err) { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCamps(); }, []);

  const getStatus = (camp) => {
    const now = new Date();
    if (new Date(camp.startDate) > now) return "Upcoming";
    if (new Date(camp.endDate) < now) return "Completed";
    return "Active";
  };

  const handleCreate = async () => {
    if (!form.title || !form.city || !form.startDate || !form.endDate || !form.organizer) {
      alert("Please fill in all required fields."); return;
    }
    try {
      setSubmitting(true);
      await createCamp({
        title: form.title, organizer: form.organizer,
        location: { city: form.city, address: form.address },
        startDate: form.startDate, endDate: form.endDate,
        time: form.time + (form.endTime ? ` - ${form.endTime}` : ""),
        description: form.description, capacity: Number(form.capacity) || 100,
        doctors: form.doctors.split(",").filter(Boolean).map(d => ({ name: d.trim() })),
        bloodGroupsNeeded: form.bloodGroupsNeeded, facilities: form.facilities,
        contactPerson: form.contactPerson, contactPhone: form.contactPhone,
        notes: form.notes, organizerPhone: form.organizerPhone, organizerEmail: form.organizerEmail,
      });
      setShowForm(false); setForm(EMPTY_FORM); fetchCamps();
    } catch { alert("Error creating camp"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this camp and all its registrations?")) return;
    await deleteCamp(id); fetchCamps();
  };

  const toggleBloodGroup = (bg) => setForm(f => ({
    ...f, bloodGroupsNeeded: f.bloodGroupsNeeded.includes(bg)
      ? f.bloodGroupsNeeded.filter(x => x !== bg) : [...f.bloodGroupsNeeded, bg]
  }));

  const toggleFacility = (fac) => setForm(f => ({
    ...f, facilities: f.facilities.includes(fac)
      ? f.facilities.filter(x => x !== fac) : [...f.facilities, fac]
  }));

  const filtered = camps
    .filter(c => c.title?.toLowerCase().includes(search.toLowerCase()) || c.location?.city?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterStatus === "All" || getStatus(c) === filterStatus);

  const totalReg    = camps.reduce((s, c) => s + (c.registeredCount || 0), 0);
  const activeCamps = camps.filter(c => getStatus(c) === "Active").length;
  const upcoming    = camps.filter(c => getStatus(c) === "Upcoming").length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
              <Tent className="text-red-600" size={20} />
            </div>
            Camp Management
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-[52px]">Create, manage, and track blood donation camps</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchCamps}
            className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm text-sm">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 transition-all text-sm">
            <Plus size={16} /> New Camp
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Tent,        value: camps.length, label: "Total Camps",         color: "text-red-600",     bg: "bg-red-50"     },
          { icon: Users,       value: totalReg,     label: "Total Registrations", color: "text-blue-600",    bg: "bg-blue-50"    },
          { icon: Activity,    value: activeCamps,  label: "Active Now",          color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: CalendarDays,value: upcoming,     label: "Upcoming",            color: "text-amber-600",   bg: "bg-amber-50"   },
        ].map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400" size={15} />
          <input placeholder="Search by name or city..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:border-red-400 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Upcoming", "Active", "Completed"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${filterStatus === s ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* CAMP GRID */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">Loading camps…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
          <Tent size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">No camps found</p>
          <p className="text-slate-300 text-sm mt-1">Create a new camp to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(camp => {
            const status  = getStatus(camp);
            const cfg     = STATUS_CONFIG[status];
            const percent = Math.min(100, ((camp.registeredCount || 0) / (camp.capacity || 1)) * 100);
            return (
              <div key={camp._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                {/* Top bar */}
                <div className={`h-1.5 w-full ${cfg.bar}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Tent size={22} className="text-red-600" />
                      </div>
                      <div>
                        <h2 className="font-black text-slate-900 text-base leading-tight group-hover:text-red-600 transition-colors">{camp.title}</h2>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Building2 size={10} /> {camp.organizer}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot} ${status === "Active" ? "animate-pulse" : ""}`} />
                      {status}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-600 truncate">{camp.location?.city || "—"}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                      <CalendarDays size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-600">{new Date(camp.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                      <Clock size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-600 truncate">{camp.time || "—"}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                      <Users size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-600">{camp.registeredCount || 0}/{camp.capacity} registered</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity</span>
                      <span className={`text-[10px] font-black ${percent >= 90 ? "text-red-600" : percent >= 60 ? "text-amber-600" : "text-emerald-600"}`}>{Math.round(percent)}% filled</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full transition-all duration-700 ${percent >= 90 ? "bg-red-500" : percent >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  {/* Blood groups */}
                  {camp.bloodGroupsNeeded?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {camp.bloodGroupsNeeded.map(bg => (
                        <span key={bg} className="text-[10px] font-black px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full">{bg}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedCamp(camp)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl text-xs font-black text-slate-600 transition-all">
                      <Eye size={13} /> View Details
                    </button>
                    <button onClick={() => handleDelete(camp._id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedCamp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-300 text-xs font-black uppercase tracking-widest mb-1">Camp Details</p>
                  <h2 className="text-xl font-black text-white">{selectedCamp.title}</h2>
                  <p className="text-red-200 text-sm mt-1">{selectedCamp.location?.city} · {selectedCamp.organizer}</p>
                </div>
                <button onClick={() => setSelectedCamp(null)} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Start Date",    value: new Date(selectedCamp.startDate).toDateString() },
                  { label: "End Date",      value: new Date(selectedCamp.endDate).toDateString()   },
                  { label: "Time",          value: selectedCamp.time || "—"                        },
                  { label: "Capacity",      value: `${selectedCamp.registeredCount || 0} / ${selectedCamp.capacity}` },
                  { label: "Address",       value: selectedCamp.location?.address || "—"           },
                  { label: "Status",        value: getStatus(selectedCamp)                         },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>

              {selectedCamp.description && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                  <p className="text-sm text-slate-600">{selectedCamp.description}</p>
                </div>
              )}

              {selectedCamp.doctors?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medical Staff</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCamp.doctors.map((d, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium border border-blue-100">
                        {d.name}{d.specialization ? ` — ${d.specialization}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCamp.facilities?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCamp.facilities.map((f, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium border border-emerald-100">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Registered Donors ({selectedCamp.registrations?.length || 0})
                </p>
                {selectedCamp.registrations?.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedCamp.registrations.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 text-red-700 rounded-xl flex items-center justify-center font-black text-sm">
                            {r.userId?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{r.userId?.name || "User"}</p>
                            <p className="text-xs text-slate-400">{r.userId?.email || ""}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100">{r.bloodGroup}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No registrations yet</div>
                )}
              </div>

              <button onClick={() => setSelectedCamp(null)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-sm hover:bg-slate-700 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-white">Create New Camp</h2>
                <p className="text-red-200 text-sm">Fill in the details below</p>
              </div>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              <Section title="Basic Information" icon={<FileText size={16}/>}>
                <FormField label="Camp Title *"><input placeholder="e.g. City Blood Drive 2025" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="fi" /></FormField>
                <FormField label="Description"><textarea placeholder="Brief description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="fi resize-none" /></FormField>
              </Section>

              <Section title="Organizer Details" icon={<Building2 size={16}/>}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Organizer Name *"><input placeholder="Hospital / NGO name" value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})} className="fi" /></FormField>
                  <FormField label="Organizer Phone"><input placeholder="+91 XXXXX XXXXX" value={form.organizerPhone} onChange={e => setForm({...form, organizerPhone: e.target.value})} className="fi" /></FormField>
                  <FormField label="Organizer Email"><input placeholder="contact@org.com" value={form.organizerEmail} onChange={e => setForm({...form, organizerEmail: e.target.value})} className="fi" /></FormField>
                  <FormField label="Contact Person"><input placeholder="On-site contact name" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} className="fi" /></FormField>
                </div>
              </Section>

              <Section title="Location" icon={<MapPin size={16}/>}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="City *"><input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="fi" /></FormField>
                  <FormField label="Full Address"><input placeholder="Street, landmark..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="fi" /></FormField>
                </div>
              </Section>

              <Section title="Schedule" icon={<CalendarDays size={16}/>}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Start Date *"><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="fi" /></FormField>
                  <FormField label="End Date *"><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="fi" /></FormField>
                  <FormField label="Start Time"><input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="fi" /></FormField>
                  <FormField label="End Time"><input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="fi" /></FormField>
                  <FormField label="Capacity"><input type="number" placeholder="100" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="fi" /></FormField>
                </div>
              </Section>

              <Section title="Blood Groups Needed" icon={<Activity size={16}/>}>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_GROUPS.map(bg => (
                    <button key={bg} type="button" onClick={() => toggleBloodGroup(bg)}
                      className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${form.bloodGroupsNeeded.includes(bg) ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
                      {bg}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Medical Staff" icon={<Stethoscope size={16}/>}>
                <FormField label="Doctors (comma-separated)"><input placeholder="Dr. Sharma, Dr. Patel" value={form.doctors} onChange={e => setForm({...form, doctors: e.target.value})} className="fi" /></FormField>
              </Section>

              <Section title="Facilities Available" icon={<CheckCircle2 size={16}/>}>
                <div className="flex flex-wrap gap-2">
                  {FACILITIES.map(fac => (
                    <button key={fac} type="button" onClick={() => toggleFacility(fac)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${form.facilities.includes(fac) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"}`}>
                      {fac}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Additional Notes" icon={<FileText size={16}/>}>
                <FormField label="Internal Notes"><textarea placeholder="Any additional notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="fi resize-none" /></FormField>
              </Section>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="flex-1 border border-slate-200 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm">Cancel</button>
                <button onClick={handleCreate} disabled={submitting}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-200">
                  {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Plus size={16} />}
                  {submitting ? "Creating..." : "Create Camp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fi { width:100%; border:1.5px solid #e2e8f0; border-radius:0.75rem; padding:0.625rem 0.875rem; font-size:0.875rem; color:#334155; background:#f8fafc; outline:none; transition:border-color 0.2s; }
        .fi:focus { border-color:#dc2626; background:white; }
      `}</style>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="text-red-600">{icon}</span>
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
