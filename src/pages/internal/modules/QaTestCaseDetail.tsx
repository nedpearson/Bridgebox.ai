import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { devQaAiApi, InternalQaTestCase } from "../../../lib/devQaAi";
import {
  Loader2,
  ArrowLeft,
  TestTube2,
  BadgeCheck,
  XCircle,
  ShieldAlert,
  Sparkles,
  Activity,
} from "lucide-react";

export default function QaTestCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<InternalQaTestCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (testId: string) => {
    try {
      setLoading(true);
      const data = await devQaAiApi.getQaTestCase(testId);
      setTest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusStr: any) => {
    if (!test) return;
    try {
      setLoading(true);
      const updated = await devQaAiApi.updateQaTestCase(test.id, {
        status: statusStr,
        approved_for_build: statusStr === "approved",
      });
      setTest(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !test) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!test)
    return (
      <div className="p-8 text-white bg-slate-900 rounded-lg text-center">
        Test Spec isolated or deleted.
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() =>
              navigate("/app/internal/recording-center/qa-test-cases")
            }
            className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider">
                {test.product_area || "Global Platform"}
              </span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider items-center flex ${
                  test.status === "approved"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : test.status === "rejected"
                      ? "bg-slate-800 text-slate-500 border border-slate-700"
                      : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                }`}
              >
                {test.status === "approved" && (
                  <BadgeCheck className="w-3 h-3 mr-1" />
                )}
                {test.status.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-2 flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-indigo-500 flex-shrink-0" />
              {test.title}
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl">{test.objective}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          {test.status !== "approved" && (
            <>
              <button
                onClick={() => handleUpdateStatus("rejected")}
                className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deprecate Trace
              </button>
              <button
                onClick={() => handleUpdateStatus("approved")}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <BadgeCheck className="w-4 h-4 mr-2" />
                Sign Off QA Matrix
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sequence Graph */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center text-indigo-400 mb-4 font-medium">
              <TestTube2 className="w-5 h-5 mr-2" />
              Verification Execution Path
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">
                    Preconditions
                  </span>
                  <pre className="text-amber-300 font-sans p-3 bg-amber-500/10 rounded border border-amber-500/20 whitespace-pre-wrap text-sm">
                    {test.preconditions || "None"}
                  </pre>
                </div>
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">
                    Environment Setup Notes
                  </span>
                  <p className="text-slate-300 p-3 bg-slate-800 rounded border border-slate-700 text-sm">
                    {test.setup_notes || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">
                  Test Sequence / Steps
                </span>
                <pre className="text-sky-300 font-mono p-4 bg-sky-900/10 rounded border border-sky-500/20 whitespace-pre-wrap text-sm shadow-inner">
                  {test.test_steps || "Execute global bounds"}
                </pre>
              </div>

              <div>
                <span className="block text-xs uppercase text-green-500 font-bold tracking-wider mb-1">
                  Expected Results (Pass Condition)
                </span>
                <p className="text-green-400 p-3 bg-green-500/10 rounded border border-green-500/20">
                  {test.expected_results || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Post-Fix Scopes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center text-orange-400 mb-4 font-medium">
              <Activity className="w-5 h-5 mr-2" />
              Regression & Defect Boundaries
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">
                  Negative Test Vectors
                </span>
                <p className="text-pink-300 p-3 bg-pink-500/10 border border-pink-500/20 rounded text-sm">
                  {test.negative_tests || "N/A"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">
                    Regression Risks
                  </span>
                  <p className="text-slate-300 p-3 bg-slate-800 border border-slate-700 rounded text-sm">
                    {test.regression_risks || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">
                    Edge Cases Detected
                  </span>
                  <p className="text-slate-300 p-3 bg-slate-800 border border-slate-700 rounded text-sm">
                    {test.edge_cases || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit / Connectivity Track */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-500 text-sm">Escalation Source</span>
              <span className="text-blue-400 font-mono text-xs cursor-pointer hover:underline">
                {test.source_type}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-500 text-sm">Source UID</span>
              <span className="text-slate-400 font-mono text-[10px]">
                {test.source_id.slice(0, 18)}...
              </span>
            </div>
          </div>

          {test.similar_qa_refs && test.similar_qa_refs.length > 0 && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
              <div className="flex items-center text-indigo-400 mb-2 font-medium">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Deduplication Signal
              </div>
              <p className="text-xs text-indigo-300">
                The Generative QA engine isolated{" "}
                <strong>{test.similar_qa_refs.length} equivalent checks</strong>{" "}
                natively in `{test.product_area}`.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
