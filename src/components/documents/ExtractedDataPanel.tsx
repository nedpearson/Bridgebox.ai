// @ts-nocheck
import { motion } from "framer-motion";
import { Database, Check, X, AlertCircle } from "lucide-react";
import Badge from "../Badge";
import Button from "../Button";
import type { ExtractedData } from "../../lib/documents/DocumentProcessor";

interface ExtractedDataPanelProps {
  data: ExtractedData[];
  onValidate?: (dataId: string, isValid: boolean) => void;
}

const DATA_TYPE_COLORS: Record<string, string> = {
  invoice: "green",
  contract: "purple",
  receipt: "blue",
  form: "amber",
  table: "slate",
  other: "slate",
};

const VALIDATION_COLORS: Record<string, string> = {
  pending: "amber",
  valid: "green",
  invalid: "red",
  needs_review: "amber",
};

export default function ExtractedDataPanel({
  data,
  onValidate,
}: ExtractedDataPanelProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">
          No structured data extracted yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-slate-800/30 rounded-lg border border-slate-700"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge color={DATA_TYPE_COLORS[item.data_type]}>
                {item.data_type}
              </Badge>
              <Badge color={VALIDATION_COLORS[item.validation_status]}>
                {item.validation_status}
              </Badge>
            </div>

            {item.confidence && (
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">Confidence</div>
                <div className="text-sm font-medium text-white">
                  {Math.round(item.confidence * 100)}%
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {Object.entries(item.extracted_fields).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <span className="text-slate-400 min-w-[120px]">
                  {formatFieldName(key)}:
                </span>
                <span className="text-white flex-1">
                  {formatFieldValue(value)}
                </span>
              </div>
            ))}
          </div>

          {onValidate && item.validation_status === "needs_review" && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
              <Button
                size="sm"
                onClick={() => onValidate(item.id, true)}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark Valid
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onValidate(item.id, false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Mark Invalid
              </Button>
            </div>
          )}

          {item.validation_status === "invalid" && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">
                This data has been marked as invalid
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function formatFieldName(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFieldValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
