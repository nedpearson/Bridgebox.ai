import { motion } from "framer-motion";
import {
  ShoppingBag,
  Zap,
  Video,
  Headphones,
  Wrench,
  ArrowRight,
  Star,
} from "lucide-react";
import { ADD_ONS, formatAddOnPrice } from "../../lib/plans";
import type { AddOnDefinition } from "../../types/billing";

interface AddOnPackGridProps {
  onPurchase?: (addonId: string) => void;
  highlighted?: string[];
}

const CATEGORY_CONFIG = {
  credits: {
    label: "AI Credits",
    icon: Zap,
    color: "#6366f1",
    description: "Top up your AI credit balance",
  },
  recordings: {
    label: "Recording Packs",
    icon: Video,
    color: "#06b6d4",
    description: "Analyze more screen recordings",
  },
  services: {
    label: "Implementation Services",
    icon: Wrench,
    color: "#10b981",
    description: "Done-for-you setup and builds",
  },
  support: {
    label: "Support Upgrades",
    icon: Headphones,
    color: "#f59e0b",
    description: "Priority access and faster response",
  },
};

function AddOnCard({
  addon,
  onPurchase,
  isHighlighted,
}: {
  addon: AddOnDefinition;
  onPurchase?: (id: string) => void;
  isHighlighted?: boolean;
}) {
  const cat = CATEGORY_CONFIG[addon.category];
  const Icon = cat.icon;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: `0 8px 30px ${cat.color}20` }}
      className="relative rounded-2xl p-5 flex flex-col"
      style={{
        background: isHighlighted
          ? `linear-gradient(135deg, ${cat.color}15, ${cat.color}08)`
          : "rgba(15,15,30,0.7)",
        border: `1px solid ${isHighlighted ? `${cat.color}40` : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.2s ease",
      }}
    >
      {isHighlighted && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: `${cat.color}20`, color: cat.color }}
        >
          <Star className="w-2.5 h-2.5" />
          Popular
        </div>
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{
          background: `${cat.color}15`,
          border: `1px solid ${cat.color}25`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: cat.color }} />
      </div>

      {/* Content */}
      <h4 className="text-white font-bold text-sm mb-1">{addon.name}</h4>
      <p className="text-slate-400 text-xs leading-relaxed flex-1 mb-4">
        {addon.description}
      </p>

      {/* Credit value badge */}
      {addon.creditValue && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold mb-3 w-fit"
          style={{ background: `${cat.color}15`, color: cat.color }}
        >
          <Zap className="w-3 h-3" />+{addon.creditValue.toLocaleString()}{" "}
          credits
        </div>
      )}
      {addon.recordingValue && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold mb-3 w-fit"
          style={{ background: `${cat.color}15`, color: cat.color }}
        >
          <Video className="w-3 h-3" />+{addon.recordingValue} recordings
        </div>
      )}

      {/* Price + CTA */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <p className="text-white font-black text-lg">
            {formatAddOnPrice(addon)}
          </p>
          <p className="text-slate-600 text-xs">one-time</p>
        </div>
        <button
          onClick={() => onPurchase?.(addon.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: `${cat.color}20`,
            border: `1px solid ${cat.color}30`,
            color: cat.color,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = `${cat.color}35`)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = `${cat.color}20`)
          }
        >
          Add <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

export default function AddOnPackGrid({
  onPurchase,
  highlighted = ["credit_pack_500"],
}: AddOnPackGridProps) {
  const categories = Object.keys(CATEGORY_CONFIG) as Array<
    keyof typeof CATEGORY_CONFIG
  >;

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const addons = ADD_ONS.filter((a) => a.category === category);
        if (addons.length === 0) return null;
        const cat = CATEGORY_CONFIG[category];
        const Icon = cat.icon;

        return (
          <div key={category}>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${cat.color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{cat.label}</h3>
                <p className="text-slate-500 text-xs">{cat.description}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addons.map((addon) => (
                <AddOnCard
                  key={addon.id}
                  addon={addon}
                  onPurchase={onPurchase}
                  isHighlighted={highlighted.includes(addon.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Enterprise CTA */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              Need a custom package?
            </p>
            <p className="text-slate-400 text-xs">
              Enterprise clients get custom credit allocations, implementation
              bundles, and dedicated support.
            </p>
          </div>
        </div>
        <a
          href="mailto:sales@bridgebox.ai?subject=Custom Package Inquiry"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ml-4"
        >
          Contact Sales <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
