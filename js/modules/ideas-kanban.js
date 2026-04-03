/* ============================================
   PUMP CONTENT STUDIO — Ideas Kanban Module
   ============================================ */

const IdeasKanbanModule = (() => {
  const COLUMNS = [
    { key: 'idea',      label: '\uD83D\uDCA1 IDEA',      color: 'var(--fire)' },
    { key: 'en_guion',  label: '\u270D\uFE0F EN GUION',   color: 'var(--purple)' },
    { key: 'grabado',   label: '\uD83C\uDFAC GRABADO',    color: 'var(--cyan)' },
    { key: 'editado',   label: '\u2702\uFE0F EDITADO',    color: 'var(--yellow)' },
    { key: 'publicado', label: '\u2705 PUBLICADO',         color: 'var(--green)' },
  ];

  async function render(container) {
    container.innerHTML = '<div class="loading-overlay"><div class="loader"></div> Cargando ideas...</div>';

    try {
      const ideas = await DB.getIdeas();

      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3>Ideas & Guiones</h3>
          <div style="display:flex;gap:8px">
            <button class="btn btn-fire" onclick="IdeasKanbanModule.showNewIdeaModal()">&#x2795; Nueva idea</button>
            <button class="btn" onclick="IdeasKanbanModule.generateIdeasAI()">&#x1F916; Generar ideas con IA</button>
          </div>
        </div>
        <div class="kanban-board" id="kanban-board">
          ${COLUMNS.map(col => {
            const colIdeas = ideas.filter(i => i.estado === col.key);
            return `
              <div class="kanban-column" data-estado="${col.key}"
                ondragover="event.preventDefault();this.style.background='var(--fire-dim)'"
                ondragleave="this.style.background=''"
                ondrop="IdeasKanbanModule.handleDrop(event,'${col.key}');this.style.background=''">
                <div class="kanban-column-header" style="border-top:2px solid ${col.color}">
                  <span>${col.label}</span>
                  <span class="count">${colIdeas.length}</span>
                </div>
                <div class="kanban-cards">
                  ${colIdeas.map(renderIdeaCard).join('')}
                  ${col.key === 'idea' ? `
                    <div class="kanban-card" style="border-style:dashed;text-align:center;color:var(--text-muted);cursor:pointer"
                      onclick="IdeasKanbanModule.showNewIdeaModal()">
                      &#x2795; Agregar idea
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><p style="color:var(--red)">Error: ${Utils.escapeHtml(e.message)}</p></div>`;
    }
  }

  function renderIdeaCard(idea) {
    const pilarInfo = Utils.PILARES[idea.pilar] || {};
    return `
      <div class="kanban-card" draggable="true"
        ondragstart="event.dataTransfer.setData('text/plain','${idea.id}')"
        onclick="IdeasKanbanModule.showIdeaDetail('${idea.id}')">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
          ${idea.pilar ? `<span class="badge ${pilarInfo.class || 'badge-muted'}" style="font-size:9px">${pilarInfo.emoji || ''} ${pilarInfo.label || idea.pilar}</span>` : ''}
          ${idea.formato_narrativo ? `<span class="text-muted" style="font-size:10px">${idea.formato_narrativo}</span>` : ''}
        </div>
        <div style="font-weight:600;font-size:13px;margin-bottom:6px">${Utils.escapeHtml(idea.titulo)}</div>
        ${idea.hook_propuesto ? `<div style="font-size:11px;color:var(--text-secondary);font-style:italic;margin-bottom:4px">"${Utils.truncate(idea.hook_propuesto, 60)}"</div>` : ''}
        ${idea.cta_propuesto ? `<div style="font-size:10px;color:var(--text-muted)">CTA: "${Utils.truncate(idea.cta_propuesto, 40)}"</div>` : ''}
        ${idea.inspirado_en ? `<div style="font-size:10px;color:var(--cyan);margin-top:4px">Inspirado en un reel</div>` : ''}
        <div style="display:flex;gap:4px;margin-top:8px">
          <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();IdeasKanbanModule.expandIdea('${idea.id}')" title="Expandir con IA">&#x2728;</button>
          <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();IdeasKanbanModule.writeGuion('${idea.id}')" title="Generar guion">&#x270D;&#xFE0F;</button>
          <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();IdeasKanbanModule.deleteIdea('${idea.id}')" title="Eliminar" style="color:var(--red)">&#x2715;</button>
        </div>
      </div>
    `;
  }

  async function handleDrop(event, newEstado) {
    event.preventDefault();
    const ideaId = event.dataTransfer.getData('text/plain');
    if (!ideaId) return;
    try {
      await DB.updateIdeaEstado(ideaId, newEstado);
      Utils.toast(`Idea movida a ${newEstado}`, 'success');
      render(document.getElementById('content'));
    } catch (e) {
      Utils.toast('Error: ' + e.message, 'error');
    }
  }

  function showNewIdeaModal() {
    const modal = document.getElementById('modal-content');
    modal.innerHTML = `
      <div class="modal-header">
        <span class="modal-title">&#x1F4A1; Nueva idea</span>
        <button class="modal-close" onclick="window.PCS.closeModal()">&times;</button>
      </div>
      <form id="idea-form" onsubmit="event.preventDefault();IdeasKanbanModule.saveIdea()">
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="form-group">
            <label class="form-label">Titulo</label>
            <input class="form-input" name="titulo" required placeholder="Titulo de la idea">
          </div>
          <div class="form-group">
            <label class="form-label">Descripcion</label>
            <textarea class="form-textarea" name="descripcion" rows="3" placeholder="De que se trata..."></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
              <label class="form-label">Pilar</label>
              <select class="form-select" name="pilar">
                <option value="">Seleccionar</option>
                ${Object.entries(Utils.PILARES).map(([k,v]) => `<option value="${k}">${v.emoji} ${v.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Formato narrativo</label>
              <select class="form-select" name="formato_narrativo">
                <option value="">Seleccionar</option>
                ${Utils.FORMATOS.map(f => `<option value="${f}">${f}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo de hook</label>
              <select class="form-select" name="hook_tipo">
                <option value="">Seleccionar</option>
                ${Utils.HOOK_TIPOS.map(h => `<option value="${h}">${h}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Subtema</label>
              <input class="form-input" name="subtema">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Hook propuesto</label>
            <input class="form-input" name="hook_propuesto" placeholder="Los primeros 3 segundos...">
          </div>
          <div class="form-group">
            <label class="form-label">CTA propuesto</label>
            <input class="form-input" name="cta_propuesto" placeholder='Comenta "KEYWORD"'>
          </div>
          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-textarea" name="notas" rows="2"></textarea>
          </div>
          <button type="submit" class="btn btn-fire">Guardar idea</button>
        </div>
      </form>
    `;
    window.PCS.openModal();
  }

  async function saveIdea(data) {
    const form = document.getElementById('idea-form');
    if (!form && !data) return;

    const idea = data || {};
    if (form) {
      const fd = new FormData(form);
      ['titulo','descripcion','pilar','subtema','formato_narrativo','hook_tipo','hook_propuesto','cta_propuesto','notas'].forEach(f => {
        if (fd.get(f)) idea[f] = fd.get(f);
      });
    }
    idea.estado = idea.estado || 'idea';

    try {
      await DB.upsertIdea(idea);
      Utils.toast('Idea guardada', 'success');
      window.PCS.closeModal();
      render(document.getElementById('content'));
    } catch (e) {
      Utils.toast('Error: ' + e.message, 'error');
    }
  }

  async function showIdeaDetail(ideaId) {
    const ideas = await DB.getIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const guiones = await DB.getGuiones(ideaId);

    const modal = document.getElementById('modal-content');
    modal.innerHTML = `
      <div class="modal-header">
        <span class="modal-title">${Utils.escapeHtml(idea.titulo)}</span>
        <button class="modal-close" onclick="window.PCS.closeModal()">&times;</button>
      </div>
      <div class="tabs">
        <div class="tab active" onclick="document.getElementById('idea-tab-info').style.display='block';document.getElementById('idea-tab-guiones').style.display='none';this.classList.add('active');this.nextElementSibling.classList.remove('active')">Info</div>
        <div class="tab" onclick="document.getElementById('idea-tab-guiones').style.display='block';document.getElementById('idea-tab-info').style.display='none';this.classList.add('active');this.previousElementSibling.classList.remove('active')">Guiones (${guiones.length})</div>
      </div>
      <div id="idea-tab-info">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
          <div><span class="text-secondary">Pilar:</span> ${idea.pilar ? Utils.pilarBadge(idea.pilar) : '—'}</div>
          <div><span class="text-secondary">Formato:</span> ${idea.formato_narrativo || '—'}</div>
          <div><span class="text-secondary">Hook tipo:</span> ${idea.hook_tipo || '—'}</div>
          <div><span class="text-secondary">Estado:</span> <span class="badge badge-fire">${idea.estado}</span></div>
        </div>
        ${idea.descripcion ? `<div style="margin-top:12px;font-size:13px;color:var(--text-secondary)">${Utils.escapeHtml(idea.descripcion)}</div>` : ''}
        ${idea.hook_propuesto ? `<div style="margin-top:12px"><strong>Hook:</strong> <em>"${Utils.escapeHtml(idea.hook_propuesto)}"</em></div>` : ''}
        ${idea.cta_propuesto ? `<div style="margin-top:8px"><strong>CTA:</strong> <em>"${Utils.escapeHtml(idea.cta_propuesto)}"</em></div>` : ''}
        ${idea.notas ? `<div style="margin-top:12px;padding:8px;background:var(--bg-void);border-radius:4px;font-size:12px;color:var(--text-muted)">${Utils.escapeHtml(idea.notas)}</div>` : ''}
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn" onclick="window.PCS.closeModal();IdeasKanbanModule.expandIdea('${idea.id}')">&#x2728; Expandir con IA</button>
          <button class="btn btn-fire" onclick="window.PCS.closeModal();IdeasKanbanModule.writeGuion('${idea.id}')">&#x270D;&#xFE0F; Generar guion</button>
        </div>
      </div>
      <div id="idea-tab-guiones" style="display:none">
        ${guiones.length === 0 ? '<p class="text-muted">Sin guiones todavia. Genera uno con IA.</p>' : ''}
        ${guiones.map(g => `
          <div class="card" style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <strong>Version ${g.version} — ${Utils.escapeHtml(g.titulo || '')}</strong>
              <span class="text-muted" style="font-size:11px">${g.duracion_estimada_segundos ? g.duracion_estimada_segundos + 's' : ''}</span>
            </div>
            ${g.hook ? `<div style="margin-bottom:6px"><span class="badge badge-red" style="font-size:9px">HOOK</span><br>${Utils.escapeHtml(g.hook)}</div>` : ''}
            ${g.desarrollo ? `<div style="margin-bottom:6px;font-size:12px;color:var(--text-secondary);white-space:pre-wrap">${Utils.escapeHtml(g.desarrollo)}</div>` : ''}
            ${g.cta ? `<div><span class="badge badge-purple" style="font-size:9px">CTA</span><br>${Utils.escapeHtml(g.cta)}</div>` : ''}
            ${g.guion_completo ? `<details style="margin-top:8px"><summary class="text-muted" style="cursor:pointer;font-size:11px">Ver guion completo</summary><div style="white-space:pre-wrap;font-size:12px;margin-top:8px;padding:8px;background:var(--bg-void);border-radius:4px">${Utils.escapeHtml(g.guion_completo)}</div></details>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    window.PCS.openModal();
  }

  async function expandIdea(ideaId) {
    if (!AI.getKey()) { Utils.toast('Configura tu API key primero', 'error'); return; }
    const ideas = await DB.getIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    Utils.toast('Expandiendo idea con IA...', 'info');

    try {
      const response = await AI.chat(
        [{ role: 'user', content: `Expandí esta idea de reel:
Titulo: ${idea.titulo}
${idea.descripcion ? 'Descripcion: ' + idea.descripcion : ''}
Pilar: ${idea.pilar || 'sin pilar'}
Formato: ${idea.formato_narrativo || 'sin formato'}

Dame: 3 variantes de hook, desarrollo del concepto, CTA sugerido, y por que funcionaria con la audiencia de Pump Team.` }],
        AI.buildIdeasSystemPrompt()
      );

      // Save analysis
      await DB.saveAnalysis({
        idea_id: ideaId,
        tipo: 'idea_expansion',
        pregunta: 'Expandir idea: ' + idea.titulo,
        respuesta: response,
      });

      // Show in AI panel
      window.PCS.openAI();
      const messagesEl = document.getElementById('ai-messages');
      if (messagesEl) {
        messagesEl.innerHTML = `
          <div class="ai-msg assistant">${Utils.formatAIText(response)}</div>
        `;
      }
    } catch (e) {
      Utils.toast('Error: ' + e.message, 'error');
    }
  }

  async function writeGuion(ideaId) {
    if (!AI.getKey()) { Utils.toast('Configura tu API key primero', 'error'); return; }
    const ideas = await DB.getIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    Utils.toast('Generando guion con IA...', 'info');

    try {
      const existingGuiones = await DB.getGuiones(ideaId);
      const version = existingGuiones.length + 1;

      const response = await AI.chat(
        [{ role: 'user', content: `Escribi un guion completo para este reel:
Titulo: ${idea.titulo}
${idea.descripcion ? 'Descripcion: ' + idea.descripcion : ''}
Pilar: ${idea.pilar || 'sin pilar'}
Formato: ${idea.formato_narrativo || 'problema-solucion'}
Hook tipo: ${idea.hook_tipo || 'pregunta'}

Necesito: HOOK (3s), DESARROLLO con timestamps, CTA plataforma-safe, duracion estimada, y PPM estimadas.` }],
        AI.buildIdeasSystemPrompt()
      );

      // Parse and save guion
      const guion = {
        idea_id: ideaId,
        version: version,
        titulo: idea.titulo,
        guion_completo: response,
        ppm_objetivo: 130,
      };

      // Try to extract hook and CTA
      const hookMatch = response.match(/HOOK[:\s]*\n?(.+?)(?:\n|$)/i);
      const ctaMatch = response.match(/CTA[:\s]*\n?(.+?)(?:\n|$)/i);
      if (hookMatch) guion.hook = hookMatch[1].trim();
      if (ctaMatch) guion.cta = ctaMatch[1].trim();

      await DB.upsertGuion(guion);

      // Save analysis
      await DB.saveAnalysis({
        idea_id: ideaId,
        tipo: 'guion_completo',
        pregunta: 'Guion para: ' + idea.titulo,
        respuesta: response,
      });

      // Update idea estado
      if (idea.estado === 'idea') {
        await DB.updateIdeaEstado(ideaId, 'en_guion');
      }

      Utils.toast('Guion generado!', 'success');

      // Show in AI panel
      window.PCS.openAI();
      const messagesEl = document.getElementById('ai-messages');
      if (messagesEl) {
        messagesEl.innerHTML = `
          <div class="ai-msg assistant">${Utils.formatAIText(response)}</div>
        `;
      }

      render(document.getElementById('content'));
    } catch (e) {
      Utils.toast('Error: ' + e.message, 'error');
    }
  }

  async function generateIdeasAI() {
    if (!AI.getKey()) { Utils.toast('Configura tu API key primero', 'error'); return; }

    const modal = document.getElementById('modal-content');
    modal.innerHTML = `
      <div class="modal-header">
        <span class="modal-title">&#x1F916; Generar ideas con IA</span>
        <button class="modal-close" onclick="window.PCS.closeModal()">&times;</button>
      </div>
      <div class="form-group" style="margin-bottom:16px">
        <label class="form-label">Que tipo de ideas necesitas?</label>
        <textarea class="form-textarea" id="ai-ideas-prompt" rows="3" placeholder="Ej: Dame 10 ideas sobre recuperacion HPTA para el proximo mes"></textarea>
      </div>
      <button class="btn btn-fire" id="btn-gen-ideas" onclick="IdeasKanbanModule.doGenerateIdeas()">Generar</button>
      <div id="ai-ideas-result" style="margin-top:16px"></div>
    `;
    window.PCS.openModal();
  }

  async function doGenerateIdeas() {
    const prompt = document.getElementById('ai-ideas-prompt')?.value;
    if (!prompt) return;

    const resultEl = document.getElementById('ai-ideas-result');
    const btn = document.getElementById('btn-gen-ideas');
    if (btn) { btn.disabled = true; btn.textContent = 'Generando...'; }
    if (resultEl) resultEl.innerHTML = '<div class="loading-overlay"><div class="loader"></div></div>';

    try {
      const response = await AI.chat(
        [{ role: 'user', content: `${prompt}

Para cada idea, dame en formato estructurado:
- TITULO:
- PILAR: (farmacologia/nutricion/entrenamiento/mindset/negocio)
- FORMATO: (problema-solucion/lista/historia/polemica/tutorial/comparacion/antes-despues/dato-sorprendente)
- HOOK: (propuesta de hook plataforma-safe)
- CTA: (propuesta de CTA)` }],
        AI.buildIdeasSystemPrompt()
      );

      // Parse ideas from response
      const ideaBlocks = response.split(/(?=\d+[\.\)]\s|TITULO:)/i).filter(b => b.trim());
      const parsed = [];

      for (const block of ideaBlocks) {
        const titulo = block.match(/TITULO:\s*(.+?)(?:\n|$)/i)?.[1]?.trim();
        const pilar = block.match(/PILAR:\s*(.+?)(?:\n|$)/i)?.[1]?.trim()?.toLowerCase();
        const formato = block.match(/FORMATO:\s*(.+?)(?:\n|$)/i)?.[1]?.trim()?.toLowerCase()?.replace(/ /g, '-');
        const hook = block.match(/HOOK:\s*(.+?)(?:\n|$)/i)?.[1]?.trim();
        const cta = block.match(/CTA:\s*(.+?)(?:\n|$)/i)?.[1]?.trim();

        if (titulo) {
          parsed.push({ titulo, pilar, formato_narrativo: formato, hook_propuesto: hook, cta_propuesto: cta });
        }
      }

      if (resultEl) {
        resultEl.innerHTML = `
          <div style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">${parsed.length} ideas generadas:</div>
          ${parsed.map((idea, i) => `
            <div class="card" style="margin-bottom:8px;padding:12px;display:flex;align-items:start;gap:12px">
              <div style="flex:1">
                <div style="font-weight:600">${Utils.escapeHtml(idea.titulo)}</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">
                  ${idea.pilar ? Utils.pilarBadge(idea.pilar) : ''}
                  ${idea.formato_narrativo || ''}
                </div>
                ${idea.hook_propuesto ? `<div style="font-size:11px;margin-top:4px;font-style:italic">"${Utils.escapeHtml(idea.hook_propuesto)}"</div>` : ''}
              </div>
              <button class="btn btn-sm btn-fire" onclick="IdeasKanbanModule.addGeneratedIdea(${i})">&#x2795;</button>
            </div>
          `).join('')}
          <div style="margin-top:8px;font-size:12px;color:var(--text-muted)">
            ${Utils.formatAIText(response)}
          </div>
        `;
      }

      // Store for later adding
      window._generatedIdeas = parsed;
    } catch (e) {
      if (resultEl) resultEl.innerHTML = `<p style="color:var(--red)">Error: ${Utils.escapeHtml(e.message)}</p>`;
    }

    if (btn) { btn.disabled = false; btn.textContent = 'Generar'; }
  }

  async function addGeneratedIdea(index) {
    const idea = window._generatedIdeas?.[index];
    if (!idea) return;
    idea.estado = 'idea';
    try {
      await DB.upsertIdea(idea);
      Utils.toast(`"${idea.titulo}" agregada al Kanban`, 'success');
    } catch (e) {
      Utils.toast('Error: ' + e.message, 'error');
    }
  }

  async function deleteIdea(ideaId) {
    if (!confirm('Eliminar esta idea?')) return;
    await DB.deleteIdea(ideaId);
    Utils.toast('Idea eliminada', 'success');
    render(document.getElementById('content'));
  }

  return {
    render, handleDrop, showNewIdeaModal, saveIdea,
    showIdeaDetail, expandIdea, writeGuion,
    generateIdeasAI, doGenerateIdeas, addGeneratedIdea, deleteIdea,
  };
})();
