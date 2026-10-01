"""Validate report shape, scores, coverage, and cross references. No network or site access."""
import argparse
import copy
import json
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:
    raise SystemExit('Install validation dependencies: python -m pip install -r docs/website-reviewer/requirements.txt')

HERE = Path(__file__).resolve().parent
SPEC = json.loads((HERE / 'agent.json').read_text(encoding='utf-8'))
SCHEMA = json.loads((HERE / 'report.schema.json').read_text(encoding='utf-8'))
WEIGHTS = {x['id']: x['weight'] for x in SPEC['dimensions']}

def half(value, digits=0):
    return float(Decimal(str(value)).quantize(Decimal('1').scaleb(-digits), rounding=ROUND_HALF_UP))

def score(observation):
    if observation['critical_override']:
        return 10
    total = sum(Decimal(w) * (observation[k] - 1) for k, w in
                [('impact', '0.5'), ('reach', '0.3'), ('persistence', '0.2')])
    return int(half(Decimal(1) + Decimal(9) * total / Decimal(4)))

def calculated_overall(report):
    dims = report['dimensions']
    applicable = sum(WEIGHTS[k] for k, v in dims.items() if v['status'] != 'not_applicable')
    scored = sum(WEIGHTS[k] for k, v in dims.items() if v['problem_score'] is not None)
    full = sum(WEIGHTS[k] for k, v in dims.items() if v['status'] == 'assessed')
    weighted = sum(WEIGHTS[k] * v['problem_score'] for k, v in dims.items() if v['problem_score'] is not None)
    result = half(Decimal(weighted) / scored, 1) if scored else None
    if any(o['critical_override'] for o in report['observations']):
        result = 10
    return result, half(Decimal(scored) * 100 / applicable, 1) if applicable else 0, half(Decimal(full) * 100 / applicable, 1) if applicable else 0

def validate(report):
    Draft202012Validator.check_schema(SCHEMA)
    errors = [f"{'.'.join(map(str, e.absolute_path)) or '$'}: {e.message}"
              for e in Draft202012Validator(SCHEMA, format_checker=FormatChecker()).iter_errors(report)]
    if errors:
        return errors
    def check(condition, message):
        if not condition:
            errors.append(message)
    def index(items, label):
        result = {x['id']: x for x in items}
        check(len(result) == len(items), f'{label}: duplicate IDs')
        return result
    evidence = index(report['evidence'], 'evidence')
    observations = index(report['observations'], 'observations')
    improvements = index(report['improvements'], 'improvements')
    check(sum(WEIGHTS.values()) == 100, 'Agent dimension weights must total 100')
    def refs(items, pool, label):
        check(len(items) == len(set(items)), f'{label}: duplicate references')
        for value in items:
            check(value in pool, f'{label}: unknown reference {value}')
    for o in observations.values():
        refs(o['evidence_ids'], evidence, o['id'])
        check(o['problem_score'] == score(o), f"{o['id']}: incorrect defect score")
        check(bool(o['critical_reason']) == o['critical_override'], f"{o['id']}: critical reason/override mismatch")
        check(any(evidence.get(e, {}).get('method') != 'access_gap' for e in o['evidence_ids']), f"{o['id']}: access gaps alone cannot prove a defect")
    for k, dim in report['dimensions'].items():
        refs(dim['evidence_ids'], evidence, k)
        refs(dim['observation_ids'], observations, k)
        expected = {o['id'] for o in observations.values() if o['dimension'] == k}
        check(set(dim['observation_ids']) == expected, f'{k}: observation membership mismatch')
        if dim['status'] in ('assessed', 'partial'):
            expected_score = max((observations[o]['problem_score'] for o in expected), default=1)
            check(dim['problem_score'] == expected_score, f'{k}: incorrect dimension score')
            check(any(evidence.get(e, {}).get('method') != 'access_gap' for e in dim['evidence_ids']), f'{k}: assessed dimension needs actual evidence')
    check([x['rank'] for x in report['improvements']] == [1, 2, 3, 4, 5], 'Improvement ranks must be 1 through 5 in order')
    check(len({x['title'].casefold().strip() for x in report['improvements']}) == 5, 'Improvement titles must be distinct')
    for action in improvements.values():
        refs(action['evidence_ids'], evidence, action['id'])
        refs(action['observation_ids'], observations, action['id'])
        linked = [observations[o] for o in action['observation_ids'] if o in observations]
        if action['kind'] == 'observed_defect' and linked:
            check(action['problem_score'] == max(o['problem_score'] for o in linked), f"{action['id']}: action score must equal its highest defect score")
            check(action['primary_dimension'] in {o['dimension'] for o in linked}, f"{action['id']}: primary dimension must match a linked defect")
            linked_evidence = {e for o in linked for e in o['evidence_ids']}
            check(bool(set(action['evidence_ids']) & linked_evidence), f"{action['id']}: needs evidence supporting its defects")
        if action['kind'] == 'opportunity':
            check(any(evidence.get(e, {}).get('method') != 'access_gap' for e in action['evidence_ids']), f"{action['id']}: opportunity needs actual evidence")
        if action['kind'] == 'validation_task':
            check(any(evidence.get(e, {}).get('method') == 'access_gap' for e in action['evidence_ids']), f"{action['id']}: validation task needs a documented evidence gap")
    covered = {o for x in improvements.values() for o in x['observation_ids']}
    for o in observations.values():
        check(not o['critical_override'] or o['id'] in covered, f"{o['id']}: critical defect omitted from action plan")
    for item in report['strengths'] + report['competitors'] + report['previous_review']['changes']:
        refs(item['evidence_ids'], evidence, 'supporting context')
    prev = report['previous_review']
    if not prev['comparable']:
        check(prev['overall_score_delta'] is None, 'Incomparable reviews cannot have an overall score delta')
    if prev['reference'] is None:
        check(not prev['comparable'] and not prev['changes'], 'Prior-review comparison requires a prior report reference')
        check(all(a['previous_status'] == 'new' for a in improvements.values()), 'No prior report: improvement statuses must be new')
    overall_score, coverage, full = calculated_overall(report)
    actual = report['overall']
    check(actual['problem_score'] == overall_score, 'Incorrect overall score')
    check(actual['scored_coverage_percent'] == coverage, 'Incorrect scored coverage')
    check(actual['full_coverage_percent'] == full, 'Incorrect full coverage')
    limited = report['scope']['sample_constrained'] or any(d['status'] in ('partial', 'not_tested') for d in report['dimensions'].values())
    if limited or overall_score is None:
        check(actual['provisional'], 'Incomplete evidence must have a provisional score')
    if overall_score is None:
        check(report['review_status'] == 'blocked', 'No scored dimensions: review_status must be blocked')
        check(actual['confidence'] == 'unassessed', 'No scored dimensions: confidence must be unassessed')
        check(all(a['kind'] == 'validation_task' for a in improvements.values()), 'Blocked review must contain five validation tasks')
    else:
        check(actual['confidence'] != 'unassessed', 'Scored review must state an assessed confidence')
        check(report['review_status'] == ('partial' if limited else 'complete'), 'review_status does not match assessment scope')
    return errors

def self_test():
    source = json.loads((HERE / 'example-report.json').read_text(encoding='utf-8'))
    cases = []
    def case(name, mutate, valid=False):
        value = copy.deepcopy(source)
        mutate(value)
        cases.append((name, value, valid))
    case('valid synthetic report', lambda r: None, True)
    case('four actions', lambda r: r['improvements'].pop())
    case('six actions', lambda r: r['improvements'].append(copy.deepcopy(r['improvements'][0])))
    case('score outside range', lambda r: r['observations'][0].update(problem_score=11))
    case('wrong score arithmetic', lambda r: r['observations'][0].update(problem_score=1))
    case('wrong overall arithmetic', lambda r: r['overall'].update(problem_score=1))
    case('wrong coverage', lambda r: r['overall'].update(scored_coverage_percent=100))
    case('unknown evidence', lambda r: r['improvements'][0].update(evidence_ids=['missing']))
    case('invalid timestamp', lambda r: r.update(reviewed_at='yesterday'))
    case('invalid target URL', lambda r: r['target'].update(url='not a URL'))
    case('duplicate evidence IDs', lambda r: r['evidence'].append(copy.deepcopy(r['evidence'][0])))
    case('unknown dimension', lambda r: r['dimensions'].update(other=copy.deepcopy(r['dimensions']['navigation'])))
    case('missing dimension', lambda r: r['dimensions'].pop('navigation'))
    case('untested dimension given pass', lambda r: r['dimensions']['performance'].update(problem_score=1))
    case('incomplete score not provisional', lambda r: r['overall'].update(provisional=False))
    case('invalid rank order', lambda r: r['improvements'][0].update(rank=2))
    case('invented prior comparison', lambda r: r['previous_review'].update(comparable=True, overall_score_delta=-2))
    def critical(r):
        r['observations'][0].update(critical_override=True, critical_reason='Synthetic essential journey outage for override test.', problem_score=10)
        r['dimensions']['accessibility']['problem_score'] = 10
        r['improvements'][0]['problem_score'] = 10
        r['overall']['problem_score'] = 10
    case('critical override', critical, True)
    def hidden_critical(r):
        critical(r)
        r['improvements'][0].update(observation_ids=['O2'], primary_dimension='mobile_friendliness', problem_score=r['observations'][1]['problem_score'], evidence_ids=['E2'])
    case('critical omitted', hidden_critical)
    def blocked(r):
        r['observations'] = []
        for d in r['dimensions'].values():
            d.update(status='not_tested', problem_score=None, evidence_ids=[], observation_ids=[])
        r['review_status'] = 'blocked'
        r['overall'].update(problem_score=None, confidence='unassessed', scored_coverage_percent=0, full_coverage_percent=0)
        for e in r['evidence']:
            e.update(method='access_gap', fact='Synthetic missing evidence for validation testing.')
        for a in r['improvements']:
            a.update(kind='validation_task', problem_score=None, score_basis='unmeasured', observation_ids=[])
    case('blocked with five validation tasks', blocked, True)
    def no_evidence_pass(r):
        blocked(r)
        r['overall']['problem_score'] = 1
    case('blocked falsely scored healthy', no_evidence_pass)
    def opportunity(r):
        removed = r['observations'].pop()
        r['dimensions'][removed['dimension']].update(problem_score=1, observation_ids=[])
        r['improvements'][-1].update(kind='opportunity', problem_score=1, score_basis='no_observed_defect', observation_ids=[])
        r['overall']['problem_score'] = calculated_overall(r)[0]
    case('opportunity without fabricated defect', opportunity, True)
    def healthy(r):
        r['observations'] = []
        for d in r['dimensions'].values():
            d.update(status='assessed', problem_score=1, evidence_ids=['E1'], observation_ids=[])
        for a in r['improvements']:
            a.update(kind='opportunity', problem_score=1, score_basis='no_observed_defect', observation_ids=[])
        r['scope']['sample_constrained'] = False
        r['review_status'] = 'complete'
        r['overall'].update(problem_score=1, provisional=False, scored_coverage_percent=100, full_coverage_percent=100)
    case('healthy inspected scope with five opportunities', healthy, True)
    def missing_opportunity_evidence(r):
        opportunity(r)
        r['evidence'][-1]['method'] = 'access_gap'
    case('opportunity supported only by missing evidence', missing_opportunity_evidence)
    for name, value, valid in cases:
        errors = validate(value)
        if (not errors) != valid:
            raise AssertionError(f'{name}: expected valid={valid}; errors={errors}')
    # Factor boundary and half-up behavior are independent from the fixture.
    assert score({'impact':1,'reach':1,'persistence':1,'critical_override':False}) == 1
    assert score({'impact':5,'reach':5,'persistence':5,'critical_override':False}) == 10
    assert score({'impact':3,'reach':3,'persistence':3,'critical_override':False}) == 6
    assert half(Decimal('6.25'), 1) == 6.3
    print(f'PASS: {len(cases)} report cases and 4 scoring boundary checks')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report', nargs='?', type=Path)
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
    if args.report:
        try:
            report = json.loads(args.report.read_text(encoding='utf-8-sig'))
            errors = validate(report)
        except (OSError, ValueError) as exc:
            raise SystemExit(f'Invalid report: {exc}')
        if errors:
            print('\n'.join(errors), file=sys.stderr)
            raise SystemExit(1)
        print('PASS: report schema, exactly five improvements, scores, coverage, and evidence references')
    if not args.self_test and not args.report:
        parser.error('Provide a report path or --self-test')

if __name__ == '__main__':
    main()
