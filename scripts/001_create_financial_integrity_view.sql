-- Create the regions table for the Financial Integrity Dashboard
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL UNIQUE,
  index NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'stale', 'delayed', 'offline')),
  quality NUMERIC NOT NULL DEFAULT 100 CHECK (quality >= 0 AND quality <= 100),
  integrity_hash TEXT,
  trend_30d NUMERIC[] DEFAULT ARRAY[]::NUMERIC[],
  trend_90d NUMERIC[] DEFAULT ARRAY[]::NUMERIC[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the dashboard
CREATE POLICY "Allow public read access" ON public.regions
  FOR SELECT USING (true);

-- Create the secure API view
CREATE OR REPLACE VIEW public.vw_structural_api_v1_secure AS
SELECT 
  id,
  jsonb_build_object(
    'region_id', region_id,
    'index', index,
    'status', status,
    'quality', quality,
    'updated_at', updated_at,
    'trend_30d', trend_30d,
    'trend_90d', trend_90d
  ) AS payload,
  integrity_hash,
  created_at
FROM public.regions
ORDER BY region_id;

-- Seed initial region data for the prediction market monitoring
INSERT INTO public.regions (region_id, index, status, quality, integrity_hash, trend_30d, trend_90d, updated_at)
VALUES 
  ('NA-EAST', 847.32, 'healthy', 98.5, 'sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 
   ARRAY[820.1, 825.4, 830.2, 835.8, 840.1, 842.5, 845.0, 847.32]::NUMERIC[],
   ARRAY[780.5, 790.2, 800.1, 810.5, 820.3, 830.1, 840.2, 847.32]::NUMERIC[],
   now()),
  ('NA-WEST', 812.45, 'healthy', 97.2, 'sha256:b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1',
   ARRAY[800.2, 802.5, 805.1, 807.8, 809.2, 810.5, 811.8, 812.45]::NUMERIC[],
   ARRAY[750.1, 760.5, 770.2, 780.8, 790.1, 800.5, 810.2, 812.45]::NUMERIC[],
   now()),
  ('EU-WEST', 923.18, 'healthy', 99.1, 'sha256:c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2',
   ARRAY[900.5, 905.2, 910.1, 915.8, 918.2, 920.5, 922.1, 923.18]::NUMERIC[],
   ARRAY[850.2, 860.5, 875.1, 890.8, 905.2, 915.5, 920.1, 923.18]::NUMERIC[],
   now()),
  ('EU-CENTRAL', 891.67, 'stale', 94.8, 'sha256:d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3',
   ARRAY[880.1, 882.5, 885.2, 887.8, 889.1, 890.5, 891.2, 891.67]::NUMERIC[],
   ARRAY[820.5, 835.2, 850.1, 865.8, 875.2, 882.5, 888.1, 891.67]::NUMERIC[],
   now() - interval '15 minutes'),
  ('APAC-EAST', 756.89, 'delayed', 89.3, NULL,
   ARRAY[780.2, 775.5, 770.1, 765.8, 762.2, 760.5, 758.1, 756.89]::NUMERIC[],
   ARRAY[800.5, 790.2, 780.1, 770.8, 765.2, 760.5, 758.2, 756.89]::NUMERIC[],
   now() - interval '30 minutes'),
  ('APAC-SOUTH', 734.21, 'healthy', 96.7, 'sha256:e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4',
   ARRAY[710.1, 715.5, 720.2, 725.8, 728.2, 730.5, 732.8, 734.21]::NUMERIC[],
   ARRAY[680.5, 690.2, 700.1, 710.8, 720.2, 728.5, 732.1, 734.21]::NUMERIC[],
   now()),
  ('LATAM-NORTH', 678.54, 'healthy', 95.4, 'sha256:f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5',
   ARRAY[660.2, 665.5, 668.1, 672.8, 675.2, 676.5, 677.8, 678.54]::NUMERIC[],
   ARRAY[620.5, 635.2, 650.1, 660.8, 668.2, 673.5, 676.1, 678.54]::NUMERIC[],
   now()),
  ('LATAM-SOUTH', 645.33, 'offline', 0.0, NULL,
   ARRAY[680.1, 670.5, 660.2, 650.8, 648.2, 647.5, 646.1, 645.33]::NUMERIC[],
   ARRAY[720.5, 700.2, 680.1, 665.8, 655.2, 650.5, 647.2, 645.33]::NUMERIC[],
   now() - interval '2 hours'),
  ('MEA-CENTRAL', 789.12, 'healthy', 97.8, 'sha256:g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6',
   ARRAY[770.2, 775.5, 780.1, 783.8, 785.2, 787.5, 788.2, 789.12]::NUMERIC[],
   ARRAY[730.5, 745.2, 758.1, 770.8, 780.2, 785.5, 787.8, 789.12]::NUMERIC[],
   now()),
  ('OCEANIA', 701.78, 'stale', 92.1, 'sha256:h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7',
   ARRAY[695.1, 696.5, 698.2, 699.8, 700.2, 700.8, 701.2, 701.78]::NUMERIC[],
   ARRAY[670.5, 680.2, 688.1, 693.8, 697.2, 699.5, 700.8, 701.78]::NUMERIC[],
   now() - interval '10 minutes');
