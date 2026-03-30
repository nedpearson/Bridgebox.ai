import { ArrowRight, Users, DollarSign, Target } from "lucide-react";
import Card from "../Card";
import {
  TrendBadge,
  TrendStrengthBadge,
  GrowthRateDisplay,
  HotIndicator,
  EmergingBadge,
} from "./TrendBadge";
import type {
  ServiceTrend,
  IndustryTrend,
  DemandSpike,
} from "../../lib/trendDetection";

interface ServiceTrendCardProps {
  trend: ServiceTrend;
}

export function ServiceTrendCard({ trend }: ServiceTrendCardProps) {
  const formatServiceName = (name: string) => {
    return name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const isHot = trend.direction === "up" && trend.growthRate > 50;

  return (
    <Card className="p-6 hover:border-blue-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {formatServiceName(trend.serviceType)}
            </h3>
            {isHot && <HotIndicator />}
          </div>
          <div className="flex items-center gap-2">
            <TrendBadge direction={trend.direction} />
            <TrendStrengthBadge strength={trend.strength} />
          </div>
        </div>
        <GrowthRateDisplay rate={trend.growthRate} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Current Period</p>
          <p className="text-2xl font-bold text-white">
            {trend.currentPeriodCount}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Previous Period</p>
          <p className="text-lg font-medium text-slate-300">
            {trend.previousPeriodCount}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Revenue</span>
          <span className="text-white font-medium">
            ${(trend.totalRevenue / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Avg Deal Size</span>
          <span className="text-white font-medium">
            ${(trend.averageDealSize / 1000).toFixed(1)}K
          </span>
        </div>
      </div>
    </Card>
  );
}

interface IndustryTrendCardProps {
  trend: IndustryTrend;
}

export function IndustryTrendCard({ trend }: IndustryTrendCardProps) {
  const isHot = trend.direction === "up" && trend.growthRate > 60;

  return (
    <Card className="p-6 hover:border-green-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {trend.industry}
            </h3>
            {isHot && <HotIndicator />}
          </div>
          <div className="flex items-center gap-2">
            <TrendBadge direction={trend.direction} />
            <TrendStrengthBadge strength={trend.strength} />
          </div>
        </div>
        <GrowthRateDisplay rate={trend.growthRate} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-400">Leads</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {trend.currentPeriodCount}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-400" />
            <p className="text-xs text-slate-400">Conversion</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {trend.conversionRate.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Revenue Potential</span>
          </div>
          <span className="text-white font-medium">
            ${(trend.totalRevenue / 1000).toFixed(0)}K
          </span>
        </div>
      </div>
    </Card>
  );
}

interface DemandSpikeCardProps {
  spike: DemandSpike;
}

export function DemandSpikeCard({ spike }: DemandSpikeCardProps) {
  return (
    <Card className="p-6 hover:border-purple-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white capitalize">
              {spike.keyword}
            </h3>
            <EmergingBadge isEmerging={spike.isEmergingTrend} />
          </div>
          <p className="text-sm text-slate-400">
            {spike.frequency} mentions across {spike.sources.length} channels
          </p>
        </div>
      </div>

      {spike.relatedServices.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Related Services</p>
          <div className="flex flex-wrap gap-2">
            {spike.relatedServices.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-md"
              >
                {service.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>First Seen</span>
          <span>{new Date(spike.firstSeen).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}

interface TrendInsightCardProps {
  type: "opportunity" | "warning" | "info";
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

export function TrendInsightCard({
  type,
  title,
  description,
  metric,
  action,
}: TrendInsightCardProps) {
  const config = {
    opportunity: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    warning: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
  };

  const style = config[type];

  return (
    <Card className={`p-6 ${style.bg} border ${style.border}`}>
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-300">{description}</p>
        </div>

        {metric && (
          <div className="py-2 px-3 bg-slate-900/30 rounded-lg">
            <p className="text-sm text-slate-400">{metric}</p>
          </div>
        )}

        {action && (
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className={`w-4 h-4 ${style.iconColor}`} />
            <span className="text-slate-300">{action}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
