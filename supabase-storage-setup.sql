-- Ejecutar en el SQL Editor de Supabase Dashboard

-- 1. Agregar columna logo_url a la tabla profiles (si no existe)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Verificar que la columna se agregó
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'logo_url';

-- 2. Crear bucket de storage para logos (ejecutar en Storage > Create bucket)
-- Nombre: logos
-- Public bucket: SÍ (marcar checkbox "Public bucket")
-- Allowed MIME types: image/*

-- O alternativamente, ejecutar este SQL para crear el bucket vía SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- 3. Configurar políticas RLS para el bucket de storage
-- Permitir a usuarios autenticados subir sus propios logos
CREATE POLICY "Users can upload their own logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = 'logos' AND
  auth.uid()::text = (storage.filename(name))[1]
);

-- Permitir a usuarios ver sus propios logos
CREATE POLICY "Users can view their own logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'logos' AND
  auth.uid()::text = SPLIT_PART(storage.filename(name), '-', 1)
);

-- Permitir a usuarios actualizar sus propios logos
CREATE POLICY "Users can update their own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  auth.uid()::text = SPLIT_PART(storage.filename(name), '-', 1)
);

-- Permitir a usuarios eliminar sus propios logos
CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  auth.uid()::text = SPLIT_PART(storage.filename(name), '-', 1)
);

-- Permitir acceso público de lectura (para mostrar logos en facturas)
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');
