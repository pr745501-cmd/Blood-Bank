import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Droplets, FileText, Search, Brain,
  Mail, LogOut, Award, Tent, Bell, User, Menu, X,
  HeartPulse, Settings, AlertCircle, ClipboardList, MapPin,
  ChevronRight, ChevronDown,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext.jsx";

const NAV = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard"        },
      { to: "/alerts",    icon: AlertCircle,     label: "Emergency Alerts" },
    ],
  },
  {
    group: "Health",
    items: [
      { to: "/eligibility-quiz", icon: ClipboardList, label: "Eligibility Quiz" },
    ],
  },
  {
    group: "Donation",
    items: [
      { to: "/donor",        icon: Droplets,   label: "Become Donor" },
      { to: "/my-donations", icon: HeartPulse, label: "My Donations" },
      { to: "/certificates", icon: Award,      label: "Certificates" },
      { to: "/camps",        icon: Tent,        label: "Blood Camps"  },
    ],
  },
  {
    group: "Blood Services",
    items: [
      { to: "/request",            icon: FileText, label: "Request Blood"      },
      { to: "/my-requests",        icon: FileText, label: "My Requests"        },
      { to: "/find-donor",         icon: Search,   label: "Find Donor"         },
      { to: "/compatibility",      icon: Brain,    label: "Compatibility"      },
      { to: "/blood-bank-locator", icon: MapPin,   label: "Blood Bank Locator" },
    ],
  },
  {
    group: "Support",
    items: [
      { to: "/contact", icon: Mail, label: "Contact Us" },
    ],
  },
];

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellOpen,   setBellOpen]   = useState(false);
  const [isDonor,    setIsDonor]    = useState(false);
  const bellRef  = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const { notifications, unread, markRead, markAllRead, clearAll } = useNotifications();

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    import("axios").then(({ default: axios }) => {
      axios.get(`http://localhost:5000/api/donor/user/${userId}`)
        .then(() => setIsDonor(true))
        .catch(() => setIsDonor(false));
    });
  }, [user?._id, user?.id]);

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  useEffect(() => {
    function handler(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout   = () => { localStorage.clear(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  const pageTitle = (() => {
    const seg = location.pathname.replace("/", "").replace(/-/g, " ");
    return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "Dashboard";
  })();

  function timeAgo(ts) {
    const d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60)    return "just now";
    if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  }

  return (
    <div className="flex h-screen font-sans antialiased overflow-hidden bg-slate-50">

      {/* ── Mobile overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col
        bg-white border-r border-slate-200 shadow-sm
        transition-transform duration-300 ease-in-out
        ${drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* ── Brand ── */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center shadow-sm group-hover:bg-rose-700 transition-colors">
              <Droplets size={16} className="text-white" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none tracking-tight">
                Blood<span className="text-rose-600">Connect</span>
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Medical Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── User card ── */}
        <div
          onClick={() => navigate("/profile")}
          className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm border border-rose-200">
                {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-none mb-0.5">
                {user?.name || "Member"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {user?.bloodGroup || "—"} · {user?.role === "admin" ? "Admin" : "Member"}
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 custom-scrollbar">
          {NAV.map(({ group, items }) => {
            const filteredItems = items.filter(item =>
              !(item.to === "/eligibility-quiz" && isDonor)
            );
            if (filteredItems.length === 0) return null;
            return (
              <div key={group}>
                <p className="px-2 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {filteredItems.map(({ to, icon: Icon, label }) => {
                    const active = isActive(to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${active
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"}
                        `}
                      >
                        <Icon
                          size={17}
                          strokeWidth={active ? 2.5 : 2}
                          className={active ? "text-blue-600" : "text-slate-400"}
                        />
                        <span className="flex-1 truncate">{label}</span>
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Admin shortcut */}
          {user?.role === "admin" && (
            <div className="pt-3 border-t border-slate-100">
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors"
              >
                <Settings size={17} className="text-amber-600" />
                <span className="flex-1">Admin Panel</span>
                <ChevronRight size={14} className="text-amber-400" />
              </Link>
            </div>
          )}
        </nav>

        {/* ── Sign out ── */}
        <div className="px-3 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="h-16 flex items-center justify-between px-5 lg:px-8 shrink-0 sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                Current Page
              </p>
              <h1 className="text-base font-bold text-slate-900 capitalize leading-none">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Blood group badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg mr-1">
              <Droplets size={14} className="text-rose-500" />
              <span className="text-sm font-bold text-rose-700">{user?.bloodGroup || "—"}</span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen(o => !o)}
                className={`relative p-2 rounded-lg border transition-all
                  ${unread > 0
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {/* Bell dropdown */}
              {bellOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl shadow-xl z-50 overflow-hidden bg-white border border-slate-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                      {unread > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-semibold">
                          {unread} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors">
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Bell size={24} className="text-slate-200" />
                        <p className="text-xs text-slate-400 font-medium">No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { markRead(n.id); setBellOpen(false); navigate(n.link || "/alerts"); }}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-l-2
                          ${!n.read ? "border-rose-500 bg-rose-50/30" : "border-transparent"}`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5
                          ${n.type === "alert" ? "bg-rose-100 text-rose-600"
                          : n.type === "certificate" ? "bg-amber-100 text-amber-600"
                          : n.type === "requestUpdate" ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-500"}`}>
                          {n.type === "alert" ? <AlertCircle size={14} />
                          : n.type === "certificate" ? <Award size={14} />
                          : n.type === "requestUpdate" ? <Bell size={14} />
                          : <Bell size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${!n.read ? "text-slate-900" : "text-slate-600"}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                          <p className="text-[10px] text-slate-300 mt-1 font-medium">{timeAgo(n.ts)}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-rose-500 rounded-full mt-1 shrink-0" />}
                      </div>
                    ))}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => { setBellOpen(false); navigate("/alerts"); }}
                        className="w-full text-center text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                      >
                        View all alerts →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm border border-rose-200">
                {user?.name?.charAt(0)?.toUpperCase() || <User size={15} />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  {user?.name?.split(" ")[0] || "User"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Profile</p>
              </div>
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
