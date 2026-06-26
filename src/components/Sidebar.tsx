"use client";

import Link from "next/link";
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, Settings, Plane, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "AI Insights", href: "/insights", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <div className="w-64 h-full flex flex-col glass border-r border-white/5 bg-slate-900/90 md:bg-transparent shadow-2xl md:shadow-none">
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white group" onClick={onClose}>
          <div className="bg-violet-500/20 p-2 rounded-lg group-hover:bg-violet-500/30 transition-colors">
            <Plane className="w-5 h-5 text-violet-400 group-hover:text-violet-300 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            VibePilot
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative overflow-hidden ${
                isActive ? "text-white bg-violet-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute left-0 w-1 inset-y-0 bg-violet-500 rounded-r-full"
                />
              )}
              <item.icon className={`w-5 h-5 transition-colors z-10 ${isActive ? "text-violet-400" : "group-hover:text-violet-400"}`} />
              <span className="font-medium z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 shrink-0">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-sky-500 flex items-center justify-center text-sm font-bold text-white shadow-lg overflow-hidden shrink-0">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0) || "U"
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.displayName || "User"}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-white shadow-lg">
              ?
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Not logged in</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden h-full"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
