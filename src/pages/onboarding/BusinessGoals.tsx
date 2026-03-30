import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Target, Check } from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { BUSINESS_GOAL_OPTIONS } from "../../types/onboarding";

export default function BusinessGoals() {
  const {
    onboardingData,
    updateOnboardingData,
    saveOnboarding,
    setCurrentStep,
  } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    onboardingData.business_goals || [],
  );
  const [customGoal, setCustomGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedGoals(onboardingData.business_goals || []);
  }, [onboardingData.business_goals]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals([...selectedGoals, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      updateOnboardingData({ business_goals: selectedGoals });
      await saveOnboarding();
      setCurrentStep(5);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = selectedGoals.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <Card glass className="p-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-xl flex items-center justify-center">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Business Goals</h2>
            <p className="text-slate-400 mt-1">
              What are you looking to achieve?
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {BUSINESS_GOAL_OPTIONS.map((goal, index) => {
            const isSelected = selectedGoals.includes(goal);

            return (
              <motion.button
                key={goal}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleGoal(goal)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                }`}
              >
                <span className="text-white font-medium">{goal}</span>
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-600 bg-slate-800"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="border-t border-slate-700 pt-6 mt-6">
          <label
            htmlFor="custom_goal"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Add Custom Goal
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              id="custom_goal"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomGoal()}
              className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Type your custom goal"
            />
            <Button
              variant="outline"
              onClick={addCustomGoal}
              disabled={!customGoal.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {selectedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mt-6"
          >
            <p className="text-sm text-indigo-500 font-medium mb-3">
              Selected Goals:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedGoals.map((goal) => (
                <span
                  key={goal}
                  className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm text-white flex items-center gap-2"
                >
                  {goal}
                  <button
                    onClick={() => toggleGoal(goal)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            <ArrowLeft className="mr-2 w-5 h-5" /> Back
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!isValid || isSaving}
          >
            {isSaving ? "Saving..." : "Continue"}{" "}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
