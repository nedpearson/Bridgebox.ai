import { Logger } from "./logger";
import { supabase } from "./supabase";

export interface InternalRecording {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  tags: string[];
  category: string | null;
  related_internal_entity_type: string | null;
  related_internal_entity_id: string | null;
  thumbnail_path: string | null;
  transcript_status: string;
  summary_status: string;
  notes: string | null;
  module_reference: string | null;
  duration: number | null;
  size: number | null;
  mime_type: string | null;
  storage_path: string;
  status:
    | "draft"
    | "recording"
    | "uploading"
    | "processing"
    | "ready"
    | "saved"
    | "failed"
    | "archived";
  recording_mode?: "standard" | "development";
  intended_use?: string | null;
  build_notes?: string | null;
  feature_request_notes?: string | null;
  email_share_history?: any[];
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export const internalRecordingsApi = {
  /**
   * AI PROCESSING HOOKS (Internal Use Only)
   * Placeholder for future transcription, summary, and action extraction pipeline.
   * This should trigger an Edge Function or background worker securely.
   */
  async triggerAIProcessing(recordingId: string): Promise<void> {
    Logger.info(
      `[AI Hook] Triggering transcription & summary jobs for recording: ${recordingId}`,
    );
    // Future implementation:
    // await supabase.functions.invoke('process-internal-recording', {
    //   body: { recordingId, tasks: ['transcribe', 'summarize', 'extract_actions'] }
    // });

    // Simulate updating status to processing
    await this.updateRecording(recordingId, { status: "processing" });
  },

  async listRecordings(): Promise<InternalRecording[]> {
    const { data, error } = await supabase
      .from("bb_internal_recordings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as InternalRecording[];
  },

  async createRecording(
    metadata: Partial<InternalRecording>,
  ): Promise<InternalRecording> {
    const { data, error } = await supabase
      .from("bb_internal_recordings")
      .insert([metadata])
      .select()
      .single();

    if (error) throw error;
    return data as InternalRecording;
  },

  async updateRecording(
    id: string,
    updates: Partial<InternalRecording>,
  ): Promise<InternalRecording> {
    const { data, error } = await supabase
      .from("bb_internal_recordings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as InternalRecording;
  },

  async deleteRecording(id: string, storagePath: string): Promise<void> {
    // Delete from storage first
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("internal-recordings")
        .remove([storagePath]);
      if (storageError) throw storageError;
    }

    // Delete database record
    const { error } = await supabase
      .from("bb_internal_recordings")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async uploadRecordingFile(
    path: string,
    file: Blob,
    type: string,
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from("internal-recordings")
      .upload(path, file, {
        contentType: type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;
    return data.path;
  },

  async getRecordingUrl(path: string): Promise<string> {
    const { data } = supabase.storage
      .from("internal-recordings")
      .getPublicUrl(path);

    // If bucket is not public (which it isn't), we must use createSignedUrl to view/download
    // Wait, let's use createSignedUrl instead of getPublicUrl for security.
    const { data: signedData, error } = await supabase.storage
      .from("internal-recordings")
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) throw error;
    return signedData.signedUrl;
  },
};
