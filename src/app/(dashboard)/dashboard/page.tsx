"use client";

import { Activity, Users, CreditCard, ArrowUpRight } from "lucide-react";
import { RiskAnalyzer } from "@/components/RiskAnalyzer";
import { motion } from "framer-motion";

export default function Dashboard() {
  const stats = [
    { name: "Total Revenue", value: "$45,231.89", change: "+20.1%", icon: CreditCard },
    { name: "Subscriptions", value: "+2350", change: "+180.1%", icon: Users },
    { name: "Active Now", value: "+12,234", change: "+19%", icon: Activity },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-10"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          Download Report
        </motion.button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat) => (
          <motion.div 
            variants={itemAnim}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            key={stat.name} 
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-400">{stat.name}</p>
              <stat.icon className="w-5 h-5 text-slate-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-emerald-400 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {stat.change} from last month
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6">
        <RiskAnalyzer />
      </div>
        
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 1, action: "Completed Task", name: "Update homepage copy", time: "2h ago", color: "from-emerald-400 to-teal-500" },
            { id: 2, action: "Added Task", name: "Fix navigation bug", time: "5h ago", color: "from-sky-400 to-indigo-500" },
            { id: 3, action: "AI Scheduled", name: "Q3 Roadmap", time: "1d ago", color: "from-violet-400 to-purple-500" },
            { id: 4, action: "AI Breakdown", name: "Launch Campaign", time: "2d ago", color: "from-amber-400 to-orange-500" },
          ].map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              whileHover={{ scale: 1.02, y: -4 }}
              key={item.id} 
              className="p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-white/5 transition-all cursor-pointer flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {item.id}
                </div>
                <div className="text-xs font-medium text-slate-500 bg-slate-900/80 px-2 py-1 rounded-md">{item.time}</div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{item.action}</p>
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
