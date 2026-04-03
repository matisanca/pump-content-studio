-- ============================================
-- PUMP CONTENT STUDIO — Migration V1
-- Supabase project: pqozzhnnfstplqrrpqwi
-- ============================================

-- Tabla principal: reels
CREATE TABLE IF NOT EXISTS pcs_reels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificacion y origen
  ig_url TEXT,
  ig_media_id TEXT UNIQUE,
  titulo TEXT,
  caption TEXT,
  cta_text TEXT,
  fecha_publicacion DATE,
  duracion_segundos INTEGER,
  thumbnail_url TEXT,

  -- Clasificacion
  tipo TEXT CHECK (tipo IN ('reel', 'trial_reel', 'carousel', 'story')) DEFAULT 'reel',
  pilares TEXT[],
  subtema TEXT,
  formato_narrativo TEXT CHECK (formato_narrativo IN (
    'problema-solucion', 'lista', 'historia', 'polemica',
    'tutorial', 'comparacion', 'antes-despues', 'dato-sorprendente'
  )),
  hook_tipo TEXT CHECK (hook_tipo IN (
    'pregunta', 'afirmacion-polemica', 'dato-sorprendente',
    'enemigo', 'promesa', 'error-comun', 'identidad'
  )),
  tiene_ads BOOLEAN DEFAULT false,

  -- Metricas publicas (scraping)
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views_totales INTEGER DEFAULT 0,

  -- Metricas privadas (Insights / manual)
  views_organicas INTEGER,
  reach_organico INTEGER,
  reach_total INTEGER,
  saves INTEGER,
  shares INTEGER,
  watch_time_total_minutos NUMERIC,
  retencion_estimada NUMERIC,
  abandono_promedio_segundos NUMERIC,

  -- Metricas pagadas
  views_paid INTEGER,
  reach_paid INTEGER,
  impr_paid INTEGER,
  spend NUMERIC,
  ctr_pago NUMERIC,
  cpv NUMERIC,
  cpm NUMERIC,
  clicks INTEGER,

  -- Metricas derivadas
  engagement_rate NUMERIC,
  save_rate NUMERIC,
  share_rate NUMERIC,
  comment_rate NUMERIC,
  like_rate NUMERIC,
  watch_time_promedio_segundos NUMERIC,
  views_reach_ratio NUMERIC,
  multiplicador NUMERIC,

  -- Tracking de ventas
  genero_ventas BOOLEAN DEFAULT false,
  producto_vendido TEXT CHECK (producto_vendido IN (
    'Pampflix', 'Asesoria Pump Team', 'Consulta PAMPFARMA', 'Otro'
  )),
  ventas_atribuidas INTEGER DEFAULT 0,
  revenue_atribuido NUMERIC DEFAULT 0,

  -- Contenido para analisis IA
  transcripcion TEXT,
  palabras_por_minuto NUMERIC,
  hook_text TEXT,
  estructura_narrativa TEXT,

  -- Estado de carga
  datos_completos BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_pcs_reels_fecha ON pcs_reels(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_pcs_reels_pilares ON pcs_reels USING GIN(pilares);
CREATE INDEX IF NOT EXISTS idx_pcs_reels_save_rate ON pcs_reels(save_rate DESC);
CREATE INDEX IF NOT EXISTS idx_pcs_reels_multiplicador ON pcs_reels(multiplicador DESC);
CREATE INDEX IF NOT EXISTS idx_pcs_reels_datos ON pcs_reels(datos_completos);
CREATE INDEX IF NOT EXISTS idx_pcs_reels_ig_url ON pcs_reels(ig_url);

-- Snapshots de cuenta
CREATE TABLE IF NOT EXISTS pcs_account_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE UNIQUE,
  followers INTEGER,
  following INTEGER,
  alcance_semanal INTEGER,
  impresiones_semanales INTEGER,
  visitas_perfil INTEGER,
  clicks_link INTEGER,
  nuevos_seguidores INTEGER,
  seguidores_perdidos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas
CREATE TABLE IF NOT EXISTS pcs_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  pilar TEXT,
  subtema TEXT,
  formato_narrativo TEXT,
  hook_tipo TEXT,
  hook_propuesto TEXT,
  cta_propuesto TEXT,
  estado TEXT CHECK (estado IN (
    'idea', 'en_guion', 'grabado', 'editado', 'publicado', 'descartado'
  )) DEFAULT 'idea',
  prioridad INTEGER DEFAULT 0,
  inspirado_en UUID REFERENCES pcs_reels(id),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guiones
CREATE TABLE IF NOT EXISTS pcs_guiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES pcs_ideas(id),
  reel_id UUID REFERENCES pcs_reels(id),
  version INTEGER DEFAULT 1,
  titulo TEXT,
  hook TEXT,
  desarrollo TEXT,
  cta TEXT,
  guion_completo TEXT,
  duracion_estimada_segundos INTEGER,
  ppm_objetivo INTEGER DEFAULT 130,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analisis IA
CREATE TABLE IF NOT EXISTS pcs_ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id UUID REFERENCES pcs_reels(id),
  idea_id UUID REFERENCES pcs_ideas(id),
  tipo TEXT CHECK (tipo IN (
    'diagnostico', 'hook_analysis', 'cta_analysis',
    'version_100k', 'idea_expansion', 'guion_completo', 'chat_libre'
  )),
  pregunta TEXT,
  respuesta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de scraping
CREATE TABLE IF NOT EXISTS pcs_scraping_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha_scraping TIMESTAMPTZ DEFAULT NOW(),
  reels_encontrados INTEGER,
  reels_nuevos INTEGER,
  reels_actualizados INTEGER,
  errores TEXT[],
  status TEXT CHECK (status IN ('success', 'partial', 'error'))
);

-- Funcion: benchmarks 90 dias
CREATE OR REPLACE FUNCTION get_benchmarks_90d()
RETURNS TABLE(
  total_reels BIGINT,
  avg_views NUMERIC,
  median_views NUMERIC,
  avg_save_rate NUMERIC,
  avg_like_rate NUMERIC,
  avg_comment_rate NUMERIC,
  avg_share_rate NUMERIC,
  avg_engagement NUMERIC,
  avg_retencion NUMERIC,
  best_pilar TEXT,
  best_formato TEXT
) AS $$
  WITH stats AS (
    SELECT
      COUNT(*) as total_reels,
      AVG(views_totales) as avg_views,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY views_totales) as median_views,
      AVG(save_rate) as avg_save_rate,
      AVG(like_rate) as avg_like_rate,
      AVG(comment_rate) as avg_comment_rate,
      AVG(share_rate) as avg_share_rate,
      AVG(engagement_rate) as avg_engagement,
      AVG(retencion_estimada) as avg_retencion
    FROM pcs_reels
    WHERE fecha_publicacion >= CURRENT_DATE - INTERVAL '90 days'
  ),
  best_p AS (
    SELECT unnest(pilares) as pilar, AVG(save_rate) as sr
    FROM pcs_reels
    WHERE fecha_publicacion >= CURRENT_DATE - INTERVAL '90 days' AND save_rate IS NOT NULL
    GROUP BY pilar ORDER BY sr DESC LIMIT 1
  ),
  best_f AS (
    SELECT formato_narrativo, AVG(views_totales) as av
    FROM pcs_reels
    WHERE fecha_publicacion >= CURRENT_DATE - INTERVAL '90 days' AND formato_narrativo IS NOT NULL
    GROUP BY formato_narrativo ORDER BY av DESC LIMIT 1
  )
  SELECT
    s.total_reels, s.avg_views, s.median_views,
    s.avg_save_rate, s.avg_like_rate, s.avg_comment_rate,
    s.avg_share_rate, s.avg_engagement, s.avg_retencion,
    COALESCE(bp.pilar, 'N/A'),
    COALESCE(bf.formato_narrativo, 'N/A')
  FROM stats s
  LEFT JOIN best_p bp ON true
  LEFT JOIN best_f bf ON true;
$$ LANGUAGE sql;

-- Funcion: auto-calcular metricas derivadas
CREATE OR REPLACE FUNCTION pcs_calc_derived()
RETURNS TRIGGER AS $$
BEGIN
  -- Engagement rate
  IF COALESCE(NEW.reach_total, NEW.views_totales, 0) > 0 THEN
    NEW.engagement_rate := ROUND(
      (COALESCE(NEW.likes,0) + COALESCE(NEW.saves,0) + COALESCE(NEW.comments,0) + COALESCE(NEW.shares,0))::NUMERIC
      / GREATEST(COALESCE(NEW.reach_total, NEW.views_totales), 1) * 100, 2
    );
  END IF;

  -- Rates individuales
  IF COALESCE(NEW.reach_total, NEW.views_totales, 0) > 0 THEN
    NEW.save_rate := ROUND(COALESCE(NEW.saves,0)::NUMERIC / GREATEST(COALESCE(NEW.reach_total, NEW.views_totales),1) * 100, 2);
    NEW.share_rate := ROUND(COALESCE(NEW.shares,0)::NUMERIC / GREATEST(COALESCE(NEW.reach_total, NEW.views_totales),1) * 100, 2);
    NEW.comment_rate := ROUND(COALESCE(NEW.comments,0)::NUMERIC / GREATEST(COALESCE(NEW.reach_total, NEW.views_totales),1) * 100, 2);
    NEW.like_rate := ROUND(COALESCE(NEW.likes,0)::NUMERIC / GREATEST(COALESCE(NEW.reach_total, NEW.views_totales),1) * 100, 2);
  END IF;

  -- Views/Reach ratio
  IF COALESCE(NEW.reach_total, 0) > 0 THEN
    NEW.views_reach_ratio := ROUND(COALESCE(NEW.views_totales,0)::NUMERIC / NEW.reach_total, 2);
  END IF;

  -- Watch time promedio
  IF COALESCE(NEW.views_totales, 0) > 0 AND NEW.watch_time_total_minutos IS NOT NULL THEN
    NEW.watch_time_promedio_segundos := ROUND((NEW.watch_time_total_minutos * 60) / NEW.views_totales, 1);
  END IF;

  -- Datos completos
  NEW.datos_completos := (
    NEW.saves IS NOT NULL AND
    NEW.reach_total IS NOT NULL AND
    NEW.shares IS NOT NULL
  );

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_pcs_calc_derived
  BEFORE INSERT OR UPDATE ON pcs_reels
  FOR EACH ROW EXECUTE FUNCTION pcs_calc_derived();

-- Funcion: calcular multiplicador (se ejecuta despues del insert/update)
CREATE OR REPLACE FUNCTION pcs_calc_multiplicador()
RETURNS TRIGGER AS $$
DECLARE
  avg_v NUMERIC;
BEGIN
  SELECT AVG(views_totales) INTO avg_v
  FROM pcs_reels
  WHERE fecha_publicacion >= CURRENT_DATE - INTERVAL '90 days'
    AND views_totales > 0
    AND id != NEW.id;

  IF avg_v IS NOT NULL AND avg_v > 0 THEN
    UPDATE pcs_reels SET multiplicador = ROUND(NEW.views_totales::NUMERIC / avg_v, 1)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_pcs_calc_multiplicador
  AFTER INSERT OR UPDATE OF views_totales ON pcs_reels
  FOR EACH ROW EXECUTE FUNCTION pcs_calc_multiplicador();

-- RLS: desactivado para V1 (uso personal)
ALTER TABLE pcs_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcs_account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcs_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcs_guiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcs_ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pcs_scraping_log ENABLE ROW LEVEL SECURITY;

-- Policies permisivas para anon (uso personal sin auth)
CREATE POLICY "pcs_reels_all" ON pcs_reels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pcs_snapshots_all" ON pcs_account_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pcs_ideas_all" ON pcs_ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pcs_guiones_all" ON pcs_guiones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pcs_ai_all" ON pcs_ai_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "pcs_scraping_all" ON pcs_scraping_log FOR ALL USING (true) WITH CHECK (true);
