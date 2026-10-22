// Grade maths only (no page code), so it can be tested on its own.
(function (root) {
  const num = v => (v === '' || v === null || v === undefined) ? NaN : Number(v);

  // bands: [{grade, min}] in any order. Returns the highest band reached, else U.
  function gradeFromPercent(pct, bands) {
    const sorted = bands.slice().sort((a, b) => b.min - a.min);
    for (const b of sorted) if (pct >= b.min) return b.grade;
    return 'U';
  }

  // Smallest band above the current percent, and how far away it is.
  function nextGrade(pct, bands) {
    const above = bands.filter(b => b.min > pct).sort((a, b) => a.min - b.min)[0];
    return above ? { grade: above.grade, needPct: +(above.min - pct).toFixed(2) } : null;
  }

  // rows: [{mark, max, weight}]. Weight is optional; when blank it defaults to
  // the paper's max mark, which gives a plain total of raw marks.
  function computeMarks(rows) {
    const errors = []; let sum = 0, wsum = 0, earned = 0, possible = 0;
    rows.forEach((r, i) => {
      const mark = num(r.mark), max = num(r.max);
      if (isNaN(mark) && isNaN(max)) return;           // empty row: ignore
      if (isNaN(mark) || isNaN(max) || max <= 0) { errors.push(`Row ${i + 1}: enter a mark and a maximum above 0.`); return; }
      if (mark < 0 || mark > max) { errors.push(`Row ${i + 1}: mark must be between 0 and ${max}.`); return; }
      const w = isNaN(num(r.weight)) || num(r.weight) <= 0 ? max : num(r.weight);
      sum += (mark / max) * w; wsum += w; earned += mark; possible += max;
    });
    if (!wsum && !errors.length) errors.push('Add at least one paper with a mark.');
    return { percent: wsum ? (sum / wsum) * 100 : 0, earned, possible, errors };
  }

  // units: [{ums, max, a2}]
  function computeUMS(units, bands, a2Min) {
    const errors = []; let got = 0, tot = 0, a2got = 0, a2tot = 0;
    units.forEach((u, i) => {
      const ums = num(u.ums), max = num(u.max);
      if (isNaN(ums) && isNaN(max)) return;
      if (isNaN(ums) || isNaN(max) || max <= 0) { errors.push(`Unit ${i + 1}: enter a UMS and a maximum above 0.`); return; }
      if (ums < 0 || ums > max) { errors.push(`Unit ${i + 1}: UMS must be between 0 and ${max}.`); return; }
      got += ums; tot += max;
      if (u.a2) { a2got += ums; a2tot += max; }
    });
    if (!tot && !errors.length) errors.push('Add at least one unit with a UMS score.');
    const percent = tot ? (got / tot) * 100 : 0;
    const a2Percent = a2tot ? (a2got / a2tot) * 100 : null;
    let grade = gradeFromPercent(percent, bands);
    if (grade === 'A' && a2Percent !== null && a2Percent >= a2Min) grade = 'A*';
    return { percent, a2Percent, grade, got, tot, errors };
  }


  // ---- Official subject mode -------------------------------------------------
  // bounds: {"9":168,"8":150,...}  (minimum raw mark for each grade)
  function linearGrade(total, bounds) {
    const g = Object.entries(bounds).map(([k, v]) => ({ grade: k, min: Number(v) })).sort((a, b) => b.min - a.min);
    for (const b of g) if (total >= b.min) return b.grade;
    return 'U';
  }
  function marksToNext(total, bounds) {
    const above = Object.entries(bounds).map(([k, v]) => ({ grade: k, min: Number(v) }))
      .filter(b => b.min > total).sort((a, b) => a.min - b.min)[0];
    return above ? { grade: above.grade, marks: above.min - total } : null;
  }
  // Raw mark -> UMS for one unit. b = {a,b,c,d,e} raw boundaries; a=80%, b=70%, c=60%, d=50%, e=40% of umsMax,
  // full marks = 100%, joined by straight lines (the way Pearson converts raw marks to UMS).
  function unitUMS(raw, max, b, umsMax) {
    umsMax = umsMax || 100;
    const pts = [[0, 0], [b.e, 0.4], [b.d, 0.5], [b.c, 0.6], [b.b, 0.7], [b.a, 0.8], [max, 1]];
    if (raw >= max) return umsMax;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (raw <= x1) return Math.round((y0 + (y1 - y0) * (x1 === x0 ? 1 : (raw - x0) / (x1 - x0))) * umsMax);
    }
    return umsMax;
  }
  // units: [{raw, max, bounds, umsMax, a2}] (only units the student has entered)
  function computeIAL(units, a2Min) {
    let got = 0, tot = 0, a2g = 0, a2t = 0; const per = [];
    units.forEach(u => {
      const um = u.umsMax || 100, v = unitUMS(u.raw, u.max, u.bounds, um);
      per.push(v); got += v; tot += um; if (u.a2) { a2g += v; a2t += um; }
    });
    const percent = tot ? got / tot * 100 : 0, a2p = a2t ? a2g / a2t * 100 : null;
    let grade = gradeFromPercent(percent, [{grade:'A',min:80},{grade:'B',min:70},{grade:'C',min:60},{grade:'D',min:50},{grade:'E',min:40}]);
    if (grade === 'A' && a2p !== null && a2p >= (a2Min || 90)) grade = 'A*';
    return { per, got, tot, percent, a2Percent: a2p, grade };
  }

  root.SSGrade = { gradeFromPercent, nextGrade, computeMarks, computeUMS, linearGrade, marksToNext, unitUMS, computeIAL };
  if (typeof module !== 'undefined') module.exports = root.SSGrade;
})(typeof window !== 'undefined' ? window : globalThis);
