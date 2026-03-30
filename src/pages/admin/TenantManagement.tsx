import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MoreVertical,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";

// Mock data to demonstrate the rigorous Premium Data Grid logic requested
const mockTenants = [
  {
    id: "t-100",
    name: "Apex Logistics Corp",
    industry: "Logistics",
    plan: "Enterprise OS",
    mrr: 1250,
    status: "active",
    users: 45,
    aiOps: "124k",
  },
  {
    id: "t-101",
    name: "Bridal Visions",
    industry: "Bridal Boutique",
    plan: "Growth Pack",
    mrr: 299,
    status: "active",
    users: 12,
    aiOps: "12k",
  },
  {
    id: "t-102",
    name: "Horizon Law Partners",
    industry: "Legal",
    plan: "Enterprise OS",
    mrr: 1850,
    status: "warning",
    users: 82,
    aiOps: "450k",
  },
  {
    id: "t-103",
    name: "Summit accounting",
    industry: "Accounting",
    plan: "Starter Base",
    mrr: 99,
    status: "active",
    users: 3,
    aiOps: "1.2k",
  },
];

export default function TenantManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Tenant Authority
          </h1>
          <p className="text-sm text-slate-400">
            Manage subscriptions, system health, and AI utilization across all
            instances.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Segments
          </Button>
          <Button>Provision Instance</Button>
        </div>
      </div>

      <Card glass className="p-0 overflow-hidden bg-slate-900/40">
        <div className="p-4 border-b border-white/5 bg-slate-900/60 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by instance name, ID, or industry..."
              className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/30">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Workspace Instance
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Plan & MRR
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Scale
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  System State
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockTenants.map((tenant) => (
                <motion.tr
                  key={tenant.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                  className="cursor-pointer group transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl border border-white/10 bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-500 transition-colors">
                          {tenant.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {tenant.industry} • {tenant.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      ${tenant.mrr.toLocaleString()} / mo
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {tenant.plan}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">
                          Users
                        </div>
                        <div className="text-sm font-medium text-white">
                          {tenant.users}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">
                          AI Ops
                        </div>
                        <div className="text-sm font-medium text-[#10B981]">
                          {tenant.aiOps}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {tenant.status === "active" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Nominal
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> High AI
                        Load
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium text-indigo-500">
                        Inspect Node
                      </span>
                      <ArrowRight className="w-4 h-4 text-indigo-500" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
