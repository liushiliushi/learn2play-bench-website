#!/usr/bin/env python3
"""Copy audited chart coordinates into a public, credential-free website snapshot."""
import csv
import hashlib
import json
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
SOURCE = SITE.parent / 'results/_analysis/rq6_cost_audit.csv'
rows = list(csv.DictReader(SOURCE.open()))
points = []
for row in rows:
    if row['model'] == 'GPT-OSS 120B':
        continue  # Same configuration set as the previous website figure.
    system = row['system'].replace('\\textsc{', '').replace('}', '')
    group = {'OpenCode': 'opencode', 'Claude Code': 'claude-code', 'Codex': 'codex'}.get(system, 'methods')
    points.append({
        'id': row['agent'], 'system': system,
        'model': row['model'].replace('~', ' '), 'group': group,
        'score': float(row['max']), 'cost': float(row['usd_per_episode']),
    })
assert len(points) == 29 and len({p['id'] for p in points}) == 29
assert all(p['cost'] > 0 and 20 <= p['score'] <= 90 for p in points)
data = {
    'snapshot': '2026-09-29', 'pricingSnapshot': '2026-08-30',
    'source': 'results/_analysis/rq6_cost_audit.csv',
    'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'metric': 'Normalized Max (% of reference ceiling)',
    'costMetric': 'Estimated mean USD per episode', 'points': points,
}
(SITE / 'assets/performance-cost.json').write_text(json.dumps(data, indent=2) + '\n')
print(f'Exported {len(points)} audited coordinates; no metrics recomputed.')
