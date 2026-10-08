'use strict';

// The browser and the static SVG export use the same coordinates and renderer.
const CostChart = (() => {
  const colors = { opencode: '#1674be', methods: '#9473c4', 'claude-code': '#167457', codex: '#c15439' };
  const names = { opencode: 'OpenCode', methods: 'Methods', 'claude-code': 'Claude Code', codex: 'Codex' };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dollars = value => '$' + value.toFixed(value < 0.01 ? 4 : value < 1 ? 3 : 2);
  const price = point => dollars(point.cost);
  const hasCost = point => Number.isFinite(point.cost) && point.cost > 0 && !point.costIsLowerBound && point.costStatus !== 'unconfirmed';
  const visiblePoints = (points, filter) => points.filter(p => hasCost(p) && (filter === 'all' || (filter === 'harnesses' ? ['claude-code', 'codex'].includes(p.group) : p.group === filter)));
  function frontier(points) {
    let best = -Infinity;
    return points.filter(hasCost).sort((a, b) => a.cost - b.cost || b.score - a.score).filter(p => {
      if (p.score <= best) return false;
      best = p.score;
      return true;
    });
  }

  function geometry(width) {
    const left = 74, right = width - 38, top = 40, bottom = 422;
    return {
      left, right, top, bottom,
      x: cost => left + (Math.log10(cost) - Math.log10(0.004)) / (Math.log10(5) - Math.log10(0.004)) * (right - left),
      y: score => bottom - (score - 20) / 70 * (bottom - top),
    };
  }

  function labelLayout(points, candidates, width) {
    const g = geometry(width), placed = [];
    for (const p of candidates) {
      const x = g.x(p.cost), y = g.y(p.score);
      const lines = [p.model, p.system];
      const w = Math.max(...lines.map(s => s.length)) * 7.6 + 12, h = 39;
      const offsets = [[12, -h - 8], [12, 12], [-w - 12, -h - 8], [-w - 12, 12], [-w / 2, -h - 16], [-w / 2, 20]];
      for (const [dx, dy] of offsets) {
        const box = { x: x + dx, y: y + dy, w, h };
        if (box.x < g.left + 3 || box.x + w > g.right - 3 || box.y < g.top + 3 || box.y + h > g.bottom - 3) continue;
        if (placed.some(b => box.x < b.x + b.w + 8 && box.x + w + 8 > b.x && box.y < b.y + b.h + 7 && box.y + h + 7 > b.y)) continue;
        if (points.some(q => g.x(q.cost) > box.x - 9 && g.x(q.cost) < box.x + w + 9 && g.y(q.score) > box.y - 9 && g.y(q.score) < box.y + h + 9)) continue;
        placed.push({ ...box, point: p, lines });
        break;
      }
    }
    return placed;
  }

  function render(data, filter = 'all', selected = null, width = 1120, interactive = false) {
    const points = visiblePoints(data.points, filter), g = geometry(width);
    // The frontier always refers to the full snapshot, even when points are filtered.
    const efficient = frontier(data.points), efficientIds = new Set(efficient.map(p => p.id));
    const candidates = [...points].sort((a, b) =>
      Number(b.id === selected) - Number(a.id === selected) ||
      Number(efficientIds.has(b.id)) - Number(efficientIds.has(a.id)) || b.score - a.score
    ).slice(0, filter === 'all' ? 7 : 9);
    const labels = labelLayout(points, candidates, width);
    const chunks = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 510" width="${width}" height="510" role="${interactive ? 'group' : 'img'}" aria-labelledby="cost-plot-title cost-plot-description" font-family="Arial, sans-serif">
      <title id="cost-plot-title">Performance and estimated inference cost</title>
      <desc id="cost-plot-description">${points.length} configurations. Horizontal axis: estimated mean US dollars per episode on a logarithmic scale. Vertical axis: normalized Max score, from 20 to 90 percent. Higher and farther left is better. The dashed frontier uses all ${data.points.filter(hasCost).length} configurations with known costs. GPT-6 Astra cost is unconfirmed and is not plotted. ${interactive ? 'Focus or select any point to read its values below the chart.' : 'Each point has a title with its configuration and values.'}</desc>
      <rect width="${width}" height="510" fill="#fff"/>
      <style>.cost-point{cursor:pointer}.cost-point:focus-visible{outline:none}.cost-point .point-halo{opacity:0}.cost-point:hover .point-halo,.cost-point:focus .point-halo,.cost-point.is-selected .point-halo{opacity:1}.cost-point:focus .point-mark{stroke:#182526;stroke-width:2.5}</style>`];
    for (let score = 20; score <= 90; score += 10) {
      const y = g.y(score);
      chunks.push(`<path d="M${g.left} ${y}H${g.right}" stroke="#e9eeeb"/><text x="${g.left - 14}" y="${y + 5}" text-anchor="end" fill="#66756e" font-size="14">${score}</text>`);
    }
    for (const cost of [0.01, 0.03, 0.1, 0.3, 1, 3]) {
      const x = g.x(cost);
      chunks.push(`<path d="M${x} ${g.top}V${g.bottom}" stroke="#f0f3f1"/><text x="${x}" y="${g.bottom + 27}" text-anchor="middle" fill="#66756e" font-size="14">$${cost}</text>`);
    }
    chunks.push(`<text transform="translate(23 ${(g.top + g.bottom) / 2}) rotate(-90)" text-anchor="middle" fill="#3e5148" font-size="15">Normalized Max (%)</text>
      <text x="${(g.left + g.right) / 2}" y="493" text-anchor="middle" fill="#3e5148" font-size="15">Estimated cost per episode (USD · log scale)</text>
      <text x="${g.left}" y="19" fill="#66756e" font-size="12">↖ Higher score, lower cost</text>`);
    chunks.push(`<path d="${efficient.map((p, i) => `${i ? 'L' : 'M'}${g.x(p.cost)} ${g.y(p.score)}`).join(' ')}" fill="none" stroke="#829d8f" stroke-width="1.6" stroke-dasharray="5 6" opacity="${filter === 'all' ? 1 : 0.45}"/>`);
    for (const label of labels) {
      const { point: p, x, y, w, h, lines } = label;
      chunks.push(`<g aria-hidden="true" pointer-events="none"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#fff" fill-opacity=".94"/>
        <text x="${x + 6}" y="${y + 15}" fill="${colors[p.group]}" font-size="14" font-weight="600">${escape(lines[0])}</text>
        <text x="${x + 6}" y="${y + 32}" fill="#6c7771" font-size="12">${escape(lines[1])}</text></g>`);
    }
    // Put selected points last, so their ring stays visible in dense clusters.
    for (const p of [...points].sort((a, b) => Number(a.id === selected) - Number(b.id === selected))) {
      const x = g.x(p.cost), y = g.y(p.score), color = colors[p.group];
      const description = `${p.system} · ${p.model}: Max ${p.score.toFixed(1)}%, estimated cost ${price(p)} per episode`;
      chunks.push(`<g class="cost-point${p.id === selected ? ' is-selected' : ''}" data-cost-id="${escape(p.id)}" ${interactive ? `tabindex="0" role="button" aria-pressed="${p.id === selected}" aria-label="${escape(description)}"` : ''}>
        <title>${escape(description)}</title><circle cx="${x}" cy="${y}" r="13" fill="transparent"/>
        <circle class="point-halo" cx="${x}" cy="${y}" r="11" fill="${color}" fill-opacity=".15"/>
        ${p.group === 'codex' ? `<path class="point-mark" d="M${x} ${y - 7}l7 7-7 7-7-7Z" fill="${color}" stroke="#fff" stroke-width="2"/>` : `<circle class="point-mark" cx="${x}" cy="${y}" r="${p.group === 'methods' ? 5 : 6}" fill="${color}" stroke="#fff" stroke-width="2"/>`}
      </g>`);
    }
    chunks.push(`<text x="${g.left}" y="467" fill="#66756e" font-size="12">GPT-6 Astra: cost unconfirmed; not plotted.</text>`);
    chunks.push('</svg>');
    return chunks.join('\n');
  }

  async function mount() {
    const host = document.querySelector('#cost-plot');
    if (!host) return;
    try {
      const response = await fetch('assets/performance-cost.json?v=astra-cost-unconfirmed-20261008');
      if (!response.ok) throw new Error('Cost snapshot unavailable');
      const data = await response.json();
      let filter = 'all', selected = null, lastWidth = 0;
      const details = document.querySelector('#cost-selection');
      const formatDetails = p => {
        details.querySelector('[data-cost-name]').textContent = `${p.system} · ${p.model}`;
        details.querySelector('[data-cost-score]').textContent = `${p.score.toFixed(1)}%`;
        details.querySelector('[data-cost-price]').textContent = price(p);
        details.hidden = false;
        document.querySelector('#cost-hint').hidden = true;
      };
      function select(id) {
        selected = id;
        const point = data.points.find(p => p.id === id);
        if (!point) return;
        host.querySelectorAll('.cost-point').forEach(node => {
          const active = node.dataset.costId === id;
          node.classList.toggle('is-selected', active);
          node.setAttribute('aria-pressed', String(active));
        });
        formatDetails(point);
        const tooltip = host.querySelector('.cost-tooltip');
        tooltip.querySelector('strong').textContent = point.model;
        tooltip.querySelector('small').textContent = point.system;
        tooltip.querySelector('span').textContent = `${point.score.toFixed(1)}% Max · ${price(point)} / episode`;
        tooltip.hidden = false;
        const scale = host.clientWidth / lastWidth, g = geometry(lastWidth), scroller = host.parentElement;
        tooltip.style.left = `${Math.max(scroller.scrollLeft + 8, Math.min(g.x(point.cost) * scale + 16, scroller.scrollLeft + scroller.clientWidth - tooltip.offsetWidth - 8))}px`;
        tooltip.style.top = `${Math.max(8, g.y(point.score) * scale - tooltip.offsetHeight - 16)}px`;
      }
      function draw() {
        const width = Math.max(640, Math.min(1120, Math.round(host.clientWidth)));
        lastWidth = width;
        host.innerHTML = render(data, filter, selected, width, true);
        const tooltip = document.createElement('div');
        tooltip.className = 'cost-tooltip'; tooltip.hidden = true; tooltip.setAttribute('aria-hidden', 'true');
        tooltip.append(document.createElement('small'), document.createElement('strong'), document.createElement('span'));
        host.append(tooltip);
        document.querySelector('#cost-count').textContent = `${visiblePoints(data.points, filter).length} configurations`;
        host.querySelectorAll('[data-cost-id]').forEach(node => {
          const activate = () => select(node.dataset.costId);
          node.addEventListener('focus', activate);
          node.addEventListener('click', event => { if (event.detail === 0) activate(); });
          node.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
          });
        });
        const svg = host.querySelector('svg');
        function nearestPoint(event) {
          if (event.type === 'pointermove' && event.pointerType === 'touch') return;
          const bounds = svg.getBoundingClientRect(), g = geometry(width);
          const x = (event.clientX - bounds.left) * width / bounds.width;
          const y = (event.clientY - bounds.top) * 510 / bounds.height;
          const closest = visiblePoints(data.points, filter).map(p => ({ p, distance: Math.hypot(g.x(p.cost) - x, g.y(p.score) - y) })).sort((a, b) => a.distance - b.distance)[0];
          if (closest && closest.distance <= 16) select(closest.p.id);
          else host.querySelector('.cost-tooltip').hidden = true;
        }
        svg.addEventListener('pointermove', nearestPoint);
        svg.addEventListener('click', event => { if (event.detail !== 0) nearestPoint(event); });
      }
      document.querySelectorAll('[data-cost-filter]').forEach(button => {
        button.disabled = false;
        button.addEventListener('click', () => {
          filter = button.dataset.costFilter;
          document.querySelectorAll('[data-cost-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
          if (!visiblePoints(data.points, filter).some(p => p.id === selected)) {
            selected = null; details.hidden = true; document.querySelector('#cost-hint').hidden = false;
          }
          draw();
        });
      });
      host.addEventListener('pointerleave', () => { host.querySelector('.cost-tooltip').hidden = true; });
      host.addEventListener('focusout', event => {
        if (!host.contains(event.relatedTarget)) host.querySelector('.cost-tooltip').hidden = true;
      });
      draw();
      if ('ResizeObserver' in window) new ResizeObserver(() => {
        const width = Math.max(640, Math.min(1120, Math.round(host.clientWidth)));
        if (Math.abs(width - lastWidth) > 2) draw();
      }).observe(host);
    } catch {
      document.querySelector('#cost-hint').textContent = 'Static chart shown. Reload to enable filters and point details.';
    }
  }
  return { render, frontier, visiblePoints, labelLayout, geometry, mount, names };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CostChart;
if (typeof document !== 'undefined') CostChart.mount();
