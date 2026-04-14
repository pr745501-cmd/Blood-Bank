import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, ClipboardList, Users, Database,
  BellRing, UserCog, MessageSquare, Award, LogOut, ChevronRight,
  Droplets, Menu, X, Tent, Bell, Search, Settings, ChevronDown,
  BarChart2, ShieldCheck
} from "lucide-react";

const NAV = [
  {
    group: "Registry",
    items: [
      { to: "/admin",             icon: LayoutDashboard, label: "Dashboard",      end: true },
      { to: "/admin/add-donor",   icon: UserPlus,        label: "Add Donor"              },
      { to: "/admin/donors",      icon: ClipboardList,   label: "Donor Archive"          },
    ],
  },
  {
    group: "Clinical",
    items: [
      { to: "/admin/blood-requests", icon: Users,    label: "Blood Requests" },
      { to: "/admin/inventory",      icon: Database, label: "Stock Ledger"   },
      { to: "/admin/alerts",         icon: BellRing, label: "Alerts"         },
      { to: "/admin/camps",          icon: Tent,     label: "Camps"          },
    ],
  },
  {
    group: "Admin",
    items: [
      { to: "/admin/users",        icon: UserCog,      label: "Staff Access"  },
      { to: "/admin/queries",      icon: MessageSquare,label: "Inbox"         },
      { to: "/admin/certificates", icon: Award,        label: "Certificates"  },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { to: "/admin/analytics",             icon: BarChart2,   label: "Analytics"       },
      { to: "/admin/donation-verification", icon: ShieldCheck, label: "Donation Verify" },
    ],
  },
];

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const [open, setOpen]         = useState(false);   // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  // close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // breadcrumb label
  const crumb = location.pathname.split("/").filter(Boolean).slice(1).join(" / ") || "dashboard";

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col
        bg-white border-r border-slate-100 shadow-xl shadow-slate-200/40
        transition-all duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${collapsed ? "lg:w-20" : "lg:w-64"}
        w-64
      `}>

        {/* Brand */}
        <div className={`flex items-center gap-3 px-5 py-5 border-b border-slate-100 ${collapsed ? "lg:justify-center lg:px-3" : ""}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
            <Droplets size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-base font-black text-slate-900 leading-none tracking-tight">
                Blood<span className="text-red-600">Connect</span>
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ChevronRight size={14} className={`transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV.map(({ group, items }) => (
            <div key={group}>
              {!collapsed && (
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] px-3 mb-2">{group}</p>
              )}
              <div className="space-y-0.5">
                {items.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                      ${collapsed ? "lg:justify-center" : ""}
                      ${isActive
                        ? "bg-red-50 text-red-600 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className={`flex-shrink-0 ${isActive ? "text-red-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                        {!collapsed && <span className="truncate">{label}</span>}
                        {!collapsed && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className={`p-3 border-t border-slate-100 ${collapsed ? "lg:flex lg:justify-center" : ""}`}>
          {collapsed ? (
            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={17} />
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate leading-none">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Administrator</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — keeping original crimson #BE123C */}
        <header className="h-16 bg-[#BE123C] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumb */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-rose-200 font-semibold uppercase tracking-wide">
                <span>Admin</span>
                <ChevronRight size={11} />
                <span className="text-white capitalize">{crumb.replace(/-/g, " ")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white/60 w-48 hover:bg-white/20 transition-colors cursor-pointer">
              <Search size={14} />
              <span className="text-xs">Quick search…</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full border-2 border-[#BE123C]" />
            </button>

            {/* Status pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white/80 uppercase tracking-wider">Live</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
