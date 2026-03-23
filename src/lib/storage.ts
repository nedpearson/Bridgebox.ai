import { supabase } from './supabase';

export type BucketName = 'deliverables' | 'support_attachments' | 'client_documents' | 'internal_assets';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  created_at: string;
}

export const storageService = {
  async uploadFile(
    bucket: BucketName,
    path: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ path: string; url: string }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const url = await this.createSignedUrl(bucket, data.path);

    return {
      path: data.path,
      url,
    };
  },

  async getFileUrl(bucket: BucketName, path: string): Promise<string> {
    return await this.createSignedUrl(bucket, path);
  },

  async createSignedUrl(bucket: BucketName, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },

  async listFiles(bucket: BucketName, folderPath: string): Promise<FileMetadata[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;

    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => ({
        id: file.id,
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'application/octet-stream',
        url: await this.getFileUrl(bucket, `${folderPath}/${file.name}`),
        path: `${folderPath}/${file.name}`,
        created_at: file.created_at,
      }))
    );

    return filesWithUrls;
  },

  async deleteFile(bucket: BucketName, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  buildDeliverablePath(organizationId: string, projectId: string, fileName: string): string {
    return `${organizationId}/${projectId}/${this.sanitizeFileName(fileName)}`;
  },

  buildSupportAttachmentPath(organizationId: string, ticketId: string, fileName: string): string {
    return `${organizationId}/${ticketId}/${this.sanitizeFileName(fileName)}`;
  },

  buildClientDocumentPath(organizationId: string, fileName: string): string {
    return `${organizationId}/${this.sanitizeFileName(fileName)}`;
  },

  sanitizeFileName(fileName: string): string {
    const timestamp = Date.now();
    const sanitized = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
    const parts = sanitized.split('.');
    const ext = parts.pop();
    const name = parts.join('.');
    return `${name}_${timestamp}.${ext}`;
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip')) return '📦';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    return '📎';
  },

  validateFile(file: File, maxSizeMB: number = 50, allowedTypes?: string[]): { valid: boolean; error?: string } {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed',
      };
    }

    return { valid: true };
  },
};
