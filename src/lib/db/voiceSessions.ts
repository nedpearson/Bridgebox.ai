import { supabase } from "../supabase";
import type { VoiceSession, VoiceContextMode } from "../../types/enhancement";

export const voiceSessionsService = {
  async create(params: {
    workspaceId: string;
    contextMode: VoiceContextMode;
    rawTranscript: string;
    durationSeconds: number;
    enhancementRequestId?: string;
  }): Promise<VoiceSession> {
    const { data: userResult } = await supabase.auth.getUser();
    if (!userResult.user) throw new Error("Not authenticated");

    const wordCount = params.rawTranscript
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    const { data, error } = await supabase
      .from("bb_voice_sessions")
      .insert({
        workspace_id: params.workspaceId,
        enhancement_request_id: params.enhancementRequestId || null,
        created_by: userResult.user.id,
        context_mode: params.contextMode,
        raw_transcript: params.rawTranscript,
        duration_seconds: params.durationSeconds,
        word_count: wordCount,
        language: "en",
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async linkToRequest(sessionId: string, requestId: string): Promise<void> {
    const { error } = await supabase
      .from("bb_voice_sessions")
      .update({ enhancement_request_id: requestId, status: "submitted" })
      .eq("id", sessionId);

    if (error) throw error;
  },

  async listByWorkspace(
    workspaceId: string,
    limit = 20,
  ): Promise<VoiceSession[]> {
    const { data, error } = await supabase
      .from("bb_voice_sessions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
