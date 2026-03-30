import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ClientHealthScore } from "../../lib/db/clientSuccess";

interface HealthScoreCardProps {
  score: ClientHealthScore;
}

function ScoreIndicator({ score, label }: { score: number; label: string }) {
  const getColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getBgColor = (value: number) => {
    if (value >= 80) return "bg-green-500/10";
    if (value >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="flex-1">
      <div className="text-sm text-slate-500 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${getColor(score)} mb-1`}>
        {score}
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${getBgColor(score)}`}
          style={{
            background:
              score >= 80
                ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                : score >= 60
                  ? "linear-gradient(90deg, #F59E0B 0%, #D97706 100%)"
                  : "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)",
          }}
        />
      </div>
    </div>
  );
}

export default function HealthScoreCard({ score }: HealthScoreCardProps) {
  const getOverallColor = (value: number) => {
    if (value >= 80) return "from-green-500 to-emerald-600";
    if (value >= 60) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const getTrend = () => {
    if (score.overall_score >= 80) return <TrendingUp className="w-5 h-5" />;
    if (score.overall_score >= 60) return <Minus className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  const getStatus = () => {
    if (score.overall_score >= 80) return "Healthy";
    if (score.overall_score >= 60) return "At Risk";
    return "Critical";
  };

  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Client Health Score
          </h3>
          <p className="text-sm text-slate-400">
            Updated {new Date(score.calculated_at).toLocaleDateString()}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${getOverallColor(score.overall_score)} rounded-full text-white font-medium`}
        >
          {getTrend()}
          {getStatus()}
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-white/10 bg-white/5 relative">
          <div className="text-5xl font-bold text-white">
            {score.overall_score}
          </div>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${
                score.overall_score >= 80
                  ? "#10B981"
                  : score.overall_score >= 60
                    ? "#F59E0B"
                    : "#EF4444"
              } ${score.overall_score * 3.6}deg, transparent 0deg)`,
              mask: "radial-gradient(circle, transparent 60%, black 60%)",
              WebkitMask: "radial-gradient(circle, transparent 60%, black 60%)",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ScoreIndicator score={score.onboarding_score} label="Onboarding" />
        <ScoreIndicator score={score.project_score} label="Projects" />
        <ScoreIndicator score={score.support_score} label="Support" />
        <ScoreIndicator score={score.engagement_score} label="Engagement" />
      </div>
    </div>
  );
}
