import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { onboardingService } from '../lib/db/onboarding';
import type { OnboardingData } from '../types/onboarding';

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  saveOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loading: boolean;
  error: string | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  isOnboardingComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const INITIAL_DATA: OnboardingData = {
  company_name: '',
  company_size: '',
  industry: '',
  website: '',
  primary_contact_name: '',
  primary_contact_email: '',
  services_needed: [],
  current_systems: {},
  business_goals: [],
  timeline: '',
  additional_notes: '',
  status: 'draft',
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, currentOrganization } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const totalSteps = 7;

  useEffect(() => {
    if (user && currentOrganization?.id) {
      loadExistingOnboarding();
    }
  }, [user, currentOrganization?.id]);

  const loadExistingOnboarding = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const existing = await onboardingService.getOnboardingByOrganization(
        currentOrganization.id
      );

      if (existing) {
        setOnboardingData(existing);
        setIsOnboardingComplete(existing.status === 'completed');
        if (existing.status === 'draft' && currentStep === 0) {
          setCurrentStep(1);
        }
      } else {
        setOnboardingData({
          ...INITIAL_DATA,
          organization_id: currentOrganization.id,
          user_id: user?.id,
          primary_contact_name: user?.user_metadata?.full_name || '',
          primary_contact_email: user?.email || '',
          company_name: currentOrganization.name || '',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const saveOnboarding = async () => {
    if (!currentOrganization?.id || !user?.id) {
      throw new Error('Missing organization or user');
    }

    try {
      setLoading(true);
      setError(null);

      const dataToSave = {
        ...onboardingData,
        organization_id: currentOrganization.id,
        user_id: user.id,
      };

      const saved = await onboardingService.createOrUpdateOnboarding(dataToSave);
      setOnboardingData(saved);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!onboardingData.id) {
      await saveOnboarding();
    }

    if (onboardingData.id) {
      try {
        setLoading(true);
        const completed = await onboardingService.completeOnboarding(onboardingData.id);
        setOnboardingData(completed);
        setIsOnboardingComplete(true);
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        saveOnboarding,
        completeOnboarding,
        loading,
        error,
        currentStep,
        setCurrentStep,
        totalSteps,
        isOnboardingComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
