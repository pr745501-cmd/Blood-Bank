import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Users, CheckCircle, MapPin, Droplets,
  Clock, Send, X, UserCheck, Phone, Heart,
  RefreshCcw, Bell, ShieldAlert, Trash2, Search,
  Radio, AlertTriangle, CheckCircle2, Eye,
  Megaphone, Zap, Activity
} from "lucide-react";
import { io } from "socket.io-client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const URGENCY_CONFIG = {
  Critical: { bg: "bg-red-600",    text: "text-white", badge: "bg-red-50 text-red-600 border-red-200",       dot: "bg-red-500",    bar: "bg-red-500",    glow: "shadow-red-200"    },
  High:     { bg: "bg-orange-500", text: "text-white", badge: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500", bar: "bg-orange-500", glow: "shadow-orange-200" },
  Medium:   { bg: "bg-blue-500",   text: "text-white", badge: "bg-blue-50 text-blue-600 border-blue-200",     dot: "bg-blue-500",   bar: "bg-blue-400",   glow: "shadow-blue-200"   },
};

const EMPTY_FORM = { hospital: "", bloodGroup: "", units: "", urgency: "", description: "", location: "" };
const EMPTY_BROADCAST = { title: "", message: "", type: "general", targetGroup: "all", bloodGroup: "", city: "" };
const BROADCAST_TYPES = {
  general:   { label: "General",   color: "bg-blue-50 text-blue-700 border-blue-200"           },
  emergency: { label: "Emergency", color: "bg-red-50 text-red-700 border-red-200"              },
  camp:      { label: "Camp",      color: "bg-emerald-50 text-emerald-700 border-emerald-200"  },
  reminder:  { label: "Reminder",  color: "bg-amber-50 text-amber-700 border-amber-200"        },
};

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminAlerts() {
  const [activeTab, setActiveTab]         = useState("alerts");
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [alerts, setAlerts]               = useState([]);
  const [responses, setResponses]         = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showResponses, setShowResponses] = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [liveMessage, setLiveMessage]     = useState(null);
  const [search, setSearch]               = useState("");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterStatus, setFilterStatus]   = useState("Active");
  const [submitting, setSubmitting]       = useState(false);
  const [users, setUsers]                 = useState([]);
  const [broadcast, setBroadcast]         = useState(EMPTY_BROADCAST);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [bSending, setBSending]           = useState(false);
  const [bSuccess, setBSuccess]           = useState("");

  const token = localStorage.getItem("token");

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alerts", { headers: { Authorization: `Bearer ${token}` } });
      setAlerts(res.data);
    } catch (err) { }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data || []);
    } catch (err) { }
  };

  useEffect(() => {
    fetchAlerts();
    fetchUsers();
    const socket = io("http://localhost:5000");
    socket.on("donorResponded", (data) => {
      setLiveMessage(`${data.name} responded for ${data.bloodGroup}`);
      setTimeout(() => setLiveMessage(null), 5000);
      fetchAlerts();
    });
    return () => socket.disconnect();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hospital || !form.bloodGroup || !form.urgency) { alert("Fill Hospital, Blood Group and Priority."); return; }
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/admin/alerts", form, { headers: { Authorization: `Bearer ${token}` } });
      setForm(EMPTY_FORM); setShowForm(false); fetchAlerts();
    } catch (err) { }
    finally { setSubmitting(false); }
  };

  const viewResponses = async (alert) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/alerts/responses/${alert._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setResponses(res.data); setSelectedAlert(alert); setShowResponses(true);
    } catch (err) { }
  };

  const resolveAlert = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/alerts/resolve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAlerts();
    } catch (err) { }
  };

  const deleteAlert = async (id) => {
    if (!window.confirm("Delete this alert permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/alerts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAlerts();
    } catch (err) { }
  };

  const broadcastRecipients = (() => {
    let list = users;
    if (broadcast.targetGroup === "blood_group" && broadcast.bloodGroup)
      list = list.filter(u => u.bloodGroup === broadcast.bloodGroup);
    else if (broadcast.targetGroup === "city" && broadcast.city.trim())
      list = list.filter(u => u.city?.toLowerCase().includes(broadcast.city.toLowerCase()));
    return list;
  })();

  const handleBroadcastSend = async (e) => {
    e.preventDefault();
    if (!broadcast.title.trim() || !broadcast.message.trim()) return;
    if (broadcastRecipients.length === 0) { alert("No recipients match."); return; }
    setBSending(true); setBSuccess("");
    try {
      await axios.post("http://localhost:5000/api/admin/broadcast", { ...broadcast, recipientCount: broadcastRecipients.length }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    setBSuccess(`Sent to ${broadcastRecipients.length} user${broadcastRecipients.length > 1 ? "s" : ""}!`);
    setBroadcastHistory(prev => [{ id: Date.now(), ...broadcast, recipientCount: broadcastRecipients.length, sentAt: new Date() }, ...prev]);
    setBroadcast(EMPTY_BROADCAST); setBSending(false);
    setTimeout(() => setBSuccess(""), 4000);
  };

  const filtered = alerts
    .filter(a => filterStatus === "All" || a.status === filterStatus)
    .filter(a => filterUrgency === "All" || a.urgency === filterUrgency)
    .filter(a => a.hospital?.toLowerCase().includes(search.toLowerCase()) || a.bloodGroup?.toLowerCase().includes(search.toLowerCase()) || a.location?.toLowerCase().includes(search.toLowerCase()));

  const activeCount    = alerts.filter(a => a.status === "Active").length;
  const resolvedCount  = alerts.filter(a => a.status === "Resolved").length;
  const criticalCount  = alerts.filter(a => a.urgency === "Critical" && a.status === "Active").length;
  const totalResponses = alerts.reduce((s, a) => s + (a.responses?.length || 0), 0);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
              <Heart className="text-red-600 fill-red-600" size={20} />
            </div>
            Emergency Dispatch
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-[52px]">Manage blood emergency alerts and broadcast notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAlerts} className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm text-sm">
            <RefreshCcw size={15} /> Refresh
          </button>
          {activeTab === "alerts" && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 transition-all text-sm">
              <Plus size={16} /> New Alert
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Radio,        value: activeCount,    label: "Active Alerts",   color: "text-red-600",     bg: "bg-red-50",     pulse: activeCount > 0    },
          { icon: ShieldAlert,  value: criticalCount,  label: "Critical",        color: "text-orange-600",  bg: "bg-orange-50",  pulse: criticalCount > 0  },
          { icon: CheckCircle2, value: resolvedCount,  label: "Resolved",        color: "text-emerald-600", bg: "bg-emerald-50", pulse: false              },
          { icon: UserCheck,    value: totalResponses, label: "Total Responses", color: "text-blue-600",    bg: "bg-blue-50",    pulse: false              },
        ].map(({ icon: Icon, value, label, color, bg, pulse }) => (
          <div key={label} className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            {pulse && value > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
        {[["alerts", Bell, "Alerts"], ["broadcast", Megaphone, "Broadcast"]].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all
              ${activeTab === key ? "bg-red-600 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── ALERTS TAB ── */}
      {activeTab === "alerts" && (
        <div className="space-y-5">

          {/* Critical banner */}
          {criticalCount > 0 && (
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-red-200">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={16} className="text-white animate-pulse" />
              </div>
              <p className="text-sm font-black text-white">
                {criticalCount} CRITICAL alert{criticalCount > 1 ? "s" : ""} active — immediate donor mobilization required
              </p>
            </div>
          )}

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400" size={15} />
              <input placeholder="Search hospital, blood group, location..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:border-red-400 transition-all" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Active", "Resolved"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${filterStatus === s ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Critical", "High", "Medium"].map(u => (
                <button key={u} onClick={() => setFilterUrgency(u)}
                  className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${filterUrgency === u ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Alert cards */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
              <Activity size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">No alerts found</p>
              <p className="text-slate-300 text-sm mt-1">Create a new alert to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(alert => {
                const cfg = URGENCY_CONFIG[alert.urgency] || URGENCY_CONFIG.Medium;
                const isResolved = alert.status === "Resolved";
                const responseCount = alert.responses?.length || 0;
                return (
                  <div key={alert._id}
                    className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${isResolved ? "border-slate-100 opacity-60" : "border-slate-100 shadow-sm"}`}>
                    {/* Top color bar */}
                    <div className={`h-1.5 w-full ${cfg.bar}`} />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 shadow-lg ${cfg.glow} ${cfg.bg} ${cfg.text}`}>
                            {alert.bloodGroup}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base leading-tight">{alert.hospital}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{timeAgo(alert.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg.badge}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot} ${!isResolved && alert.urgency === "Critical" ? "animate-pulse" : ""}`} />
                            {alert.urgency}
                          </span>
                          {isResolved && (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200 uppercase">✓ Resolved</span>
                          )}
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-600 truncate">{alert.location || "—"}</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                          <Droplets size={12} className="text-red-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-600">{alert.units} units needed</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                          <UserCheck size={12} className="text-blue-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-600">{responseCount} response{responseCount !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                          <Clock size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-600 truncate">{new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {alert.description && (
                        <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl px-3 py-2 mb-4 line-clamp-2">"{alert.description}"</p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => viewResponses(alert)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl text-xs font-black text-slate-600 transition-all">
                          <Eye size={13} /> Responses
                          {responseCount > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{responseCount}</span>}
                        </button>
                        {!isResolved && (
                          <button onClick={() => resolveAlert(alert._id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-2.5 rounded-xl text-xs font-black text-emerald-700 transition-all">
                            <CheckCircle size={13} /> Resolve
                          </button>
                        )}
                        <button onClick={() => deleteAlert(alert._id)}
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
        </div>
      )}

      {/* ── BROADCAST TAB ── */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-black text-slate-800 mb-5 flex items-center gap-2">
              <Megaphone size={18} className="text-red-600" /> Compose Broadcast
            </h2>
            <form onSubmit={handleBroadcastSend} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(BROADCAST_TYPES).map(([key, cfg]) => (
                    <button type="button" key={key} onClick={() => setBroadcast(b => ({ ...b, type: key }))}
                      className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all ${broadcast.type === key ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title *</label>
                <input value={broadcast.title} onChange={e => setBroadcast(b => ({ ...b, title: e.target.value }))}
                  placeholder="e.g. Urgent: O- Blood Needed" maxLength={80} required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-red-400 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message *</label>
                <textarea value={broadcast.message} onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))}
                  placeholder="Write your message..." rows={4} maxLength={300} required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-red-400 transition-all resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Audience</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {[{ key: "all", label: "All Users" }, { key: "blood_group", label: "Blood Group" }, { key: "city", label: "By City" }].map(({ key, label }) => (
                    <button type="button" key={key} onClick={() => setBroadcast(b => ({ ...b, targetGroup: key }))}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${broadcast.targetGroup === key ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {broadcast.targetGroup === "blood_group" && (
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map(g => (
                      <button type="button" key={g} onClick={() => setBroadcast(b => ({ ...b, bloodGroup: g }))}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${broadcast.bloodGroup === g ? "bg-red-600 text-white border-red-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-red-300"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                )}
                {broadcast.targetGroup === "city" && (
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={broadcast.city} onChange={e => setBroadcast(b => ({ ...b, city: e.target.value }))}
                      placeholder="Enter city name..."
                      className="w-full border border-slate-200 rounded-xl p-3 pl-9 text-sm font-semibold text-slate-700 focus:outline-none focus:border-red-400 transition-all" />
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${broadcastRecipients.length > 0 ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-200"}`}>
                <Users size={16} className={broadcastRecipients.length > 0 ? "text-emerald-600" : "text-slate-400"} />
                <p className={`text-sm font-black ${broadcastRecipients.length > 0 ? "text-emerald-800" : "text-slate-500"}`}>
                  {broadcastRecipients.length} recipient{broadcastRecipients.length !== 1 ? "s" : ""} will receive this
                </p>
              </div>
              {bSuccess && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-black text-emerald-800">{bSuccess}</p>
                </div>
              )}
              <button type="submit" disabled={bSending || !broadcast.title.trim() || !broadcast.message.trim()}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50">
                {bSending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                {bSending ? "Sending…" : `Send to ${broadcastRecipients.length} User${broadcastRecipients.length !== 1 ? "s" : ""}`}
              </button>
            </form>
          </div>

          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <h2 className="font-black text-slate-800">Broadcast History</h2>
              <p className="text-xs text-slate-400 mt-0.5">{broadcastHistory.length} sent this session</p>
            </div>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {broadcastHistory.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold text-sm">No broadcasts yet</p>
                </div>
              ) : broadcastHistory.map(h => {
                const cfg = BROADCAST_TYPES[h.type] || BROADCAST_TYPES.general;
                return (
                  <div key={h.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                        <p className="font-black text-slate-800 text-sm truncate mt-1">{h.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{h.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-slate-400"><Users size={9} className="inline mr-1" />{h.recipientCount} recipients</span>
                          <span className="text-[10px] text-slate-300">{new Date(h.sentAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button onClick={() => setBroadcastHistory(prev => prev.filter(x => x.id !== h.id))}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* NEW ALERT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white">New Emergency Alert</h2>
                <p className="text-red-200 text-sm mt-0.5">Alert will be sent to all matching donors</p>
              </div>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Hospital Name *</label>
                <input name="hospital" value={form.hospital} onChange={handleChange} placeholder="e.g. City General Hospital"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-all text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Blood Group *</label>
                  <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-all text-sm font-black text-red-600">
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Units Required</label>
                  <input name="units" type="number" min="1" value={form.units} onChange={handleChange} placeholder="e.g. 5"
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-all text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Priority Level *</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {["Critical", "High", "Medium"].map(u => (
                    <button key={u} type="button" onClick={() => setForm({ ...form, urgency: u })}
                      className={`py-3 rounded-xl text-sm font-black border transition-all ${form.urgency === u
                        ? u === "Critical" ? "bg-red-600 text-white border-red-600"
                          : u === "High" ? "bg-orange-500 text-white border-orange-500"
                          : "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Location</label>
                <div className="relative mt-1.5">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="location" value={form.location} onChange={handleChange} placeholder="Hospital address..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-all text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Clinical Notes</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Patient details, urgency context..." rows={3}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 p-4 rounded-xl focus:bg-white focus:border-red-400 outline-none transition-all text-sm font-medium resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="flex-1 border border-slate-200 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm">
                  {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Send size={16} />}
                  {submitting ? "Broadcasting..." : "Broadcast Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESPONSES MODAL */}
      {showResponses && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Donor Responses</h3>
                  <p className="text-xs text-slate-400">{selectedAlert?.hospital} · {selectedAlert?.bloodGroup}</p>
                </div>
              </div>
              <button onClick={() => setShowResponses(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-6 max-h-[55vh] overflow-y-auto space-y-3">
              {responses.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Users size={36} className="mx-auto mb-3 text-slate-200" />
                  <p className="font-bold text-sm">No responses yet</p>
                </div>
              ) : responses.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center font-black text-sm">{r.bloodGroup}</div>
                    <div>
                      <p className="font-black text-sm text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={10} /> {r.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ml-auto mb-1" />
                    <p className="text-[10px] text-slate-400">{r.respondedAt ? new Date(r.respondedAt).toLocaleTimeString() : ""}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100">
              <button onClick={() => setShowResponses(false)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-sm hover:bg-slate-700 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE TOAST */}
      {liveMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100]">
          <Bell size={18} className="text-red-500 animate-bounce" />
          <p className="text-sm font-bold">{liveMessage}</p>
        </div>
      )}
    </div>
  );
}
