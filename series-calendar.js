// Works out, from today's date, which exam series exist and when results are due.
// Nothing here is a hard-coded year: when the date moves on, new sessions appear.
(function (root) {
  const FIRST_YEAR = 2022;
  // end = last month/day of the exam window; pub = usual boundary publication day
  // (+1 means the following calendar year). Publication days are ESTIMATES used only
  // when the live feed is unavailable; edit them if Pearson's timetable changes.
  const RULES = {
    igcse: {
      january: { label: 'January', end: [0, 31], pub: [2, 15, 0], last: 2023 },
      june: { label: 'May/June', end: [5, 30], pub: [7, 20, 0] },
      november: { label: 'November', end: [10, 30], pub: [0, 20, 1], first: 2023 }
    },
    ial: {
      january: { label: 'January', end: [0, 31], pub: [2, 15, 0] },
      june: { label: 'May/June', end: [5, 30], pub: [7, 13, 0] },
      october: { label: 'October', end: [9, 31], pub: [1, 20, 1], first: 2016 }
    }
  };
  const sessionList = q => Object.entries(RULES[q]).map(([k, v]) => [k, v.label]);
  const endOf = (q, s, y) => { const e = RULES[q][s].end; return new Date(y, e[0], e[1], 23, 59, 59); };
  const pubOf = (q, s, y) => { const p = RULES[q][s].pub; return new Date(y + p[2], p[0], p[1]); };
  // Years whose session has already finished (so a new year appears right after the exams).
  function years(q, s, now) {
    now = now || new Date(); const out = [];
    for (let y = now.getFullYear(); y >= FIRST_YEAR; y--) if (endOf(q, s, y) <= now) out.push(y);
    return out;
  }
  const isDue = (q, s, y, now) => pubOf(q, s, y) <= (now || new Date());
  const label = (q, s, y) => `${RULES[q][s].label} ${y}`;
  // Most recent finished session whose boundaries are due, across both qualifications.
  function latestDue(now) {
    now = now || new Date(); let best = null;
    for (const q of Object.keys(RULES)) for (const s of Object.keys(RULES[q]))
      for (const y of years(q, s, now)) {
        const r = RULES[q][s];
        if ((r.first && y < r.first) || (r.last && y > r.last)) continue;
        if (isDue(q, s, y, now) && (!best || pubOf(q, s, y) > best.pub)) best = { q, s, y, pub: pubOf(q, s, y) };
      }
    return best;
  }
  root.SSCal = { sessionList, years, isDue, label, latestDue, pubOf, endOf, FIRST_YEAR };
  if (typeof module !== 'undefined') module.exports = root.SSCal;
})(typeof window !== 'undefined' ? window : globalThis);
