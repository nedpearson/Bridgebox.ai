import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  LayoutTemplate,
  Briefcase,
  Settings,
  Save,
  Archive,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { BridgeboxTemplate, templateService } from "../../../lib/db/templates";
import Button from "../../../components/Button";
import Card from "../../../components/Card";

export default function TemplateStudio() {
  const [templates, setTemplates] = useState<BridgeboxTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // In a real app we'd fetch ALL templates (including drafts) for admins
      const data = await templateService.getAllTemplatesForAdmin();
      setTemplates(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-start mb-6">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Template Studio
          </h1>
          <p className="text-slate-400">
            Architect, version, and manage the official Bridgebox Industry Packs
            and Business Model overlays.
          </p>
        </div>
        <Button
          onClick={() => {}}
          variant="primary"
          className="bg-indigo-500 hover:bg-indigo-600 border-none text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Blueprint
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                    template.status === "published"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {template.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 truncate">
                {template.name}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3">
                <Briefcase className="w-3 h-3" />
                <span className="capitalize">
                  {template.category.replace("_", " ")}
                </span>
                <span>•</span>
                <span>v{template.version}</span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">
                {template.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                  <Archive className="w-4 h-4" />
                </button>
              </div>
              <Button variant="secondary" size="sm" className="text-xs">
                Open Editor
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
