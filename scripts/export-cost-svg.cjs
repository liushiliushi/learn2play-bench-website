const fs = require('node:fs');
const path = require('node:path');
const chart = require('../cost-chart.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/performance-cost.json'), 'utf8'));
fs.writeFileSync(path.join(__dirname, '../assets/performance-cost.svg'), chart.render(data));
console.log(`Rendered ${data.points.length} configurations to the static SVG fallback.`);
