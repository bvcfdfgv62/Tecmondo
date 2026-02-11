-- Migration to add fields for Service Order V2 (Pattern Password, Checklists, Images)

-- Add JSONB column for entry checklists (Liga, Tela Quebrada, etc)
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS entry_condition JSONB DEFAULT '{}'::jsonb;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS pattern_password TEXT;

-- Add Columns for Images (Before/After)
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS img_frente_quebrado TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS img_tras_quebrado TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS img_frente_reparado TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS img_tras_reparado TEXT;

-- Add Columns for Technician Notes
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS technical_notes TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS risk_assessment TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS repair_category TEXT;

-- Add Signatures
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS client_signature TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS technician_signature TEXT;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS warranty_terms TEXT;

-- Ensure Storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('os-images', 'os-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for Storage (Public Read - allow anyone)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'os-images' );

-- Policy for Storage (Authenticated Upload - allow anyone logged in)
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'os-images' );

-- Policy for Storage (Update - allow owner/anyone logged in)
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'os-images' );
