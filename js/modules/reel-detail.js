/* ============================================
   PUMP CONTENT STUDIO — Reel Detail Module
   ============================================ */

const ReelDetailModule = (() => {

  async function render(container, reelId) {
    container.innerHTML = '<div class="loading-overlay"><div class="loader"></div> Cargando detalle...</div>';

    try {
      const [reel, benchmarksArr] = await Promise.all([
        DB.getReel(reelId),
        DB.getBenchmarks(),
      ]);
      const b = benchmarksArr?.[0] || {};

      if (!reel) {
        container.innerHTML = '<div class="empty-state"><p>Reel no encontrado</p></div>';
        return;
      }

      container.innerHTML = `
        <div style="margin-bottom:16px">
          <button class="btn btn-sm btn-ghost" onclick="window.PCS.navigate('reels')">&#x25C0; Volver a Reels</button>
        </div>
        <div class="detail-layout">
          <!-- COLUMNA A: Identidad -->
          <div style="display:flex;flex-direction:column;gap:16px">
            ${renderIdentity(reel, b)}
          </div>

          <!-- COLUMNA B: Metricas -->
          <div style="display:flex;flex-direction:column;gap:16px">
            ${renderMetrics(reel, b)}
          </div>

          <!-- COLUMNA C: Contenido + IA -->
          <div style="display:flex;flex-direction:column;gap:16px">
            ${renderContent(reel)}
          </div>
        </div>
      `;

      // Render comparison chart
      setTimeout(() => {
        Charts.horizontalBars('chart-comparison',
          ['Save rate', 'Like rate', 'Comment rate', 'Share rate'],
          [reel.save_rate || 0, reel.like_rate || 0, reel.comment_rate || 0, reel.share_rate || 0],
          [b.avg_save_rate || 0, b.avg_like_rate || 0, b.avg_comment_rate || 0, b.avg_share_rate || 0],
          ['#00ff88', '#ffd600', '#00d4ff', '#8b5cf6']
        );
      }, 100);

    } catch (e) {
      container.innerHTML = `<div class="empty-state"><p style="color:var(--red)">Error: ${Utils.escapeHtml(e.message)}</p></div>`;
    }
  }

  function renderIdentity(reel, b) {
    const pilares = (reel.pilares || []).map(p => Utils.pilarBadge(p)).join(' ');
    const sr = Utils.saveRateEval(reel.save_rate);

    const metrics = [
      { label: 'Save rate', current: reel.save_rate, bench: b.avg_save_rate, icon: '\uD83D\uDD16' },
      { label: 'Like rate', current: reel.like_rate, bench: b.avg_like_rate, icon: '\u2764\uFE0F' },
      { label: 'Comment rate', current: reel.comment_rate, bench: b.avg_comment_rate, icon: '\uD83D\uDCAC' },
      { label: 'Share rate', current: reel.share_rate, bench: b.avg_share_rate, icon: '\u2197\uFE0F' },
    ];

    return `
      <!-- Thumbnail -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="aspect-ratio:9/16;max-height:280px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;position:relative">
          ${reel.thumbnail_url ? `<img src="${reel.thumbnail_url}" style="width:100%;height:100%;object-fit:cover">` : `<span style="font-size:64px;opacity:.2">${(Utils.PILARES[(reel.pilares||[])[0]]||{}).emoji || '\uD83C\uDFAC'}</span>`}
          ${reel.ig_url ? `<a href="${reel.ig_url}" target="_blank" class="btn btn-sm btn-fire" style="position:absolute;bottom:12px;right:12px">Abrir en IG &#x2197;</a>` : ''}
        </div>
      </div>

      <!-- Info -->
      <div class="card">
        <h3 style="font-size:15px;margin-bottom:12px">${Utils.escapeHtml(reel.titulo || 'Sin titulo')}</h3>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:12px">
          <div><span class="text-secondary">Fecha:</span> ${Utils.formatDate(reel.fecha_publicacion)} (${Utils.timeAgo(reel.fecha_publicacion)})</div>
          <div><span class="text-secondary">Duracion:</span> ${Utils.formatDuration(reel.duracion_segundos)}</div>
          <div><span class="text-secondary">Tipo:</span> <span class="badge badge-fire">${reel.tipo || 'reel'}</span></div>
          <div><span class="text-secondary">Pilares:</span> ${pilares || '<span class="text-muted">Sin pilar</span>'}</div>
          <div><span class="text-secondary">Subtema:</span> ${reel.subtema || '—'}</div>
          <div><span class="text-secondary">Formato:</span> ${reel.formato_narrativo || '—'}</div>
          <div><span class="text-secondary">Tipo hook:</span> ${reel.hook_tipo || '—'}</div>
          ${reel.cta_text ? `<div><span class="text-secondary">CTA:</span> <em>"${Utils.escapeHtml(reel.cta_text)}"</em></div>` : ''}
          <div style="display:flex;gap:6px;margin-top:4px">
            ${reel.tiene_ads ? '<span class="badge badge-pink">Ads</span>' : ''}
            ${reel.genero_ventas ? '<span class="badge badge-green">Vendio</span>' : ''}
            ${!reel.datos_completos ? '<span class="badge badge-yellow">\u26A0\uFE0F Datos incompletos</span>' : '<span class="badge badge-green">\u2713 Datos completos</span>'}
          </div>
        </div>
      </div>

      <!-- Vs Benchmark -->
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">VS BENCHMARK 90D</div>
        ${metrics.map(m => {
          const d = Utils.delta(m.current, m.bench);
          const pct = m.bench > 0 ? Math.min(100, (m.current || 0) / m.bench * 50) : 0;
          const benchPct = 50;
          return `
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
                <span>${m.icon} ${m.label}</span>
                <span class="mono kpi-delta ${d.class}">${d.text}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="mono" style="font-size:12px;width:50px">${Utils.formatPct(m.current)}</span>
                <div class="h-bar">
                  <div class="fill" style="width:${pct}%;background:${d.class === 'positive' ? 'var(--green)' : d.class === 'negative' ? 'var(--red)' : 'var(--yellow)'};opacity:0.7"></div>
                  <div class="benchmark-line" style="left:${benchPct}%"></div>
                </div>
                <span class="mono text-muted" style="font-size:10px;width:50px">${Utils.formatPct(m.bench)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderMetrics(reel, b) {
    const grid = (items) => `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">${items.join('')}</div>`;

    const mini = (label, value, delta, isAds) => {
      const d = delta ? Utils.delta(value, delta) : null;
      return `
        <div class="metric-mini ${isAds ? 'ads-metric' : ''}">
          <div class="metric-value">${typeof value === 'number' ? (value > 999 ? Utils.formatNum(value) : value.toLocaleString('es-AR')) : (value || '\u2014')}</div>
          <div class="metric-label">${label}</div>
          ${d ? `<div class="metric-delta kpi-delta ${d.class}">${d.text}</div>` : ''}
        </div>
      `;
    };

    const orgMetrics = [
      mini('Views Org', reel.views_organicas),
      mini('Views Total', reel.views_totales, b.avg_views),
      mini('Reach Org', reel.reach_organico),
      mini('Reach Total', reel.reach_total),
      mini('Eng. Rate', Utils.formatPct(reel.engagement_rate)),
    ];
    const watchMetrics = [
      mini('Watch Total', reel.watch_time_total_minutos ? reel.watch_time_total_minutos.toFixed(1) + ' min' : null),
      mini('Watch Prom', reel.watch_time_promedio_segundos ? reel.watch_time_promedio_segundos.toFixed(1) + 's' : null),
      mini('Retencion', reel.retencion_estimada ? Utils.formatPct(reel.retencion_estimada) : null),
      mini('Abandono', reel.abandono_promedio_segundos ? reel.abandono_promedio_segundos.toFixed(1) + 's' : null),
      mini('Likes', reel.likes, b.avg_views ? (b.avg_like_rate / 100 * b.avg_views) : null),
    ];
    const socialMetrics = [
      mini('Saves', reel.saves),
      mini('Comments', reel.comments),
      mini('Shares', reel.shares),
      mini('Views/Reach', reel.views_reach_ratio ? reel.views_reach_ratio + '×' : null),
      mini('Multiplicador', reel.multiplicador ? reel.multiplicador + '×' : null),
    ];

    let adsHtml = '';
    if (reel.tiene_ads) {
      const adsMetrics = [
        mini('Views Paid', reel.views_paid, null, true),
        mini('Reach Paid', reel.reach_paid, null, true),
        mini('Impresiones', reel.impr_paid, null, true),
        mini('CTR', reel.ctr_pago ? Utils.formatPct(reel.ctr_pago) : null, null, true),
        mini('CPV', reel.cpv ? Utils.formatMoney(reel.cpv) : null, null, true),
        mini('CPM', reel.cpm ? Utils.formatMoney(reel.cpm) : null, null, true),
        mini('Spend', reel.spend ? Utils.formatMoney(reel.spend) : null, null, true),
        mini('Clicks', reel.clicks, null, true),
      ];
      adsHtml = `
        <div class="card" style="border:1px solid rgba(255,0,153,0.2)">
          <div class="card-title" style="color:var(--pink);margin-bottom:12px">&#x1F4B0; METRICAS PAGADAS</div>
          ${grid(adsMetrics)}
        </div>
      `;
    }

    // Retention bar
    let retentionBarHtml = '';
    if (reel.duracion_segundos && reel.abandono_promedio_segundos) {
      const pct = Math.min(100, (reel.abandono_promedio_segundos / reel.duracion_segundos) * 100);
      retentionBarHtml = `
        <div class="card">
          <div class="card-title" style="margin-bottom:8px">HASTA DONDE LLEGA EL VIEWER</div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px">
            <span>0s</span>
            <span>${reel.duracion_segundos}s</span>
          </div>
          <div class="retention-bar">
            <div class="fill" style="width:${pct}%"></div>
            <div class="marker" style="left:${pct}%">
              <div class="marker-label">${reel.abandono_promedio_segundos.toFixed(1)}s (${Utils.formatPct(reel.retencion_estimada)} retencion)</div>
            </div>
          </div>
        </div>
      `;
    }

    // Revenue
    let revenueHtml = '';
    if (reel.genero_ventas) {
      revenueHtml = `
        <div class="card" style="border:1px solid rgba(0,255,136,0.2)">
          <div class="card-title" style="color:var(--green);margin-bottom:12px">&#x1F4B0; REVENUE</div>
          <div style="font-size:13px;display:flex;flex-direction:column;gap:6px">
            <div>Producto: <strong>${reel.producto_vendido || '—'}</strong></div>
            <div>Ventas atribuidas: <strong class="mono">${reel.ventas_atribuidas || 0}</strong></div>
            <div>Revenue: <strong class="mono" style="font-size:1.2rem;color:var(--green)">${Utils.formatMoney(reel.revenue_atribuido)}</strong></div>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">METRICAS ORGANICAS</div>
        ${grid(orgMetrics)}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">WATCH TIME & ENGAGEMENT</div>
        ${grid(watchMetrics)}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">SOCIAL & MULTIPLICADOR</div>
        ${grid(socialMetrics)}
      </div>
      ${retentionBarHtml}
      ${adsHtml}
      ${revenueHtml}
      <!-- Comparison chart -->
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">ESTE REEL VS BENCHMARK</div>
        <div class="chart-container" style="height:200px">
          <canvas id="chart-comparison"></canvas>
        </div>
      </div>
    `;
  }

  function renderContent(reel) {
    // ── GUION ──────────────────────────────────────────────────────────
    const guionHtml = `
      <div class="card" id="guion-card-${reel.id}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div class="card-title">GUION DEL REEL</div>
          <button class="btn" style="font-size:11px;padding:4px 10px" onclick="ReelDetailModule.toggleGuionEdit('${reel.id}')">&#x270F;&#xFE0F; Editar</button>
        </div>

        ${reel.hook_text || reel.transcripcion || reel.cta_text ? `
          <div id="guion-view-${reel.id}" style="display:flex;flex-direction:column;gap:10px">
            ${reel.hook_text ? `
              <div>
                <div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--danger);margin-bottom:4px">HOOK (0–3s)</div>
                <div style="font-size:13px;font-style:italic;background:var(--bg-void);padding:10px 12px;border-radius:var(--radius-sm);border-left:3px solid var(--danger);line-height:1.5">"${Utils.escapeHtml(reel.hook_text)}"</div>
              </div>` : ''}
            ${reel.transcripcion ? `
              <div>
                <div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--accent);margin-bottom:4px">DESARROLLO${reel.palabras_por_minuto ? ` · ${reel.palabras_por_minuto} ppm` : ''}</div>
                <div style="font-size:12px;line-height:1.7;background:var(--bg-void);padding:10px 12px;border-radius:var(--radius-sm);border-left:3px solid var(--accent);white-space:pre-wrap;max-height:300px;overflow-y:auto">${Utils.escapeHtml(reel.transcripcion)}</div>
              </div>` : ''}
            ${reel.cta_text ? `
              <div>
                <div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--purple, #a78bfa);margin-bottom:4px">CTA</div>
                <div style="font-size:13px;font-style:italic;background:var(--bg-void);padding:10px 12px;border-radius:var(--radius-sm);border-left:3px solid var(--purple, #a78bfa);line-height:1.5">"${Utils.escapeHtml(reel.cta_text)}"</div>
              </div>` : ''}
          </div>
        ` : `
          <div id="guion-view-${reel.id}" style="color:var(--text-secondary);font-size:12px;text-align:center;padding:20px 0">
            Sin guion cargado — usá el editor para agregar hook, desarrollo y CTA.
          </div>
        `}

        <div id="guion-edit-${reel.id}" style="display:none;flex-direction:column;gap:10px">
          <div>
            <label style="font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--danger)">HOOK (primeros 3 segundos)</label>
            <textarea id="ge-hook-${reel.id}" class="input" rows="2" style="width:100%;margin-top:4px;font-size:13px;resize:vertical" placeholder="La frase de apertura que engancha...">${Utils.escapeHtml(reel.hook_text || '')}</textarea>
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--accent)">DESARROLLO / TRANSCRIPCION</label>
            <textarea id="ge-trans-${reel.id}" class="input" rows="8" style="width:100%;margin-top:4px;font-size:12px;resize:vertical;line-height:1.6" placeholder="El cuerpo del reel...">${Utils.escapeHtml(reel.transcripcion || '')}</textarea>
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--purple, #a78bfa)">CTA</label>
            <textarea id="ge-cta-${reel.id}" class="input" rows="2" style="width:100%;margin-top:4px;font-size:13px;resize:vertical" placeholder="Comentá X / Link en bio...">${Utils.escapeHtml(reel.cta_text || '')}</textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-fire" style="font-size:12px" onclick="ReelDetailModule.saveGuion('${reel.id}')">Guardar guion</button>
            <button class="btn btn-ghost" style="font-size:12px" onclick="ReelDetailModule.toggleGuionEdit('${reel.id}')">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    // Segmented transcription (legacy — solo si hay transcripcion pero no hook separado, se muestra el guion arriba)
    let transcripcionHtml = '';
    // (ahora el guion unifica hook + transcripcion + cta, no mostramos separado)

    // Structure analysis
    let structureHtml = '';
    if (reel.estructura_narrativa) {
      structureHtml = `
        <div class="card">
          <div class="card-title" style="margin-bottom:8px">ESTRUCTURA NARRATIVA</div>
          <div style="font-size:12px;color:var(--text-secondary);white-space:pre-wrap">${Utils.escapeHtml(reel.estructura_narrativa)}</div>
        </div>
      `;
    }

    // Caption
    const captionHtml = reel.caption ? `
      <div class="card">
        <div class="card-title" style="margin-bottom:8px">CAPTION</div>
        <div style="font-size:12px;color:var(--text-secondary);white-space:pre-wrap;max-height:200px;overflow-y:auto">${Utils.escapeHtml(reel.caption)}</div>
      </div>
    ` : '';

    return `
      ${guionHtml}
      ${structureHtml}
      ${captionHtml}

      <!-- Actions -->
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">ACCIONES</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-fire" onclick="window.PCS.openAIForReel('${reel.id}')">&#x1F916; Analizar con Pump AI</button>
          <button class="btn" onclick="ReelDetailModule.editReel('${reel.id}')">&#x270F;&#xFE0F; Editar reel</button>
          <button class="btn" onclick="ReelDetailModule.createIdeaFrom('${reel.id}')">&#x1F4A1; Crear idea inspirada</button>
          <button class="btn btn-ghost" style="color:var(--red)" onclick="ReelDetailModule.deleteReel('${reel.id}')">&#x1F5D1;&#xFE0F; Eliminar</button>
        </div>
      </div>
    `;
  }

  function toggleGuionEdit(reelId) {
    const view = document.getElementById(`guion-view-${reelId}`);
    const edit = document.getElementById(`guion-edit-${reelId}`);
    if (!view || !edit) return;
    const isEditing = edit.style.display !== 'none';
    view.style.display = isEditing ? '' : 'none';
    edit.style.display = isEditing ? 'none' : 'flex';
  }

  async function saveGuion(reelId) {
    const hook = document.getElementById(`ge-hook-${reelId}`)?.value?.trim();
    const trans = document.getElementById(`ge-trans-${reelId}`)?.value?.trim();
    const cta = document.getElementById(`ge-cta-${reelId}`)?.value?.trim();

    try {
      await DB.upsertReel({ id: reelId, hook_text: hook || null, transcripcion: trans || null, cta_text: cta || null });
      Utils.toast('Guion guardado', 'success');
      // Reload the detail view
      render(document.getElementById('main-content'), reelId);
    } catch (e) {
      Utils.toast('Error guardando: ' + e.message, 'error');
    }
  }

  async function editReel(reelId) {
    // Open upload form pre-filled with this reel's data
    const reel = await DB.getReel(reelId);
    window.PCS.navigate('upload');
    // After render, fill the form
    setTimeout(() => UploadModule.prefillForm(reel), 300);
  }

  async function createIdeaFrom(reelId) {
    const reel = await DB.getReel(reelId);
    const idea = {
      titulo: 'Iteracion de: ' + (reel.titulo || 'Sin titulo'),
      pilar: (reel.pilares || [])[0] || '',
      formato_narrativo: reel.formato_narrativo || '',
      hook_tipo: reel.hook_tipo || '',
      inspirado_en: reelId,
      estado: 'idea',
      notas: `Inspirado en reel ×${reel.multiplicador || '?'} con ${Utils.formatNum(reel.views_totales)} views y ${Utils.formatPct(reel.save_rate)} save rate`,
    };
    await DB.upsertIdea(idea);
    Utils.toast('Idea creada en el Kanban', 'success');
    window.PCS.navigate('ideas');
  }

  async function deleteReel(reelId) {
    if (!confirm('Seguro que queres eliminar este reel?')) return;
    await DB.deleteReel(reelId);
    Utils.toast('Reel eliminado', 'success');
    window.PCS.navigate('reels');
  }

  return { render, editReel, createIdeaFrom, deleteReel, toggleGuionEdit, saveGuion };
})();
