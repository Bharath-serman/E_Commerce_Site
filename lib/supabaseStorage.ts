import { supabase } from './supabase';

const BUCKET_NAME = 'prod_images';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param fileName - Optional custom filename (defaults to original filename with timestamp)
 * @returns UploadResult with URL and path
 */
export async function uploadImage(
  file: File,
  fileName?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename if not provided
    const timestamp = Date.now();
    const uniqueFileName = fileName || `${timestamp}-${file.name}`;
    const filePath = `products/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return {
        url: '',
        path: '',
        error: uploadError.message || 'Failed to upload image',
      };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - The path of the file to delete
 * @returns true if successful, false otherwise
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
