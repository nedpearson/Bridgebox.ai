import { motion } from "framer-motion";
import {
  Smartphone,
  ShieldCheck,
  MapPin,
  Camera,
  MessageSquare,
} from "lucide-react";
import Section from "../Section";

export default function MobileExperienceSection() {
  return (
    <Section background="dark" className="py-24 border-t border-white/5">
      <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
        {/* Left Copy block */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Native Mobile Ecosystems. Generated instantly.
          </h2>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Bridgebox isn't just a web dashboard. The engine automatically
            generates two distinct Progressive Web Apps linked to your tenant
            data base.
          </p>

          <div className="space-y-8">
            {/* Staff App */}
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  The Field Operations App
                </h3>
                <p className="text-slate-400 mb-4">
                  Armed with offline-sync, GPS check-ins, and direct camera
                  upload functionality for field staff dispatching or warehouse
                  tracking.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded border border-white/5">
                    <MapPin className="w-3 h-3 inline mr-1" /> GPS Logs
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded border border-white/5">
                    <Camera className="w-3 h-3 inline mr-1" /> Intake Scanning
                  </span>
                </div>
              </div>
            </div>

            {/* Client Portal */}
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  The Customer VIP Portal
                </h3>
                <p className="text-slate-400 mb-4">
                  A white-labeled authentication zone allowing your clients to
                  pay invoices via Stripe, message your team, and track project
                  status on their phones.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded border border-white/5">
                    <MessageSquare className="w-3 h-3 inline mr-1" /> Chat
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded border border-white/5">
                    Stripe Billing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual block - Mobile Mockups */}
        <div className="relative h-[600px] w-full flex justify-center items-center">
          {/* Ambient Lighting */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 blur-[100px] -z-10 opacity-50"></div>

          {/* Back Mobile (Client Portal) */}
          <motion.div
            initial={{ x: 50, y: -20, rotate: 5, opacity: 0 }}
            whileInView={{ x: 60, y: -20, rotate: 5, opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute w-[260px] h-[540px] bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden p-[6px]"
          >
            <div className="w-full h-full bg-slate-950 rounded-[2rem] border border-slate-800/50 flex flex-col relative overflow-hidden">
              <div className="h-6 w-32 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl"></div>
              <div className="p-4 pt-10 pb-4 border-b border-white/5 bg-slate-900/50">
                <div className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">
                  Customer Portal
                </div>
                <div className="text-lg font-bold text-white">
                  Project Status
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-24 bg-slate-800/50 rounded-xl border border-white/5 p-3 flex flex-col justify-end">
                  <div className="text-lg font-bold text-white">$4,250.00</div>
                  <div className="text-xs text-red-400">Invoice Due</div>
                </div>
                <div className="h-16 bg-slate-800/50 rounded-xl border border-white/5"></div>
                <div className="h-16 bg-slate-800/50 rounded-xl border border-white/5"></div>
              </div>
            </div>
          </motion.div>

          {/* Front Mobile (Staff App) */}
          <motion.div
            initial={{ x: -20, y: 20, rotate: -2, opacity: 0 }}
            whileInView={{ x: -40, y: 20, rotate: -2, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute w-[280px] h-[580px] bg-slate-900 border border-slate-600 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 overflow-hidden p-[6px] z-20"
          >
            <div className="w-full h-full bg-slate-950 rounded-[2.2rem] border border-slate-800 flex flex-col relative overflow-hidden">
              <div className="h-7 w-36 bg-slate-950 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl border-b border-x border-slate-800 z-10"></div>

              {/* Fake UI */}
              <div className="p-5 pt-12">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full">
                    Sync Active
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Field Operations
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  3 Pending Assignments
                </p>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                    <div className="text-xs font-bold text-indigo-400 mb-1">
                      Route 04A
                    </div>
                    <div className="text-white font-semibold mb-2">
                      Delivery Terminal C
                    </div>
                    <div className="w-full h-8 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-300">
                      <Camera className="w-3 h-3 mr-2" /> SCAN BARCODE
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 opacity-50">
                    <div className="text-xs font-bold text-slate-500 mb-1">
                      Route 04B
                    </div>
                    <div className="text-slate-300 font-semibold">
                      Warehouse Intake
                    </div>
                  </div>
                </div>

                {/* Floating Action Dock Fake */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex justify-between items-center px-4">
                  <div className="w-10 h-10 rounded-full hover:bg-slate-700 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg -translate-y-4">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full hover:bg-slate-700 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
