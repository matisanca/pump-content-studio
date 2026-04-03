/* ============================================
   PUMP CONTENT STUDIO — AI Chat Module
   ============================================ */

const AIChatModule = (() => {
  let messages = [];
  let currentReel = null;
  let benchmarks = null;
  let systemPrompt = '';
  let isLoading = false;

  const REEL_PILLS = [
    { label: 'Por que funciono?', prompt: 'Analiza por que este reel funciono (o no). Usa el framework de 3 ejes: Concepto, Estructura, Ejecucion.' },
    { label: 'Version para 100K', prompt: 'Como escalarias este reel a 100K views? Dame 3 variantes de hook, cambios en estructura, ajuste de CTA, y recomendacion sobre ads.' },
    { label: 'Mejorar el hook', prompt: 'Analiza el hook de este reel y dame 5 variantes mejoradas que generen mas retencion. Explica por que cada una funcionaria mejor.' },
    { label: 'Evaluar el CTA', prompt: 'Evalua el CTA de este reel. Es claro? Plataforma-safe? Alineado con el contenido? Dame 3 alternativas mejoradas.' },
    { label: 'Vale la pena con ads?', prompt: 'Basandote en las metricas organicas de este reel, vale la pena meterle presupuesto de ads? A que publico? Con que objetivo? Presupuesto sugerido?' },
    { label: '5 ideas para iterar', prompt: 'Dame 5 ideas para crear reels nuevos iterando sobre el concepto de este reel. Cada idea con hook y CTA sugerido.' },
    { label: 'Guion mejorado', prompt: 'Escribi una version mejorada del guion de este reel. Mantene el concepto core pero mejora hook, estructura y CTA. Incluye timestamps.' },
    { label: 'Que cambiaria?', prompt: 'Si pudieras cambiar UNA SOLA cosa de este reel para duplicar su rendimiento, que cambiarias y por que?' },
  ];

  const FREE_PILLS = [
    { label: 'Tendencias del nicho', prompt: 'Cuales son las tendencias actuales en contenido de fitness/farmacologia deportiva en Instagram? Que deberia estar haciendo Pump Team?' },
    { label: 'Calendario de contenido', prompt: 'Arma un calendario de contenido para la proxima semana con 5 reels. Variá pilares y formatos. Incluí hooks y CTAs.' },
    { label: 'Analisis de competencia', prompt: 'Que tipo de contenido deberia analizar de la competencia en el nicho fitness/farmacologia? Que metricas mirar?' },
  ];

  async function openForReel(reelId) {
    currentReel = await DB.getReel(reelId);
    const benchArr = await DB.getBenchmarks();
    benchmarks = benchArr?.[0] || {};
    systemPrompt = AI.buildReelSystemPrompt(currentReel, benchmarks);
    messages = [];
    renderPanel();
  }

  function openFree() {
    currentReel = null;
    systemPrompt = AI.buildFreeSystemPrompt();
    messages = [];
    renderPanel();
  }

  function renderPanel() {
    const panel = document.getElementById('ai-panel');
    const context = document.getElementById('ai-context');
    const pillsEl = document.getElementById('ai-pills');
    const messagesEl = document.getElementById('ai-messages');

    if (!panel) return;
    panel.classList.add('open');

    if (context) {
      if (currentReel) {
        context.innerHTML = `Analizando: "${Utils.escapeHtml(Utils.truncate(currentReel.titulo, 40))}"<br>
          <span class="mono" style="font-size:11px">×${currentReel.multiplicador || '?'} · ${Utils.formatPct(currentReel.save_rate)} save · ${Utils.formatNum(currentReel.views_totales)} views</span>`;
      } else {
        context.textContent = 'Estratega de Contenido — Chat libre';
      }
    }

    if (pillsEl) {
      const pills = currentReel ? REEL_PILLS : FREE_PILLS;
      pillsEl.innerHTML = pills.map((p, i) =>
        `<span class="pill" onclick="AIChatModule.sendPill(${i})">${p.label}</span>`
      ).join('');
    }

    if (messagesEl) {
      messagesEl.innerHTML = messages.map(renderMessage).join('');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function renderMessage(msg) {
    if (msg.role === 'user') {
      return `<div class="ai-msg user">${Utils.escapeHtml(msg.content)}</div>`;
    }
    return `<div class="ai-msg assistant">${Utils.formatAIText(msg.content)}</div>`;
  }

  async function sendPill(index) {
    const pills = currentReel ? REEL_PILLS : FREE_PILLS;
    const pill = pills[index];
    if (pill) await send(pill.prompt);
  }

  async function send(text) {
    if (!text && !document.getElementById('ai-input')) return;
    const msg = text || document.getElementById('ai-input')?.value?.trim();
    if (!msg || isLoading) return;

    if (!AI.getKey()) {
      Utils.toast('Configura tu API key de Anthropic en Configuracion', 'error');
      return;
    }

    // Clear input
    const inputEl = document.getElementById('ai-input');
    if (inputEl && !text) inputEl.value = '';

    // Add user message
    messages.push({ role: 'user', content: msg });
    renderMessages();

    // Show loading
    isLoading = true;
    const messagesEl = document.getElementById('ai-messages');
    if (messagesEl) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'ai-msg assistant';
      loadingDiv.id = 'ai-loading';
      loadingDiv.innerHTML = '<div class="loader" style="margin:0 auto"></div>';
      messagesEl.appendChild(loadingDiv);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    try {
      const response = await AI.chat(
        messages.map(m => ({ role: m.role, content: m.content })),
        systemPrompt
      );

      messages.push({ role: 'assistant', content: response });

      // Save to DB
      try {
        await DB.saveAnalysis({
          reel_id: currentReel?.id || null,
          tipo: currentReel ? 'chat_libre' : 'chat_libre',
          pregunta: msg,
          respuesta: response,
        });
      } catch (e) { /* ignore save errors */ }

    } catch (e) {
      messages.push({ role: 'assistant', content: `Error: ${e.message}` });
    }

    isLoading = false;
    renderMessages();
  }

  function renderMessages() {
    const messagesEl = document.getElementById('ai-messages');
    if (!messagesEl) return;
    messagesEl.innerHTML = messages.map(renderMessage).join('');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function close() {
    const panel = document.getElementById('ai-panel');
    if (panel) panel.classList.remove('open');
  }

  return { openForReel, openFree, sendPill, send, close, renderPanel };
})();
