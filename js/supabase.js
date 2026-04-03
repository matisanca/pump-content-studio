/* ============================================
   PUMP CONTENT STUDIO — Supabase Client
   ============================================ */

const DB = (() => {
  // Config — change these or use env vars via Netlify
  const SUPABASE_URL = 'https://pqozzhnnfstplqrrpqwi.supabase.co';
  const SUPABASE_ANON_KEY = localStorage.getItem('pcs_supabase_key') || '';

  let client = null;

  function init() {
    const key = SUPABASE_ANON_KEY || localStorage.getItem('pcs_supabase_key');
    if (!key) return false;
    client = supabase.createClient(SUPABASE_URL, key);
    return true;
  }

  function setKey(key) {
    localStorage.setItem('pcs_supabase_key', key);
    client = supabase.createClient(SUPABASE_URL, key);
  }

  function isConnected() {
    return !!client;
  }

  // ──── REELS ────

  async function getReels({ page = 1, limit = 20, orderBy = 'fecha_publicacion', asc = false, filters = {} } = {}) {
    let q = client.from('pcs_reels').select('*', { count: 'exact' });

    if (filters.search) {
      q = q.or(`titulo.ilike.%${filters.search}%,caption.ilike.%${filters.search}%`);
    }
    if (filters.pilar) {
      q = q.contains('pilares', [filters.pilar]);
    }
    if (filters.formato) {
      q = q.eq('formato_narrativo', filters.formato);
    }
    if (filters.hook_tipo) {
      q = q.eq('hook_tipo', filters.hook_tipo);
    }
    if (filters.tiene_ads !== undefined && filters.tiene_ads !== '') {
      q = q.eq('tiene_ads', filters.tiene_ads === 'true');
    }
    if (filters.genero_ventas !== undefined && filters.genero_ventas !== '') {
      q = q.eq('genero_ventas', filters.genero_ventas === 'true');
    }
    if (filters.datos_completos !== undefined && filters.datos_completos !== '') {
      q = q.eq('datos_completos', filters.datos_completos === 'true');
    }

    q = q.order(orderBy, { ascending: asc });
    q = q.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await q;
    if (error) throw error;
    return { data: data || [], count };
  }

  async function getReel(id) {
    const { data, error } = await client.from('pcs_reels').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function upsertReel(reel) {
    // If has ig_media_id, upsert on that
    if (reel.ig_media_id) {
      const { data, error } = await client.from('pcs_reels')
        .upsert(reel, { onConflict: 'ig_media_id' })
        .select().single();
      if (error) throw error;
      return data;
    }
    // Otherwise insert or update by id
    const { data, error } = await client.from('pcs_reels')
      .upsert(reel)
      .select().single();
    if (error) throw error;
    return data;
  }

  async function upsertReelByUrl(reel) {
    // Try to find existing by ig_url
    if (reel.ig_url) {
      const { data: existing } = await client.from('pcs_reels')
        .select('id').eq('ig_url', reel.ig_url).maybeSingle();
      if (existing) {
        reel.id = existing.id;
      }
    }
    return upsertReel(reel);
  }

  async function deleteReel(id) {
    const { error } = await client.from('pcs_reels').delete().eq('id', id);
    if (error) throw error;
  }

  async function getAllReels() {
    const { data, error } = await client.from('pcs_reels')
      .select('*').order('fecha_publicacion', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getReelStats() {
    const reels = await getAllReels();
    const total = reels.length;
    const completos = reels.filter(r => r.datos_completos).length;
    const totalViews = reels.reduce((s, r) => s + (r.views_totales || 0), 0);
    const totalRevenue = reels.reduce((s, r) => s + (r.revenue_atribuido || 0), 0);
    const avgSaveRate = reels.filter(r => r.save_rate != null).reduce((s, r, _, a) => s + r.save_rate / a.length, 0);
    return { total, completos, totalViews, totalRevenue, avgSaveRate, reels };
  }

  // ──── BENCHMARKS ────

  async function getBenchmarks() {
    const { data, error } = await client.rpc('get_benchmarks_90d');
    if (error) {
      // Fallback: calculate manually
      const reels = await getAllReels();
      const recent = reels.filter(r => {
        const d = new Date(r.fecha_publicacion);
        return d >= new Date(Date.now() - 90 * 86400000);
      });
      return [{
        total_reels: recent.length,
        avg_views: recent.reduce((s, r) => s + (r.views_totales || 0), 0) / Math.max(recent.length, 1),
        avg_save_rate: recent.filter(r => r.save_rate).reduce((s, r, _, a) => s + r.save_rate / a.length, 0),
        avg_like_rate: recent.filter(r => r.like_rate).reduce((s, r, _, a) => s + r.like_rate / a.length, 0),
        avg_comment_rate: recent.filter(r => r.comment_rate).reduce((s, r, _, a) => s + r.comment_rate / a.length, 0),
        avg_share_rate: recent.filter(r => r.share_rate).reduce((s, r, _, a) => s + r.share_rate / a.length, 0),
        avg_engagement: recent.filter(r => r.engagement_rate).reduce((s, r, _, a) => s + r.engagement_rate / a.length, 0),
        avg_retencion: recent.filter(r => r.retencion_estimada).reduce((s, r, _, a) => s + r.retencion_estimada / a.length, 0),
        best_pilar: 'N/A',
        best_formato: 'N/A',
      }];
    }
    return data;
  }

  // ──── SNAPSHOTS ────

  async function getSnapshots(limit = 30) {
    const { data, error } = await client.from('pcs_account_snapshots')
      .select('*').order('fecha', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function upsertSnapshot(snap) {
    const { data, error } = await client.from('pcs_account_snapshots')
      .upsert(snap, { onConflict: 'fecha' }).select().single();
    if (error) throw error;
    return data;
  }

  // ──── IDEAS ────

  async function getIdeas() {
    const { data, error } = await client.from('pcs_ideas')
      .select('*').order('prioridad', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function upsertIdea(idea) {
    const { data, error } = await client.from('pcs_ideas')
      .upsert(idea).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteIdea(id) {
    const { error } = await client.from('pcs_ideas').delete().eq('id', id);
    if (error) throw error;
  }

  async function updateIdeaEstado(id, estado) {
    const { error } = await client.from('pcs_ideas').update({ estado }).eq('id', id);
    if (error) throw error;
  }

  // ──── GUIONES ────

  async function getGuiones(ideaId) {
    const { data, error } = await client.from('pcs_guiones')
      .select('*').eq('idea_id', ideaId).order('version', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function upsertGuion(guion) {
    const { data, error } = await client.from('pcs_guiones')
      .upsert(guion).select().single();
    if (error) throw error;
    return data;
  }

  // ──── AI ANALYSES ────

  async function saveAnalysis(analysis) {
    const { data, error } = await client.from('pcs_ai_analyses')
      .insert(analysis).select().single();
    if (error) throw error;
    return data;
  }

  async function getAnalyses(reelId) {
    const { data, error } = await client.from('pcs_ai_analyses')
      .select('*').eq('reel_id', reelId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // ──── SCRAPING LOG ────

  async function logScraping(entry) {
    const { data, error } = await client.from('pcs_scraping_log')
      .insert(entry).select().single();
    if (error) throw error;
    return data;
  }

  async function getLastScraping() {
    const { data, error } = await client.from('pcs_scraping_log')
      .select('*').order('fecha_scraping', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }

  // ──── COMPETITORS ────

  async function getCompetitors() {
    const { data, error } = await client.from('pcs_competitors')
      .select('*').order('followers_aprox', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function upsertCompetitor(competitor) {
    const { data, error } = await client.from('pcs_competitors')
      .upsert(competitor, { onConflict: competitor.id ? 'id' : 'username' })
      .select().single();
    if (error) throw error;
    return data;
  }

  async function getCompetitor(id) {
    const { data, error } = await client.from('pcs_competitors')
      .select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function getCompetitorReels(competitorId) {
    let q = client.from('pcs_competitor_reels').select('*').order('views_totales', { ascending: false });
    if (competitorId) q = q.eq('competitor_id', competitorId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function updateCompetitor(id, fields) {
    const { error } = await client.from('pcs_competitors')
      .update(fields).eq('id', id);
    if (error) throw error;
  }

  async function deleteCompetitor(id) {
    const { error } = await client.from('pcs_competitors').delete().eq('id', id);
    if (error) throw error;
  }

  async function upsertCompetitorReel(reel) {
    const onConflict = reel.ig_media_id ? 'ig_media_id' : undefined;
    const opts = onConflict ? { onConflict } : {};
    const { data, error } = await client.from('pcs_competitor_reels')
      .upsert(reel, opts).select().single();
    if (error) throw error;
    return data;
  }

  async function bulkUpsertCompetitorReels(reels) {
    if (!reels.length) return 0;
    // Supabase upsert acepta arrays — un solo request para todos
    const { data, error } = await client.from('pcs_competitor_reels')
      .upsert(reels, { onConflict: 'ig_media_id', ignoreDuplicates: false })
      .select('id');
    if (error) throw error;
    return (data || []).length;
  }

  // ──── BULK UPSERT ────

  async function bulkUpsertReels(reels) {
    let inserted = 0, updated = 0, errors = [];
    for (const reel of reels) {
      try {
        // Check if exists
        let existing = null;
        if (reel.ig_media_id) {
          const { data } = await client.from('pcs_reels')
            .select('id').eq('ig_media_id', reel.ig_media_id).maybeSingle();
          existing = data;
        } else if (reel.ig_url) {
          const { data } = await client.from('pcs_reels')
            .select('id').eq('ig_url', reel.ig_url).maybeSingle();
          existing = data;
        }
        if (existing) {
          reel.id = existing.id;
          updated++;
        } else {
          inserted++;
        }
        await upsertReel(reel);
      } catch (e) {
        errors.push(reel.ig_url || reel.titulo || 'unknown');
      }
    }
    return { inserted, updated, errors };
  }

  return {
    init, setKey, isConnected,
    getReels, getReel, upsertReel, upsertReelByUrl, deleteReel, getAllReels, getReelStats,
    getBenchmarks,
    getSnapshots, upsertSnapshot,
    getIdeas, upsertIdea, deleteIdea, updateIdeaEstado,
    getGuiones, upsertGuion,
    saveAnalysis, getAnalyses,
    logScraping, getLastScraping,
    bulkUpsertReels,
    getCompetitors, upsertCompetitor, updateCompetitor, getCompetitor, deleteCompetitor, getCompetitorReels, upsertCompetitorReel, bulkUpsertCompetitorReels,
  };
})();
