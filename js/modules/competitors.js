/* ============================================
   PUMP CONTENT STUDIO — Competencia Module
   ============================================ */

const CompetitorsModule = (() => {

  // ──── LISTA PREDEFINIDA ────────────────────────────────────────────────
  const PRESET_COMPETITORS = [
    // Hispanos — Farmacología/AAS
    { username: 'tonilloret.tollo',         nombre: 'Toni Lloret Tollo',           nicho: 'farmacologia', idioma: 'es', followers_aprox: 244000, notas: 'Hipertrofia y química, club educativo, podcast' },
    { username: 'thekaizentrainer',          nombre: 'Eduardo Aguila (Kaizen)',     nicho: 'farmacologia', idioma: 'es', followers_aprox: 68000,  notas: 'Preparador físico, coaching fitness + péptidos' },
    { username: 'musclespain1',              nombre: 'Carlos Mejías (Muscle Spain)',nicho: 'farmacologia', idioma: 'es', followers_aprox: 68000,  notas: 'Preparador en química y transformación física, Patreon, podcast' },
    { username: 'academia.tren',             nombre: 'Academia Tren (Training Enhanced)', nicho: 'farmacologia', idioma: 'es', followers_aprox: 42300, notas: 'Educación AAS/SARMs, creada por @musclespain1' },
    { username: 'manulopez.lifestyle',       nombre: 'Manu Lopez',                 nicho: 'farmacologia', idioma: 'es', followers_aprox: 23400,  notas: 'Fundador @academiahormonal, química deportiva' },
    { username: 'farmacologia_deportiva_',   nombre: 'Dr Marcelo Gómez',           nicho: 'farmacologia', idioma: 'es', followers_aprox: 3000,   notas: '⚠️ Médico deporte/endocrino, credencial médica real' },
    { username: '_nutribuilder_',            nombre: 'Nutribuilder (Julio Vizuete)',nicho: 'farmacologia', idioma: 'es', followers_aprox: 55100,  notas: 'Preparador físico, nutrición, farmacología, salud' },
    { username: 'culturismototaloficial',    nombre: 'Culturismo Total',           nicho: 'farmacologia', idioma: 'es', followers_aprox: 43800,  notas: 'Culturismo avanzado, optimización, farmacología' },
    { username: 'heroe.fitness',             nombre: 'Héroe Fitness (Alfredo Martín)',nicho: 'farmacologia', idioma: 'es', followers_aprox: 120000, notas: 'Referente farma hispano (fallecido 2023)' },
    { username: 'roberto_castellano_ifbb',   nombre: 'Roberto Castellano',           nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'IFBB Pro, abierto sobre AAS, denunciado por FACUA' },
    { username: 'danidegea_ifbb',            nombre: 'Dani de Gea',                  nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'IFBB Pro, contenido farma, denunciado por FACUA' },
    { username: 'rubenlopez_ifbb',           nombre: 'Rubén López',                  nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'IFBB Pro, contenido AAS, denunciado por FACUA' },
    { username: 'palomaparra_ifbb',          nombre: 'Paloma Parra',                 nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'IFBB Pro, única mujer denunciada por FACUA por promo AAS' },
    { username: 'escuelaculturismopro',      nombre: 'Escuela Culturismo Profesional',nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,   notas: 'Cursos certificados de farma deportiva, Minxto Lasaosa' },
    { username: 'culturismoalaespanola',     nombre: 'Culturismo a la Española',   nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'Podcast referente, entrevistas figuras del culturismo + farma ESP' },
    { username: 'faborsky',                  nombre: 'FH Institute',               nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'Certificación farmacología deportiva' },
    { username: 'drdiegomuscle',             nombre: 'Dr De Diego Muscle',         nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'Médico culturista, farma deportiva, España' },
    { username: 'danielpinedafit',           nombre: 'Daniel Pineda',              nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'Autor libro Farmacología Deportiva en Culturismo' },
    { username: 'suplementosyculturismo',    nombre: 'Suplementos y Culturismo',   nicho: 'farmacologia', idioma: 'es', followers_aprox: 0,      notas: 'Blog científico suplementación, farmacología y culturismo' },
    // English — PEDs Education
    { username: 'moreplatesmoredates',       nombre: 'Derek (MPMD)',               nicho: 'PEDs', idioma: 'en', followers_aprox: 907000, notas: 'Gorilla Mind, Marek Health, referente #1 PEDs education' },
    { username: 'gregdoucetteifbbpro',       nombre: 'Greg Doucette',              nicho: 'PEDs', idioma: 'en', followers_aprox: 959000, notas: 'IFBB Pro, powerlifter, HTLT supps, abierto sobre AAS' },
    { username: 'noeldeyzel_bodybuilder',    nombre: 'Noel Deyzel',                nicho: 'PEDs', idioma: 'en', followers_aprox: 6500000,notas: 'Abierto sobre esteroides, mental health, comunidad wholesome' },
    { username: 'vigoroussteve',             nombre: 'Vigorous Steve',             nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: '⚠️ Cuenta posiblemente renombrada. Harm reduction, bloodwork, activo en YT/TikTok' },
    { username: 'sethferoce',                nombre: 'Seth Feroce',                nicho: 'PEDs', idioma: 'en', followers_aprox: 732000, notas: 'IFBB Pro, Axe & Sledge, warns about dangers' },
    { username: 'realnicktrigili',           nombre: 'Nick Trigili',               nicho: 'PEDs', idioma: 'en', followers_aprox: 479000, notas: 'IFBB Pro, biohacking, TRT coaching' },
    { username: 'drthomasoconnor',           nombre: 'Dr Thomas O\'Connor',         nicho: 'PEDs', idioma: 'en', followers_aprox: 34800,  notas: 'Anabolic Doc, Board Certified MD, TRT, heart health' },
    { username: 'toddleemd',                 nombre: 'Todd Lee MD',                nicho: 'PEDs', idioma: 'en', followers_aprox: 85900,  notas: 'IFBB Pro, MD, biochemist, bloodwork analysis' },
    { username: 'dynamite_d',               nombre: 'David DeMesquita',           nicho: 'PEDs', idioma: 'en', followers_aprox: 104000, notas: 'Olympian coach, R&D Morphogen Nutrition' },
    { username: 'coach.agz',                 nombre: 'Coach Angelo AGZ',           nicho: 'PEDs', idioma: 'en', followers_aprox: 4200,   notas: 'TRT, peptides, cycle coaching' },
    { username: 'tonyhuge_',                 nombre: 'Tony Huge',                  nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Enhanced Athlete, controversial, SARMs + AAS content' },
    { username: 'huge285',                   nombre: 'Dave Palumbo',               nicho: 'PEDs', idioma: 'en', followers_aprox: 114000, notas: 'RX Muscle, AskDave, autor Anabolics 11th Edition' },
    { username: 'evilgeniusdownunder',       nombre: 'Broderick Chavez',           nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Evil Genius, AAS Family Tree, guru de protocolos, 30 años de experiencia' },
    { username: 'jaycampbell333',            nombre: 'Jay Campbell',               nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: '5x bestselling author, TOT Bible, TRT expert, 60K+ newsletter' },
    { username: 'dannybossa',                nombre: 'Danny Bossa',                nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'TRT optimization, harm reduction, comunidad activa' },
    { username: 'leoandlongevity',           nombre: 'Leo & Longevity',            nicho: 'PEDs', idioma: 'en', followers_aprox: 20000,  notas: 'Educación profunda PEDs + longevidad (fallecido)' },
    { username: 'ankrom_official',           nombre: 'Ryan Ankrom',                nicho: 'PEDs', idioma: 'en', followers_aprox: 25000,  notas: 'Steroid cycle education, personal training' },
    { username: 'kennykoooo',                nombre: 'Kenny KO',                   nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Natty police, exposing fake natties, contenido viral sobre AAS' },
    { username: 'basementbodybuilding',      nombre: 'Basement Bodybuilding',      nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Memes + educación AAS, comunidad activa' },
    { username: 'steroidsourcetalk',         nombre: 'Steroid Source Talk',        nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Dave Moffat, certified trainer, harm reduction content' },
    { username: 'musclemedicine_m.d',        nombre: 'Muscle Medicine MD',         nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Bodybuilding coach, TRT+, medical approach' },
    { username: 'garybrecka',               nombre: 'Gary Brecka',                nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Biohacker, péptidos, controversial pero massive reach' },
    { username: 'marksmellybell',            nombre: 'Mark Bell',                  nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Sling Shot inventor, abierto sobre TRT, Power Magazine' },
    { username: 'derrek_bb',                 nombre: 'Derrek (IFBB)',              nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Contenido educativo PEDs, ciclos, harm reduction' },
    { username: 'official_rxmuscle',         nombre: 'RX Muscle',                  nicho: 'PEDs', idioma: 'en', followers_aprox: 0,      notas: 'Dave Palumbo\'s media, cubre PEDs + bodybuilding' },
    // Brasil — Farmacología/AAS
    { username: 'duduhaluch',               nombre: 'Dudu Haluch',                nicho: 'farmacologia', idioma: 'pt', followers_aprox: 411000,  notas: 'Autor "Hormônios no Fisiculturismo", nutricionista, referente #1 en farma BR' },
    { username: 'renato_cariani',           nombre: 'Renato Cariani',             nicho: 'farmacologia', idioma: 'pt', followers_aprox: 11000000, notas: 'Prof de educação física e QUÍMICA, coach, empresário, habla de farma abiertamente' },
    { username: 'leandrotwin',              nombre: 'Leandro Twin',               nicho: 'farmacologia', idioma: 'pt', followers_aprox: 3000000,  notas: 'Videos sobre ciclos, anabolizantes, suplementação, mega popular' },
    { username: 'paulomuzy',                nombre: 'Paulo Muzy',                 nicho: 'farmacologia', idioma: 'pt', followers_aprox: 8000000,  notas: 'Médico CRM, ortopedista, habla de TRT, hormônios, lesiones' },
    { username: 'juliobalestrinoficial',    nombre: 'Julio Balestrin',            nicho: 'coach',        idioma: 'pt', followers_aprox: 6000000,  notas: 'Uno de los mejores prep coaches de Brasil, protocolos farma' },
    { username: 'ramondinopro',             nombre: 'Ramon Dino',                 nicho: 'farmacologia', idioma: 'pt', followers_aprox: 7000000,  notas: 'Mr Olympia Classic 2025, Arnold Classic 2023, ícono BR' },
    { username: 'fernandosardinha',         nombre: 'Fernando Sardinha',          nicho: 'farmacologia', idioma: 'pt', followers_aprox: 1000000,  notas: 'Bodybuilder BR veterano, contenido sobre treino y farma' },
    { username: 'leostrondaoficial',        nombre: 'Leo Stronda',                nicho: 'farmacologia', idioma: 'pt', followers_aprox: 0,        notas: 'Mega influencer BR, abierto sobre transformación, suplementos, PEDs' },
    { username: 'pobreloco',                nombre: 'Pobre Loco',                 nicho: 'farmacologia', idioma: 'pt', followers_aprox: 1700000,  notas: 'Investigado por promo de anabolizantes en redes' },
    { username: 'togabornintheusa',         nombre: 'Toguro',                     nicho: 'farmacologia', idioma: 'pt', followers_aprox: 0,        notas: 'Mega popular BR, contenido BB, discute uso abiertamente' },
    { username: 'laerciorefundini',         nombre: 'Laercio Refundini',          nicho: 'farmacologia', idioma: 'pt', followers_aprox: 0,        notas: 'PhD, ciencia del entrenamiento y farmacología, contenido educativo' },
    { username: 'brasilbodybuildingnews',   nombre: 'Brasil Bodybuilding News',   nicho: 'farmacologia', idioma: 'pt', followers_aprox: 0,        notas: 'Media de fisiculturismo brasileño, noticias + farma' },
    // IFBB Coaches
    { username: 'hanyrambod',               nombre: 'Hany Rambod',                nicho: 'coach', idioma: 'en', followers_aprox: 3100000,notas: '25x Olympia winning coach, retirado 2024' },
    { username: 'mattjansen8',               nombre: 'Matt Jansen',                nicho: 'coach', idioma: 'en', followers_aprox: 0,      notas: 'Top prep coach, retirado coaching 2024' },
    { username: 'patricktuor',               nombre: 'Patrick Tuor',               nicho: 'coach', idioma: 'en', followers_aprox: 0,      notas: '83 Pro Cards, SST Training, coach de Urs Kalecinski' },
    { username: 'chadnichollsofficial',      nombre: 'Chad Nicholls',              nicho: 'coach', idioma: 'en', followers_aprox: 0,      notas: 'Coach de Ronnie Coleman, leyenda del prep' },
    { username: 'georgefarah',               nombre: 'George Farah',               nicho: 'coach', idioma: 'en', followers_aprox: 0,      notas: 'Guru de nutrición BB, múltiples Mr Olympia competitors' },
    { username: 'chrisaceto',                nombre: 'Chris Aceto',                nicho: 'coach', idioma: 'en', followers_aprox: 0,      notas: 'Autor Championship Bodybuilding, coach de pros' },
    { username: 'milossarcev',               nombre: 'Milos Sarcev',               nicho: 'coach', idioma: 'en', followers_aprox: 0,      notas: 'IFBB Pro retirado, guru de Giant Sets' },
    { username: 'drmikeisraetel',            nombre: 'Mike Israetel',              nicho: 'PEDs',   idioma: 'en', followers_aprox: 1200000,notas: 'PhD, admitió uso AAS en competición, RP Strength' },
    { username: 'liftrunbang',               nombre: 'Paul Carter',                nicho: 'PEDs',   idioma: 'en', followers_aprox: 0,      notas: 'Autor, coach, habla abierto de PEDs y entrenamiento' },
  ];

  const NICHO_COLORS = {
    farmacologia: 'var(--danger, #ff4757)',
    PEDs:         'var(--accent, #ff6b35)',
    coach:        'var(--green, #2ed573)',
    atleta:       'var(--purple, #a78bfa)',
  };

  const BACKEND_URL = 'http://localhost:5001';

  // ──── RENDER PRINCIPAL ────────────────────────────────────────────────
  async function render(container) {
    container.innerHTML = `
      <div class="tabs" id="comp-tabs">
        <div class="tab active" onclick="CompetitorsModule.switchTab('overview')">&#x1F4CA; Overview</div>
        <div class="tab" onclick="CompetitorsModule.switchTab('reels')">&#x1F3AC; Reels</div>
        <div class="tab" onclick="CompetitorsModule.switchTab('scraping')">&#x1F504; Scraping</div>
        <div class="tab" onclick="CompetitorsModule.switchTab('analisis')">&#x1F52C; Análisis cruzado</div>
      </div>
      <div id="comp-content"></div>
    `;
    await renderTab('overview', container);
  }

  function switchTab(tab) {
    document.querySelectorAll('#comp-tabs .tab').forEach((t, i) => {
      t.classList.toggle('active', ['overview','reels','scraping','analisis'][i] === tab);
    });
    const container = document.getElementById('content');
    renderTab(tab, container);
  }

  async function renderTab(tab, container) {
    const el = document.getElementById('comp-content') || container;
    switch(tab) {
      case 'overview':  await renderOverview(el); break;
      case 'reels':     await renderReelsTab(el); break;
      case 'scraping':  await renderScraping(el); break;
      case 'analisis':  await renderAnalisis(el); break;
    }
  }

  // ──── REELS TAB ────────────────────────────────────────────────────────
  let _reelsState = { competitorId: null, sort: 'likes' };

  async function renderReelsTab(el) {
    let scraped = [];
    try {
      const all = await DB.getCompetitors();
      scraped = all.filter(c => c.ultimo_scraping);
    } catch(e) {}

    if (scraped.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">🎬</div><p>Todavía no scrapeaste ningún competidor.</p><button class="btn btn-fire" onclick="CompetitorsModule.switchTab('scraping')">Ir a Scraping</button></div>`;
      return;
    }

    if (!_reelsState.competitorId) _reelsState.competitorId = scraped[0].id;

    const options = scraped.map(c =>
      `<option value="${c.id}" ${c.id === _reelsState.competitorId ? 'selected' : ''}>@${c.username} (${c.total_reels_scrapeados || 0} reels)</option>`
    ).join('');

    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <select id="comp-reels-select" class="form-input" style="max-width:280px"
          onchange="CompetitorsModule.onReelsCompChange(this.value)">
          ${options}
        </select>
        <div style="display:flex;gap:6px">
          <button class="btn ${_reelsState.sort==='likes'?'btn-fire':''}" onclick="CompetitorsModule.setReelsSort('likes')">❤️ Más likes</button>
          <button class="btn ${_reelsState.sort==='comments'?'btn-fire':''}" onclick="CompetitorsModule.setReelsSort('comments')">💬 Más comentarios</button>
          <button class="btn ${_reelsState.sort==='views'?'btn-fire':''}" onclick="CompetitorsModule.setReelsSort('views')">👁 Más views</button>
        </div>
      </div>
      <div id="comp-reels-list"><div style="display:flex;justify-content:center;padding:40px"><div class="loader"></div></div></div>
    `;

    await loadReelsList();
  }

  async function loadReelsList() {
    const listEl = document.getElementById('comp-reels-list');
    if (!listEl) return;

    let reels = [];
    try { reels = await DB.getCompetitorReels(_reelsState.competitorId); } catch(e) {
      listEl.innerHTML = `<div class="empty-state"><p style="color:var(--red)">${e.message}</p></div>`; return;
    }

    if (!reels.length) {
      listEl.innerHTML = `<div class="empty-state"><p>Sin reels. Scrapeá este competidor primero.</p></div>`; return;
    }

    const sorted = [...reels].sort((a, b) => {
      if (_reelsState.sort === 'comments') return (b.comments||0) - (a.comments||0);
      if (_reelsState.sort === 'views')    return (b.views_totales||0) - (a.views_totales||0);
      return (b.likes||0) - (a.likes||0);
    });

    listEl.innerHTML = sorted.map((r, i) => `
      <div class="card" id="creel-${r.id}" style="margin-bottom:10px;padding:12px">
        <div style="display:flex;gap:12px;align-items:flex-start">
          ${r.thumbnail_url
            ? `<img src="${r.thumbnail_url}" style="width:56px;height:100px;object-fit:cover;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">`
            : `<div style="width:56px;height:100px;background:var(--bg-elevated);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🎬</div>`}
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;margin-bottom:4px;line-height:1.3">${Utils.escapeHtml(r.titulo || 'Sin título')}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;line-height:1.4;max-height:36px;overflow:hidden">${Utils.escapeHtml((r.caption||'').slice(0,120))}${(r.caption||'').length>120?'…':''}</div>
            <div style="display:flex;gap:14px;font-size:12px;color:var(--text-secondary)">
              <span>👁 ${Utils.formatNum(r.views_totales||0)}</span>
              <span>❤️ ${Utils.formatNum(r.likes||0)}</span>
              <span>💬 ${Utils.formatNum(r.comments||0)}</span>
              ${r.fecha_publicacion ? `<span>📅 ${r.fecha_publicacion}</span>` : ''}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            ${r.ig_url ? `<a href="${r.ig_url}" target="_blank" class="btn" style="font-size:10px;padding:3px 8px;text-decoration:none">🔗 Ver</a>` : ''}
            <button class="btn" style="font-size:11px;padding:4px 10px;white-space:nowrap"
              onclick="CompetitorsModule.genGuion('${r.id}')">🎬 Guion</button>
            <button class="btn" style="font-size:11px;padding:4px 10px;white-space:nowrap"
              onclick="CompetitorsModule.translateGuion('${r.id}')">🇦🇷 Traducir</button>
          </div>
        </div>
        <div id="creel-output-${r.id}" style="display:none;margin-top:10px;border-top:1px solid var(--border);padding-top:10px"></div>
      </div>
    `).join('');

    // Store reels data for AI access
    window._compReelsData = Object.fromEntries(sorted.map(r => [r.id, r]));
  }

  function onReelsCompChange(id) {
    _reelsState.competitorId = id;
    loadReelsList();
  }

  function setReelsSort(sort) {
    _reelsState.sort = sort;
    const el = document.getElementById('comp-content');
    renderReelsTab(el);
  }

  async function genGuion(reelId) {
    const r = (window._compReelsData || {})[reelId];
    if (!r) return;
    const outEl = document.getElementById(`creel-output-${reelId}`);
    if (!outEl) return;

    outEl.style.display = 'block';
    outEl.innerHTML = `<div style="font-size:12px;color:var(--text-secondary)">⏳ Generando guion con IA...</div>`;

    const prompt = `Analizá este reel de la competencia y generá un guion adaptado para @pump_team:

REEL ORIGINAL:
Título: ${r.titulo || '—'}
Caption: ${(r.caption || '').slice(0, 500)}
Views: ${Utils.formatNum(r.views_totales||0)} | Likes: ${Utils.formatNum(r.likes||0)} | Comentarios: ${Utils.formatNum(r.comments||0)}
Idioma original: ${r.caption && /[áéíóúñ¿¡]/i.test(r.caption) ? 'español' : 'otro idioma (inglés/portugués)'}

Generá un guion completo para Mati (@pump_team) INSPIRADO en este reel pero adaptado a su voz, nicho y restricciones de plataforma:

**HOOK** (primeros 3 segundos):
[texto del hook]

**DESARROLLO** (estructura con timestamps estimados):
[0:03] ...
[0:15] ...
[0:30] ...

**CTA**:
[texto del CTA con keyword]

**Duración estimada**: X segundos
**Notas de adaptación**: [qué tomaste del original y qué cambiaste]`;

    try {
      const text = await AI.chat(
        [{ role: 'user', content: prompt }],
        AI.buildIdeasSystemPrompt()
      );
      outEl.innerHTML = `
        <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:8px;letter-spacing:.05em">🎬 GUION GENERADO</div>
        <div id="creel-guion-text-${reelId}" style="font-size:12px;line-height:1.7;white-space:pre-wrap;color:var(--text)">${Utils.escapeHtml(text)}</div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn" style="font-size:11px;padding:4px 10px" onclick="CompetitorsModule.translateGuion('${reelId}')">🇦🇷 Traducir al rioplatense</button>
          <button class="btn" style="font-size:11px;padding:4px 10px" onclick="navigator.clipboard.writeText(document.getElementById('creel-guion-text-${reelId}').textContent);Utils.toast('Copiado','success')">📋 Copiar</button>
        </div>
      `;
    } catch(e) {
      outEl.innerHTML = `<div style="font-size:12px;color:var(--red)">Error: ${Utils.escapeHtml(e.message)}</div>`;
    }
  }

  async function translateGuion(reelId) {
    const r = (window._compReelsData || {})[reelId];
    const outEl = document.getElementById(`creel-output-${reelId}`);
    if (!outEl) return;

    // Si hay un guion ya generado, tomamos ese texto; si no, usamos el caption original
    const existingGuion = document.getElementById(`creel-guion-text-${reelId}`)?.textContent;
    const sourceText = existingGuion || r?.caption || '';
    if (!sourceText) { Utils.toast('No hay texto para traducir', 'error'); return; }

    outEl.style.display = 'block';
    // Si no había output previo, mostrar el original también
    if (!existingGuion) {
      outEl.innerHTML = `<div style="font-size:12px;color:var(--text-secondary)">⏳ Traduciendo y adaptando al rioplatense...</div>`;
    } else {
      outEl.insertAdjacentHTML('beforeend', `<div id="creel-translate-${reelId}" style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;color:var(--text-secondary)">⏳ Adaptando al rioplatense...</div></div>`);
    }

    const prompt = `Traducí y adaptá este texto al español rioplatense argentino natural (voseo, vocabulario argentino, tono directo como hablaría Mati de @pump_team):

${sourceText}

Reglas:
- Usá "vos" en vez de "tú"
- Vocabulario argentino natural (no forzado)
- Mantené las restricciones de plataforma (no nombrar compuestos farmacológicos directamente)
- Si el texto ya es un guion estructurado (HOOK/DESARROLLO/CTA), respetá la estructura
- Solo devolvé el texto traducido, sin explicaciones`;

    try {
      const translated = await AI.chat(
        [{ role: 'user', content: prompt }],
        AI.buildFreeSystemPrompt()
      );

      const targetEl = document.getElementById(`creel-translate-${reelId}`) || outEl;
      targetEl.innerHTML = `
        <div style="font-size:11px;font-weight:700;color:var(--green);margin-bottom:8px;letter-spacing:.05em">🇦🇷 VERSIÓN RIOPLATENSE</div>
        <div id="creel-translated-text-${reelId}" style="font-size:12px;line-height:1.7;white-space:pre-wrap;color:var(--text)">${Utils.escapeHtml(translated)}</div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn" style="font-size:11px;padding:4px 10px" onclick="navigator.clipboard.writeText(document.getElementById('creel-translated-text-${reelId}').textContent);Utils.toast('Copiado','success')">📋 Copiar</button>
        </div>
      `;
    } catch(e) {
      Utils.toast('Error al traducir: ' + e.message, 'error');
    }
  }

  // ──── OVERVIEW ─────────────────────────────────────────────────────────
  async function renderOverview(el) {
    el.innerHTML = `<div style="display:flex;justify-content:center;padding:40px"><div class="loader"></div></div>`;

    let competitors = [], myStats = null;
    try {
      [competitors, myStats] = await Promise.all([
        DB.getCompetitors(),
        DB.getReelStats(),
      ]);
    } catch(e) {
      el.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">Error: ${Utils.escapeHtml(e.message)}</p></div>`;
      return;
    }

    if (competitors.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🕵️</div>
          <p>No hay competidores cargados todavía.</p>
          <button class="btn btn-fire" onclick="CompetitorsModule.switchTab('scraping')">Importar competidores</button>
        </div>
      `;
      return;
    }

    // Build comparison rows
    const rows = competitors.map(c => {
      const avgViews = c.avg_views_reels || 0;
      const avgLikeRate = c.avg_like_rate_reels || 0;
      const reelCount = c.total_reels_scrapeados || 0;
      const color = NICHO_COLORS[c.nicho] || 'var(--text)';
      return `
        <tr style="cursor:pointer" onclick="CompetitorsModule.openDetail('${c.id}')">
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge" style="background:${color}22;color:${color};font-size:10px">${c.nicho}</span>
              <div>
                <div style="font-weight:600;font-size:13px">@${c.username}</div>
                <div style="font-size:11px;color:var(--text-secondary)">${c.nombre}</div>
              </div>
            </div>
          </td>
          <td style="font-family:monospace">${c.idioma === 'en' ? '🇺🇸' : c.idioma === 'pt' ? '🇧🇷' : '🇪🇸'}</td>
          <td style="font-family:monospace">${Utils.formatNum(c.followers_actual || c.followers_aprox || 0)}</td>
          <td style="font-family:monospace">${reelCount > 0 ? Utils.formatNum(Math.round(avgViews)) : '—'}</td>
          <td style="font-family:monospace">${reelCount > 0 ? Utils.formatPct(avgLikeRate) : '—'}</td>
          <td style="font-family:monospace">${reelCount}</td>
          <td style="font-size:11px;color:var(--text-secondary)">${c.ultimo_scraping ? Utils.timeAgo(c.ultimo_scraping) : 'Nunca'}</td>
          <td>
            <button class="btn" style="font-size:11px;padding:3px 8px"
              onclick="event.stopPropagation();CompetitorsModule.scrapeOne('${c.id}','${c.username}')">
              &#x1F504;
            </button>
          </td>
        </tr>
      `;
    }).join('');

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-size:13px;color:var(--text-secondary)">${competitors.length} competidores • ${competitors.filter(c=>c.ultimo_scraping).length} con datos scrapeados</div>
        <div style="display:flex;gap:8px">
          <button class="btn" onclick="CompetitorsModule.switchTab('scraping')">&#x2795; Gestionar</button>
          <button class="btn btn-fire" onclick="CompetitorsModule.scrapeAll()">&#x1F504; Scrapear todos</button>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:var(--bg-elevated);color:var(--text-secondary);font-size:11px;text-transform:uppercase;letter-spacing:.05em">
              <th style="padding:10px 14px;text-align:left">Cuenta</th>
              <th style="padding:10px 8px">Lang</th>
              <th style="padding:10px 8px">Followers</th>
              <th style="padding:10px 8px">Avg Views</th>
              <th style="padding:10px 8px">Like Rate</th>
              <th style="padding:10px 8px">Reels</th>
              <th style="padding:10px 8px">Scrapeado</th>
              <th style="padding:10px 8px"></th>
            </tr>
          </thead>
          <tbody id="comp-tbody">
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  // ──── SCRAPING ─────────────────────────────────────────────────────────
  async function renderScraping(el) {
    let existing = [];
    try { existing = await DB.getCompetitors(); } catch(e) {}

    const existingMap = {};
    existing.forEach(c => { existingMap[c.username] = c; });

    const presetUsernames = new Set(PRESET_COMPETITORS.map(c => c.username));
    const extraInDB = existing.filter(c => !presetUsernames.has(c.username));
    const extraRows = extraInDB.length ? `
      <div style="margin-top:16px">
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;font-weight:600;letter-spacing:.05em">EN BASE DE DATOS — NO EN PRESET</div>
        <div class="card" style="padding:0;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <tbody>${extraInDB.map(c => `
              <tr style="border-bottom:1px solid var(--border)">
                <td style="padding:6px 12px;font-size:12px;color:var(--text-secondary)">${c.nicho || '—'}</td>
                <td style="padding:6px 12px;font-size:13px;font-weight:500">@${c.username}</td>
                <td style="padding:6px 12px;font-size:12px;color:var(--text-secondary)">${c.nombre || '—'}</td>
                <td style="padding:6px 8px">
                  <button class="btn" style="font-size:10px;padding:2px 7px;color:var(--red);border-color:var(--red)" onclick="CompetitorsModule.removeCompetitor('${c.id}')">✕ Quitar</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : '';

    const presetRows = PRESET_COMPETITORS.map(c => {
      const loaded = existingMap[c.username];
      const color = NICHO_COLORS[c.nicho] || 'var(--text)';
      return `
        <tr>
          <td style="padding:6px 12px">
            <span class="badge" style="background:${color}22;color:${color};font-size:10px">${c.nicho}</span>
          </td>
          <td style="padding:6px 8px;font-size:12px">${c.idioma === 'en' ? '🇺🇸' : c.idioma === 'pt' ? '🇧🇷' : '🇪🇸'}</td>
          <td style="padding:6px 12px;font-size:13px;font-weight:500">@${c.username}</td>
          <td style="padding:6px 12px;font-size:12px;color:var(--text-secondary)">${c.nombre}</td>
          <td style="padding:6px 8px;font-family:monospace;font-size:12px">${c.followers_aprox ? Utils.formatNum(c.followers_aprox) : '—'}</td>
          <td style="padding:6px 12px;font-size:11px;color:var(--text-secondary);max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.notas}</td>
          <td style="padding:6px 8px;display:flex;gap:4px;align-items:center">
            ${loaded
              ? `<span style="color:var(--green);font-size:11px">✓</span>
                 <button class="btn" style="font-size:10px;padding:2px 7px;color:var(--red);border-color:var(--red)" onclick="CompetitorsModule.removeCompetitor('${loaded.id}')">✕</button>`
              : `<button class="btn" style="font-size:11px;padding:3px 10px" onclick="CompetitorsModule.addPreset('${c.username}')">Agregar</button>`
            }
          </td>
        </tr>
      `;
    }).join('');

    el.innerHTML = `
      <div style="display:flex;gap:12px;margin-bottom:16px">
        <button class="btn btn-fire" onclick="CompetitorsModule.addAllPresets()">&#x2795; Agregar todos (${PRESET_COMPETITORS.filter(c => !existingMap[c.username]).length} nuevos)</button>
        <button class="btn" onclick="CompetitorsModule.showAddCustom()">&#x270F;&#xFE0F; Agregar cuenta manual</button>
      </div>

      <div id="comp-add-custom" style="display:none" class="card" style="margin-bottom:16px">
        <div style="display:flex;gap:8px;align-items:flex-end">
          <div style="flex:1">
            <label style="font-size:11px;color:var(--text-secondary)">Username (sin @)</label>
            <input id="comp-custom-user" class="input" placeholder="usuario_instagram" style="margin-top:4px">
          </div>
          <div style="flex:1">
            <label style="font-size:11px;color:var(--text-secondary)">Nombre</label>
            <input id="comp-custom-nombre" class="input" placeholder="Nombre real" style="margin-top:4px">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-secondary)">Nicho</label>
            <select id="comp-custom-nicho" class="input" style="margin-top:4px">
              <option value="farmacologia">Farmacología</option>
              <option value="PEDs">PEDs (EN)</option>
              <option value="coach">Coach</option>
              <option value="atleta">Atleta</option>
            </select>
          </div>
          <button class="btn btn-fire" onclick="CompetitorsModule.addCustom()">Agregar</button>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:var(--bg-elevated);color:var(--text-secondary);font-size:10px;text-transform:uppercase;letter-spacing:.05em">
              <th style="padding:8px 12px;text-align:left">Nicho</th>
              <th style="padding:8px">Lang</th>
              <th style="padding:8px 12px;text-align:left">Username</th>
              <th style="padding:8px 12px;text-align:left">Nombre</th>
              <th style="padding:8px">Followers</th>
              <th style="padding:8px 12px;text-align:left">Notas</th>
              <th style="padding:8px"></th>
            </tr>
          </thead>
          <tbody>${presetRows}</tbody>
        </table>
      </div>

      ${extraRows}

      <div id="comp-scrape-log" style="margin-top:16px"></div>
    `;
  }

  // ──── ANÁLISIS CRUZADO ─────────────────────────────────────────────────
  async function renderAnalisis(el) {
    el.innerHTML = `<div style="display:flex;justify-content:center;padding:40px"><div class="loader"></div></div>`;

    let competitors = [], myReels = [], compReels = [];
    try {
      [competitors, myReels, compReels] = await Promise.all([
        DB.getCompetitors(),
        DB.getAllReels(),
        DB.getCompetitorReels(),
      ]);
    } catch(e) {
      el.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">Error: ${e.message}</p></div>`;
      return;
    }

    const hasData = compReels.length > 0;

    // Top reels de competencia
    const topReels = [...compReels]
      .sort((a, b) => (b.views_totales || 0) - (a.views_totales || 0))
      .slice(0, 20);

    // Stats por competidor
    const statsByComp = {};
    for (const r of compReels) {
      if (!statsByComp[r.competitor_id]) statsByComp[r.competitor_id] = { reels: [], views: [], likes: [] };
      statsByComp[r.competitor_id].reels.push(r);
      if (r.views_totales) statsByComp[r.competitor_id].views.push(r.views_totales);
      if (r.like_rate) statsByComp[r.competitor_id].likes.push(r.like_rate);
    }

    const topReelsHtml = topReels.length ? topReels.map(r => {
      const comp = competitors.find(c => c.id === r.competitor_id);
      return `
        <div style="display:flex;gap:12px;padding:10px;border-bottom:1px solid var(--border);align-items:flex-start">
          ${r.thumbnail_url ? `<img src="${r.thumbnail_url}" style="width:45px;height:80px;object-fit:cover;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">` : ''}
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;color:var(--accent);margin-bottom:2px">@${comp?.username || '?'}</div>
            <div style="font-size:12px;font-weight:500;line-height:1.3;margin-bottom:4px">${Utils.truncate(r.titulo || r.caption || '—', 60)}</div>
            <div style="display:flex;gap:12px;font-size:11px;color:var(--text-secondary)">
              <span>👁 ${Utils.formatNum(r.views_totales || 0)}</span>
              <span>❤️ ${Utils.formatNum(r.likes || 0)}</span>
              <span>💬 ${Utils.formatNum(r.comments || 0)}</span>
            </div>
          </div>
          <button class="btn" style="font-size:10px;padding:3px 8px;flex-shrink:0"
            onclick="CompetitorsModule.createIdeaFrom(${JSON.stringify(r.titulo||'').replace(/"/g,'&quot;')})">
            💡
          </button>
        </div>
      `;
    }).join('') : `<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px">Scrapea competidores para ver sus mejores reels aquí.</div>`;

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <div class="card">
          <div class="card-title" style="margin-bottom:12px">🏆 TOP REELS DE LA COMPETENCIA</div>
          <div style="max-height:500px;overflow-y:auto">
            ${topReelsHtml}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-title" style="margin-bottom:12px">📊 COMPARATIVA DE VIEWS</div>
            <canvas id="comp-scatter" height="200"></canvas>
          </div>

          <div class="card">
            <div class="card-title" style="margin-bottom:12px">🤖 ANÁLISIS CON PUMP AI</div>
            <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">
              Analizá qué está haciendo la competencia que vos no aprovechás todavía.
            </p>
            <button class="btn btn-fire" onclick="CompetitorsModule.aiCompAnalysis()">
              ¿Qué está haciendo la competencia que yo no?
            </button>
          </div>
        </div>

      </div>
    `;

    // Draw scatter if data exists
    if (hasData && myReels.length) {
      setTimeout(() => drawCompScatter(myReels, compReels, competitors), 100);
    }
  }

  function drawCompScatter(myReels, compReels, competitors) {
    const canvas = document.getElementById('comp-scatter');
    if (!canvas) return;

    const myDataset = {
      label: '@pump_team',
      data: myReels.filter(r => r.views_totales).map(r => ({ x: r.views_totales, y: r.like_rate || 0, title: r.titulo })),
      backgroundColor: 'rgba(255, 107, 53, 0.8)',
      pointRadius: 5,
    };

    // Group by competitor
    const compDatasets = competitors.slice(0, 8).map((c, i) => {
      const reels = compReels.filter(r => r.competitor_id === c.id && r.views_totales);
      const hue = (i * 47) % 360;
      return {
        label: `@${c.username}`,
        data: reels.map(r => ({ x: r.views_totales, y: r.like_rate || 0 })),
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.5)`,
        pointRadius: 3,
      };
    }).filter(d => d.data.length > 0);

    new Chart(canvas, {
      type: 'scatter',
      data: { datasets: [myDataset, ...compDatasets] },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#aaa', font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: '#666', callback: v => Utils.formatNum(v) }, grid: { color: '#222' } },
          y: { ticks: { color: '#666', callback: v => v + '%' }, grid: { color: '#222' } },
        },
      },
    });
  }

  // ──── DETALLE COMPETIDOR ───────────────────────────────────────────────
  async function openDetail(competitorId) {
    let comp, reels;
    try {
      [comp, reels] = await Promise.all([
        DB.getCompetitor(competitorId),
        DB.getCompetitorReels(competitorId),
      ]);
    } catch(e) { Utils.toast('Error: ' + e.message, 'error'); return; }

    const topReels = [...reels].sort((a,b) => (b.views_totales||0) - (a.views_totales||0)).slice(0, 12);
    const avgViews = reels.length ? Math.round(reels.reduce((s,r) => s + (r.views_totales||0), 0) / reels.length) : 0;
    const avgLikes = reels.length ? (reels.reduce((s,r) => s + (r.likes||0), 0) / reels.reduce((s,r) => s + (r.views_totales||1), 0) * 100) : 0;

    const reelsHtml = topReels.map(r => `
      <div style="display:flex;flex-direction:column;gap:4px;cursor:pointer" onclick="window.open('${r.ig_url||'#'}','_blank')">
        ${r.thumbnail_url
          ? `<img src="${r.thumbnail_url}" style="width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:4px" onerror="this.src=''">`
          : `<div style="width:100%;aspect-ratio:9/16;background:var(--bg-elevated);border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:20px">🎬</div>`}
        <div style="font-size:10px;color:var(--text-secondary)">${Utils.formatNum(r.views_totales||0)} views</div>
        <div style="font-size:11px;line-height:1.2;max-height:32px;overflow:hidden">${Utils.truncate(r.titulo||'',35)}</div>
      </div>
    `).join('');

    window.PCS.openModal(`
      <div style="max-width:800px;width:90vw">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div>
            <h2 style="margin:0">@${comp.username}</h2>
            <div style="font-size:13px;color:var(--text-secondary)">${comp.nombre} · ${comp.nicho}</div>
          </div>
          <button class="btn btn-fire" onclick="CompetitorsModule.scrapeOne('${comp.id}','${comp.username}')">&#x1F504; Actualizar</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
          <div class="card" style="text-align:center;padding:12px">
            <div style="font-size:20px;font-weight:700">${Utils.formatNum(comp.followers_actual || comp.followers_aprox || 0)}</div>
            <div style="font-size:11px;color:var(--text-secondary)">Followers</div>
          </div>
          <div class="card" style="text-align:center;padding:12px">
            <div style="font-size:20px;font-weight:700">${reels.length}</div>
            <div style="font-size:11px;color:var(--text-secondary)">Reels scrapeados</div>
          </div>
          <div class="card" style="text-align:center;padding:12px">
            <div style="font-size:20px;font-weight:700">${Utils.formatNum(avgViews)}</div>
            <div style="font-size:11px;color:var(--text-secondary)">Avg views</div>
          </div>
          <div class="card" style="text-align:center;padding:12px">
            <div style="font-size:20px;font-weight:700">${avgLikes.toFixed(2)}%</div>
            <div style="font-size:11px;color:var(--text-secondary)">Like rate</div>
          </div>
        </div>

        ${comp.notas ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;padding:8px 12px;background:var(--bg-elevated);border-radius:var(--radius-sm)">${comp.notas}</div>` : ''}

        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--text-secondary);margin-bottom:12px">TOP REELS POR VIEWS</div>
        ${reels.length > 0
          ? `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">${reelsHtml}</div>`
          : `<div style="text-align:center;padding:20px;color:var(--text-secondary)">Sin reels scrapeados. <button class="btn" onclick="CompetitorsModule.scrapeOne('${comp.id}','${comp.username}')">Scrapear ahora</button></div>`
        }
      </div>
    `);
  }

  // ──── AI ANÁLISIS COMPETENCIA ──────────────────────────────────────────
  async function aiCompAnalysis() {
    let competitors = [], compReels = [], myReels = [];
    try {
      [competitors, compReels, myReels] = await Promise.all([
        DB.getCompetitors(),
        DB.getCompetitorReels(),
        DB.getAllReels(),
      ]);
    } catch(e) {}

    const topByComp = competitors.slice(0, 5).map(c => {
      const reels = compReels.filter(r => r.competitor_id === c.id);
      const avgViews = reels.length ? Math.round(reels.reduce((s,r) => s+(r.views_totales||0),0)/reels.length) : 0;
      return `@${c.username} (${Utils.formatNum(c.followers_actual||c.followers_aprox||0)} seg, avg ${Utils.formatNum(avgViews)} views)`;
    }).join('\n');

    const myAvgViews = myReels.length ? Math.round(myReels.reduce((s,r) => s+(r.views_totales||0),0)/myReels.length) : 0;

    const prompt = `Analizá la siguiente comparativa entre @pump_team y su competencia:

PUMP TEAM (@pump_team):
- Reels analizados: ${myReels.length}
- Avg views: ${Utils.formatNum(myAvgViews)}
- Followers: ~79K

COMPETENCIA SCRAPEADA:
${topByComp || 'No hay datos de competencia scrapeados todavía.'}

TOTAL REELS COMPETENCIA: ${compReels.length}

Respondé:
1. ¿Qué formatos o pilares está usando la competencia hispana que @pump_team no explota?
2. ¿Qué gaps de contenido detectás en el nicho hispanoparlante?
3. ¿Qué 3 ideas concretas de reel podría hacer Mati basándose en lo que funciona en la competencia?`;

    window.PCS.openAI();
    setTimeout(() => {
      const input = document.getElementById('ai-input');
      if (input) { input.value = prompt; window.PCS.sendAI(); }
    }, 300);
  }

  // ──── ACCIONES ─────────────────────────────────────────────────────────
  async function addPreset(username) {
    const preset = PRESET_COMPETITORS.find(c => c.username === username);
    if (!preset) return;
    try {
      await DB.upsertCompetitor(preset);
      Utils.toast(`@${username} agregado`, 'success');
      renderScraping(document.getElementById('comp-content'));
    } catch(e) { Utils.toast('Error: ' + e.message, 'error'); }
  }

  async function addAllPresets() {
    const existing = await DB.getCompetitors().catch(() => []);
    const existingUsernames = new Set(existing.map(c => c.username));
    const toAdd = PRESET_COMPETITORS.filter(c => !existingUsernames.has(c.username));
    if (toAdd.length === 0) { Utils.toast('Todos ya están cargados', 'info'); return; }
    try {
      for (const c of toAdd) await DB.upsertCompetitor(c);
      Utils.toast(`${toAdd.length} competidores agregados`, 'success');
      renderScraping(document.getElementById('comp-content'));
    } catch(e) { Utils.toast('Error: ' + e.message, 'error'); }
  }

  function showAddCustom() {
    const el = document.getElementById('comp-add-custom');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }

  async function removeCompetitor(id) {
    if (!confirm('¿Quitar este competidor de la lista? Se borran también sus reels.')) return;
    try {
      await DB.deleteCompetitor(id);
      Utils.toast('Competidor eliminado', 'success');
      renderScraping(document.getElementById('comp-content'));
    } catch(e) { Utils.toast('Error: ' + e.message, 'error'); }
  }

  async function addCustom() {
    const username = document.getElementById('comp-custom-user')?.value?.trim().replace('@','');
    const nombre = document.getElementById('comp-custom-nombre')?.value?.trim();
    const nicho = document.getElementById('comp-custom-nicho')?.value;
    if (!username) { Utils.toast('Username requerido', 'error'); return; }
    try {
      await DB.upsertCompetitor({ username, nombre: nombre || username, nicho: nicho || 'farmacologia', idioma: 'es' });
      Utils.toast(`@${username} agregado`, 'success');
      renderScraping(document.getElementById('comp-content'));
    } catch(e) { Utils.toast('Error: ' + e.message, 'error'); }
  }

  async function scrapeOne(competitorId, username) {
    const logEl = document.getElementById('comp-scrape-log') || document.createElement('div');
    const log = (msg, type='info') => {
      const d = document.createElement('div');
      d.className = `log-line log-${type}`;
      d.textContent = msg;
      logEl.appendChild(d);
      logEl.scrollTop = logEl.scrollHeight;
    };
    if (!logEl.id) { logEl.id = 'comp-scrape-log'; document.getElementById('comp-content')?.appendChild(logEl); }
    logEl.innerHTML = '';

    log(`Scrapeando @${username}...`);
    try {
      const health = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (!health?.ok) { log('Backend offline en localhost:5001', 'error'); return; }

      log('⏳ Conectando a Instagram (puede tardar 20-60s)...');
      const r = await fetch(`${BACKEND_URL}/api/scrape-ig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, limit: 100 }),
        signal: AbortSignal.timeout(90000),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      const tipo = data.total > 0 ? 'success' : 'error';
      log(`${data.total} reels encontrados (${data.strategy})`, tipo);

      // Mostrar errores del backend PRIMERO para que siempre sean visibles
      if (data.errors?.length) data.errors.forEach(e => log(`⚠ ${e}`, 'error'));

      // Update competitor — usar UPDATE parcial, no upsert (evita NOT NULL violation)
      const now = new Date().toISOString();
      if (data.snapshot?.followers) {
        await DB.updateCompetitor(competitorId, { followers_actual: data.snapshot.followers, ultimo_scraping: now });
      } else {
        await DB.updateCompetitor(competitorId, { ultimo_scraping: now });
      }

      // Save reels — bulk upsert en un solo request
      const reels = (data.reels || []).map(r => ({ ...r, competitor_id: competitorId }));
      let saved = 0;
      if (reels.length > 0) {
        log(`Guardando ${reels.length} reels en base de datos...`);
        try {
          saved = await DB.bulkUpsertCompetitorReels(reels);
        } catch(e) {
          log(`⚠ Error guardando reels: ${e.message}`, 'error');
        }
      }

      if (saved > 0) log(`✓ ${saved} reels guardados`, 'success');

      // Calcular y guardar stats agregados en el competidor
      if (reels.length > 0) {
        const withViews = reels.filter(r => r.views_totales > 0);
        const avgViews = withViews.length
          ? Math.round(withViews.reduce((s, r) => s + r.views_totales, 0) / withViews.length)
          : 0;
        const withLikes = reels.filter(r => r.views_totales > 0 && r.likes > 0);
        const avgLikeRate = withLikes.length
          ? withLikes.reduce((s, r) => s + (r.likes / r.views_totales * 100), 0) / withLikes.length
          : 0;
        await DB.updateCompetitor(competitorId, {
          total_reels_scrapeados: reels.length,
          avg_views_reels: avgViews,
          avg_like_rate_reels: Math.round(avgLikeRate * 10000) / 10000,
        });
      }

      // Refrescar la tabla del overview si está visible
      const overviewTab = document.querySelector('#comp-tabs .tab.active');
      if (overviewTab?.textContent.includes('Overview')) {
        await renderOverview(document.getElementById('comp-content'));
      }
    } catch(e) {
      log('Error: ' + e.message, 'error');
    }
  }

  async function scrapeAll() {
    const competitors = await DB.getCompetitors().catch(() => []);
    if (!competitors.length) { Utils.toast('No hay competidores cargados', 'error'); return; }
    Utils.toast(`Scrapeando ${competitors.length} cuentas...`, 'info');
    for (const c of competitors) {
      await scrapeOne(c.id, c.username);
      await new Promise(r => setTimeout(r, 1500)); // Rate limiting
    }
    Utils.toast('Scraping completo', 'success');
  }

  async function createIdeaFrom(titulo) {
    try {
      await DB.upsertIdea({
        titulo: `[INSPIRADO EN COMPETENCIA] ${titulo}`,
        estado: 'idea',
        prioridad: 3,
        notas: 'Idea inspirada en contenido de la competencia',
      });
      Utils.toast('Idea creada', 'success');
    } catch(e) { Utils.toast('Error: ' + e.message, 'error'); }
  }

  return { render, switchTab, openDetail, scrapeOne, scrapeAll, addPreset, addAllPresets, showAddCustom, addCustom, removeCompetitor, aiCompAnalysis, createIdeaFrom, onReelsCompChange, setReelsSort, genGuion, translateGuion };
})();
