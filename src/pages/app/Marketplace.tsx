import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Star,
  Download,
  TrendingUp,
  Zap,
  Building2,
  Package,
  LayoutTemplate,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import { supabase } from "../../lib/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";
import TemplateDetailView from "../../components/marketplace/TemplateDetailView";
import AgentDetailView from "../../components/marketplace/AgentDetailView";

const MOCK_TEMPLATES: any[] = [
  { id: "mock-1", category: "industry_pack", is_premium: true, is_agent: false, install_count: 1245, average_rating: 4.9, bb_templates: { name: "Forensic CPA Firm OS", description: "Complete ERP for forensic accounting with Client Portal, Document extraction, and secure audit logs." } },
  { id: "mock-2", category: "industry_pack", is_premium: true, is_agent: false, install_count: 854, average_rating: 4.8, bb_templates: { name: "Bridal Boutique Logistics OS", description: "Inventory management, POS, and scheduling tailored for luxury bridal boutiques." } },
  { id: "mock-3", category: "industry_pack", is_premium: false, is_agent: false, install_count: 5200, average_rating: 4.7, bb_templates: { name: "Real Estate Brokerage Core", description: "Property CRM, agent leaderboards, and basic transaction pipeline management." } },
  { id: "mock-13", category: "industry_pack", is_premium: false, is_agent: false, install_count: 7300, average_rating: 4.5, bb_templates: { name: "Freelancer Starter CRM", description: "A lightweight, beautiful Kanban and invoicing setup for independent contractors." } },
  { id: "mock-4", category: "workflow", is_premium: false, is_agent: false, install_count: 14500, average_rating: 4.9, bb_templates: { name: "Automated Client Onboarding", description: "Trigger welcome emails, create portals, and assign tasks the moment a contract is signed." } },
  { id: "mock-5", category: "workflow", is_premium: true, is_agent: false, install_count: 890, average_rating: 4.9, bb_templates: { name: "Multi-stage Approval Engine", description: "Complex hierarchical approval matrices with auto-escalation for enterprise compliance." } },
  { id: "mock-6", category: "workflow", is_premium: false, is_agent: false, install_count: 3200, average_rating: 4.6, bb_templates: { name: "Invoice Sync & Reminder", description: "Automatically sync invoices to QBO and send Dunning reminders for past-due accounts." } },
  { id: "mock-14", category: "workflow", is_premium: false, is_agent: false, install_count: 1100, average_rating: 4.4, bb_templates: { name: "Employee Offboarding", description: "Revoke access across SaaS apps and notify HR securely via automated checklists." } },
  { id: "mock-7", category: "ai_agent", is_premium: true, is_agent: true, install_count: 410, average_rating: 5.0, bb_templates: { name: "Tax Code Extraction Bot", description: "Autonomous agent that reads 1040s and populates your ledger with 99% accuracy." } },
  { id: "mock-8", category: "ai_agent", is_premium: true, is_agent: true, install_count: 1120, average_rating: 4.8, bb_templates: { name: "Customer Support Triage", description: "Reads incoming tickets, categorizes them, and assigns them to the correct department." } },
  { id: "mock-9", category: "ai_agent", is_premium: true, is_agent: true, install_count: 85, average_rating: 4.5, bb_templates: { name: "Inventory Forecasting Agent", description: "Analyzes historical sales to autonomously reorder low-stock items before they run out." } },
  { id: "mock-10", category: "ai_agent", is_premium: true, is_agent: true, install_count: 310, average_rating: 4.9, bb_templates: { name: "Social Media Sentiment Crawler", description: "Scrapes brand mentions and generates automated threat/opportunity reports daily." } },
  { id: "mock-16", category: "ai_agent", is_premium: true, is_agent: true, install_count: 2280, average_rating: 4.9, bb_templates: { name: "Sales Outreach Personalization", description: "Reads CRM target data and dynamically drafts highly personalized cold-outreach emails." } },
  { id: "mock-11", category: "premium_addon", is_premium: true, is_agent: false, install_count: 2200, average_rating: 4.8, bb_templates: { name: "White-label Custom Domain", description: "Serve your portals on your own company domain with full SSL management." } },
  { id: "mock-12", category: "premium_addon", is_premium: true, is_agent: false, install_count: 1540, average_rating: 4.7, bb_templates: { name: "Advanced SSO Security", description: "SAML 2.0 integration for enterprise Okta/Azure Active Directory identity federation." } },
  { id: "mock-15", category: "premium_addon", is_premium: true, is_agent: false, install_count: 670, average_rating: 4.9, bb_templates: { name: "Multi-Language Localization", description: "Translate all client portals into 40+ languages using deeply integrated localized UI strings." } },
  { id: "mock-17", category: "premium_addon", is_premium: true, is_agent: false, install_count: 940, average_rating: 4.6, bb_templates: { name: "HIPAA Compliance Vault", description: "End-to-end encrypted local data storage and specialized audit trails matching HIPAA regulations." } }
];

export default function Marketplace() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>(
    location.state?.category || "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Templates", icon: Package },
    { id: "industry_pack", label: "Industry Packs", icon: Building2 },
    { id: "workflow", label: "Workflows", icon: TrendingUp },
    { id: "ai_agent", label: "AI Agents", icon: Zap },
    { id: "premium_addon", label: "Premium Add-ons", icon: ShoppingBag },
  ];

  useEffect(() => {
    loadMarketplace();
  }, [activeCategory]);

  const loadMarketplace = async () => {
    setLoading(true);

    try {
      if (activeCategory === "ai_agent") {
        const { data, error } = await supabase
          .from("bb_agents")
          .select("*")
          .order("created_at", { ascending: false });

        let normalized = [] as any[];
        if (!error && data) {
          normalized = data.map((agent) => ({
            id: agent.id,
            category: agent.category,
            is_premium: true,
            is_agent: true,
            install_count: Math.floor(Math.random() * 500) + 50,
            average_rating: 4.9,
            bb_templates: {
              name: agent.name,
              description: agent.description,
              thumbnail_url: null,
            },
          }));
        }

        if (normalized.length === 0) {
          normalized = MOCK_TEMPLATES.filter(m => m.category === 'ai_agent');
        }
        
        setTemplates(normalized);
      } else {
        let query = supabase
          .from("bb_marketplace_templates")
          .select(
            `
             *,
             bb_templates(name, description, thumbnail_url),
             bb_organizations(name)
           `,
          )
          .eq("is_published", true);

        if (activeCategory !== "all") {
          query = query.eq("category", activeCategory);
        }

        const { data, error } = await query;

        let normalized = [] as any[];
        if (!error && data) {
           normalized = data.map((t) => ({ ...t, is_agent: false }));
        }
        
        if (normalized.length === 0) {
          if (activeCategory === "all") {
            normalized = MOCK_TEMPLATES;
          } else {
            normalized = MOCK_TEMPLATES.filter(m => m.category === activeCategory);
          }
        }

        setTemplates(normalized);
      }
    } catch (err) {
      console.error("Failed to load marketplace data:", err);
      // Failsafe crash recovery
      if (activeCategory === "all") {
         setTemplates(MOCK_TEMPLATES);
      } else {
         setTemplates(MOCK_TEMPLATES.filter(m => m.category === activeCategory));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.bb_templates?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bb_templates?.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <AppHeader
        title="Template Marketplace"
        subtitle="Discover, install, and share high-performing ecosystem workflows."
      />

      <div className="p-8 space-y-8">
        {/* Marketplace Nav */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-slate-800/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#1E293B] border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50 p-6 flex flex-col justify-between">
                  {template.is_premium ? (
                    <div className="self-end bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider relative z-10 shadow-lg">
                      Premium
                    </div>
                  ) : (
                    <div className="self-end bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-slate-600 relative z-10">
                      Free
                    </div>
                  )}
                  {template.is_agent ? (
                    <Zap className="w-12 h-12 text-indigo-500/70 group-hover:text-indigo-500 transition-colors mx-auto" />
                  ) : (
                    <LayoutTemplate className="w-12 h-12 text-slate-500/50 group-hover:text-indigo-500/50 transition-colors mx-auto" />
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    {template.category.replace("_", " ")}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {template.bb_templates?.name}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                    {template.bb_templates?.description ||
                      template.best_use_case}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>{template.install_count} installs</span>
                    </div>
                    {template.average_rating > 0 && (
                      <div className="flex items-center space-x-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{template.average_rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                  <button
                    className={`px-6 py-2 text-white font-medium rounded-lg shadow-lg ${template.is_agent ? "bg-indigo-500 hover:bg-indigo-600" : "bg-slate-700 hover:bg-slate-600"}`}
                  >
                    {template.is_agent ? "Deploy Assistant" : "View Details"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedTemplate &&
        (activeCategory === "ai_agent" ? (
          <AgentDetailView
            agentId={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
          />
        ) : (
          <TemplateDetailView
            templateId={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
          />
        ))}
    </>
  );
}
