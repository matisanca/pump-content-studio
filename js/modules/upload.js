/* ============================================
   PUMP CONTENT STUDIO — Upload / Import Module
   ============================================ */

const UploadModule = (() => {
  let activeTab = 'sync';

  function render(container) {
    container.innerHTML = `
      <div class="tabs">
        <div class="tab ${activeTab === 'sync' ? 'active' : ''}" onclick="UploadModule.switchTab('sync')">&#x1F504; Sincronizar</div>
        <div class="tab ${activeTab === 'csv' ? 'active' : ''}" onclick="UploadModule.switchTab('csv')">&#x1F4C1; Importar CSV</div>
        <div class="tab ${activeTab === 'manual' ? 'active' : ''}" onclick="UploadModule.switchTab('manual')">&#x270F;&#xFE0F; Carga Manual</div>
        <div class="tab ${activeTab === 'snapshot' ? 'active' : ''}" onclick="UploadModule.switchTab('snapshot')">&#x1F4F8; Snapshot de Cuenta</div>
      </div>
      <div id="upload-content"></div>
    `;
    renderTab();
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${['sync','csv','manual','snapshot'].indexOf(tab)+1})`)?.classList.add('active');
    renderTab();
  }

  async function renderTab() {
    const el = document.getElementById('upload-content');
    if (!el) return;

    switch (activeTab) {
      case 'sync': await renderSync(el); break;
      case 'csv': renderCSV(el); break;
      case 'manual': renderManual(el); break;
      case 'snapshot': renderSnapshot(el); break;
    }
  }

  const BACKEND_URL = 'http://localhost:5001';

  // ──── SYNC TAB ────
  async function renderSync(el) {
    let lastScraping = null;
    let stats = { total: 0, completos: 0 };
    let sessionStatus = { active: false };
    try {
      [lastScraping, stats] = await Promise.all([DB.getLastScraping(), DB.getReelStats()]);
    } catch (e) {}

    // Check backend + session status
    try {
      const r = await fetch(`${BACKEND_URL}/api/ig-session-status?username=pump_team`, { signal: AbortSignal.timeout(2000) });
      if (r.ok) sessionStatus = await r.json();
    } catch (e) {
      sessionStatus = { active: false, backend_offline: true };
    }

    const lastDate = lastScraping ? Utils.timeAgo(lastScraping.fecha_scraping) : 'nunca';
    const pct = stats.total > 0 ? Math.round(stats.completos / stats.total * 100) : 0;

    const sessionBadge = sessionStatus.backend_offline
      ? `<span style="color:var(--text-secondary)">&#x26AA; Backend offline — <a href="#" onclick="UploadModule.renderTab();return false" style="color:var(--accent)">reintentar</a></span>`
      : sessionStatus.active
        ? `<span style="color:var(--green)">&#x1F7E2; Sesion activa (guardada ${sessionStatus.saved_at})</span>`
        : `<span style="color:var(--danger)">&#x1F534; Sin sesion — Instagram bloquea acceso anonimo</span>`;

    const loginForm = !sessionStatus.backend_offline && !sessionStatus.active ? `
      <details style="background:var(--bg-elevated);border-radius:var(--radius-sm);padding:12px" open>
        <summary style="cursor:pointer;font-size:12px;color:var(--accent)">&#x1F511; Conectar con Instagram</summary>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:10px">

          <div style="background:var(--bg);border-radius:var(--radius-sm);padding:10px">
            <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text)">&#x1F310; Opcion 1 — Importar sesion desde Chrome (recomendado)</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">Usa las cookies de Instagram que ya tenes en Chrome. No necesitas ingresar contraseña.</div>
            <button class="btn btn-primary" onclick="UploadModule.importBrowserSession()" style="font-size:12px">Importar sesion de Chrome</button>
          </div>

          <div style="background:var(--bg);border-radius:var(--radius-sm);padding:10px">
            <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text)">&#x1F511; Opcion 2 — Iniciar sesion con usuario/contraseña</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">Puede ser una cuenta secundaria — las credenciales no se almacenan.</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <input id="ig-login-user" class="input" placeholder="Usuario de Instagram" style="font-size:13px">
              <input id="ig-login-pass" class="input" type="password" placeholder="Contraseña" style="font-size:13px">
              <button class="btn" onclick="UploadModule.igLogin()" style="width:fit-content;font-size:12px">Iniciar sesion</button>
            </div>
          </div>

        </div>
      </details>` : '';

    el.innerHTML = `
      <div class="card" style="max-width:700px">
        <h3 style="margin-bottom:16px">&#x1F504; SCRAPING DE @pump_team</h3>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:13px">
          <div style="display:flex;align-items:center;gap:8px">
            ${sessionBadge}
          </div>

          ${loginForm}

          <div>
            <span class="text-secondary">Ultimo scraping:</span> ${lastDate}
            ${lastScraping ? `(${lastScraping.reels_encontrados} reels)` : ''}
          </div>
          <div>
            <span class="text-secondary">Reels en la base:</span>
            <span class="mono">${stats.total}</span> |
            <span class="text-secondary">Con metricas completas:</span>
            <span class="mono">${stats.completos}</span>
          </div>

          <div style="display:flex;gap:8px;margin:8px 0">
            <button class="btn btn-fire" id="btn-scrape" onclick="UploadModule.startScrape()" ${!sessionStatus.active ? 'disabled title="Necesitas sesion activa"' : ''}>&#x1F504; Scrapear ahora</button>
            <label class="btn" style="cursor:pointer">
              &#x1F4C1; Importar JSON de Instaloader
              <input type="file" accept=".json" style="display:none" onchange="UploadModule.handleJSONFile(event)">
            </label>
          </div>

          <div style="background:var(--bg-elevated);padding:12px;border-radius:var(--radius-sm);font-size:12px;color:var(--text-secondary)">
            &#x26A0;&#xFE0F; El scraping obtiene metricas publicas (views, likes, comments). Para Saves, Reach y Watch Time usa la pestana <strong>Importar CSV</strong> con el export de Meta Business Suite.
          </div>

          <div>
            <span class="text-secondary">Progreso de enriquecimiento:</span>
            <div class="progress-bar" style="margin-top:6px">
              <div class="fill" style="width:${pct}%"></div>
            </div>
            <span class="mono" style="font-size:11px">${stats.completos}/${stats.total} reels con datos completos (${pct}%)</span>
          </div>

          <div id="scraping-log-container" style="display:none">
            <div class="card-title" style="margin:12px 0 6px">Log del scraping:</div>
            <div class="scraping-log" id="scraping-log"></div>
            <div class="progress-bar" style="margin-top:8px">
              <div class="fill" id="scraping-progress" style="width:0%"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function startScrape() {
    const logContainer = document.getElementById('scraping-log-container');
    const logEl = document.getElementById('scraping-log');
    const progressEl = document.getElementById('scraping-progress');
    const btn = document.getElementById('btn-scrape');

    if (!logContainer || !logEl) return;
    logContainer.style.display = 'block';
    logEl.innerHTML = '';
    btn.disabled = true;
    btn.textContent = 'Scrapeando...';

    const onLog = (msg, type) => {
      const div = document.createElement('div');
      div.className = `log-line log-${type}`;
      div.textContent = msg;
      logEl.appendChild(div);
      logEl.scrollTop = logEl.scrollHeight;
    };

    const onProgress = (pct) => {
      if (progressEl) progressEl.style.width = pct + '%';
    };

    try {
      await Scraper.scrape(onLog, onProgress);
      Utils.toast('Scraping completado', 'success');
    } catch (e) {
      onLog('Error fatal: ' + e.message, 'error');
      Utils.toast('Error en scraping', 'error');
    }

    btn.disabled = false;
    btn.textContent = '\uD83D\uDD04 Scrapear ahora';
  }

  async function importBrowserSession() {
    const btn = event?.target;
    if (btn) { btn.disabled = true; btn.textContent = 'Importando...'; }
    try {
      const r = await fetch(`${BACKEND_URL}/api/ig-import-browser-session`, { method: 'POST' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Error desconocido');
      Utils.toast(`✓ Sesion de Chrome importada (${data.cookies_found?.length || 0} cookies)`, 'success');
      await renderTab();
    } catch (e) {
      Utils.toast(`Error: ${e.message}`, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Importar sesion de Chrome'; }
    }
  }

  async function igLogin() {
    const user = document.getElementById('ig-login-user')?.value?.trim();
    const pass = document.getElementById('ig-login-pass')?.value?.trim();
    if (!user || !pass) { Utils.toast('Usuario y contraseña requeridos', 'error'); return; }

    const btn = document.querySelector('#upload-content button.btn-fire[onclick*="igLogin"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Iniciando sesion...'; }

    try {
      const r = await fetch(`${BACKEND_URL}/api/ig-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Error desconocido');
      Utils.toast(`✓ Sesion guardada para @${user}`, 'success');
      await renderTab(); // Refresh to show active session
    } catch (e) {
      Utils.toast(`Error: ${e.message}`, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Iniciar sesion'; }
    }
  }

  async function handleJSONFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const logContainer = document.getElementById('scraping-log-container');
      const logEl = document.getElementById('scraping-log');
      const progressEl = document.getElementById('scraping-progress');
      if (logContainer) logContainer.style.display = 'block';
      if (logEl) logEl.innerHTML = '';

      const onLog = (msg, type) => {
        if (!logEl) return;
        const div = document.createElement('div');
        div.className = `log-line log-${type}`;
        div.textContent = msg;
        logEl.appendChild(div);
        logEl.scrollTop = logEl.scrollHeight;
      };
      const onProgress = (pct) => { if (progressEl) progressEl.style.width = pct + '%'; };

      await Scraper.importJSON(data, onLog, onProgress);
      Utils.toast('JSON importado', 'success');
    } catch (e) {
      Utils.toast('Error parseando JSON: ' + e.message, 'error');
    }
  }

  // ──── CSV TAB ────
  function renderCSV(el) {
    el.innerHTML = `
      <div class="card" style="max-width:700px">
        <h3 style="margin-bottom:16px">&#x1F4C1; Importar CSV de Meta Insights</h3>
        <div class="drop-zone" id="csv-drop"
          ondragover="event.preventDefault();this.classList.add('dragover')"
          ondragleave="this.classList.remove('dragover')"
          ondrop="UploadModule.handleCSVDrop(event)"
          onclick="document.getElementById('csv-file-input').click()">
          <div style="font-size:32px;margin-bottom:12px">&#x1F4C4;</div>
          <div>Arrastra tu archivo CSV aca o hace click para seleccionar</div>
          <div class="text-muted" style="font-size:12px;margin-top:8px">Formato: Export de Meta Business Suite (CSV o TSV)</div>
          <input type="file" id="csv-file-input" accept=".csv,.tsv,.txt" style="display:none" onchange="UploadModule.handleCSVFile(event)">
        </div>

        <div id="csv-preview" style="display:none;margin-top:16px">
          <div class="card-title" style="margin-bottom:8px">Preview de datos</div>
          <div id="csv-preview-table" style="overflow-x:auto;font-size:12px"></div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-fire" onclick="UploadModule.confirmCSVImport()">Importar datos</button>
            <button class="btn" onclick="document.getElementById('csv-preview').style.display='none'">Cancelar</button>
          </div>
        </div>

        <div id="csv-log" style="display:none;margin-top:16px">
          <div class="scraping-log" id="csv-import-log"></div>
          <div class="progress-bar" style="margin-top:8px">
            <div class="fill" id="csv-progress" style="width:0%"></div>
          </div>
        </div>
      </div>
    `;
  }

  let pendingCSVText = '';

  async function handleCSVDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) processCSVFile(file);
  }

  async function handleCSVFile(event) {
    const file = event.target.files[0];
    if (file) processCSVFile(file);
  }

  async function processCSVFile(file) {
    pendingCSVText = await file.text();
    const rows = Utils.parseCSV(pendingCSVText);

    if (rows.length === 0) {
      Utils.toast('CSV vacio o formato no reconocido', 'error');
      return;
    }

    // Show preview
    const previewEl = document.getElementById('csv-preview');
    const tableEl = document.getElementById('csv-preview-table');
    if (!previewEl || !tableEl) return;

    const headers = Object.keys(rows[0]);
    const preview = rows.slice(0, 5);

    tableEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>${headers.map(h => `<th style="padding:6px;text-align:left;border-bottom:1px solid var(--border);color:var(--text-secondary);font-size:10px;white-space:nowrap">${Utils.escapeHtml(h)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${preview.map(row => `<tr>${headers.map(h => `<td style="padding:4px 6px;border-bottom:1px solid var(--border);white-space:nowrap;max-width:200px;overflow:hidden;text-overflow:ellipsis">${Utils.escapeHtml(row[h] || '')}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="text-muted" style="margin-top:8px;font-size:11px">Mostrando ${preview.length} de ${rows.length} filas</div>
    `;
    previewEl.style.display = 'block';
  }

  async function confirmCSVImport() {
    if (!pendingCSVText) return;
    const previewEl = document.getElementById('csv-preview');
    const logEl = document.getElementById('csv-log');
    const importLogEl = document.getElementById('csv-import-log');
    const progressEl = document.getElementById('csv-progress');

    if (previewEl) previewEl.style.display = 'none';
    if (logEl) logEl.style.display = 'block';
    if (importLogEl) importLogEl.innerHTML = '';

    const onLog = (msg, type) => {
      if (!importLogEl) return;
      const div = document.createElement('div');
      div.className = `log-line log-${type}`;
      div.textContent = msg;
      importLogEl.appendChild(div);
      importLogEl.scrollTop = importLogEl.scrollHeight;
    };
    const onProgress = (pct) => { if (progressEl) progressEl.style.width = pct + '%'; };

    await Scraper.importCSV(pendingCSVText, onLog, onProgress);
    Utils.toast('CSV importado correctamente', 'success');
    pendingCSVText = '';
  }

  // ──── MANUAL TAB ────
  function renderManual(el, prefill) {
    const r = prefill || {};
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;max-width:1000px">
        <div>
          <form id="manual-form" onsubmit="event.preventDefault();UploadModule.saveManual()">
            ${renderSection('Basico', true, `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group" style="grid-column:span 2">
                  <label class="form-label">URL de Instagram</label>
                  <input class="form-input" name="ig_url" value="${r.ig_url || ''}" placeholder="https://www.instagram.com/reel/...">
                </div>
                <div class="form-group" style="grid-column:span 2">
                  <label class="form-label">Titulo</label>
                  <input class="form-input" name="titulo" value="${Utils.escapeHtml(r.titulo || '')}" required>
                </div>
                <div class="form-group" style="grid-column:span 2">
                  <label class="form-label">Caption</label>
                  <textarea class="form-textarea" name="caption" rows="3">${Utils.escapeHtml(r.caption || '')}</textarea>
                </div>
                <div class="form-group" style="grid-column:span 2">
                  <label class="form-label">CTA</label>
                  <input class="form-input" name="cta_text" value="${Utils.escapeHtml(r.cta_text || '')}" placeholder='Comenta "KEYWORD"'>
                </div>
                <div class="form-group">
                  <label class="form-label">Fecha publicacion</label>
                  <input class="form-input" type="date" name="fecha_publicacion" value="${r.fecha_publicacion || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Duracion (segundos)</label>
                  <input class="form-input" type="number" name="duracion_segundos" value="${r.duracion_segundos || ''}" min="0">
                </div>
                <div class="form-group">
                  <label class="form-label">Tipo</label>
                  <select class="form-select" name="tipo">
                    ${['reel','trial_reel','carousel','story'].map(t => `<option value="${t}" ${r.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Pilares</label>
                  <select class="form-select" name="pilar_1">
                    <option value="">Seleccionar</option>
                    ${Object.entries(Utils.PILARES).map(([k,v]) => `<option value="${k}" ${(r.pilares||[])[0] === k ? 'selected' : ''}>${v.emoji} ${v.label}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Subtema</label>
                  <input class="form-input" name="subtema" value="${Utils.escapeHtml(r.subtema || '')}">
                </div>
                <div class="form-group">
                  <label class="form-label">Formato narrativo</label>
                  <select class="form-select" name="formato_narrativo">
                    <option value="">Seleccionar</option>
                    ${Utils.FORMATOS.map(f => `<option value="${f}" ${r.formato_narrativo === f ? 'selected' : ''}>${f}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tipo de hook</label>
                  <select class="form-select" name="hook_tipo">
                    <option value="">Seleccionar</option>
                    ${Utils.HOOK_TIPOS.map(h => `<option value="${h}" ${r.hook_tipo === h ? 'selected' : ''}>${h}</option>`).join('')}
                  </select>
                </div>
              </div>
            `)}

            ${renderSection('Metricas organicas', !!r.id, `
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
                ${numField('Views totales', 'views_totales', r.views_totales)}
                ${numField('Views organicas', 'views_organicas', r.views_organicas)}
                ${numField('Reach organico', 'reach_organico', r.reach_organico)}
                ${numField('Reach total', 'reach_total', r.reach_total)}
                ${numField('Likes', 'likes', r.likes)}
                ${numField('Saves', 'saves', r.saves)}
                ${numField('Comments', 'comments', r.comments)}
                ${numField('Shares', 'shares', r.shares)}
                ${numField('Watch time (min)', 'watch_time_total_minutos', r.watch_time_total_minutos, true)}
              </div>
            `)}

            ${renderSection('Retencion', !!r.id, `
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
                ${numField('Retencion %', 'retencion_estimada', r.retencion_estimada, true)}
                ${numField('Abandono (seg)', 'abandono_promedio_segundos', r.abandono_promedio_segundos, true)}
              </div>
            `)}

            ${renderSection('Ventas', !!r.genero_ventas, `
              <div style="display:flex;flex-direction:column;gap:12px">
                <label class="toggle-wrap">
                  <input type="checkbox" name="genero_ventas" ${r.genero_ventas ? 'checked' : ''}>
                  <div class="toggle"></div>
                  <span>Genero ventas</span>
                </label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
                  <div class="form-group">
                    <label class="form-label">Producto</label>
                    <select class="form-select" name="producto_vendido">
                      <option value="">—</option>
                      ${Utils.PRODUCTOS.map(p => `<option value="${p}" ${r.producto_vendido === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                  </div>
                  ${numField('Ventas', 'ventas_atribuidas', r.ventas_atribuidas)}
                  ${numField('Revenue', 'revenue_atribuido', r.revenue_atribuido, true)}
                </div>
              </div>
            `)}

            ${renderSection('Ads (pagado)', !!r.tiene_ads, `
              <label class="toggle-wrap" style="margin-bottom:12px">
                <input type="checkbox" name="tiene_ads" ${r.tiene_ads ? 'checked' : ''}>
                <div class="toggle"></div>
                <span>Tiene ads</span>
              </label>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
                ${numField('Views paid', 'views_paid', r.views_paid)}
                ${numField('Reach paid', 'reach_paid', r.reach_paid)}
                ${numField('Impr paid', 'impr_paid', r.impr_paid)}
                ${numField('Spend', 'spend', r.spend, true)}
                ${numField('CTR %', 'ctr_pago', r.ctr_pago, true)}
                ${numField('CPV', 'cpv', r.cpv, true)}
                ${numField('CPM', 'cpm', r.cpm, true)}
                ${numField('Clicks', 'clicks', r.clicks)}
              </div>
            `)}

            ${renderSection('Contenido', false, `
              <div style="display:flex;flex-direction:column;gap:12px">
                <div class="form-group">
                  <label class="form-label">Transcripcion</label>
                  <textarea class="form-textarea" name="transcripcion" rows="5">${Utils.escapeHtml(r.transcripcion || '')}</textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Hook text (primeros segundos)</label>
                  <input class="form-input" name="hook_text" value="${Utils.escapeHtml(r.hook_text || '')}">
                </div>
                <div class="form-group">
                  <label class="form-label">Estructura narrativa</label>
                  <textarea class="form-textarea" name="estructura_narrativa" rows="3">${Utils.escapeHtml(r.estructura_narrativa || '')}</textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Thumbnail URL</label>
                  <input class="form-input" name="thumbnail_url" value="${r.thumbnail_url || ''}">
                </div>
              </div>
            `)}

            <input type="hidden" name="id" value="${r.id || ''}">
            <div style="display:flex;gap:8px;margin-top:16px">
              <button type="submit" class="btn btn-fire">${r.id ? 'Actualizar reel' : 'Guardar reel'}</button>
              <button type="button" class="btn" onclick="UploadModule.renderTab()">Cancelar</button>
            </div>
          </form>
        </div>

        <!-- Live preview -->
        <div>
          <div class="card" style="position:sticky;top:0">
            <div class="card-title" style="margin-bottom:12px">&#x1F4CA; Preview metricas</div>
            <div id="manual-preview" style="font-size:12px;color:var(--text-secondary)">
              Completa las metricas para ver el preview en tiempo real.
            </div>
          </div>
        </div>
      </div>
    `;

    // Live preview on input
    const form = document.getElementById('manual-form');
    if (form) {
      form.addEventListener('input', Utils.debounce(updatePreview, 300));
      if (r.id) updatePreview();
    }
  }

  function renderSection(title, open, content) {
    return `
      <div style="margin-bottom:12px">
        <div class="collapse-header ${open ? 'open' : ''}" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
          <span>${title}</span>
          <span class="arrow">&#x25B6;</span>
        </div>
        <div class="collapse-body ${open ? 'open' : ''}" style="padding-top:12px">
          ${content}
        </div>
      </div>
    `;
  }

  function numField(label, name, value, isFloat) {
    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <input class="form-input" type="number" name="${name}" value="${value != null ? value : ''}" ${isFloat ? 'step="0.01"' : ''} min="0">
      </div>
    `;
  }

  function updatePreview() {
    const form = document.getElementById('manual-form');
    const preview = document.getElementById('manual-preview');
    if (!form || !preview) return;

    const fd = new FormData(form);
    const views = parseInt(fd.get('views_totales')) || 0;
    const reach = parseInt(fd.get('reach_total')) || views;
    const likes = parseInt(fd.get('likes')) || 0;
    const saves = parseInt(fd.get('saves')) || 0;
    const comments = parseInt(fd.get('comments')) || 0;
    const shares = parseInt(fd.get('shares')) || 0;
    const base = Math.max(reach, views, 1);

    const eng = ((likes + saves + comments + shares) / base * 100).toFixed(2);
    const sr = (saves / base * 100).toFixed(2);
    const lr = (likes / base * 100).toFixed(2);
    const srEval = Utils.saveRateEval(parseFloat(sr));

    preview.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <div>Engagement rate: <strong class="mono">${eng}%</strong></div>
        <div>Save rate: <strong class="mono" style="color:${srEval.color}">${sr}% ${srEval.icon}</strong> <span class="text-muted">${srEval.label}</span></div>
        <div>Like rate: <strong class="mono">${lr}%</strong></div>
        <div>Comment rate: <strong class="mono">${(comments / base * 100).toFixed(2)}%</strong></div>
        <div>Share rate: <strong class="mono">${(shares / base * 100).toFixed(2)}%</strong></div>
        ${fd.get('watch_time_total_minutos') && views ? `<div>Watch prom: <strong class="mono">${(parseFloat(fd.get('watch_time_total_minutos')) * 60 / views).toFixed(1)}s</strong></div>` : ''}
      </div>
    `;
  }

  async function saveManual() {
    const form = document.getElementById('manual-form');
    if (!form) return;
    const fd = new FormData(form);
    const reel = {};

    // Text fields
    ['ig_url','titulo','caption','cta_text','subtema','transcripcion','hook_text','estructura_narrativa','thumbnail_url','producto_vendido'].forEach(f => {
      if (fd.get(f)) reel[f] = fd.get(f);
    });

    // Select/enum fields
    ['tipo','formato_narrativo','hook_tipo'].forEach(f => {
      if (fd.get(f)) reel[f] = fd.get(f);
    });

    // Date
    if (fd.get('fecha_publicacion')) reel.fecha_publicacion = fd.get('fecha_publicacion');

    // Numbers
    ['duracion_segundos','views_totales','views_organicas','reach_organico','reach_total','likes','saves','comments','shares','views_paid','reach_paid','impr_paid','clicks','ventas_atribuidas'].forEach(f => {
      if (fd.get(f) !== '') reel[f] = parseInt(fd.get(f));
    });
    ['watch_time_total_minutos','retencion_estimada','abandono_promedio_segundos','spend','ctr_pago','cpv','cpm','revenue_atribuido'].forEach(f => {
      if (fd.get(f) !== '') reel[f] = parseFloat(fd.get(f));
    });

    // Booleans
    reel.tiene_ads = !!fd.get('tiene_ads');
    reel.genero_ventas = !!fd.get('genero_ventas');

    // Pilares
    const pilar = fd.get('pilar_1');
    if (pilar) reel.pilares = [pilar];

    // ID for update
    if (fd.get('id')) reel.id = fd.get('id');

    try {
      await DB.upsertReel(reel);
      Utils.toast(reel.id ? 'Reel actualizado' : 'Reel guardado', 'success');
      window.PCS.navigate('reels');
    } catch (e) {
      Utils.toast('Error guardando: ' + e.message, 'error');
    }
  }

  // ──── SNAPSHOT TAB ────
  function renderSnapshot(el) {
    el.innerHTML = `
      <div class="card" style="max-width:600px">
        <h3 style="margin-bottom:16px">&#x1F4F8; Snapshot semanal de la cuenta</h3>
        <form id="snapshot-form" onsubmit="event.preventDefault();UploadModule.saveSnapshot()">
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
            <div class="form-group" style="grid-column:span 2">
              <label class="form-label">Fecha</label>
              <input class="form-input" type="date" name="fecha" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            ${numField('Followers', 'followers', '')}
            ${numField('Nuevos seguidores', 'nuevos_seguidores', '')}
            ${numField('Seguidores perdidos', 'seguidores_perdidos', '')}
            ${numField('Following', 'following', '')}
            ${numField('Alcance semanal', 'alcance_semanal', '')}
            ${numField('Impresiones semanales', 'impresiones_semanales', '')}
            ${numField('Visitas al perfil', 'visitas_perfil', '')}
            ${numField('Clicks en link bio', 'clicks_link', '')}
          </div>
          <button type="submit" class="btn btn-fire" style="margin-top:16px">Guardar snapshot</button>
        </form>
      </div>
    `;
  }

  async function saveSnapshot() {
    const form = document.getElementById('snapshot-form');
    if (!form) return;
    const fd = new FormData(form);
    const snap = { fecha: fd.get('fecha') };
    ['followers','following','alcance_semanal','impresiones_semanales','visitas_perfil','clicks_link','nuevos_seguidores','seguidores_perdidos'].forEach(f => {
      if (fd.get(f) !== '') snap[f] = parseInt(fd.get(f));
    });
    try {
      await DB.upsertSnapshot(snap);
      Utils.toast('Snapshot guardado', 'success');
    } catch (e) {
      Utils.toast('Error: ' + e.message, 'error');
    }
  }

  function prefillForm(reel) {
    activeTab = 'manual';
    const el = document.getElementById('upload-content');
    if (el) renderManual(el, reel);
  }

  return {
    render, switchTab, renderTab, startScrape, igLogin, importBrowserSession, handleJSONFile,
    handleCSVDrop, handleCSVFile, confirmCSVImport,
    saveManual, saveSnapshot, prefillForm,
  };
})();
