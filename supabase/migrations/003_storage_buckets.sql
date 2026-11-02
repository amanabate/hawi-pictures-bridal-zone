-- ============================================================================
-- 003_storage_buckets.sql
-- Hawi Pictures & Bridal Zone - Storage Buckets & Policies
-- ============================================================================

-- Create storage buckets if storage schema exists (standard Supabase setup)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'payment-screenshots',
    'payment-screenshots',
    false, -- Strictly PRIVATE: signed URLs required
    10485760, -- Max 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'gallery',
    'gallery',
    true, -- PUBLIC: for wedding & bridal portfolio
    20971520, -- Max 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- Storage Policies for 'payment-screenshots'
-- ----------------------------------------------------------------------------
-- Owner & Receptionist can read screenshots via signed URLs
CREATE POLICY "Owner and Receptionist view screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots' AND
    public.is_receptionist_or_owner()
  );

-- Upload policy: Server route handlers (service role) bypass RLS.
-- Authenticated staff can also upload if necessary.
CREATE POLICY "Staff upload screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots' AND
    public.is_staff_or_above()
  );

-- ----------------------------------------------------------------------------
-- Storage Policies for 'gallery'
-- ----------------------------------------------------------------------------
-- Public read access to gallery objects
CREATE POLICY "Public read gallery objects"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

-- Owner and Receptionist can upload, update, and delete gallery images
CREATE POLICY "Owner and Receptionist manage gallery objects"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'gallery' AND
    public.is_receptionist_or_owner()
  )
  WITH CHECK (
    bucket_id = 'gallery' AND
    public.is_receptionist_or_owner()
  );
