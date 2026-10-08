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
COHORT = SITE.parent / 'results/_analysis/opus55_full/20260929T151230Z'
performance_path = COHORT / 'provisional_performance.json'
cost_path = COHORT / 'paper_cost_analysis.json'
performance = json.loads(performance_path.read_text())
cost = json.loads(cost_path.read_text())
points.append({'id': 'opencode_claude-opus-5-5', 'system': 'OpenCode',
               'model': 'Claude Opus 5.5', 'group': 'opencode',
               'score': performance['metrics']['opencode_claude-opus-5-5']['metrics']['max'],
               'cost': cost['usd_per_episode']})
assert len(points) == 30 and len({p['id'] for p in points}) == 30
ASTRA = SITE.parent / 'results/_analysis/gpt6_astra_opencode/20261007T152233Z'
astra_performance_path = ASTRA / 'paper_analysis.json'
astra_cost_path = ASTRA / 'paper_cost_analysis.json'
astra = json.loads(astra_performance_path.read_text())
astra_cost = json.loads(astra_cost_path.read_text())
assert astra['terminal_replays_verified'] == 600 and astra['paper_scored_episodes'] == 375
assert not astra_cost['selected_cohort']['usage_complete']
billing_path = ASTRA / 'website_cost_accuracy_20261008/user-reported-total.json'
billing = json.loads(billing_path.read_text())
assert billing['status'] == 'billing_confirmed_by_user'
assert billing['total_usd'] == 150 and billing['completed_episodes'] == 600
points.append({'id': 'opencode_gpt-6-astra', 'system': 'OpenCode',
               'model': 'GPT-6 Astra', 'group': 'opencode',
               'score': astra['metrics']['max'],
               'cost': billing['total_usd'] / billing['completed_episodes'],
               'costStatus': 'billing_confirmed_by_user', 'costBasis': 'billed',
               'totalBilledUsd': billing['total_usd'], 'completedEpisodes': 600})
assert len(points) == 31 and len({p['id'] for p in points}) == 31
assert all(p['cost'] > 0 and 20 <= p['score'] <= 90 for p in points)
data = {
    'snapshot': '2026-10-08', 'pricingSnapshot': '2026-08-30',
    'source': 'results/_analysis/rq6_cost_audit.csv',
    'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'opus55': {'performanceSourceSha256': hashlib.sha256(performance_path.read_bytes()).hexdigest(),
               'costSourceSha256': hashlib.sha256(cost_path.read_bytes()).hexdigest(),
               'pricingSource': cost['pricing_source'], 'pricingAccessed': cost['pricing_accessed'],
               'usdPerMillionTokens': cost['usd_per_million_tokens'],
               'trials': 60, 'collectedEpisodes': 600, 'reportedEpisodes': 375},
    'metric': 'Normalized Max (% of reference ceiling)',
    'astra': {'performanceSourceSha256': hashlib.sha256(astra_performance_path.read_bytes()).hexdigest(),
              'costSourceSha256': hashlib.sha256(astra_cost_path.read_bytes()).hexdigest(),
              'pricingSource': astra_cost['pricing_source'], 'pricingAccessed': '2026-10-08',
              'usdPerMillionTokens': astra_cost['usd_per_million_tokens'],
              'longContextThreshold': astra_cost['long_context_threshold'],
              'longContextMultipliers': astra_cost['long_context_multipliers'],
              'uniqueUsageRecords': astra_cost['selected_cohort']['unique_native_reports'],
              'unknownUsageRecords': len(astra_cost['selected_cohort']['unknown_usage_records']),
              'trials': 60, 'collectedEpisodes': 600, 'reportedEpisodes': 375,
              'costStatus': 'billing_confirmed_by_user', 'totalBilledUsd': 150,
              'billingConfirmationSourceSha256': hashlib.sha256(billing_path.read_bytes()).hexdigest(),
              'costBasis': 'billed',
              'note': 'User-confirmed evaluation bill: USD150 total / 600 completed episodes = USD0.25 per episode. Attempt-level charges are not separately itemized. Standard-rate token reconciliation remains incomplete. Excluded from the standard-price frontier.'},
    'costMetric': 'Mean USD per completed episode; Astra billed, other configurations standard-price estimates', 'points': points, 'unplotted': [],
}
(SITE / 'assets/performance-cost.json').write_text(json.dumps(data, indent=2) + '\n')
print(f'Exported {len(points)} audited coordinates; no metrics recomputed.')
