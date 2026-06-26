import { BarChart3, TrendingUp, Users, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const metrics = [
    { title: "Conversion Rate", value: "3.2%", trend: "+1.1%", icon: TrendingUp },
    { title: "Active Users", value: "24.5K", trend: "+5.4%", icon: Users },
    { title: "Engagement Score", value: "8.4/10", trend: "+0.3", icon: Zap },
    { title: "Avg Session", value: "4m 12s", trend: "-12s", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
        <div className="flex bg-white/5 p-1 rounded-lg">
          <button className="px-3 py-1.5 text-sm font-medium bg-white/10 text-white rounded-md shadow">7D</button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white">30D</button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white">3M</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="glass-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-400">{metric.title}</p>
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <metric.icon className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className={`text-xs mt-1 ${metric.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metric.trend} from previous period
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Traffic Sources</h3>
          <div className="flex-1 border border-white/5 rounded-xl bg-slate-800/30 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Interactive Chart Component</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
          <div className="flex-1 space-y-4">
            {[
              { path: "/home", views: "12.5K" },
              { path: "/features", views: "8.2K" },
              { path: "/pricing", views: "5.1K" },
              { path: "/blog/release", views: "3.4K" },
              { path: "/contact", views: "1.2K" },
            ].map((page, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-sm text-slate-300 truncate w-32">{page.path}</span>
                <span className="text-sm font-medium text-white">{page.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
