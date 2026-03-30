import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  useOnboarding,
  OnboardingProvider,
} from "../../contexts/OnboardingContext";
import OnboardingLayout from "../../layouts/OnboardingLayout";
import Welcome from "./Welcome";
import CompanyDetails from "./CompanyDetails";
import ServicesNeeded from "./ServicesNeeded";
import CurrentSystems from "./CurrentSystems";
import BusinessGoals from "./BusinessGoals";
import Timeline from "./Timeline";
import Review from "./Review";

function OnboardingContent() {
  const { currentStep } = useOnboarding();

  const steps = [
    <Welcome />,
    <CompanyDetails />,
    <ServicesNeeded />,
    <CurrentSystems />,
    <BusinessGoals />,
    <Timeline />,
    <Review />,
  ];

  return <OnboardingLayout>{steps[currentStep]}</OnboardingLayout>;
}

export default function OnboardingFlow() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
