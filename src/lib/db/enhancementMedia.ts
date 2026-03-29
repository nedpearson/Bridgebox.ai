import * as tus from 'tus-js-client';
import { supabase } from '../supabase';
import type { EnhancementMedia, MediaProcessingStatus } from '../../types/enhancement';

export const enhancementMediaService = {
  async upload(params: {
    file: File;
    workspaceId: string;
    enhancementRequestId: string;
    annotation?: string;
    onProgress?: (progress: number) => void;
  }): Promise<EnhancementMedia> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error('Not authenticated');
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

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

    // Upload via high-performance fast streams using Tus Protocol to combat timeout issues
    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(params.file, {
        endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000],
        headers: {
          authorization: `Bearer ${sessionData.session?.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: false,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: 'enhancement_media',
          objectName: storagePath,
          contentType: params.file.type || 'application/octet-stream',
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024,
        onError: reject,
        onProgress: (bytesUploaded, bytesTotal) => {
          params.onProgress?.((bytesUploaded / bytesTotal) * 100);
        },
        onSuccess: () => resolve(),
      });

      upload.findPreviousUploads().then((previous) => {
        if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      });
    });

    const { data: urlData } = await supabase.storage
      .from('enhancement_media')
      .createSignedUrl(finalPath, 3600);
    storageUrl = urlData?.signedUrl;


    const { data, error } = await supabase
      .from('bb_enhancement_media')
      .insert({
        enhancement_request_id: params.enhancementRequestId,
        workspace_id: params.workspaceId,
        uploaded_by: userData.user.id,
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
