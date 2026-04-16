-- Enable RLS on storage (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow public uploads to the prod_images bucket
CREATE POLICY "Allow public uploads to prod_images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'prod_images'
);

-- Policy to allow public reads from the prod_images bucket
CREATE POLICY "Allow public reads from prod_images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'prod_images'
);

-- Policy to allow users to update their own uploads
CREATE POLICY "Allow users to update their own uploads"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (
  bucket_id = 'prod_images'
)
WITH CHECK (
  bucket_id = 'prod_images'
);

-- Policy to allow users to delete their own uploads
CREATE POLICY "Allow users to delete their own uploads"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (
  bucket_id = 'prod_images'
);
