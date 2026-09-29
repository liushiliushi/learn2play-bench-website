'use strict';
// Snapshot transcribed from the manuscript's main comparison tables, 2026-09-29.
const results = {
  backbones: [
    ['Claude Opus 5',74.5,53.8,21.3,5.13],['Qwen 3.8 Max',72.5,51.1,25.2,6.30],
    ['Gemini 3.5 Flash',72.0,52.2,19.8,5.37],['Kimi K3',68.5,50.2,17.1,4.24],
    ['Gemini 3.7 Flash',58.3,39.9,10.7,2.47],['GPT-5.6-SOL',57.0,41.1,14.5,3.71],
    ['Claude Sonnet 5',55.9,35.6,15.7,3.72],['DeepSeek V4 Pro',54.2,38.2,14.7,3.66],['GPT-5 Mini',34.0,22.3,9.2,1.83]
  ],
  opus: [['EvoTest',66.1,51.3,9.4,2.52],['Reflexion',64.8,48.8,11.6,2.93],['Memory',60.9,48.2,11.4,2.87],['ReasoningBank',60.2,45.3,12.3,2.85],['Naive',53.4,36.6,-5.1,-1.08],['AWM',50.7,37.8,0.7,0.43]],
  kimi: [['Memory',63.3,48.0,16.9,4.69],['EvoTest',62.4,48.0,1.8,1.01],['Reflexion',61.6,40.4,14.8,3.35],['ReasoningBank',59.9,40.1,8.3,2.59],['AWM',56.1,37.0,4.8,0.62],['Naive',54.7,31.9,0.3,0.42]],
  harnesses: [['Opus 5 · OpenCode',74.5,53.8,21.3,5.13],['Opus 5 · Claude Code',81.8,62.3,27.1,6.59],['GPT-5.6-SOL · OpenCode',57.0,41.1,14.5,3.71],['GPT-5.6-SOL · Codex',74.3,54.8,22.2,5.66]]
};
const games = [
  ['🦋','Butterfly','Breed butterflies toward a target appearance.'],['👻','Haunted Inn','Welcome guests to an inn with mysterious constraints.'],['💎','GemForge','Experiment with ingredients and discover new gems.'],['🍵','Mola Tea','Develop recipes and grow a small tea shop.'],
  ['🏢','SynergyCorp','Navigate an unfamiliar workplace and earn promotions.'],['🏠','Roommates','Arrange tenants into compatible shared rooms.'],['🔭','Roadside Observatory','Guide a traveler toward a mountain observatory.'],['🧳','Lost and Found','Investigate competing claims to lost belongings.'],
  ['🦠','Plague','Manage an outbreak and protect a village.'],['🛰️','Model Auditor','Probe a hidden machine and predict its outputs.'],['🧪','Primordial Soup','Explore reactions and synthesize new compounds.'],['🍷','Poisoner','Discover a royal diner’s preferences through feedback.'],
  ['🐱','Catnip','Try feline actions and learn how people respond.'],['🏰','Dungeon','Explore a maze, gather treasure, and survive.'],['🌙','DreamGarden','Experiment with an interconnected dream ecosystem.'],['🌐','Ecosphere','Build an ecosystem and observe how it develops.'],
  ['📣','Grapevine','Choose where a rumor starts and watch it spread.'],['🏝️','Castaway','Explore an unfamiliar island and find a way out.'],['🚢','RedEye','Investigate a doomed cruise across repeated time loops.'],['🧩','Patch Reality','Observe anomalies and work out how to resolve them.']
];
let selectedGroup = 'backbones';
const body = document.querySelector('#result-body');
function renderResults() {
  const key = selectedGroup === 'methods' ? document.querySelector('#method-backbone').value : selectedGroup;
  const metric = Number(document.querySelector('#rank-metric').value);
  const metricName = ['','Max','Mean','LG','LS'][metric];
  const harnessBackbone = document.querySelector('#harness-backbone').value;
  const comparisonRows = selectedGroup === 'harnesses' ? results.harnesses.slice(harnessBackbone === 'opus' ? 0 : 2, harnessBackbone === 'opus' ? 2 : 4) : results[key];
  const rows = [...comparisonRows].sort((a,b) => b[metric] - a[metric] || a[0].localeCompare(b[0]));
  const maxima = [1,2,3,4].map(i => Math.max(...rows.map(row => row[i])));
  body.replaceChildren();
  let rank = 0;
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    if (rowIndex === 0 || row[metric] !== rows[rowIndex - 1][metric]) rank = rowIndex + 1;
    const rankCell = document.createElement('td');
    rankCell.className = 'rank-column';
    const badge = document.createElement('span');
    badge.className = rank === 1 ? 'rank-badge rank-first' : 'rank-badge';
    badge.textContent = String(rank);
    rankCell.append(badge); tr.append(rankCell);
    row.forEach((value, index) => {
      const cell = document.createElement('td');
      if (index === 0) cell.className = 'entry-name';
      if (index === metric) cell.classList.add('ranked-metric');
      cell.textContent = index === 0 ? value : (index >= 3 && value > 0 ? '+' : '') + value.toFixed(index === 4 ? 2 : 1);
      if (index > 0 && value === maxima[index - 1]) cell.classList.add('best');
      tr.append(cell);
    });
    body.append(tr);
  });
  document.querySelector('#method-choice').hidden = selectedGroup !== 'methods';
  document.querySelector('#harness-choice').hidden = selectedGroup !== 'harnesses';
  document.querySelectorAll('[data-metric]').forEach(header => {
    const active = Number(header.dataset.metric) === metric;
    header.setAttribute('aria-sort', active ? 'descending' : 'none');
    header.classList.toggle('ranked-metric', active);
  });
  const settings = selectedGroup === 'backbones' ? '9 backbones · OpenCode harness' : selectedGroup === 'methods' ? `6 methods · ${key === 'opus' ? 'Claude Opus 5' : 'Kimi K3'} backbone` : `2 harnesses · ${harnessBackbone === 'opus' ? 'Claude Opus 5' : 'GPT-5.6-SOL'} backbone`;
  const context = `${settings} · Ranked by ${metricName}, highest first.`;
  document.querySelector('#table-context').textContent = context;
  document.querySelector('#result-caption').textContent = context;
  document.querySelector('#name-column').textContent = selectedGroup === 'methods' ? 'Method' : selectedGroup === 'harnesses' ? 'Model · Harness' : 'Model';
}
document.querySelectorAll('[data-group]').forEach(button => button.addEventListener('click', () => {
  selectedGroup = button.dataset.group;
  document.querySelectorAll('[data-group]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderResults();
}));
document.querySelector('#method-backbone').addEventListener('change', renderResults);
document.querySelector('#harness-backbone').addEventListener('change', renderResults);
document.querySelector('#rank-metric').addEventListener('change', renderResults);
const grid = document.querySelector('#game-grid');
games.forEach(([emoji,name,description], index) => {
  const card = document.createElement('article'); card.className = 'game-card';
  const icon = document.createElement('span'); icon.className = 'game-icon'; icon.setAttribute('aria-hidden','true'); icon.textContent = emoji;
  const title = document.createElement('h3'); title.textContent = name;
  const text = document.createElement('p'); text.textContent = description;
  const example = document.createElement('a');
  example.className = 'game-example-link'; example.href = '#example'; example.textContent = 'See gameplay';
  example.setAttribute('aria-label', `See ${name} gameplay`);
  example.addEventListener('click', () => {
    if (gamePreviews.length) {
      document.querySelector('#example-game').value = String(index);
      previewStep = 0; renderGamePreview();
    }
  });
  card.append(icon,title,text,example); grid.append(card);
});
renderResults();
document.querySelectorAll('[data-curve]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-curve]').forEach(b => {
    b.classList.toggle('active', b === button);
    b.setAttribute('aria-pressed', String(b === button));
  });
  const chart = document.querySelector('#learning-chart');
  chart.src = `assets/learning-${button.dataset.curve}.svg`;
  chart.alt = button.dataset.curve === 'backbones'
    ? 'Learning curves for nine OpenCode backbones, showing normalized score against progress through the evaluation window.'
    : 'Learning curves for six self-evolving methods and baselines with Claude Opus 5, showing normalized score against progress through the evaluation window.';
}));

const previewGameIds = ['butterfly','hauntedinn','gemforge','mola_tea','synergycorp','hezu','roadside_observatory','lost_and_found','plague','modelkeeper_expert','primordialsoup','poisoner','catnip','dungeon','dreamgarden','ecosphere','grapevine','castaway','redeye','patch_reality_moderate'];
let gamePreviews = [];
let previewStep = 0;
function renderGamePreview() {
  const index = Number(document.querySelector('#example-game').value);
  const preview = gamePreviews[index];
  if (!preview) return;
  const step = preview.steps[previewStep];
  document.querySelector('#example-name').textContent = `${games[index][0]} ${games[index][1]}`;
  document.querySelector('#example-goal').textContent = games[index][2];
  document.querySelector('#example-how').textContent = preview.how;
  document.querySelector('#example-meta').textContent = `Seed ${preview.seed} · ${preview.id === 'redeye' ? 'Unscored opening prologue' : 'Opening sequence'} · Recorded preview`;
  document.querySelector('#example-stage').textContent = previewStep ? 'Feedback after your action' : 'Opening situation';
  document.querySelector('#example-action').textContent = step.action || 'No action yet';
  const output = document.querySelector('#example-output');
  output.textContent = step.observation; output.scrollTop = 0;
  document.querySelector('#example-prev').disabled = previewStep === 0;
  document.querySelector('#example-next').disabled = previewStep === preview.steps.length - 1;
  document.querySelector('#example-progress').textContent = previewStep === preview.steps.length - 1
    ? `Step ${previewStep} of ${preview.steps.length - 1} · End of preview`
    : `Step ${previewStep} of ${preview.steps.length - 1}`;
}
document.querySelector('#example-game').addEventListener('change', () => { previewStep = 0; renderGamePreview(); });
document.querySelector('#example-prev').addEventListener('click', () => { if (previewStep > 0) { previewStep--; renderGamePreview(); } });
document.querySelector('#example-next').addEventListener('click', () => {
  const preview = gamePreviews[Number(document.querySelector('#example-game').value)];
  if (preview && previewStep < preview.steps.length - 1) { previewStep++; renderGamePreview(); }
});
fetch('assets/game-examples.json').then(response => {
  if (!response.ok) throw new Error('Unable to load game examples');
  return response.json();
}).then(data => {
  gamePreviews = previewGameIds.map(id => data.examples.find(example => example.id === id));
  if (gamePreviews.some(preview => !preview || !preview.steps.length)) throw new Error('Incomplete example data');
  const select = document.querySelector('#example-game');
  select.replaceChildren(...games.map(([, name], index) => {
    const option = document.createElement('option'); option.value = String(index); option.textContent = name; return option;
  }));
  select.disabled = false; renderGamePreview();
}).catch(() => {
  gamePreviews = [];
  document.querySelector('#example-how').textContent = 'The recorded examples could not load. Reload this page or visit the game portal to play.';
  document.querySelector('#example-output').textContent = 'Preview unavailable.';
  document.querySelector('#example-game').options[0].textContent = 'Preview unavailable';
});
