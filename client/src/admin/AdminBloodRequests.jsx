import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Droplets, Search, Filter, CheckCircle, Trash2,
  UserCheck, Clock, MapPin, Hospital, Phone,
  AlertTriangle, RefreshCcw, Eye, X, ChevronDown,
  FileText, Users, Activity, ShieldAlert, Calendar, Zap
} from "lucide-react";

const STATUS_CONFIG = {
  Pending:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   bar: "bg-amber-400"   },
  Approved:  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    bar: "bg-blue-500"    },
  Assigned:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  bar: "bg-purple-500"  },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500" },
  Rejected:  { bg: "bg-slate-100",  text: "text-slate-500",   border: "border-slate-200",   bar: "bg-slate-400"   },
};

const URGENCY_CONFIG = {
  Critical: { bg: "bg-red-600",    text: "text-white",     label: "bg-red-50 text-red-600 border-red-200"       },
  Urgent:   { bg: "bg-orange-500", text: "text-white",     label: "bg-orange-50 text-orange-600 border-orange-200" },
  Normal:   { bg: "bg-emerald-500","text": "text-white",   label: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

function AdminBloodRequests() {
  const [requests, setRequests]         = useState([]);
  const [donors, setDonors]             = useState([]);
  const [selectedDonor, setSelectedDonor] = useState({});
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [viewRequest, setViewRequest]   = useState(null);
  const [loading, setLoading]           = useState(false);
  const [notifying, setNotifying]       = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get("/request/all");
      setRequests(res.data);
    } catch (err) { }
    finally { setLoading(false); }
  };

  const fetchDonors = async () => {
    try {
      const res = await API.get("/donor/all");
      setDonors(res.data);
    } catch (err) { }
  };

  useEffect(() => { fetchRequests(); fetchDonors(); }, []);

  const approveRequest = async (id) => {
    try {
      await API.put(`/request/update/${id}`, { status: "Approved" });
      fetchRequests();
    } catch (err) { }
  };

  const rejectRequest = async (id) => {
    if (!window.confirm("Reject this request?")) return;
    try {
      await API.put(`/request/update/${id}`, { status: "Rejected" });
      fetchRequests();
    } catch (err) { }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Delete this request permanently?")) return;
    try {
      await API.delete(`/request/delete/${id}`);
      fetchRequests();
    } catch (err) { alert("Failed to delete request"); }
  };

  const assignDonor = async (requestId) => {
    const donorId = selectedDonor[requestId];
    if (!donorId) { alert("Please select a donor first"); return; }
    try {
      await API.put(`/request/assign/${requestId}`, { donorId });
      fetchRequests();
    } catch (err) { }
  };

  const autoNotify = async (requestId) => {
    setNotifying(requestId);
    try {
      const res = await API.post(`/admin/match/${requestId}`);
      alert(res.data.message || "Donors notified successfully!");
      fetchRequests();
    } catch (err) {
      alert("Failed to notify donors. Please try again.");
    }
    setNotifying("");
  };

  const filtered = requests
    .filter(r => filterStatus  === "All" || r.status  === filterStatus)
    .filter(r => filterUrgency === "All" || r.urgency === filterUrgency)
    .filter(r =>
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital?.toLowerCase().includes(search.toLowerCase()) ||
      r.bloodGroup?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === "Pending").length,
    critical:  requests.filter(r => r.urgency === "Critical").length,
    completed: requests.filter(r => r.status === "Completed").length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Blood Requests <span className="text-red-600">Portal</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage and fulfill live blood donation requirements</p>
          </div>
          <button onClick={fetchRequests} className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm text-sm">
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FileText size={20}/>}     value={counts.total}     label="Total Requests"  color="text-blue-600 bg-blue-50" />
          <StatCard icon={<Clock size={20}/>}         value={counts.pending}   label="Pending"         color="text-amber-600 bg-amber-50" pulse={counts.pending > 0} />
          <StatCard icon={<ShieldAlert size={20}/>}  value={counts.critical}  label="Critical"        color="text-red-600 bg-red-50" />
          <StatCard icon={<CheckCircle size={20}/>}  value={counts.completed} label="Completed"       color="text-emerald-600 bg-emerald-50" />
        </div>

        {/* CRITICAL BANNER */}
        {counts.critical > 0 && (
          <div className="bg-red-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-red-200">
            <AlertTriangle size={18} className="text-white shrink-0 animate-pulse" />
            <p className="text-sm font-black text-white">
              {counts.critical} critical request{counts.critical > 1 ? "s" : ""} require immediate attention
            </p>
          </div>
        )}

        {/* SEARCH + FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" size={15} />
            <input
              placeholder="Search patient, hospital, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:border-red-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Pending", "Approved", "Assigned", "Completed", "Rejected"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${filterStatus === s ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Critical", "Urgent", "Normal"].map(u => (
              <button key={u} onClick={() => setFilterUrgency(u)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${filterUrgency === u ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* REQUESTS GRID */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
            <Droplets size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">No requests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(req => {
              const sCfg = STATUS_CONFIG[req.status]  || STATUS_CONFIG.Pending;
              const uCfg = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.Normal;
              const matchingDonors = donors.filter(d => d.bloodGroup === req.bloodGroup);
              const availableDonors = matchingDonors.filter(d => d.availability === true || d.availability === "true");

              return (
                <div key={req._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">

                  {/* urgency bar */}
                  <div className={`h-1 w-full ${uCfg.bg}`} />

                  <div className="p-5 flex-1 space-y-4">

                    {/* top row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-base font-black text-slate-800 group-hover:text-red-600 transition-colors">
                          {req.patientName}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Patient</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${uCfg.label}`}>
                          {req.urgency || "Normal"}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* blood group + units */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-md ${uCfg.bg} ${uCfg.text}`}>
                        {req.bloodGroup}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-800">{req.units} <span className="text-sm font-medium text-slate-400">units</span></p>
                        <p className="text-xs text-slate-400 font-medium">Required</p>
                      </div>
                    </div>

                    {/* info chips */}
                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-50 rounded-lg"><MapPin size={12}/></div>
                        <span className="truncate font-medium">{req.hospital}, {req.city}</span>
                      </div>
                      {req.requiredDate && (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-50 rounded-lg"><Calendar size={12}/></div>
                          <span className="font-medium">{new Date(req.requiredDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      )}
                      {req.contactPhone && (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-50 rounded-lg"><Phone size={12}/></div>
                          <span className="font-medium">{req.contactName} · {req.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* notes */}
                    {req.notes && (
                      <div className="bg-slate-50 border-l-4 border-slate-300 p-3 rounded-r-xl text-xs text-slate-500 italic line-clamp-2">
                        "{req.notes}"
                      </div>
                    )}

                    {/* assigned donor */}
                    {req.assignedDonor && (
                      <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-emerald-800 truncate">
                          Assigned: {req.assignedDonor.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">

                    {/* assign donor (Approved only) */}
                    {req.status === "Approved" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          Assign Donor ({availableDonors.length} available · {matchingDonors.length} total)
                        </label>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:border-red-400 font-medium"
                            onChange={e => setSelectedDonor({ ...selectedDonor, [req._id]: e.target.value })}
                          >
                            <option value="">Choose donor...</option>
                            {availableDonors.length > 0 && (
                              <optgroup label="✅ Available">
                                {availableDonors.map(d => (
                                  <option key={d._id} value={d._id}>{d.name} · {d.city}</option>
                                ))}
                              </optgroup>
                            )}
                            {matchingDonors.filter(d => !(d.availability === true || d.availability === "true")).length > 0 && (
                              <optgroup label="⏳ Unavailable">
                                {matchingDonors.filter(d => !(d.availability === true || d.availability === "true")).map(d => (
                                  <option key={d._id} value={d._id}>{d.name} · {d.city} (unavailable)</option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                          <button onClick={() => assignDonor(req._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl text-sm font-black shadow-sm transition-all">
                            Assign
                          </button>
                        </div>
                      </div>
                    )}

                    {/* action buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => setViewRequest(req)}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-white transition-all">
                        <Eye size={13}/> View
                      </button>

                      {req.status === "Pending" && (
                        <>
                          <button onClick={() => approveRequest(req._id)}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-blue-200 py-2 rounded-xl text-xs font-black text-blue-600 hover:bg-blue-50 transition-all">
                            <CheckCircle size={13}/> Approve
                          </button>
                          <button onClick={() => rejectRequest(req._id)}
                            className="flex items-center justify-center border border-slate-200 p-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 transition-all">
                            <X size={13}/>
                          </button>
                        </>
                      )}

                      {/* Auto-Notify button for Pending/Approved */}
                      {["Pending", "Approved"].includes(req.status) && (
                        <button
                          onClick={() => autoNotify(req._id)}
                          disabled={notifying === req._id}
                          title="Auto-notify all matching available donors"
                          className="flex items-center justify-center gap-1.5 border border-purple-200 px-3 py-2 rounded-xl text-xs font-black text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
                        >
                          {notifying === req._id
                            ? <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                            : <Zap size={13} />}
                          Notify
                        </button>
                      )}

                      <button onClick={() => deleteRequest(req._id)}
                        className="flex items-center justify-center border border-red-100 p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW DETAIL MODAL */}
      {viewRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* modal header */}
            <div className={`p-6 flex justify-between items-start ${URGENCY_CONFIG[viewRequest.urgency]?.bg || "bg-red-600"}`}>
              <div>
                <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Blood Request</p>
                <h2 className="text-xl font-black text-white">{viewRequest.patientName}</h2>
                <p className="text-white/80 text-sm mt-1">{viewRequest.hospital} · {viewRequest.city}</p>
              </div>
              <button onClick={() => setViewRequest(null)} className="text-white/70 hover:text-white mt-1">
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Blood Group"   value={viewRequest.bloodGroup} />
                <Detail label="Units"         value={`${viewRequest.units} units`} />
                <Detail label="Urgency"       value={viewRequest.urgency || "Normal"} />
                <Detail label="Status"        value={viewRequest.status} />
                <Detail label="Required Date" value={viewRequest.requiredDate ? new Date(viewRequest.requiredDate).toLocaleDateString() : "—"} />
                <Detail label="Submitted"     value={new Date(viewRequest.createdAt).toLocaleDateString()} />
                <Detail label="Contact"       value={viewRequest.contactName || "—"} />
                <Detail label="Phone"         value={viewRequest.contactPhone || "—"} />
              </div>

              {viewRequest.notes && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-sm text-slate-600">{viewRequest.notes}</p>
                </div>
              )}

              {viewRequest.assignedDonor && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
                  <UserCheck size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Assigned Donor</p>
                    <p className="text-sm font-black text-emerald-800">{viewRequest.assignedDonor.name}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {viewRequest.status === "Pending" && (
                  <button onClick={() => { approveRequest(viewRequest._id); setViewRequest(null); }}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-sm hover:bg-blue-700 transition-all">
                    Approve Request
                  </button>
                )}
                <button onClick={() => setViewRequest(null)}
                  className="flex-1 border border-slate-200 py-3 rounded-xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBloodRequests;

/* ── Sub-components ── */

function StatCard({ icon, value, label, color, pulse }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl relative ${color}`}>
        {icon}
        {pulse && value > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}
