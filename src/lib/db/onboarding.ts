import { supabase } from "../supabase";
import type { OnboardingData } from "../../types/onboarding";

export const onboardingService = {
  async createOrUpdateOnboarding(data: OnboardingData) {
    const { id, ...onboardingData } = data;

    if (id) {
      const { data: updated, error } = await supabase
        .from("bb_onboarding_responses")
        .update({
          ...onboardingData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return updated as OnboardingData;
    }

    const { data: created, error } = await supabase
      .from("bb_onboarding_responses")
      .insert([onboardingData])
      .select()
      .maybeSingle();

    if (error) throw error;
    return created as OnboardingData;
  },

  async getOnboardingByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from("bb_onboarding_responses")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data as OnboardingData | null;
  },

  async completeOnboarding(id: string) {
    const { data, error } = await supabase
      .from("bb_onboarding_responses")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (data) {
      await supabase
        .from("bb_organizations")
        .update({
          onboarding_status: "completed",
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", data.organization_id);
    }

    return data as OnboardingData;
  },

  async getAllOnboardingResponses() {
    const { data, error } = await supabase
      .from("bb_onboarding_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as OnboardingData[];
  },

  async getOnboardingById(id: string) {
    const { data, error } = await supabase
      .from("bb_onboarding_responses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as OnboardingData | null;
  },
};
