import { useState, useCallback } from "react";
import { aiService } from "../lib/ai/services/aiService";
import type { AITaskResult } from "../lib/ai/types";

export interface UseAIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isAIGenerated: boolean;
  fromCache: boolean;
}

export function useAI<T>() {
  const [state, setState] = useState<UseAIState<T>>({
    data: null,
    loading: false,
    error: null,
    isAIGenerated: false,
    fromCache: false,
  });

  const execute = useCallback(
    async (taskFn: () => Promise<AITaskResult<T>>) => {
      setState({
        data: null,
        loading: true,
        error: null,
        isAIGenerated: false,
        fromCache: false,
      });

      try {
        const result = await taskFn();

        if (result.success && result.data) {
          setState({
            data: result.data,
            loading: false,
            error: null,
            isAIGenerated: true,
            fromCache: result.fromCache || false,
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: result.error?.message || "AI task failed",
            isAIGenerated: false,
            fromCache: false,
          });
        }
      } catch (error: any) {
        setState({
          data: null,
          loading: false,
          error: error.message || "Unknown error",
          isAIGenerated: false,
          fromCache: false,
        });
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isAIGenerated: false,
      fromCache: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isAvailable: aiService.isAvailable(),
    provider: aiService.getProviderName(),
  };
}

export function useLeadSummary() {
  const ai = useAI<any>();

  const summarize = useCallback(
    (leadData: any, useCache = true) => {
      return ai.execute(() => aiService.summarizeLead(leadData, useCache));
    },
    [ai],
  );

  return { ...ai, summarize };
}

export function useProjectSummary() {
  const ai = useAI<any>();

  const summarize = useCallback(
    (projectData: any, useCache = true) => {
      return ai.execute(() =>
        aiService.summarizeProject(projectData, useCache),
      );
    },
    [ai],
  );

  return { ...ai, summarize };
}

export function useTicketSummary() {
  const ai = useAI<any>();

  const summarize = useCallback(
    (ticketData: any, useCache = true) => {
      return ai.execute(() => aiService.summarizeTicket(ticketData, useCache));
    },
    [ai],
  );

  return { ...ai, summarize };
}

export function useBusinessInsights() {
  const ai = useAI<any>();

  const generate = useCallback(
    (metricsData: any, useCache = true) => {
      return ai.execute(() =>
        aiService.generateBusinessInsights(metricsData, useCache),
      );
    },
    [ai],
  );

  return { ...ai, generate };
}

export function useActionRecommendations() {
  const ai = useAI<any[]>();

  const recommend = useCallback(
    (contextData: any) => {
      return ai.execute(() => aiService.recommendActions(contextData));
    },
    [ai],
  );

  return { ...ai, recommend };
}

export function useProposalDraft() {
  const ai = useAI<any>();

  const draft = useCallback(
    (proposalData: any) => {
      return ai.execute(() => aiService.draftProposal(proposalData));
    },
    [ai],
  );

  return { ...ai, draft };
}
