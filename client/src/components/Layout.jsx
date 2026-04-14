import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Droplets, FileText, Search, Brain,
  Mail, LogOut, Award, Tent, Bell, User, Menu, X,
  HeartPulse, Settings, AlertCircle, ClipboardList, MapPin,
  ChevronRight,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext.jsx";

const NAV = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard"        },
      { to: "/alerts",       icon: AlertCircle,     label: "Emergency Alerts" },
    ],
  },
  {
    group: "Health & Eligibility",
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
      { to: "/camps",        icon: Tent,       label: "Blood Camps"  },
    ],
  },
  {
    group: "Blood Services",
    items: [
      { to: "/request",            icon: FileText, label: "Request Blood"       },
      { to: "/my-requests",        icon: FileText, label: "My Requests"         },
      { to: "/find-donor",         icon: Search,   label: "Find Donor"          },
      { to: "/compatibility",      icon: Brain,    label: "Compatibility"       },
      { to: "/blood-bank-locator", icon: MapPin,   label: "Blood Bank Locator"  },
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
  const bellRef  = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const { notifications, unread, markRead, markAllRead, clearAll } = useNotifications();

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
    <div className="flex h-screen font-sans antialiased overflow-hidden bg-slate-100">

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/30 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ══════════════ SIDEBAR (REBUILT FOR MODERN UI) ══════════════ */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col bg-white
        transition-all duration-300 ease-in-out border-r border-slate-200/60
        ${drawerOpen ? "translate-x-0 shadowed-sidebar" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* ── Brand ── */}
        <div className="h-20 flex items-center px-6 mb-2">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform">
              <Droplets size={22} fill="currentColor" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900 leading-none">
                Blood<span className="text-rose-600">Connect</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-400">
                User Dashboard
              </p>
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="lg:hidden ml-auto p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Search Bar (Modern addition) ── */}
        <div className="px-6 mb-6">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search features..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white focus:border-rose-200 transition-all"
            />
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-7 pb-6 custom-scrollbar">
          {NAV.map(({ group, items }) => (
            <div key={group} className="space-y-2">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {group}
              </h3>
              <div className="space-y-1">
                {items.map(({ to, icon: Icon, label }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200
                        ${active 
                          ? "bg-rose-50 text-rose-600 shadow-sm border border-rose-100/50" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"}
                      `}
                    >
                      <div className={`
                        p-1.5 rounded-lg transition-colors
                        ${active ? "bg-white shadow-sm text-rose-600" : "bg-transparent text-slate-400 group-hover:text-slate-600"}
                      `}>
                        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                      </div>
                      <span className="flex-1 truncate">{label}</span>
                      {active && (
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin shortcut */}
          {user?.role === "admin" && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all group"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-amber-600 group-hover:rotate-45 transition-transform">
                  <Settings size={18} />
                </div>
                <span className="text-[13px] font-bold">Admin Panel</span>
                <ChevronRight size={14} className="ml-auto opacity-50" />
              </Link>
            </div>
          )}
        </nav>

        {/* ── User Footer Card ── */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/60 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-black text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || <User size={18} />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate tracking-tight">
                {user?.name || "Member"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {user?.bloodGroup || "O+"} · {user?.role || "Member"}
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Page</span>
              <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Stats (Desktop) */}
            <div className="hidden md:flex items-center gap-2 mr-4 pr-4 border-r border-slate-100">
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                 <span className="text-sm font-black text-rose-600">{user?.bloodGroup || "O+"}</span>
               </div>
               <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                 <Droplets size={16} />
               </div>
            </div>

            {/* Notifications */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => { setBellOpen(o => !o); if (!bellOpen) markAllRead(); }}
                className={`
                  relative p-2.5 rounded-xl transition-all border
                  ${unread > 0 
                    ? "bg-rose-50 border-rose-100 text-rose-600 shadow-sm" 
                    : "bg-white border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50"}
                `}
              >
                <Bell size={20} strokeWidth={unread > 0 ? 2.5 : 2} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-rose-600 rounded-full border-2 border-white text-white text-[9px] font-black flex items-center justify-center px-1">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-14 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden bg-white border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-black text-slate-900">Notifications</h3>
                       {unread > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">{unread} New</span>}
                    </div>
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-[10px] text-slate-400 hover:text-rose-600 font-bold uppercase tracking-wider transition">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-300">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                           <Bell size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400">No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { markRead(n.id); setBellOpen(false); navigate(n.link || "/alerts"); }}
                        className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${!n.read ? "bg-rose-50/30 border-rose-500" : "border-transparent opacity-75 hover:opacity-100"}`}
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${n.type === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                           {n.type === "alert" ? <AlertCircle size={18} /> : n.type === "certificate" ? <Award size={18} /> : <Bell size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-snug ${!n.read ? "text-slate-900" : "text-slate-600"}`}>{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.body}</p>
                          <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-tight">{timeAgo(n.ts)}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 shadow-sm shadow-rose-200" />}
                      </div>
                    ))}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => { setBellOpen(false); navigate("/alerts"); }}
                        className="w-full py-2 text-center text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        View all emergency alerts
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <button
              onClick={() => navigate("/profile")}
              className="group relative flex items-center"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-rose-200 group-hover:scale-105 group-hover:shadow-rose-300 transition-all">
                {user?.name?.charAt(0)?.toUpperCase() || <User size={18} />}
              </div>
              <div className="hidden sm:flex flex-col items-start ml-3">
                 <span className="text-xs font-bold text-slate-900 leading-none">{user?.name?.split(" ")[0] || "User"}</span>
                 <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">View Profile</span>
              </div>
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
