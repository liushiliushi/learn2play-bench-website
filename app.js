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
  const rows = results[key];
  const maxima = [1,2,3,4].map(i => Math.max(...rows.map(row => row[i])));
  body.replaceChildren();
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    row.forEach((value, index) => {
      const cell = document.createElement('td');
      cell.textContent = index === 0 ? value : (index >= 3 && value > 0 ? '+' : '') + value.toFixed(index === 4 ? 2 : 1);
      const comparison = selectedGroup === 'harnesses' ? rows.slice(Math.floor(rowIndex / 2) * 2, Math.floor(rowIndex / 2) * 2 + 2) : rows;
      if (index > 0 && value === (selectedGroup === 'harnesses' ? Math.max(...comparison.map(r => r[index])) : maxima[index - 1])) cell.classList.add('best');
      tr.append(cell);
    });
    body.append(tr);
  });
  document.querySelector('#method-choice').hidden = selectedGroup !== 'methods';
  const context = selectedGroup === 'backbones' ? 'Nine backbones, one common harness: OpenCode. Highlighted values are best within this comparison.' : selectedGroup === 'methods' ? `Six experience-retention methods with ${key === 'opus' ? 'Claude Opus 5' : 'Kimi K3'} fixed. Highlighted values are best or tied-best.` : 'Compare harnesses within each backbone pair. Highlighted values are best within a pair, not across different models.';
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
const grid = document.querySelector('#game-grid');
games.forEach(([emoji,name,description]) => {
  const card = document.createElement('article'); card.className = 'game-card';
  const icon = document.createElement('span'); icon.className = 'game-icon'; icon.setAttribute('aria-hidden','true'); icon.textContent = emoji;
  const title = document.createElement('h3'); title.textContent = name;
  const text = document.createElement('p'); text.textContent = description;
  card.append(icon,title,text); grid.append(card);
});
renderResults();
