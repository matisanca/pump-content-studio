/* ============================================
   PUMP CONTENT STUDIO — Utilities
   ============================================ */

const Utils = {
  // Format number: 1234 → 1.2K, 1234567 → 1.2M
  formatNum(n) {
    if (n == null) return '—';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
    return n.toLocaleString('es-AR');
  },

  // Format percentage
  formatPct(n, decimals = 2) {
    if (n == null) return '—';
    return Number(n).toFixed(decimals) + '%';
  },

  // Format currency (ARS)
  formatMoney(n) {
    if (n == null) return '—';
    return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
  },

  // Format duration: 67 → 1:07
  formatDuration(secs) {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  // Relative date: "hace 3 dias"
  timeAgo(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'hoy';
    if (diff === 1) return 'ayer';
    if (diff < 7) return `hace ${diff} dias`;
    if (diff < 30) return `hace ${Math.floor(diff / 7)} sem`;
    if (diff < 365) return `hace ${Math.floor(diff / 30)} mes${Math.floor(diff / 30) > 1 ? 'es' : ''}`;
    return `hace ${Math.floor(diff / 365)} a`;
  },

  // Format date: 2024-01-15 → 15 ene 2024
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  // Multiplicador badge class
  multBadgeClass(mult) {
    if (mult == null) return 'badge-muted';
    if (mult < 0.7) return 'badge-mult-low';
    if (mult < 1.2) return 'badge-mult-avg';
    if (mult < 2) return 'badge-mult-good';
    if (mult < 4) return 'badge-mult-great';
    return 'badge-mult-fire';
  },

  // Pilar config
  PILARES: {
    'farmacologia':   { emoji: '\uD83D\uDC8A', label: 'Farma',         color: '#8b5cf6', class: 'pilar-farma' },
    'nutricion':      { emoji: '\uD83E\uDD57', label: 'Nutricion',     color: '#00ff88', class: 'pilar-nutricion' },
    'entrenamiento':  { emoji: '\uD83D\uDCAA', label: 'Entrenamiento', color: '#00d4ff', class: 'pilar-entrenamiento' },
    'mindset':        { emoji: '\uD83E\uDDE0', label: 'Mindset',       color: '#ffd600', class: 'pilar-mindset' },
    'negocio':        { emoji: '\uD83D\uDCBC', label: 'Negocio',       color: '#ff6b35', class: 'pilar-negocio' },
  },

  pilarBadge(pilar) {
    const p = this.PILARES[pilar] || { emoji: '?', label: pilar, class: 'badge-muted' };
    return `<span class="badge ${p.class}">${p.emoji} ${p.label}</span>`;
  },

  pilarColor(pilar) {
    return (this.PILARES[pilar] || {}).color || '#7070a0';
  },

  FORMATOS: [
    'problema-solucion', 'lista', 'historia', 'polemica',
    'tutorial', 'comparacion', 'antes-despues', 'dato-sorprendente'
  ],

  HOOK_TIPOS: [
    'pregunta', 'afirmacion-polemica', 'dato-sorprendente',
    'enemigo', 'promesa', 'error-comun', 'identidad'
  ],

  ESTADOS_IDEA: ['idea', 'en_guion', 'grabado', 'editado', 'publicado', 'descartado'],

  PRODUCTOS: ['Pampflix', 'Asesoria Pump Team', 'Consulta PAMPFARMA', 'Otro'],

  // Save rate evaluation
  saveRateEval(sr) {
    if (sr == null) return { icon: '\u2014', color: 'var(--text-muted)', label: '' };
    if (sr >= 2) return { icon: '\uD83D\uDFE2', color: 'var(--green)', label: 'Excelente' };
    if (sr >= 1) return { icon: '\uD83D\uDFE1', color: 'var(--yellow)', label: 'Normal' };
    return { icon: '\uD83D\uDD34', color: 'var(--red)', label: 'Mejorable' };
  },

  // Delta arrow
  delta(current, benchmark) {
    if (current == null || benchmark == null || benchmark === 0) return { text: '—', class: 'neutral' };
    const pct = ((current - benchmark) / benchmark * 100).toFixed(0);
    if (pct > 0) return { text: `+${pct}%`, class: 'positive' };
    if (pct < 0) return { text: `${pct}%`, class: 'negative' };
    return { text: '0%', class: 'neutral' };
  },

  // Toast notification
  toast(msg, type = 'info') {
    const container = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  },

  // Truncate text
  truncate(text, max = 80) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '...' : text;
  },

  // Debounce
  debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  // Generate UUID (simple v4)
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  // Parse CSV to array of objects
  parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    // Detect separator
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(sep).map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue; }
        if (char === sep && !inQuotes) { values.push(current.trim()); current = ''; continue; }
        current += char;
      }
      values.push(current.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    });
  },

  // Simple markdown-like formatting for AI responses
  formatAIText(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^### (.+)$/gm, '<h4 style="color:var(--fire);margin:12px 0 6px;">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 style="color:var(--fire);margin:14px 0 8px;">$1</h3>')
      .replace(/^- (.+)$/gm, '<div style="padding-left:12px;">&#x2022; $1</div>')
      .replace(/\n/g, '<br>');
  },

  // Escape HTML
  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
