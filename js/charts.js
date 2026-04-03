/* ============================================
   PUMP CONTENT STUDIO — Chart.js Wrappers
   ============================================ */

const Charts = (() => {
  // Global Chart.js defaults
  Chart.defaults.color = '#7070a0';
  Chart.defaults.borderColor = '#1f1f2e';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.legend.display = false;

  const instances = {};

  function destroy(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  function getCtx(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    destroy(canvasId);
    return canvas.getContext('2d');
  }

  // ---- Scatter: Performance Map ----
  function scatterPerformance(canvasId, reels, benchmarks) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;

    const datasets = {};
    for (const reel of reels) {
      if (reel.save_rate == null || reel.views_totales == null) continue;
      const pilar = (reel.pilares || [])[0] || 'entrenamiento';
      if (!datasets[pilar]) {
        datasets[pilar] = {
          label: Utils.PILARES[pilar]?.label || pilar,
          data: [],
          backgroundColor: Utils.pilarColor(pilar) + '99',
          borderColor: Utils.pilarColor(pilar),
          borderWidth: 1,
          pointRadius: [],
          pointHoverRadius: 8,
        };
      }
      const eng = reel.engagement_rate || 2;
      datasets[pilar].data.push({
        x: reel.save_rate,
        y: reel.views_totales,
        reel: reel,
      });
      datasets[pilar].pointRadius.push(Math.max(3, Math.min(12, eng * 2)));
    }

    const avgSave = benchmarks?.avg_save_rate || 1.5;
    const avgViews = benchmarks?.avg_views || 20000;

    instances[canvasId] = new Chart(ctx, {
      type: 'scatter',
      data: { datasets: Object.values(datasets) },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Save Rate %', color: '#7070a0' },
            grid: { color: '#1f1f2e40' },
          },
          y: {
            title: { display: true, text: 'Views', color: '#7070a0' },
            grid: { color: '#1f1f2e40' },
            ticks: {
              callback: v => Utils.formatNum(v),
            },
          },
        },
        plugins: {
          legend: { display: true, position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              title: items => items[0]?.raw?.reel?.titulo || '',
              label: item => {
                const r = item.raw.reel;
                return [
                  `Views: ${Utils.formatNum(r.views_totales)}`,
                  `Save rate: ${Utils.formatPct(r.save_rate)}`,
                  `Multiplicador: ${r.multiplicador || '?'}x`,
                ];
              },
            },
          },
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const dsIdx = elements[0].datasetIndex;
            const reel = Object.values(datasets)[dsIdx]?.data[idx]?.reel;
            if (reel) window.PCS.navigate('reel-detail', reel.id);
          }
        },
      },
      plugins: [{
        afterDraw: (chart) => {
          const { ctx: c, chartArea: { left, right, top, bottom } } = chart;
          const xScale = chart.scales.x;
          const yScale = chart.scales.y;
          const xMid = xScale.getPixelForValue(avgSave);
          const yMid = yScale.getPixelForValue(avgViews);

          c.save();
          c.setLineDash([4, 4]);
          c.strokeStyle = '#3a3a5a';
          c.lineWidth = 1;

          // Vertical line at avg save rate
          if (xMid >= left && xMid <= right) {
            c.beginPath();
            c.moveTo(xMid, top);
            c.lineTo(xMid, bottom);
            c.stroke();
          }

          // Horizontal line at avg views
          if (yMid >= top && yMid <= bottom) {
            c.beginPath();
            c.moveTo(left, yMid);
            c.lineTo(right, yMid);
            c.stroke();
          }
          c.restore();
        }
      }],
    });
  }

  // ---- Area: Growth Chart ----
  function areaGrowth(canvasId, snapshots) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;

    const sorted = [...snapshots].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const labels = sorted.map(s => Utils.formatDate(s.fecha));
    const followers = sorted.map(s => s.followers || 0);

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');

    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Followers',
          data: followers,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#ff6b35',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#1f1f2e40' },
            ticks: { callback: v => Utils.formatNum(v) },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: item => `${Utils.formatNum(item.raw)} followers`,
            },
          },
        },
      },
    });
  }

  // ---- Bar: Views over time ----
  function barViews(canvasId, reels) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;

    // Group by week
    const weeks = {};
    for (const r of reels) {
      if (!r.fecha_publicacion) continue;
      const d = new Date(r.fecha_publicacion);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!weeks[key]) weeks[key] = { views: 0, count: 0 };
      weeks[key].views += r.views_totales || 0;
      weeks[key].count++;
    }

    const sorted = Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0])).slice(-20);

    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sorted.map(([k]) => Utils.formatDate(k)),
        datasets: [{
          label: 'Views por semana',
          data: sorted.map(([, v]) => v.views),
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: '#8b5cf6',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#1f1f2e40' },
            ticks: { callback: v => Utils.formatNum(v) },
          },
        },
      },
    });
  }

  // ---- Horizontal Bar: Metric Comparison ----
  function horizontalBars(canvasId, labels, values, benchmarks, colors) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;

    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Este reel',
            data: values,
            backgroundColor: (colors || []).map(c => c + '80') || 'rgba(255, 107, 53, 0.6)',
            borderColor: colors || '#ff6b35',
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: 'Benchmark 90d',
            data: benchmarks,
            backgroundColor: 'rgba(58, 58, 90, 0.5)',
            borderColor: '#3a3a5a',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: '#1f1f2e40' } },
          y: { grid: { display: false } },
        },
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 10 }, padding: 12 } },
        },
      },
    });
  }

  // ---- Doughnut: Pilar breakdown ----
  function doughnutPilares(canvasId, pilarData) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;

    const labels = Object.keys(pilarData);
    const values = Object.values(pilarData);
    const colors = labels.map(p => Utils.pilarColor(p));

    instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.map(p => Utils.PILARES[p]?.label || p),
        datasets: [{
          data: values,
          backgroundColor: colors.map(c => c + '80'),
          borderColor: colors,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { display: true, position: 'right', labels: { font: { size: 11 }, padding: 8 } },
        },
      },
    });
  }

  // ---- Sparkline ----
  function sparkline(canvasId, data, color = '#ff6b35') {
    const ctx = getCtx(canvasId);
    if (!ctx) return;

    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data: data,
          borderColor: color,
          borderWidth: 1.5,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: false,
      },
    });
  }

  return {
    scatterPerformance,
    areaGrowth,
    barViews,
    horizontalBars,
    doughnutPilares,
    sparkline,
    destroy,
  };
})();
