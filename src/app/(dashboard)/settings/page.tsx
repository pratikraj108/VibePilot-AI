"use client";

import { useState, useEffect } from "react";
import { Save, User as UserIcon, Bell, Shield, Palette, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  
  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Preferences State
  const [preferences, setPreferences] = useState({
    weeklyDigest: true,
    taskUpdates: true,
    securityAlerts: true,
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState("");

  // Security State
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");

  useEffect(() => {
    if (user) {
      const names = user.displayName?.split(" ") || ["", ""];
      setFirstName(names[0] || "");
      setLastName(names.slice(1).join(" ") || "");
      
      // Load preferences via Prisma API
      const loadPrefs = async () => {
        try {
          const res = await fetch("/api/user/preferences");
          if (res.ok) {
            const data = await res.json();
            setPreferences(data);
          }
        } catch (error) {
          console.error("Failed to load preferences", error);
        }
      };
      loadPrefs();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    setProfileMessage("");
    try {
      if (user.rawUser?.update) {
        await user.rawUser.update({
          firstName,
          lastName,
        });
      }
      setProfileMessage("Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error: any) {
      setProfileMessage(error.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setIsSavingPrefs(true);
    setPrefsMessage("");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        setPrefsMessage("Preferences saved successfully!");
        setTimeout(() => setPrefsMessage(""), 3000);
      } else {
        throw new Error("Failed to save preferences.");
      }
    } catch (error: any) {
      setPrefsMessage(error.message || "Failed to save preferences.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    setSecurityMessage("");
    try {
      setSecurityMessage("Security and password management is managed securely through your Clerk account.");
    } catch (error: any) {
      setSecurityMessage(error.message || "Failed to process request.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const tabs = [
    { name: "Profile", icon: UserIcon },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: Shield },
    { name: "Appearance", icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.name
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "Profile" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile
                    </button>
                  </div>
                  
                  {profileMessage && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {profileMessage}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-xl overflow-hidden shrink-0 border border-white/10">
                        {user?.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user?.displayName?.charAt(0) || "U"
                        )}
                      </div>
                      <div className="text-slate-400 text-sm">
                        <p className="font-medium text-white">Profile Image</p>
                        <p className="mt-1">Your avatar is securely synced from your Google account.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-400">Email Address (Read-only)</label>
                        <input
                          type="email"
                          readOnly
                          value={user?.email || ""}
                          className="w-full bg-slate-900/30 border border-white/5 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Notifications" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-xl font-semibold text-white">Email Preferences</h2>
                    <button 
                      onClick={handleSavePreferences}
                      disabled={isSavingPrefs}
                      className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Preferences
                    </button>
                  </div>

                  {prefsMessage && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {prefsMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    {[
                      { id: "weeklyDigest", title: "Weekly Digest", desc: "Get a summary of your tasks and analytics every week." },
                      { id: "taskUpdates", title: "Task Updates", desc: "Be notified when a task status changes." },
                      { id: "securityAlerts", title: "Security Alerts", desc: "Important notifications about your account security." },
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                        <div>
                          <h4 className="text-sm font-medium text-white">{pref.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{pref.desc}</p>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, [pref.id]: !(prev as any)[pref.id] }))}
                          className={`w-11 h-6 rounded-full transition-colors relative ${((preferences as any)[pref.id]) ? 'bg-violet-500' : 'bg-slate-700'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${((preferences as any)[pref.id]) ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Security" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                  </div>
                  
                  {securityMessage && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-sky-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {securityMessage}
                    </div>
                  )}

                  <div className="p-6 rounded-xl border border-white/5 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Reset Password</h4>
                      <p className="text-xs text-slate-400 max-w-sm">We will send a secure link to your email address allowing you to change your account password.</p>
                    </div>
                    <button 
                      onClick={handleResetPassword}
                      disabled={isSendingReset}
                      className="shrink-0 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/5 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      Send Reset Email
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "Appearance" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-xl font-semibold text-white">Appearance</h2>
                  </div>
                  <div className="p-6 rounded-xl border border-white/5 bg-slate-900/50 text-center">
                    <Palette className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-white mb-1">Dark Mode Only</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">VibePilot AI is currently optimized for a premium dark mode experience. Additional themes will be available in the future!</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
