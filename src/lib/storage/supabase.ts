import { supabaseAdmin } from '@/lib/api/supabase-server'
import type { IStorageService, UploadResult } from './types'

const BUCKET = 'dokumen'

export const storageService: IStorageService = {
  async upload(buffer, filePath, mimeType): Promise<UploadResult> {
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: mimeType, upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)

    return {
      fileId: filePath,
      webViewLink: publicUrl,
      webContentLink: publicUrl,
    }
  },

  async getUrl(fileId: string) {
    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileId)

    return {
      webViewLink: publicUrl,
      webContentLink: publicUrl,
    }
  },

  async copy(fromPath: string, toPath: string): Promise<{ fileId: string; webViewLink: string }> {
    const { error: copyError } = await supabaseAdmin.storage
      .from(BUCKET)
      .copy(fromPath, toPath)

    if (copyError) throw new Error('Gagal copy file: ' + copyError.message)

    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(toPath)

    return {
      fileId: toPath,
      webViewLink: publicUrl,
    }
  },

  async delete(fileId: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([fileId])
    if (error) throw new Error(error.message)
  },

  async list(prefix: string) {
    const parts = prefix.split('/').filter(Boolean)
    const folderPath = parts.length > 0 ? parts.join('/') : ''

    const { data: files, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(folderPath, { limit: 200 })

    if (error) throw new Error(error.message)

    return (files ?? []).map((f) => {
      const fullPath = folderPath ? `${folderPath}/${f.name}` : f.name
      const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fullPath)

      return {
        fileId: fullPath,
        name: f.name,
        webViewLink: publicUrl,
        webContentLink: publicUrl,
        mimeType: f.metadata?.mimetype ?? undefined,
        size: f.metadata?.size ? Number(f.metadata.size) : undefined,
      }
    })
  },
}
