/* ============================================
   PUMP CONTENT STUDIO — Main App Router
   ============================================ */

window.PCS = (() => {
  let currentPage = 'dashboard';

  async function init() {
    // Check Supabase connection
    if (!DB.init()) {
      navigate('config');
      return;
    }

    // Load header KPIs
    loadHeaderKPIs();

    // Navigate to default page
    const hash = window.location.hash.slice(1);
    if (hash) {
      const [page, param] = hash.split('/');
      navigate(page, param);
    } else {
      navigate('dashboard');
    }
  }

  async function navigate(page, param) {
    currentPage = page;
    const content = document.getElementById('content');
    if (!content) return;

    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page || (page === 'reel-detail' && el.dataset.page === 'reels') || (page === 'competitor-detail' && el.dataset.page === 'competitors'));
    });

    // Update breadcrumb
    const pageNames = {
      'dashboard': 'Dashboard',
      'reels': 'Reels',
      'reel-detail': 'Detalle de Reel',
      'ideas': 'Ideas & Guiones',
      'upload': 'Cargar / Importar',
      'competitors': 'Competencia',
      'config': 'Configuracion',
    };
    const breadcrumb = document.getElementById('header-page-name');
    if (breadcrumb) breadcrumb.textContent = pageNames[page] || page;

    // Update hash
    window.location.hash = param ? `${page}/${param}` : page;

    // Check DB connection for non-config pages
    if (page !== 'config' && !DB.isConnected()) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">\u26A0\uFE0F</div>
          <p>Necesitas configurar la conexion a Supabase primero.</p>
          <button class="btn btn-fire" onclick="window.PCS.navigate('config')">Ir a Configuracion</button>
        </div>
      `;
      return;
    }

    // Route
    try {
      switch (page) {
        case 'dashboard':
          await DashboardModule.render(content);
          break;
        case 'reels':
          await ReelsGridModule.render(content);
          break;
        case 'reel-detail':
          await ReelDetailModule.render(content, param);
          break;
        case 'ideas':
          await IdeasKanbanModule.render(content);
          break;
        case 'upload':
          UploadModule.render(content);
          break;
        case 'competitors':
          await CompetitorsModule.render(content);
          break;
        case 'config':
          renderConfig(content);
          break;
        default:
          content.innerHTML = '<div class="empty-state"><p>Pagina no encontrada</p></div>';
      }
    } catch (e) {
      content.innerHTML = `<div class="empty-state"><p style="color:var(--red)">Error: ${Utils.escapeHtml(e.message)}</p></div>`;
    }
  }

  async function loadHeaderKPIs() {
    const el = document.getElementById('header-kpis');
    if (!el || !DB.isConnected()) return;

    try {
      const stats = await DB.getReelStats();
      el.innerHTML = `
        <span class="header-kpi"><span class="value">${stats.total}</span> reels</span>
        <span class="header-kpi"><span class="value">${Utils.formatNum(stats.totalViews)}</span> views</span>
        <span class="header-kpi"><span class="value">${Utils.formatPct(stats.avgSaveRate)}</span> save rate</span>
        <span class="header-kpi"><span class="value">${Utils.formatMoney(stats.totalRevenue)}</span> revenue</span>
      `;
    } catch (e) {
      el.innerHTML = '';
    }
  }

  // ──── Config Page ────
  function renderConfig(container) {
    const sbKey = localStorage.getItem('pcs_supabase_key') || '';
    const aiKey = AI.getKey() || '';

    container.innerHTML = `
      <div style="max-width:600px">
        <h3 style="margin-bottom:20px">\u2699\uFE0F Configuracion</h3>

        <div class="card" style="margin-bottom:16px">
          <div class="card-title" style="margin-bottom:12px">SUPABASE</div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Supabase URL</label>
            <input class="form-input" value="https://pqozzhnnfstplqrrpqwi.supabase.co" disabled>
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Supabase Anon Key</label>
            <input class="form-input" id="config-sb-key" type="password" value="${sbKey}" placeholder="eyJhbG...">
          </div>
          <button class="btn btn-fire" onclick="window.PCS.saveConfig()">Guardar y conectar</button>
          <span id="config-sb-status" style="margin-left:12px;font-size:12px;color:var(--text-secondary)">
            ${DB.isConnected() ? '\u2705 Conectado' : '\u274C Sin conexion'}
          </span>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-title" style="margin-bottom:12px">ANTHROPIC API (PUMP AI)</div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">API Key</label>
            <input class="form-input" id="config-ai-key" type="password" value="${aiKey}" placeholder="sk-ant-...">
          </div>
          <button class="btn" onclick="window.PCS.saveAIKey()">Guardar API Key</button>
          <span id="config-ai-status" style="margin-left:12px;font-size:12px;color:var(--text-secondary)">
            ${aiKey ? '\u2705 Configurada' : '\u274C Sin configurar'}
          </span>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-title" style="margin-bottom:12px">SCRAPING</div>
          <div style="font-size:13px;color:var(--text-secondary)">
            <p>El scraping de @pump_team usa endpoints publicos de Instagram.</p>
            <p style="margin-top:8px">Si el scraping automatico no funciona (rate limiting), podes:</p>
            <ul style="margin:8px 0 0 20px">
              <li>Usar <strong>Instaloader</strong> para exportar un JSON</li>
              <li>Exportar el <strong>CSV de Meta Business Suite</strong></li>
              <li>Cargar manualmente cada reel</li>
            </ul>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-title" style="margin-bottom:12px">DATOS DE PRUEBA</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
            Genera datos ficticios para testear el dashboard completo.
          </div>
          <button class="btn" onclick="window.PCS.generateTestData()">Generar 20 reels de prueba</button>
          <button class="btn btn-ghost" style="color:var(--red);margin-left:8px" onclick="window.PCS.clearTestData()">Limpiar todo</button>
        </div>

        <div class="card">
          <div class="card-title" style="margin-bottom:12px">ACERCA DE</div>
          <div style="font-size:13px;color:var(--text-secondary)">
            <strong>Pump Content Studio</strong> v1.0<br>
            Sistema de inteligencia de contenido para @pump_team<br>
            Stack: HTML + CSS + JS vanilla + Supabase + Claude API
          </div>
        </div>
      </div>
    `;
  }

  function saveConfig() {
    const key = document.getElementById('config-sb-key')?.value;
    if (!key) { Utils.toast('Ingresa la Supabase Anon Key', 'error'); return; }
    DB.setKey(key);
    const status = document.getElementById('config-sb-status');
    if (status) status.innerHTML = '\u2705 Conectado';
    Utils.toast('Supabase configurado', 'success');
    loadHeaderKPIs();
  }

  function saveAIKey() {
    const key = document.getElementById('config-ai-key')?.value;
    if (!key) { Utils.toast('Ingresa la API Key', 'error'); return; }
    AI.setKey(key);
    const status = document.getElementById('config-ai-status');
    if (status) status.innerHTML = '\u2705 Configurada';
    Utils.toast('API key guardada', 'success');
  }

  // ──── Test Data Generator ────
  async function generateTestData() {
    if (!DB.isConnected()) { Utils.toast('Conecta Supabase primero', 'error'); return; }
    Utils.toast('Generando datos de prueba...', 'info');

    const pilares = Object.keys(Utils.PILARES);
    const formatos = Utils.FORMATOS;
    const hooks = Utils.HOOK_TIPOS;
    const productos = Utils.PRODUCTOS;

    const titles = [
      'El error #1 que cometen en el primer ciclo',
      'Por que no creces aunque entrenes 6 dias',
      'Esto pasa cuando no haces PCT',
      'La dieta que todo asesorado deberia conocer',
      '3 senales de que tu eje esta destruido',
      'Por que el volumen alto no funciona para todos',
      'La verdad sobre los peptidos',
      'Deficit calorico: cuanto es demasiado?',
      'Recuperacion hormonal: el protocolo completo',
      'Si no medis esto, estas perdiendo plata',
      'El error mas comun en el press banca',
      'Macros: cuanto necesitas realmente',
      'Por que tus abdominales no se ven',
      'La suplementacion que SI funciona',
      'Como saber si tu coach sabe lo que hace',
      'Cardio en volumen: si o no?',
      'La clave de la hipertrofia que nadie te dice',
      'Deload: cuando y como hacerlo',
      'Ganancia muscular real vs retencion de liquido',
      'Tu dieta esta matando tus ganancias',
    ];

    const reels = [];
    for (let i = 0; i < 20; i++) {
      const fecha = new Date(Date.now() - Math.random() * 120 * 86400000);
      const views = Math.round(5000 + Math.random() * 80000);
      const reach = Math.round(views * (0.7 + Math.random() * 0.5));
      const likes = Math.round(views * (0.01 + Math.random() * 0.03));
      const saves = Math.round(reach * (0.005 + Math.random() * 0.04));
      const comments = Math.round(views * (0.001 + Math.random() * 0.005));
      const shares = Math.round(views * (0.0005 + Math.random() * 0.002));
      const duracion = Math.round(30 + Math.random() * 50);
      const watchTime = duracion * views * (0.3 + Math.random() * 0.3) / 60;
      const retencion = 20 + Math.random() * 40;
      const abandono = duracion * (retencion / 100);
      const tieneAds = Math.random() > 0.7;
      const vendio = Math.random() > 0.6;

      reels.push({
        ig_url: `https://www.instagram.com/reel/test${i + 1}/`,
        ig_media_id: `test_${i + 1}_${Date.now()}`,
        titulo: titles[i],
        caption: titles[i] + '\n\nSeguime para mas contenido.\n\nComenta "INFO" y te mando el protocolo completo.',
        cta_text: ['Comenta "INFO"', 'Comenta "PHARMA"', 'Comenta "DIETA"', 'Link en bio'][Math.floor(Math.random() * 4)],
        fecha_publicacion: fecha.toISOString().split('T')[0],
        duracion_segundos: duracion,
        tipo: 'reel',
        pilares: [pilares[Math.floor(Math.random() * pilares.length)]],
        subtema: ['PCT', 'Hipertrofia', 'Deficit', 'Suplementos', 'Tecnica'][Math.floor(Math.random() * 5)],
        formato_narrativo: formatos[Math.floor(Math.random() * formatos.length)],
        hook_tipo: hooks[Math.floor(Math.random() * hooks.length)],
        views_totales: views,
        views_organicas: Math.round(views * 0.85),
        reach_organico: Math.round(reach * 0.8),
        reach_total: reach,
        likes,
        saves,
        comments,
        shares,
        watch_time_total_minutos: Math.round(watchTime),
        retencion_estimada: Math.round(retencion * 100) / 100,
        abandono_promedio_segundos: Math.round(abandono * 10) / 10,
        tiene_ads: tieneAds,
        genero_ventas: vendio,
        producto_vendido: vendio ? productos[Math.floor(Math.random() * 3)] : null,
        ventas_atribuidas: vendio ? Math.round(1 + Math.random() * 15) : 0,
        revenue_atribuido: vendio ? Math.round(5000 + Math.random() * 50000) : 0,
        hook_text: titles[i].split(':')[0] || titles[i],
        transcripcion: `${titles[i]}.\n\nBueno, hoy te voy a explicar algo que la mayoria no entiende...\n\nLo primero que tenes que saber es que esto afecta directamente a tu recuperacion.\n\nSi no lo tomas en cuenta, todo el esfuerzo que estas haciendo en el gimnasio se puede perder.\n\nComenta "${['INFO','PHARMA','DIETA'][Math.floor(Math.random()*3)]}" y te mando el protocolo completo.`,
        ...(tieneAds ? {
          views_paid: Math.round(views * 0.15),
          reach_paid: Math.round(reach * 0.2),
          impr_paid: Math.round(reach * 0.25),
          spend: Math.round(500 + Math.random() * 5000),
          ctr_pago: Math.round((1 + Math.random() * 3) * 100) / 100,
          cpv: Math.round((0.5 + Math.random() * 2) * 100) / 100,
          cpm: Math.round((30 + Math.random() * 70) * 100) / 100,
          clicks: Math.round(10 + Math.random() * 200),
        } : {}),
      });
    }

    try {
      const result = await DB.bulkUpsertReels(reels);
      Utils.toast(`Datos de prueba generados: ${result.inserted} insertados`, 'success');

      // Generate some snapshots
      for (let w = 0; w < 8; w++) {
        const fecha = new Date(Date.now() - w * 7 * 86400000);
        await DB.upsertSnapshot({
          fecha: fecha.toISOString().split('T')[0],
          followers: 15000 + w * -200 + Math.round(Math.random() * 300),
          following: 800,
          alcance_semanal: 30000 + Math.round(Math.random() * 20000),
          impresiones_semanales: 50000 + Math.round(Math.random() * 30000),
          visitas_perfil: 500 + Math.round(Math.random() * 300),
          clicks_link: 50 + Math.round(Math.random() * 50),
          nuevos_seguidores: 100 + Math.round(Math.random() * 200),
          seguidores_perdidos: 30 + Math.round(Math.random() * 50),
        });
      }

      // Generate some ideas
      const ideaTitles = [
        'Serie sobre los 5 errores en PCT',
        'Comparacion: deficit moderado vs agresivo',
        'Tutorial: como leer un analisis de sangre',
        'La verdad sobre el cardarine',
        'Antes y despues de un protocolo bien hecho',
      ];
      for (let i = 0; i < 5; i++) {
        await DB.upsertIdea({
          titulo: ideaTitles[i],
          pilar: pilares[Math.floor(Math.random() * pilares.length)],
          formato_narrativo: formatos[Math.floor(Math.random() * formatos.length)],
          hook_tipo: hooks[Math.floor(Math.random() * hooks.length)],
          estado: Utils.ESTADOS_IDEA[Math.floor(Math.random() * 3)],
          hook_propuesto: 'Sabias que...',
          cta_propuesto: 'Comenta "PHARMA"',
        });
      }

      loadHeaderKPIs();
      navigate('dashboard');
    } catch (e) {
      Utils.toast('Error generando datos: ' + e.message, 'error');
    }
  }

  async function clearTestData() {
    if (!confirm('Esto va a eliminar TODOS los datos de la base. Seguro?')) return;
    Utils.toast('Esta accion requiere ejecutar DELETE manualmente desde Supabase', 'info');
  }

  // ──── UI Helpers ────

  function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('expanded');
  }

  function openAI() {
    AIChatModule.openFree();
  }

  function closeAI() {
    AIChatModule.close();
  }

  async function openAIForReel(reelId) {
    await AIChatModule.openForReel(reelId);
  }

  async function sendAI() {
    await AIChatModule.send();
  }

  function openModal() {
    document.getElementById('modal-overlay')?.classList.add('visible');
  }

  function closeModal() {
    document.getElementById('modal-overlay')?.classList.remove('visible');
  }

  async function syncReels() {
    navigate('upload');
    setTimeout(() => UploadModule.startScrape(), 500);
  }

  // ──── Init ────
  window.addEventListener('DOMContentLoaded', init);
  window.addEventListener('hashchange', () => {
    const [page, param] = window.location.hash.slice(1).split('/');
    if (page) navigate(page, param);
  });

  return {
    navigate, toggleSidebar,
    openAI, closeAI, openAIForReel, sendAI,
    openModal, closeModal,
    syncReels,
    saveConfig, saveAIKey,
    generateTestData, clearTestData,
    loadHeaderKPIs,
  };
})();
