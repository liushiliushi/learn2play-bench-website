#!/usr/bin/env python3
"""Add the frozen, audited Astra curve while retaining every existing series."""
from pathlib import Path
from math import ceil
from xml.sax.saxutils import escape
import hashlib
import json

SITE = Path(__file__).resolve().parents[1]
SOURCE = SITE.parent / 'results/_analysis/gpt6_astra_opencode/20261007T152233Z/paper_analysis.json'
data = json.loads(SOURCE.read_text())
assert data['terminal_replays_verified'] == 600 and data['paper_scored_episodes'] == 375
path = SITE / 'assets/learning-curves.json'
snapshot = json.loads(path.read_text())
snapshot.update(snapshot='2026-10-08', astraSourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest())
snapshot['source'] = 'Frozen manuscript curve snapshots; canonical and Opus 5.5 curves retained; audited GPT-6 Astra paper_analysis.json curve added; human_experiment.json weighted_curve'
for group, name in [('backbones', 'GPT-6 Astra'), ('humans', 'OpenCode · GPT-6 Astra')]:
    snapshot['groups'][group] = [s for s in snapshot['groups'][group] if s['name'] != name]
    snapshot['groups'][group].append({'name': name, 'values': data['curve']})
    series = snapshot['groups'][group]
    colors = (['#0047ab', '#2563eb', '#15803d', '#292524', '#78716c', '#a16207', '#0f6b87']
              if group == 'humans' else ['#2563eb', '#15803d', '#dc2626', '#7c3aed', '#b45309', '#be185d', '#0891b2', '#475569', '#9333ea', '#0047ab', '#0f6b87'])
    assert len(series) == len(colors)
    height = max(490, 416 + ceil(len(series) / 3) * 27)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 {height}" role="img">',
           '<title>Normalized learning curves: ' + group + '</title>',
           f'<rect width="820" height="{height}" fill="white"/>',
           '<g font-family="Arial, sans-serif" font-size="14" fill="#475569">',
           '<text x="65" y="24">Normalized score (% of reference ceiling)</text>']
    for tick in [0, 25, 50, 75, 100]:
        y = 335 - tick * 2.8
        svg += [f'<path d="M65 {y} H790" stroke="#e2e8f0"/>', f'<text x="52" y="{y+5}" text-anchor="end">{tick}</text>']
    for x, label in [(65, '0%'), (427.5, '50%'), (790, '100%')]:
        svg += [f'<text x="{x}" y="358" text-anchor="middle">{label}</text>']
    svg += ['<text x="427" y="383" text-anchor="middle">Progress through the evaluation window</text>']
    for i, s in enumerate(series):
        assert len(s['values']) == 10 and all(isinstance(v, (int, float)) for v in s['values'])
        color = colors[i]
        dash = (' stroke-dasharray="6 3"' if 'Astra' in s['name'] else
                ' stroke-dasharray="8 5"' if group == 'humans' and i == 4 else
                ' stroke-dasharray="2 4"' if group == 'humans' and i == 5 else '')
        points = [(65 + j * 725 / 9, 335 - v * 2.8) for j, v in enumerate(s['values'])]
        svg += [f'<polyline points="{" ".join(f"{x:.2f},{y:.2f}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="2.4"{dash}/>']
        svg += [f'<circle cx="{x:.2f}" cy="{y:.2f}" r="3" fill="{color}"/>' for x,y in points]
        x,y = 65 + (i % 3) * 245, 416 + (i // 3) * 27
        svg += [f'<path d="M{x} {y} h22" stroke="{color}" stroke-width="3"{dash}/>', f'<text x="{x+30}" y="{y+5}">{escape(s["name"])}</text>']
    svg += ['</g></svg>']
    (SITE / f'assets/learning-{group}.svg').write_text('\n'.join(svg))
path.write_text(json.dumps(snapshot, indent=2) + '\n')
print('Added audited Astra curve to backbones and human comparison; other series retained.')
