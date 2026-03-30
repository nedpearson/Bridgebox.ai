import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import Card from "../Card";
import { TrendIndicator } from "./PredictionBadge";
import type { RevenueForecast } from "../../lib/predictiveAnalytics";

interface ForecastCardProps {
  forecast: RevenueForecast;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const monthName = new Date(forecast.month + "-01").toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">{monthName}</span>
        </div>
        <TrendIndicator trend={forecast.trend} />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${forecast.totalPredicted.toLocaleString()}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">MRR</span>
            <span className="text-white font-medium">
              ${forecast.predictedMRR.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Project Revenue</span>
            <span className="text-white font-medium">
              ${forecast.predictedProjectRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Confidence</span>
            <span className="text-slate-400 font-medium">
              {forecast.confidence}%
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-1 mt-2">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${forecast.confidence}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ForecastSummaryProps {
  forecasts: RevenueForecast[];
}

export function ForecastSummary({ forecasts }: ForecastSummaryProps) {
  if (forecasts.length === 0) return null;

  const next3Months = forecasts.slice(0, 3);
  const totalNext3Months = next3Months.reduce(
    (sum, f) => sum + f.totalPredicted,
    0,
  );
  const avgConfidence =
    next3Months.reduce((sum, f) => sum + f.confidence, 0) / next3Months.length;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            90-Day Revenue Forecast
          </h3>
          <p className="text-sm text-slate-400">Next quarter projection</p>
        </div>
      </div>

      <div className="text-3xl font-bold text-white mb-2">
        ${totalNext3Months.toLocaleString()}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-slate-400">
          <span>Confidence:</span>
          <span className="text-blue-400 font-medium">
            {avgConfidence.toFixed(0)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
