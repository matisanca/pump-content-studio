/* ============================================
   PUMP CONTENT STUDIO — Instagram Scraper
   ============================================ */

const Scraper = (() => {
  const USERNAME = 'pump_team';
  const BACKEND_URL = 'http://localhost:5001';

  // Extract shortcode from URL
  function extractShortcode(url) {
    const match = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  }

  // Strategy: proxy call to Flask backend (server-side, no CORS)
  async function fetchViaProxy(onLog, username) {
    const user = username || USERNAME;
    onLog(`Conectando al backend (${BACKEND_URL}/api/scrape-ig)...`, 'info');
    try {
      // First check if backend is up
      const healthCheck = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (!healthCheck || !healthCheck.ok) {
        onLog('Backend Flask no disponible en localhost:5001 — ¿está corriendo el servidor?', 'error');
        onLog('Iniciá el backend con: cd backend && python server.py', 'info');
        return null;
      }

      onLog(`Scrapeando @${user} via servidor Python...`, 'info');
      const resp = await fetch(`${BACKEND_URL}/api/scrape-ig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, limit: 500 }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const strategy = data.strategy || 'unknown';
      onLog(`Estrategia usada: ${strategy} — ${data.total} reels encontrados`, 'success');
      if (data.errors?.length) {
        data.errors.forEach(e => onLog(`⚠ ${e}`, 'error'));
      }
      return data.reels || [];
    } catch (e) {
      onLog(`Proxy error: ${e.message}`, 'error');
      return null;
    }
  }

  // Auto-extract title from caption
  function extractTitle(caption) {
    if (!caption) return 'Sin titulo';
    // First line or first sentence
    const firstLine = caption.split('\n')[0].trim();
    if (firstLine.length > 80) return firstLine.slice(0, 77) + '...';
    return firstLine || 'Sin titulo';
  }

  // Auto-detect pilares from caption
  function detectPilares(caption) {
    if (!caption) return [];
    const lower = caption.toLowerCase();
    const pilares = [];

    const farmaKeywords = ['ciclo', 'hormona', 'testosterona', 'recuperacion', 'pct', 'eje', 'hpta', 'sustancia', 'farmaco', 'pampfarma', 'sarm', 'peptido', 'protocolo'];
    const nutriKeywords = ['dieta', 'calorias', 'macros', 'proteina', 'nutricion', 'comida', 'alimentacion', 'deficit', 'superavit', 'carbohidrato'];
    const entreKeywords = ['entrenamiento', 'ejercicio', 'hipertrofia', 'volumen', 'serie', 'repeticion', 'ppl', 'press', 'sentadilla', 'peso muerto', 'gym'];
    const mindKeywords = ['mentalidad', 'disciplina', 'habito', 'motivacion', 'constancia', 'excusa', 'compromiso'];
    const negKeywords = ['negocio', 'cliente', 'asesoria', 'pampflix', 'monetizar', 'marca personal', 'emprender'];

    if (farmaKeywords.some(k => lower.includes(k))) pilares.push('farmacologia');
    if (nutriKeywords.some(k => lower.includes(k))) pilares.push('nutricion');
    if (entreKeywords.some(k => lower.includes(k))) pilares.push('entrenamiento');
    if (mindKeywords.some(k => lower.includes(k))) pilares.push('mindset');
    if (negKeywords.some(k => lower.includes(k))) pilares.push('negocio');

    return pilares.length ? pilares : ['entrenamiento']; // default
  }

  // Auto-detect CTA from caption
  function extractCTA(caption) {
    if (!caption) return '';
    const lower = caption.toLowerCase();
    // Look for "comenta X", "escribi X", "manda X"
    const ctaMatch = caption.match(/(comenta|escribi|manda|pone)[a-z]*\s+["""]?(\w+)["""]?/i);
    if (ctaMatch) return ctaMatch[0];
    if (lower.includes('link en bio')) return 'Link en bio';
    return '';
  }

  // Main scrape function
  async function scrape(onLog, onProgress, username) {
    onLog('Iniciando scraping de @' + (username || USERNAME) + '...', 'info');
    onProgress(0);

    // Single strategy: Flask backend proxy (server-side, no CORS issues)
    let rawReels = await fetchViaProxy(onLog, username);

    if (!rawReels || rawReels.length === 0) {
      onLog('No se pudieron obtener reels via scraping automatico.', 'error');
      onLog('Usa "Importar JSON de Instaloader" como alternativa.', 'info');
      return { encontrados: 0, nuevos: 0, actualizados: 0, errores: ['No se pudo scrapear'] };
    }

    onLog(`Se encontraron ${rawReels.length} reels`, 'success');
    onProgress(30);

    let nuevos = 0, actualizados = 0;
    const errores = [];

    for (let i = 0; i < rawReels.length; i++) {
      const raw = rawReels[i];
      try {
        // Enrich with auto-detection
        raw.titulo = raw.titulo || extractTitle(raw.caption);
        raw.pilares = raw.pilares || detectPilares(raw.caption);
        raw.cta_text = raw.cta_text || extractCTA(raw.caption);

        const result = await DB.upsertReel(raw);
        if (result) {
          // Check if it was new or updated by comparing created_at
          nuevos++; // simplified — DB handles upsert
          onLog(`\u2713 ${raw.ig_url} — "${Utils.truncate(raw.titulo, 40)}" — ${Utils.formatNum(raw.views_totales)} views`, 'success');
        }
      } catch (e) {
        if (e.message?.includes('duplicate') || e.code === '23505') {
          actualizados++;
          onLog(`\u2713 ${raw.ig_url} — ya existe, metricas actualizadas`, 'update');
        } else {
          errores.push(raw.ig_url);
          onLog(`\u2717 ${raw.ig_url} — Error: ${e.message}`, 'error');
        }
      }
      onProgress(30 + Math.round((i + 1) / rawReels.length * 60));
    }

    onProgress(100);
    onLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
    onLog(`${nuevos} nuevos | ${actualizados} actualizados | ${errores.length} errores`, 'info');

    // Log to DB
    try {
      await DB.logScraping({
        reels_encontrados: rawReels.length,
        reels_nuevos: nuevos,
        reels_actualizados: actualizados,
        errores: errores,
        status: errores.length === 0 ? 'success' : errores.length < rawReels.length ? 'partial' : 'error',
      });
    } catch (e) { /* ignore logging errors */ }

    return { encontrados: rawReels.length, nuevos, actualizados, errores };
  }

  // Import from Instaloader JSON
  async function importJSON(jsonData, onLog, onProgress) {
    onLog('Importando datos de Instaloader...', 'info');
    const reels = Array.isArray(jsonData) ? jsonData : [jsonData];

    let nuevos = 0, errores = [];
    for (let i = 0; i < reels.length; i++) {
      try {
        const r = reels[i];
        const reel = {
          ig_media_id: r.id || r.media_id || r.node?.id,
          ig_url: r.url || r.permalink || (r.shortcode ? `https://www.instagram.com/reel/${r.shortcode}/` : null),
          caption: r.caption || r.edge_media_to_caption?.edges[0]?.node?.text || '',
          thumbnail_url: r.thumbnail_url || r.display_url || r.thumbnail_src,
          fecha_publicacion: r.date || r.taken_at || (r.taken_at_timestamp ? new Date(r.taken_at_timestamp * 1000).toISOString().split('T')[0] : null),
          duracion_segundos: r.duration || r.video_duration ? Math.round(r.duration || r.video_duration) : null,
          likes: r.likes || r.edge_media_preview_like?.count || 0,
          comments: r.comments || r.edge_media_to_comment?.count || 0,
          views_totales: r.views || r.video_view_count || r.video_play_count || 0,
          tipo: 'reel',
        };
        reel.titulo = extractTitle(reel.caption);
        reel.pilares = detectPilares(reel.caption);
        reel.cta_text = extractCTA(reel.caption);

        await DB.upsertReel(reel);
        nuevos++;
        onLog(`\u2713 Importado: "${Utils.truncate(reel.titulo, 40)}"`, 'success');
      } catch (e) {
        errores.push(e.message);
        onLog(`\u2717 Error importando reel: ${e.message}`, 'error');
      }
      onProgress(Math.round((i + 1) / reels.length * 100));
    }

    onLog(`Importacion completada: ${nuevos} reels importados, ${errores.length} errores`, nuevos > 0 ? 'success' : 'error');
    return { nuevos, errores };
  }

  // Import from Meta Insights CSV
  const META_COLUMN_MAP = {
    'Permalink': 'ig_url',
    'Post type': '_tipo',
    'Description': 'caption',
    'Date': 'fecha_publicacion',
    'Duration (seconds)': 'duracion_segundos',
    'Views': 'views_totales',
    'Reach': 'reach_total',
    'Likes': 'likes',
    'Comments': 'comments',
    'Saves': 'saves',
    'Shares': 'shares',
    'Watch time (minutes)': 'watch_time_total_minutos',
    'Average watch time (seconds)': 'watch_time_promedio_segundos',
    'Retention rate': 'retencion_estimada',
    'Accounts reached': 'reach_total',
    // Spanish variants
    'Enlace permanente': 'ig_url',
    'Tipo de publicacion': '_tipo',
    'Descripcion': 'caption',
    'Fecha': 'fecha_publicacion',
    'Duracion (segundos)': 'duracion_segundos',
    'Reproducciones': 'views_totales',
    'Alcance': 'reach_total',
    'Me gusta': 'likes',
    'Comentarios': 'comments',
    'Guardados': 'saves',
    'Compartidos': 'shares',
    'Tiempo de reproduccion (minutos)': 'watch_time_total_minutos',
    'Tiempo promedio de reproduccion (segundos)': 'watch_time_promedio_segundos',
    'Tasa de retencion': 'retencion_estimada',
    'Cuentas alcanzadas': 'reach_total',
  };

  async function importCSV(csvText, onLog, onProgress) {
    onLog('Parseando CSV de Meta Insights...', 'info');
    const rows = Utils.parseCSV(csvText);
    if (rows.length === 0) {
      onLog('CSV vacio o formato no reconocido', 'error');
      return { actualizados: 0, errores: ['CSV vacio'] };
    }

    // Map columns
    const headers = Object.keys(rows[0]);
    onLog(`Columnas detectadas: ${headers.length}`, 'info');

    let actualizados = 0, nuevos = 0, errores = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const reel = {};

        // Map each column
        for (const [csvCol, dbCol] of Object.entries(META_COLUMN_MAP)) {
          if (row[csvCol] !== undefined && row[csvCol] !== '' && dbCol && !dbCol.startsWith('_')) {
            let val = row[csvCol];
            // Parse numbers
            if (['likes','comments','saves','shares','views_totales','reach_total','duracion_segundos'].includes(dbCol)) {
              val = parseInt(val.replace(/[^\d.-]/g, '')) || 0;
            }
            if (['watch_time_total_minutos','watch_time_promedio_segundos','retencion_estimada'].includes(dbCol)) {
              val = parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
            }
            if (dbCol === 'retencion_estimada' && val > 1) {
              // Already percentage, keep as-is
            } else if (dbCol === 'retencion_estimada' && val <= 1) {
              val = val * 100; // Convert decimal to percentage
            }
            reel[dbCol] = val;
          }
        }

        if (!reel.ig_url && !reel.caption) {
          onLog(`Fila ${i + 1}: sin URL ni caption, saltando`, 'error');
          continue;
        }

        // Auto-enrich
        if (!reel.titulo) reel.titulo = extractTitle(reel.caption);
        if (reel.caption) reel.pilares = detectPilares(reel.caption);

        // Upsert by URL
        if (reel.ig_url) {
          const result = await DB.upsertReelByUrl(reel);
          actualizados++;
          onLog(`\u2713 ${reel.ig_url} — enriquecido con metricas privadas`, 'update');
        } else {
          await DB.upsertReel(reel);
          nuevos++;
          onLog(`\u2713 Nuevo reel importado desde CSV`, 'success');
        }
      } catch (e) {
        errores.push(`Fila ${i + 1}: ${e.message}`);
        onLog(`\u2717 Fila ${i + 1}: ${e.message}`, 'error');
      }
      onProgress(Math.round((i + 1) / rows.length * 100));
    }

    onLog(`CSV importado: ${actualizados} enriquecidos, ${nuevos} nuevos, ${errores.length} errores`,
      actualizados + nuevos > 0 ? 'success' : 'error');
    return { actualizados, nuevos, errores };
  }

  return { scrape, importJSON, importCSV, extractTitle, detectPilares, extractCTA };
})();
