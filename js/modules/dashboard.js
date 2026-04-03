/* ============================================
   PUMP CONTENT STUDIO — Dashboard Module
   ============================================ */

const DashboardModule = (() => {

  async function render(container) {
    container.innerHTML = `<div class="loading-overlay"><div class="loader"></div> Cargando dashboard...</div>`;

    try {
      const [stats, benchmarksArr, snapshots] = await Promise.all([
        DB.getReelStats(),
        DB.getBenchmarks(),
        DB.getSnapshots(30),
      ]);

      const benchmarks = benchmarksArr?.[0] || {};
      const reels = stats.reels || [];

      // Calculate deltas (vs 30d ago)
      const now = new Date();
      const reels30d = reels.filter(r => new Date(r.fecha_publicacion) >= new Date(now - 30 * 86400000));
      const reels60d = reels.filter(r => {
        const d = new Date(r.fecha_publicacion);
        return d >= new Date(now - 60 * 86400000) && d < new Date(now - 30 * 86400000);
      });
      const views30 = reels30d.reduce((s, r) => s + (r.views_totales || 0), 0);
      const views60 = reels60d.reduce((s, r) => s + (r.views_totales || 0), 0);
      const viewsDelta = views60 > 0 ? ((views30 - views60) / views60 * 100).toFixed(0) : '—';

      const lastSnap = snapshots[0];
      const prevSnap = snapshots[7] || snapshots[snapshots.length - 1];
      const followersDelta = lastSnap && prevSnap ? lastSnap.followers - prevSnap.followers : 0;

      container.innerHTML = `
        <div class="dashboard-grid">
          <!-- Hero KPIs -->
          <div class="dashboard-kpis">
            <div class="kpi-card">
              <span class="kpi-label">&#x1F441; Views totales lifetime</span>
              <span class="kpi-value">${Utils.formatNum(stats.totalViews)}</span>
              <span class="kpi-delta ${viewsDelta > 0 ? 'positive' : viewsDelta < 0 ? 'negative' : 'neutral'}">
                ${viewsDelta > 0 ? '+' : ''}${viewsDelta}% vs mes anterior
              </span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">&#x1F465; Followers</span>
              <span class="kpi-value">${Utils.formatNum(lastSnap?.followers || 0)}</span>
              <span class="kpi-delta ${followersDelta >= 0 ? 'positive' : 'negative'}">
                ${followersDelta >= 0 ? '+' : ''}${followersDelta} esta semana
              </span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">&#x1F516; Save rate promedio</span>
              <span class="kpi-value">${Utils.formatPct(stats.avgSaveRate)}</span>
              <span class="kpi-delta ${stats.avgSaveRate >= 2 ? 'positive' : stats.avgSaveRate >= 1 ? 'neutral' : 'negative'}">
                ${stats.avgSaveRate >= 2 ? 'Excelente' : stats.avgSaveRate >= 1 ? 'Normal' : 'Mejorable'} (bench: 2%)
              </span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">&#x1F4B0; Revenue atribuido</span>
              <span class="kpi-value">${Utils.formatMoney(stats.totalRevenue)}</span>
              <span class="kpi-delta neutral">total acumulado</span>
            </div>
          </div>

          <!-- Scatter + Growth -->
          <div class="dashboard-row">
            <div class="card">
              <div class="card-header">
                <span class="card-title">&#x1F4CD; Mapa de Performance</span>
                <span class="text-muted" style="font-size:11px">Save Rate vs Views (tamano = engagement)</span>
              </div>
              <div class="scatter-wrap">
                <div class="chart-container" style="height:380px">
                  <canvas id="chart-scatter"></canvas>
                </div>
                <div class="scatter-quadrants">
                  <div class="scatter-quadrant">JOYAS OCULTAS<br><span style="font-weight:400;font-size:9px">Alto save, bajas views → Ads</span></div>
                  <div class="scatter-quadrant">WINNERS<br><span style="font-weight:400;font-size:9px">Alto todo → Iterar</span></div>
                  <div class="scatter-quadrant">DESCARTABLES<br><span style="font-weight:400;font-size:9px">Bajo todo → No repetir</span></div>
                  <div class="scatter-quadrant">ENTRETENIMIENTO<br><span style="font-weight:400;font-size:9px">Views sin conversion</span></div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="card-title">&#x1F4C8; Views por semana</span>
              </div>
              <div class="chart-container" style="height:380px">
                <canvas id="chart-views-weekly"></canvas>
              </div>
            </div>
          </div>

          <!-- AI Insights + Growth -->
          <div class="dashboard-row">
            <div class="card card-glow">
              <div class="card-header">
                <span class="card-title">&#x1F916; Patron ganador de @pump_team</span>
                <button class="btn btn-sm" onclick="DashboardModule.regenerateInsights()">&#x1F504; Regenerar</button>
              </div>
              <div id="ai-insights" style="font-size:13px;line-height:1.7;color:var(--text-secondary)">
                ${generateStaticInsights(reels, benchmarks)}
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="card-title">&#x1F4C8; Crecimiento de la cuenta</span>
              </div>
              <div class="chart-container" style="height:260px">
                <canvas id="chart-growth"></canvas>
              </div>
              ${snapshots.length === 0 ? '<p class="text-muted" style="text-align:center;padding:12px;font-size:12px">Sin datos de snapshots. Cargalos en Cargar > Snapshot de Cuenta</p>' : ''}
            </div>
          </div>

          <!-- Pilares breakdown -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">&#x1F4CA; Breakdown por Pilares</span>
            </div>
            <div class="dashboard-pilares">
              ${renderPilarCards(reels)}
            </div>
          </div>

          <!-- Heatmap -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">&#x1F5D3;&#xFE0F; Heatmap de publicacion</span>
              <span class="text-muted" style="font-size:11px">Ultimas 12 semanas</span>
            </div>
            ${renderHeatmap(reels)}
          </div>
        </div>
      `;

      // Render charts
      setTimeout(() => {
        Charts.scatterPerformance('chart-scatter', reels, benchmarks);
        Charts.barViews('chart-views-weekly', reels);
        if (snapshots.length > 1) {
          Charts.areaGrowth('chart-growth', snapshots);
        }
      }, 100);

    } catch (e) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">&#x26A0;&#xFE0F;</div>
          <p>Error cargando dashboard: ${Utils.escapeHtml(e.message)}</p>
          <p class="text-muted">Verifica la conexion a Supabase en Configuracion.</p>
        </div>
      `;
    }
  }

  function generateStaticInsights(reels, benchmarks) {
    if (reels.length === 0) {
      return '<p>Sin reels cargados todavia. Scrapea o importa reels para ver insights.</p>';
    }

    // Best pilar by save rate
    const pilarStats = {};
    for (const r of reels) {
      for (const p of (r.pilares || [])) {
        if (!pilarStats[p]) pilarStats[p] = { saves: [], views: [], count: 0, revenue: 0 };
        pilarStats[p].count++;
        if (r.save_rate != null) pilarStats[p].saves.push(r.save_rate);
        pilarStats[p].views.push(r.views_totales || 0);
        pilarStats[p].revenue += r.revenue_atribuido || 0;
      }
    }

    let bestPilar = '', bestPilarSR = 0;
    for (const [p, s] of Object.entries(pilarStats)) {
      const avg = s.saves.length ? s.saves.reduce((a, b) => a + b, 0) / s.saves.length : 0;
      if (avg > bestPilarSR) { bestPilarSR = avg; bestPilar = p; }
    }

    // Best format
    const formatStats = {};
    for (const r of reels) {
      if (!r.formato_narrativo) continue;
      if (!formatStats[r.formato_narrativo]) formatStats[r.formato_narrativo] = [];
      formatStats[r.formato_narrativo].push(r.views_totales || 0);
    }
    let bestFormat = '', bestFormatViews = 0;
    for (const [f, views] of Object.entries(formatStats)) {
      const avg = views.reduce((a, b) => a + b, 0) / views.length;
      if (avg > bestFormatViews) { bestFormatViews = avg; bestFormat = f; }
    }

    // Best day
    const dayStats = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    for (const r of reels) {
      if (!r.fecha_publicacion) continue;
      const day = new Date(r.fecha_publicacion).getDay();
      dayStats[day] += r.views_totales || 0;
      dayCounts[day]++;
    }
    let bestDay = 0, bestDayAvg = 0;
    for (let i = 0; i < 7; i++) {
      const avg = dayCounts[i] > 0 ? dayStats[i] / dayCounts[i] : 0;
      if (avg > bestDayAvg) { bestDayAvg = avg; bestDay = i; }
    }

    // Best hook type
    const hookStats = {};
    for (const r of reels) {
      if (!r.hook_tipo || r.engagement_rate == null) continue;
      if (!hookStats[r.hook_tipo]) hookStats[r.hook_tipo] = [];
      hookStats[r.hook_tipo].push(r.engagement_rate);
    }
    let bestHook = '', bestHookEng = 0;
    for (const [h, engs] of Object.entries(hookStats)) {
      const avg = engs.reduce((a, b) => a + b, 0) / engs.length;
      if (avg > bestHookEng) { bestHookEng = avg; bestHook = h; }
    }

    // Top sellers
    const sellers = reels.filter(r => r.genero_ventas && r.revenue_atribuido > 0)
      .sort((a, b) => b.revenue_atribuido - a.revenue_atribuido).slice(0, 3);

    const bp = Utils.PILARES[bestPilar] || {};
    const avgViews = benchmarks?.avg_views ? Utils.formatNum(benchmarks.avg_views) : '?';

    return `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div>${bp.emoji || ''} <strong>Tu mejor pilar:</strong> ${bp.label || bestPilar} — save rate promedio ${Utils.formatPct(bestPilarSR)}</div>
        <div>&#x1F3AC; <strong>Tu mejor formato:</strong> ${bestFormat || 'N/A'} — ${Utils.formatNum(bestFormatViews)} views promedio</div>
        <div>&#x1F4C5; <strong>Tu mejor dia:</strong> ${dayNames[bestDay]} — promedio ${Utils.formatNum(bestDayAvg)} views</div>
        ${bestHook ? `<div>&#x1F3A3; <strong>Tu hook mas efectivo:</strong> "${bestHook}" — ${Utils.formatPct(bestHookEng)} engagement</div>` : ''}
        ${sellers.length > 0 ? `
          <div style="margin-top:8px"><strong>&#x1F4B0; Top reels que mas vendieron:</strong></div>
          ${sellers.map((s, i) => `<div style="padding-left:16px;color:var(--text-secondary)">${i + 1}. ${s.titulo || 'Sin titulo'} — ${Utils.formatMoney(s.revenue_atribuido)}</div>`).join('')}
        ` : '<div class="text-muted">Sin ventas atribuidas todavia.</div>'}
      </div>
    `;
  }

  function renderPilarCards(reels) {
    const pilarStats = {};
    for (const p of Object.keys(Utils.PILARES)) {
      pilarStats[p] = { views: [], saveRates: [], count: 0, revenue: 0 };
    }
    for (const r of reels) {
      for (const p of (r.pilares || [])) {
        if (!pilarStats[p]) pilarStats[p] = { views: [], saveRates: [], count: 0, revenue: 0 };
        pilarStats[p].count++;
        pilarStats[p].views.push(r.views_totales || 0);
        if (r.save_rate != null) pilarStats[p].saveRates.push(r.save_rate);
        pilarStats[p].revenue += r.revenue_atribuido || 0;
      }
    }

    return Object.entries(pilarStats).map(([p, s]) => {
      const info = Utils.PILARES[p] || {};
      const avgViews = s.views.length ? s.views.reduce((a, b) => a + b, 0) / s.views.length : 0;
      const avgSR = s.saveRates.length ? s.saveRates.reduce((a, b) => a + b, 0) / s.saveRates.length : 0;

      return `
        <div class="card" style="border-top:2px solid ${info.color || '#333'}">
          <div style="font-size:24px;margin-bottom:6px">${info.emoji || ''}</div>
          <div style="font-weight:700;font-size:13px;margin-bottom:10px">${info.label || p}</div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:12px">
            <div><span class="text-secondary">Views prom:</span> <span class="mono" style="color:var(--text-primary)">${Utils.formatNum(avgViews)}</span></div>
            <div><span class="text-secondary">Save rate:</span> <span class="mono" style="color:${avgSR >= 2 ? 'var(--green)' : avgSR >= 1 ? 'var(--yellow)' : 'var(--red)'}">${Utils.formatPct(avgSR)}</span></div>
            <div><span class="text-secondary">Reels:</span> <span class="mono">${s.count}</span></div>
            <div><span class="text-secondary">Revenue:</span> <span class="mono">${Utils.formatMoney(s.revenue)}</span></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderHeatmap(reels) {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const now = new Date();
    const weeks = 12;

    // Build map of date → views
    const dateViews = {};
    for (const r of reels) {
      if (!r.fecha_publicacion) continue;
      const key = r.fecha_publicacion;
      dateViews[key] = (dateViews[key] || 0) + (r.views_totales || 0);
    }

    // Find max views for intensity
    const maxViews = Math.max(...Object.values(dateViews), 1);

    let html = '<div class="heatmap-grid">';
    // Header row
    html += '<div class="heatmap-label"></div>';
    for (let d = 0; d < 7; d++) {
      html += `<div class="heatmap-label">${days[d]}</div>`;
    }

    // Weeks
    for (let w = weeks - 1; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (w * 7 + now.getDay()));
      html += `<div class="heatmap-label" style="font-size:9px">${Utils.formatDate(weekStart.toISOString().split('T')[0])}</div>`;

      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        const key = date.toISOString().split('T')[0];
        const views = dateViews[key] || 0;
        const intensity = views === 0 ? 0 : Math.min(5, Math.ceil(views / maxViews * 5));
        html += `<div class="heatmap-cell intensity-${intensity}" data-tooltip="${key}: ${Utils.formatNum(views)} views" title="${key}: ${Utils.formatNum(views)} views"></div>`;
      }
    }

    html += '</div>';
    return html;
  }

  async function regenerateInsights() {
    const el = document.getElementById('ai-insights');
    if (!el) return;
    if (!AI.getKey()) {
      Utils.toast('Configura tu API key de Anthropic primero', 'error');
      return;
    }
    el.innerHTML = '<div class="loading-overlay"><div class="loader"></div> Generando insights con IA...</div>';

    try {
      const stats = await DB.getReelStats();
      const benchmarks = (await DB.getBenchmarks())?.[0] || {};

      const reelsSummary = stats.reels.slice(0, 30).map(r =>
        `"${r.titulo}" — ${Utils.formatNum(r.views_totales)} views, ${Utils.formatPct(r.save_rate)} save, ${r.multiplicador || '?'}x, pilar: ${(r.pilares || []).join(',')}, formato: ${r.formato_narrativo || '?'}`
      ).join('\n');

      const prompt = `Analiza estos datos de la cuenta @pump_team y dame insights accionables:

Reels (${stats.total} total, ultimos 30):
${reelsSummary}

Benchmarks 90d: Views prom ${Utils.formatNum(benchmarks.avg_views)}, Save rate ${Utils.formatPct(benchmarks.avg_save_rate)}, Engagement ${Utils.formatPct(benchmarks.avg_engagement)}

Dame:
1. El patron ganador (que pilar + formato + hook funciona mejor)
2. Que NO esta funcionando
3. 3 recomendaciones concretas para el proximo mes
Formato: bullets concisos, con numeros.`;

      const response = await AI.chat(
        [{ role: 'user', content: prompt }],
        AI.buildFreeSystemPrompt()
      );
      el.innerHTML = Utils.formatAIText(response);
    } catch (e) {
      el.innerHTML = `<p style="color:var(--red)">Error: ${Utils.escapeHtml(e.message)}</p>`;
    }
  }

  return { render, regenerateInsights };
})();
