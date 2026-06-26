import { Bell, Search, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {

  return (
    <header className="h-16 border-b border-white/5 glass flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, analytics..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-slate-900"></span>
        </button>
      </div>
    </header>
  );
}
