"""Validate a Recipe SEO report. Does not contact Google or inspect a website."""
import argparse
import copy
import json
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:
    raise SystemExit('Install dependencies: python -m pip install -r docs/recipe-seo/requirements.txt')

HERE=Path(__file__).resolve().parent
SCHEMA=json.loads((HERE/'report.schema.json').read_text(encoding='utf-8'))

def validate(report):
    Draft202012Validator.check_schema(SCHEMA)
    errors=[f"{'.'.join(map(str,e.absolute_path)) or '$'}: {e.message}"
            for e in Draft202012Validator(SCHEMA,format_checker=FormatChecker()).iter_errors(report)]
    if errors:
        return errors
    def check(ok,message):
        if not ok: errors.append(message)
    evidence={e['id']:e for e in report['evidence']}
    actions={a['id']:a for a in report['actions']}
    check(len(evidence)==len(report['evidence']),'Duplicate evidence IDs')
    check(len(actions)==5,'Action IDs must be unique')
    check([a['rank'] for a in report['actions']]==[1,2,3,4,5],'Ranks must be 1-5 in order')
    check(len({a['title'].strip().casefold() for a in report['actions']})==5,'Action titles must be distinct')
    def refs(values,label):
        check(len(values)==len(set(values)),f'{label}: duplicate evidence references')
        for value in values:
            check(value in evidence,f'{label}: unknown evidence {value}')
    def methods(values):
        return {evidence[e]['method'] for e in values if e in evidence}
    for key,area in report['areas'].items():
        refs(area['evidence_ids'],key)
        if area['status'] in ('assessed','partial'):
            check(bool(methods(area['evidence_ids'])-{'access_gap'}),f'{key}: scored area requires actual evidence')
    for a in report['actions']:
        refs(a['evidence_ids'],a['id'])
        refs(a['measurement']['baseline_evidence_ids'],a['id']+' baseline')
        primary=report['areas'][a['primary_area']]
        check(a['primary_area'] not in a['related_areas'],f"{a['id']}: primary area must not be repeated as related")
        if a['kind']=='observed_issue':
            check(primary['status'] in ('assessed','partial'),f"{a['id']}: observed issue cannot belong to an untested area")
            check(a['problem_score']==primary['problem_score'],f"{a['id']}: score must match the primary area's driving issue")
            check(bool(set(a['evidence_ids']) & set(primary['evidence_ids'])),f"{a['id']}: evidence must support the primary area")
            check(bool(methods(a['evidence_ids'])-{'access_gap'}),f"{a['id']}: missing access does not establish a defect")
            for key in a['related_areas']:
                related=report['areas'][key]
                check(related['problem_score'] is not None and related['problem_score']<=a['problem_score'],f"{a['id']}: primary must be the most severe grouped area")
                check(bool(set(a['evidence_ids']) & set(related['evidence_ids'])),f"{a['id']}: related area needs supporting action evidence")
        elif a['kind']=='validation_task':
            check('access_gap' in methods(a['evidence_ids']),f"{a['id']}: validation task requires a documented gap")
        else:
            check(bool(methods(a['evidence_ids'])-{'access_gap'}),f"{a['id']}: opportunity requires actual evidence")
        m=a['measurement']
        if m['baseline'] is not None:
            check(bool(m['baseline_evidence_ids']),f"{a['id']}: supplied baseline requires evidence")
        if report['mode'] in ('audit','prepublication'):
            check(a['delivery_status']=='proposed',f"{a['id']}: review/brief mode must not claim implementation")
        if a['delivery_status']=='verified_live':
            check(bool(methods(a['evidence_ids']) & {'http','browser','rich_results_test','search_console'}),f"{a['id']}: live verification needs appropriate evidence")
    for item in report['indexing_observations']:
        refs(item['evidence_ids'],'indexing observation')
        if item['google_index_status']!='unknown':
            check('search_console' in methods(item['evidence_ids']),'Asserted Google index state requires Search Console inspection evidence')
    for b in report['recipe_briefs']:
        check(b['action_id'] in actions,'Recipe brief must link to one of the five actions')
        refs(b['evidence_ids'],'recipe brief')
        if b['demand_basis']=='measured':
            check(bool(methods(b['evidence_ids']) & {'search_console','keyword_tool'}),'Measured demand needs a suitable data source')
        if b['demand_basis']=='search_result_supported':
            check('search_results' in methods(b['evidence_ids']),'Search-result-supported demand needs actual result evidence')
    if report['scope']['search_console_access']=='unavailable':
        check(not any(e['method']=='search_console' for e in evidence.values()),'Search Console evidence conflicts with unavailable access/export')
    prior=report['previous_review']
    if prior['reference'] is None:
        check(not prior['comparable'] and not prior['changes'],'Prior comparison requires an actual prior report')
        check(all(a['previous_status']=='new' for a in actions.values()),'Prior action states require a prior report')
    for item in prior['changes']:
        refs(item['evidence_ids'],'prior change')
        if item['status']!='not_retested':
            check(bool(item['evidence_ids']),'Re-tested previous finding requires evidence')
    scores=[a['problem_score'] for a in report['areas'].values() if a['problem_score'] is not None]
    expected=max(scores) if scores else None
    check(report['overall']['problem_score']==expected,'Overall score must be the maximum scored area, or null if none')
    limited=report['scope']['constrained'] or any(a['status'] in ('partial','not_tested') for a in report['areas'].values())
    check(report['status']==('blocked' if not scores else 'partial' if limited else 'complete'),'Report status conflicts with assessment scope')
    if limited or not scores:
        check(report['overall']['provisional'],'Incomplete evidence requires provisional status')
    if not scores:
        check(report['overall']['confidence']=='unassessed','Unscored report must use unassessed confidence')
        check(all(a['kind']=='validation_task' for a in actions.values()),'Blocked report requires five validation tasks')
    else:
        check(report['overall']['confidence']!='unassessed','Scored report needs assessed confidence')
    for key,area in report['areas'].items():
        if area['problem_score'] is not None and area['problem_score']>=9:
            check(any(a['kind']=='observed_issue' and key in [a['primary_area']]+a['related_areas'] for a in actions.values()),f'{key}: severe issue omitted from the five actions')
    return errors

def self_test():
    original=json.loads((HERE/'example-report.json').read_text(encoding='utf-8'))
    cases=[]
    def case(label,change,valid=False):
        report=copy.deepcopy(original); change(report); cases.append((label,report,valid))
    case('valid synthetic example',lambda r:None,True)
    case('four actions',lambda r:r['actions'].pop())
    case('six actions',lambda r:r['actions'].append(copy.deepcopy(r['actions'][0])))
    case('missing area',lambda r:r['areas'].pop('query_intent'))
    case('invalid score',lambda r:r['actions'][0].update(problem_score=11))
    case('overall average instead of maximum',lambda r:r['overall'].update(problem_score=6))
    case('mismatched area/action score',lambda r:r['actions'][0].update(problem_score=7))
    case('duplicate action IDs',lambda r:r['actions'][1].update(id='SEO-1'))
    case('unknown evidence',lambda r:r['actions'][0].update(evidence_ids=['missing']))
    case('unknown date',lambda r:r.update(reviewed_at='yesterday'))
    case('invalid URL',lambda r:r['target'].update(url='not a URL'))
    case('unknown indexing treated as known',lambda r:r['indexing_observations'][0].update(google_index_status='indexed'))
    case('invented measured demand',lambda r:r['recipe_briefs'][0].update(demand_basis='measured'))
    case('brief not linked to action',lambda r:r['recipe_briefs'][0].update(action_id='extra-action'))
    case('baseline without evidence',lambda r:r['actions'][0]['measurement'].update(baseline='100 impressions'))
    case('audit claims implementation',lambda r:r['actions'][0].update(delivery_status='verified_live'))
    case('partial report not provisional',lambda r:r['overall'].update(provisional=False))
    case('untested area given score',lambda r:r['areas']['query_intent'].update(problem_score=1))
    case('unmeasured task given score',lambda r:r['actions'][-1].update(problem_score=5))
    case('severe omitted area',lambda r:r['areas']['onpage_content'].update(problem_score=10))
    def indexed(r):
        r['scope']['search_console_access']='export_provided'
        r['evidence'][0]['method']='search_console'
        r['indexing_observations'][0]['google_index_status']='not_indexed'
    case('sourced indexing evidence',indexed,True)
    def blocked(r):
        for a in r['areas'].values():
            a.update(status='not_tested',problem_score=None,evidence_ids=[])
        for a in r['actions']:
            a.update(kind='validation_task',problem_score=None)
        for e in r['evidence']: e['method']='access_gap'
        r['indexing_observations']=[];r['recipe_briefs']=[]
        r['overall'].update(problem_score=None,confidence='unassessed')
        r['status']='blocked'
    case('blocked access with five validation tasks',blocked,True)
    def healthy(r):
        for a in r['areas'].values():
            a.update(status='assessed',problem_score=1,evidence_ids=['E1'])
        for a in r['actions']:
            a.update(kind='opportunity',problem_score=1,evidence_ids=['E1'])
        r['overall'].update(problem_score=1,provisional=False)
        r['scope']['constrained']=False;r['status']='complete'
        r['indexing_observations']=[]
    case('healthy scope with five supported opportunities',healthy,True)
    def grouped(r):
        for action in r['actions']:
            action.update(kind='observed_issue',problem_score=9)
            area=r['areas'][action['primary_area']]
            area.update(status='partial',problem_score=9,evidence_ids=action['evidence_ids'])
        r['evidence'][-1]['method']='user_provided'
        r['areas']['rendering_delivery'].update(status='partial',problem_score=9,evidence_ids=['E1'])
        r['actions'][0]['related_areas']=['rendering_delivery']
        r['overall']['problem_score']=9
    case('six severe areas grouped into five actions',grouped,True)
    for label,report,valid in cases:
        problems=validate(report)
        if (not problems)!=valid:
            raise AssertionError(f'{label}: expected valid={valid}, errors={problems}')
    print(f'PASS: {len(cases)} report contract scenarios')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report',nargs='?',type=Path)
    parser.add_argument('--self-test',action='store_true')
    args=parser.parse_args()
    if args.self_test:self_test()
    if args.report:
        try:
            errors=validate(json.loads(args.report.read_text(encoding='utf-8-sig')))
        except (OSError,ValueError) as exc:
            raise SystemExit(f'Invalid report: {exc}')
        if errors:
            print('\n'.join(errors),file=sys.stderr);raise SystemExit(1)
        print('PASS: report schema, exactly five actions, scores, evidence, and honest indexing/demand states')
    if not args.report and not args.self_test:parser.error('Provide a report path or --self-test')

if __name__=='__main__':main()
