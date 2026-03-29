import { supabase } from '../supabase';
import type { EnhancementMedia, MediaProcessingStatus } from '../../types/enhancement';

export const enhancementMediaService = {
  async upload(params: {
    file: File;
    workspaceId: string;
    enhancementRequestId: string;
    annotation?: string;
  }): Promise<EnhancementMedia> {
    const { data: userResult } = await supabase.auth.getUser();
    if (!userResult.user) throw new Error('Not authenticated');

    const fileType: EnhancementMedia['file_type'] = params.file.type.startsWith('image/')
      ? 'screenshot'
      : params.file.type.startsWith('video/')
      ? 'video'
      : params.file.type.startsWith('audio/')
      ? 'audio'
      : 'document';

    // Sanitize filename
    const timestamp = Date.now();
    const ext = params.file.name.split('.').pop() || 'bin';
    const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${params.workspaceId}/${params.enhancementRequestId}/${timestamp}_${safeName}`;

    // Upload — try enhancement_media bucket, fall back to internal_assets
    let finalPath = storagePath;
    let storageUrl: string | undefined;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('enhancement_media')
        .upload(storagePath, params.file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;
      finalPath = uploadData.path;

      const { data: urlData } = await supabase.storage
        .from('enhancement_media')
        .createSignedUrl(finalPath, 3600);
      storageUrl = urlData?.signedUrl;
    } catch {
      // Fallback to internal_assets if bucket doesn't exist yet
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('internal_assets')
        .upload(storagePath, params.file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;
      finalPath = uploadData.path;

      const { data: urlData } = await supabase.storage
        .from('internal_assets')
        .createSignedUrl(finalPath, 3600);
      storageUrl = urlData?.signedUrl;
    }

    const { data, error } = await supabase
      .from('bb_enhancement_media')
      .insert({
        enhancement_request_id: params.enhancementRequestId,
        workspace_id: params.workspaceId,
        uploaded_by: userResult.user.id,
        file_name: params.file.name,
        file_type: fileType,
        mime_type: params.file.type,
        file_size_bytes: params.file.size,
        storage_path: finalPath,
        storage_url: storageUrl || null,
        annotation: params.annotation || null,
        processing_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(
    id: string,
    status: MediaProcessingStatus,
    analysisJson?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('bb_enhancement_media')
      .update({ processing_status: status, analysis_json: analysisJson || null })
      .eq('id', id);

    if (error) throw error;
  },

  async listByRequest(requestId: string): Promise<EnhancementMedia[]> {
    const { data, error } = await supabase
      .from('bb_enhancement_media')
      .select('*')
      .eq('enhancement_request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async delete(id: string, storagePath: string): Promise<void> {
    // Best-effort storage cleanup
    try {
      await supabase.storage.from('enhancement_media').remove([storagePath]);
    } catch {
      try {
        await supabase.storage.from('internal_assets').remove([storagePath]);
      } catch {
        console.warn('Storage cleanup failed — DB record will still be removed');
      }
    }

    const { error } = await supabase.from('bb_enhancement_media').delete().eq('id', id);
    if (error) throw error;
  },
};
