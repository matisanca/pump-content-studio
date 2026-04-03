/* ============================================
   PUMP CONTENT STUDIO — Reels Grid Module
   ============================================ */

const ReelsGridModule = (() => {
  let currentPage = 1;
  let currentOrder = 'fecha_publicacion';
  let currentAsc = false;
  let currentFilters = {};
  let currentView = 'grid'; // 'grid' | 'list'

  async function render(container) {
    container.innerHTML = `
      <div class="filter-bar" id="reels-filters">
        <div class="search-wrap">
          <input type="text" class="form-input search-input" id="reel-search" placeholder="Buscar..." value="${currentFilters.search || ''}">
        </div>
        <select class="form-select" id="filter-pilar" style="width:130px">
          <option value="">Pilar</option>
          ${Object.entries(Utils.PILARES).map(([k, v]) => `<option value="${k}" ${currentFilters.pilar === k ? 'selected' : ''}>${v.emoji} ${v.label}</option>`).join('')}
        </select>
        <select class="form-select" id="filter-formato" style="width:160px">
          <option value="">Formato</option>
          ${Utils.FORMATOS.map(f => `<option value="${f}" ${currentFilters.formato === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
        <select class="form-select" id="filter-hook" style="width:160px">
          <option value="">Hook tipo</option>
          ${Utils.HOOK_TIPOS.map(h => `<option value="${h}" ${currentFilters.hook_tipo === h ? 'selected' : ''}>${h}</option>`).join('')}
        </select>
        <select class="form-select" id="filter-ads" style="width:100px">
          <option value="">Ads</option>
          <option value="true" ${currentFilters.tiene_ads === 'true' ? 'selected' : ''}>Con ads</option>
          <option value="false" ${currentFilters.tiene_ads === 'false' ? 'selected' : ''}>Sin ads</option>
        </select>
        <select class="form-select" id="filter-ventas" style="width:110px">
          <option value="">Vendio</option>
          <option value="true" ${currentFilters.genero_ventas === 'true' ? 'selected' : ''}>Si</option>
          <option value="false" ${currentFilters.genero_ventas === 'false' ? 'selected' : ''}>No</option>
        </select>
        <select class="form-select" id="filter-datos" style="width:140px">
          <option value="">Datos</option>
          <option value="true" ${currentFilters.datos_completos === 'true' ? 'selected' : ''}>Completos</option>
          <option value="false" ${currentFilters.datos_completos === 'false' ? 'selected' : ''}>&#x26A0;&#xFE0F; Incompletos</option>
        </select>
        <div class="spacer"></div>
        <span class="text-muted" style="font-size:12px">Ordenar:</span>
        <select class="form-select" id="sort-field" style="width:140px">
          <option value="fecha_publicacion" ${currentOrder === 'fecha_publicacion' ? 'selected' : ''}>Fecha</option>
          <option value="views_totales" ${currentOrder === 'views_totales' ? 'selected' : ''}>Views</option>
          <option value="save_rate" ${currentOrder === 'save_rate' ? 'selected' : ''}>Save rate</option>
          <option value="engagement_rate" ${currentOrder === 'engagement_rate' ? 'selected' : ''}>Engagement</option>
          <option value="multiplicador" ${currentOrder === 'multiplicador' ? 'selected' : ''}>Multiplicador</option>
          <option value="revenue_atribuido" ${currentOrder === 'revenue_atribuido' ? 'selected' : ''}>Revenue</option>
        </select>
        <button class="btn btn-sm btn-icon" id="sort-dir" title="Cambiar orden">${currentAsc ? '&#x2191;' : '&#x2193;'}</button>
        <button class="btn btn-sm ${currentView === 'grid' ? 'btn-fire' : ''}" onclick="ReelsGridModule.setView('grid')">&#x229E;</button>
        <button class="btn btn-sm ${currentView === 'list' ? 'btn-fire' : ''}" onclick="ReelsGridModule.setView('list')">&#x2261;</button>
      </div>
      <div id="reels-container">
        <div class="loading-overlay"><div class="loader"></div> Cargando reels...</div>
      </div>
      <div id="reels-pagination" style="display:flex;justify-content:center;gap:8px;padding:20px 0"></div>
    `;

    // Event listeners
    const debSearch = Utils.debounce(() => { currentFilters.search = document.getElementById('reel-search').value; currentPage = 1; loadReels(); }, 400);
    document.getElementById('reel-search').addEventListener('input', debSearch);

    ['filter-pilar', 'filter-formato', 'filter-hook', 'filter-ads', 'filter-ventas', 'filter-datos'].forEach(id => {
      document.getElementById(id).addEventListener('change', (e) => {
        const key = id.replace('filter-', '').replace('pilar', 'pilar').replace('formato', 'formato').replace('hook', 'hook_tipo').replace('ads', 'tiene_ads').replace('ventas', 'genero_ventas').replace('datos', 'datos_completos');
        currentFilters[key] = e.target.value;
        currentPage = 1;
        loadReels();
      });
    });

    document.getElementById('sort-field').addEventListener('change', (e) => { currentOrder = e.target.value; loadReels(); });
    document.getElementById('sort-dir').addEventListener('click', () => {
      currentAsc = !currentAsc;
      document.getElementById('sort-dir').innerHTML = currentAsc ? '&#x2191;' : '&#x2193;';
      loadReels();
    });

    await loadReels();
  }

  async function loadReels() {
    const container = document.getElementById('reels-container');
    if (!container) return;
    container.innerHTML = '<div class="loading-overlay"><div class="loader"></div></div>';

    try {
      const { data: reels, count } = await DB.getReels({
        page: currentPage,
        limit: 20,
        orderBy: currentOrder,
        asc: currentAsc,
        filters: currentFilters,
      });

      if (reels.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">&#x1F3AC;</div>
            <p>No hay reels que coincidan con los filtros</p>
            <button class="btn btn-fire" onclick="window.PCS.navigate('upload')">Cargar reels</button>
          </div>
        `;
        return;
      }

      if (currentView === 'grid') {
        container.innerHTML = `<div class="reels-grid">${reels.map(renderCard).join('')}</div>`;
      } else {
        container.innerHTML = `<div style="display:flex;flex-direction:column;gap:4px">${reels.map(renderListItem).join('')}</div>`;
      }

      // Pagination
      const totalPages = Math.ceil((count || reels.length) / 20);
      const pagEl = document.getElementById('reels-pagination');
      if (pagEl && totalPages > 1) {
        let pagHtml = '';
        if (currentPage > 1) pagHtml += `<button class="btn btn-sm" onclick="ReelsGridModule.goPage(${currentPage - 1})">&#x25C0;</button>`;
        for (let i = 1; i <= totalPages; i++) {
          if (i === currentPage) pagHtml += `<button class="btn btn-sm btn-fire">${i}</button>`;
          else if (Math.abs(i - currentPage) < 3 || i === 1 || i === totalPages) {
            pagHtml += `<button class="btn btn-sm" onclick="ReelsGridModule.goPage(${i})">${i}</button>`;
          } else if (Math.abs(i - currentPage) === 3) {
            pagHtml += `<span class="text-muted">...</span>`;
          }
        }
        if (currentPage < totalPages) pagHtml += `<button class="btn btn-sm" onclick="ReelsGridModule.goPage(${currentPage + 1})">&#x25B6;</button>`;
        pagEl.innerHTML = pagHtml;
      }
    } catch (e) {
      container.innerHTML = `<p style="color:var(--red);padding:20px">Error: ${Utils.escapeHtml(e.message)}</p>`;
    }
  }

  function renderCard(reel) {
    const multClass = Utils.multBadgeClass(reel.multiplicador);
    const pilarBadges = (reel.pilares || []).map(p => Utils.pilarBadge(p)).join(' ');
    const typeBadges = [];
    if (reel.tipo) typeBadges.push(`<span class="badge badge-fire">${reel.tipo === 'reel' ? '&#x1F525; Reel' : reel.tipo}</span>`);
    if (reel.tiene_ads) typeBadges.push('<span class="badge badge-pink">&#x1F4B0; Ads</span>');
    if (reel.genero_ventas) typeBadges.push('<span class="badge badge-green">&#x1F4B0;</span>');
    if (!reel.datos_completos) typeBadges.push('<span class="badge badge-yellow">&#x26A0;&#xFE0F;</span>');

    return `
      <div class="reel-card card-glow" onclick="window.PCS.navigate('reel-detail','${reel.id}')">
        <div class="reel-card-thumb">
          ${reel.thumbnail_url
            ? `<img src="${reel.thumbnail_url}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''}
          <div class="placeholder" ${reel.thumbnail_url ? 'style="display:none"' : ''}>${(Utils.PILARES[(reel.pilares||[])[0]] || {}).emoji || '&#x1F3AC;'}</div>
          <div class="badges-overlay">
            ${reel.multiplicador != null ? `<span class="badge ${multClass}">×${reel.multiplicador}</span>` : '<span></span>'}
            <span>${pilarBadges}</span>
          </div>
          <div class="bottom-badges">${typeBadges.join(' ')}</div>
        </div>
        <div class="reel-card-body">
          <div class="reel-card-title">${Utils.escapeHtml(reel.titulo || 'Sin titulo')}</div>
          <div class="reel-card-views">${Utils.formatNum(reel.views_totales)} views</div>
          <div class="reel-card-rates">
            <span>&#x1F516;${Utils.formatPct(reel.save_rate)}</span>
            <span>&#x2764;&#xFE0F;${Utils.formatPct(reel.like_rate)}</span>
            <span>&#x1F4AC;${Utils.formatPct(reel.comment_rate)}</span>
          </div>
          <div class="reel-card-meta">
            <span>${reel.formato_narrativo || ''}</span>
            ${reel.cta_text ? `<span>"${Utils.truncate(reel.cta_text, 30)}"</span>` : ''}
            <span>${Utils.timeAgo(reel.fecha_publicacion)}</span>
          </div>
        </div>
        <div class="reel-card-footer">
          ${reel.ig_url ? `<a href="${reel.ig_url}" target="_blank" class="btn btn-sm btn-ghost" onclick="event.stopPropagation()">IG</a>` : '<span></span>'}
          <button class="btn btn-sm" onclick="event.stopPropagation();window.PCS.openAIForReel('${reel.id}')">&#x1F916; Analizar</button>
        </div>
      </div>
    `;
  }

  function renderListItem(reel) {
    const multClass = Utils.multBadgeClass(reel.multiplicador);
    return `
      <div class="card" style="padding:12px;cursor:pointer;display:flex;align-items:center;gap:16px" onclick="window.PCS.navigate('reel-detail','${reel.id}')">
        <div style="width:50px;height:70px;background:var(--bg-elevated);border-radius:4px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center">
          ${reel.thumbnail_url ? `<img src="${reel.thumbnail_url}" style="width:100%;height:100%;object-fit:cover" loading="lazy">` : '<span style="font-size:20px;opacity:.3">&#x1F3AC;</span>'}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${Utils.escapeHtml(reel.titulo || 'Sin titulo')}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${(reel.pilares || []).join(', ')} · ${reel.formato_narrativo || ''} · ${Utils.timeAgo(reel.fecha_publicacion)}</div>
        </div>
        <div class="mono" style="text-align:right;min-width:80px">
          <div style="font-size:1rem;font-weight:700">${Utils.formatNum(reel.views_totales)}</div>
          <div style="font-size:10px;color:var(--text-secondary)">views</div>
        </div>
        <div style="display:flex;gap:12px;font-size:11px;font-family:var(--font-display)">
          <span>&#x1F516;${Utils.formatPct(reel.save_rate)}</span>
          <span>&#x2764;&#xFE0F;${Utils.formatPct(reel.like_rate)}</span>
          <span>&#x1F4AC;${Utils.formatPct(reel.comment_rate)}</span>
        </div>
        <span class="badge ${multClass}" style="min-width:45px;text-align:center">${reel.multiplicador != null ? '×' + reel.multiplicador : '—'}</span>
        ${!reel.datos_completos ? '<span class="badge badge-yellow">&#x26A0;&#xFE0F;</span>' : ''}
      </div>
    `;
  }

  function setView(view) {
    currentView = view;
    const container = document.getElementById('content');
    if (container) render(container);
  }

  function goPage(p) {
    currentPage = p;
    loadReels();
    document.getElementById('content')?.scrollTo(0, 0);
  }

  return { render, setView, goPage };
})();
