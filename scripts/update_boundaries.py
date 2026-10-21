#!/usr/bin/env python3
"""Downloads Pearson's International GCSE (9-1) and International A Level grade-boundary
PDFs, reads the tables and writes one JSON file per series into
tools/assets/gradedata/series/. Runs on GitHub Actions (see .github/workflows).

Usage:  python scripts/update_boundaries.py            (only series not yet saved)
        python scripts/update_boundaries.py --force    (re-read everything)
        python scripts/update_boundaries.py --debug    (also dump PDF text to scripts/debug/)
"""
import io, json, os, re, sys, urllib.request
import pdfplumber

BASE = 'https://qualifications.pearson.com'
PAGE = BASE + '/en/support/support-topics/results-certification/grade-boundaries.html'
OUT = 'tools/assets/gradedata/series'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; StudySphereBot/1.0)'}
MONTH = {'january': 'january', 'may': 'june', 'june': 'june', 'october': 'october', 'november': 'november'}
FORCE, DEBUG = '--force' in sys.argv, '--debug' in sys.argv


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()


def discover(text):
    """Find (qual, session, year) -> pdf url on Pearson's 'most recent' list."""
    found = {}
    pat = re.compile(r'(?<!Component )Grade Boundaries - (January|May|June|October|November) (\d{4}) - '
                     r'(International GCSE \(9-1\)|International A Level)[\s\S]{0,300}?(/content/dam/[^\s"\'<>]+?\.pdf)', re.I)
    for m in pat.finditer(text):
        q = 'igcse' if 'GCSE' in m.group(3) else 'ial'
        found[(q, MONTH[m.group(1).lower()], int(m.group(2)))] = BASE + m.group(4)
    return found


def known():
    p = os.path.join(os.path.dirname(__file__), 'known_pdfs.json')
    out = {}
    if os.path.exists(p):
        for k, u in json.load(open(p)).items():
            if k.startswith('_'): continue
            q, s, y = k.split('|'); out[(q, s, int(y))] = u
    return out


def text_lines(pdf_bytes):
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            for ln in (page.extract_text() or '').split('\n'):
                ln = ln.strip()
                if ln: yield ln


def nums(line):
    """Trailing run of numbers/dashes in a line, e.g. '200 170 150 - -' -> [200,170,150,None,None]."""
    toks, out = line.split(), []
    for t in reversed(toks):
        if re.fullmatch(r'\d+', t): out.append(int(t))
        elif t in ('-', '–', '—'): out.append(None)
        else: break
    return out[::-1]


def parse_igcse(lines):
    lines, subs, seen = list(lines), [], set()
    for i, l in enumerate(lines):
        if not re.search(r'Max Mark\s+9\s+8\s+7\s+6\s+5\s+4\s+3\s+2\s+1', l): continue
        row = next((nums(x) for x in lines[i:i + 4] if len(nums(x)) >= 10 and nums(x)[0]), None)
        if not row: continue
        row = row[-11:] if len(row) >= 11 else row[-10:]   # max + nine grades (+ U)
        mx, grades = row[0], row[1:10]
        title = next((x for x in reversed(lines[max(0, i - 3):i]) if not re.fullmatch(r'[\d\s\-–]+', x)
                      and not re.search(r'grade boundaries|Max Mark', x, re.I)), '')
        code = (re.search(r'\b4[A-Z]{2}\d\b', title) or re.search(r'\b4[A-Z]{2}\d\b', l) or [''])[0] if True else ''
        name = re.sub(r'\b4[A-Z]{2}\d\b', '', title)
        papers = re.search(r'Paper\(?s?\)?\s*(.+)$', name, re.I)
        name = re.sub(r'\s*Paper\(?s?\)?.*$', '', name, flags=re.I).strip(' -:,') or (code or f'Subject {len(subs)+1}')
        label = name + (f' (Papers {papers.group(1).strip()})' if papers else '')
        if label in seen: continue
        seen.add(label)
        bounds = {str(9 - k): v for k, v in enumerate(grades) if v is not None}
        if bounds: subs.append({'name': label, 'code': code, 'max': mx, 'bounds': bounds})
    return subs


def parse_ial(lines):
    subs, cur_a2, subj_name, order = {}, False, None, []
    for l in lines:
        if re.search(r'International A2 unit grade boundaries|A2 unit', l, re.I): cur_a2 = True
        elif re.search(r'International AS unit grade boundaries|AS unit', l, re.I): cur_a2 = False
        m = re.match(r'^([A-Z]{3}\d{2})\s+(.*)$', l)
        if m:
            n = nums(l)
            if len(n) >= 7 and n[-7]:
                n = n[-7:]                                   # max, a, b, c, d, e, u
                mx, a, b, c, d, e = n[:6]
                code = m.group(1); sname = code[:3]
                if sname not in subs: subs[sname] = {'name': sname, 'code': sname, 'units': []}; order.append(sname)
                unit_name = ' '.join(m.group(2).split()[:-7]).strip() or code
                subs[sname]['units'].append({'name': unit_name, 'code': code, 'max': mx, 'a2': cur_a2,
                                             'bounds': {'a': a, 'b': b, 'c': c, 'd': d, 'e': e}})
        elif re.match(r'^(Accounting|Biology|Business|Chemistry|Economics|English|Further|Geography|History|Information|Law|Mathematics|Physics|Psychology|Pure|Statistics|Arabic|French|Spanish|Chinese|Urdu|Bengali|Bangla|Tamil|Sinhala)', l) and not nums(l):
            subj_name = l
    return [s for s in (subs[k] for k in order) if s['units']]


def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = dict(known())
    try: jobs.update(discover(get(PAGE).decode('utf-8', 'ignore')))
    except Exception as ex: print('Could not read Pearson page:', ex)
    done = 0
    for (q, s, y), url in sorted(jobs.items(), key=lambda kv: (kv[0][2], kv[0][1])):
        path = f'{OUT}/pearson-{q}-{y}-{s}.json'
        if os.path.exists(path) and not FORCE: continue
        try:
            data = get(url if url.startswith('http') else BASE + url)
            lines = list(text_lines(data))
            if DEBUG:
                os.makedirs('scripts/debug', exist_ok=True)
                open(f'scripts/debug/{q}-{y}-{s}.txt', 'w').write('\n'.join(lines))
            subs = parse_igcse(lines) if q == 'igcse' else parse_ial(lines)
            if not subs: print(f'! {q} {s} {y}: no tables recognised, skipped ({url})'); continue
            json.dump({'board': 'pearson', 'qual': q, 'year': y, 'session': s, 'source': url, 'subjects': subs},
                      open(path, 'w'), indent=1, ensure_ascii=False)
            print(f'+ {q} {s} {y}: {len(subs)} subjects'); done += 1
        except Exception as ex:
            print(f'! {q} {s} {y}: {ex}')
    print('Done,', done, 'new file(s)')


if __name__ == '__main__':
    main()
