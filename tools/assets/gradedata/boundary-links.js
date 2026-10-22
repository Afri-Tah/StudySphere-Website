// Where to find OFFICIAL grade boundaries. Links point at Cambridge and Pearson
// only; nothing here is copied from them. Add rows to PEARSON_PDF when you find
// more direct files (keys are  qual|session|year).
(function (root) {
  const CAM = 'https://www.cambridgeinternational.org/programmes-and-qualifications/';
  const CAM_LAND = {
    igcse: CAM + 'cambridge-upper-secondary/cambridge-igcse/grade-threshold-tables/',
    olevel: CAM + 'cambridge-upper-secondary/cambridge-o-level/grade-threshold-tables/',
    alevel: CAM + 'cambridge-advanced/cambridge-international-as-and-a-levels/grade-threshold-tables/'
  };
  const PEARSON_LAND = 'https://qualifications.pearson.com/en/support/support-topics/results-certification/grade-boundaries.html';
  const PDF = 'https://qualifications.pearson.com/content/dam/pdf/Support/Grade-boundaries/';
  const JAN_NOTICE = 'https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/notice-of-changes-january-and-november-series.pdf';
  const NOV_PAGE = 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/about-international-gcses/international-gcse-november-series-from-2023.html';
  const IAL_OCT_NEWS = 'https://qualifications.pearson.com/en/news-policy/qualifications/international-advanced-levels/general-international-a-level-news/edexcel-international-advanced-level-qualifications-new-october-exam-series-from-2016.html';

  const PEARSON_PDF = {
    'igcse|january|2014': 'International-GCSE/1401-International-GCSE-grade-boundaries.pdf',
    'igcse|june|2014': 'International-GCSE/1406_International_GCSE_Grade_Boundaries.pdf',
    'igcse|january|2015': 'International-GCSE/1501-International-GCSE-Grade-Boundaries.pdf',
    'igcse|january|2016': 'International-GCSE/1601-International-GCSE-Grade-Boundaries.pdf',
    'igcse|june|2016': 'International-GCSE/1606-Int-GCSE-Grade-Boundaries-Final-V2.pdf',
    'igcse|january|2017': 'International-GCSE/international-gcse-grade-boundaries-1701.pdf',
    'igcse|june|2017': 'International-GCSE/1706-international-gcse-grade-boundaries-v2.pdf',
    'igcse|january|2018': 'International-GCSE/grade-boundaries-int-gcse-jan-18.pdf',
    'igcse|november|2025': 'International-GCSE/2511-international-gcse-subject-grade-boundaries.pdf',
    'ial|october|2017': 'International-A-level/1710-ial-grade-boundaries.pdf',
    'ial|october|2018': 'International-A-level/1810-IAL-Subject-Grade-Boundaries.pdf',
    'ial|october|2021': 'International-A-level/2110_IAL_Subject_Grade_Boundaries.pdf',
    'ial|october|2022': 'International-A-level/2210-ial-subject-grade-boundaries-v1.pdf',
    'ial|january|2026': 'International-A-level/2601-ial-subject-grade-boundaries.pdf'
  };
  const PEARSON_MODULAR = {
    'november|2024': 'International-GCSE/grade-boundaries-november-2024-int-gcse-modular.pdf',
    'june|2024': 'International-GCSE/grade-boundaries-june-2024-int-gcse-modular.pdf',
    'november|2025': 'International-GCSE/2511-international-gcse-modular-subject-grade-boundaries.pdf',
    'june|2026': 'International-GCSE/grade-boundaries-june-2026-international-gcse-modular.pdf'
  };

  const NAMES = { january: 'January', march: 'March', june: 'May/June', november: 'November', october: 'October' };
  const SESSIONS = {
    cambridge: [['march', 'February/March'], ['june', 'May/June'], ['november', 'October/November'], ['january', 'January']],
    'edexcel-igcse': [['january', 'January'], ['june', 'May/June'], ['november', 'November']],
    'edexcel-ial': [['january', 'January'], ['june', 'May/June'], ['october', 'October']]
  };
  const QUALS = {
    cambridge: [['igcse', 'IGCSE'], ['olevel', 'O Level'], ['alevel', 'AS & A Level']],
    edexcel: [['igcse', 'International GCSE (IGCSE)'], ['ial', 'International A Level (IAL)']]
  };
  const YEARS = { cambridge: [2026, 2025, 2024, 2023, 2022], edexcel: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014] };

  function sessionsFor(board, qual) { return SESSIONS[board === 'cambridge' ? 'cambridge' : 'edexcel-' + qual]; }

  function resolve(board, qual, session, year) {
    const label = `${NAMES[session]} ${year}`;
    const L = (l, u) => ({ label: l, url: u });
    const notYet = (board === 'cambridge' && year === 2026 && session === 'november') ||
                   (board === 'edexcel' && year === 2026 && (session === 'november' || session === 'october'));
    if (notYet) return { kind: 'soon', headline: `${label} boundaries are not out yet`,
      text: 'Boundaries are published after results are released. Check the official page again after your results day.',
      links: [L('Official boundaries page', board === 'cambridge' ? CAM_LAND[qual] : PEARSON_LAND)] };

    if (board === 'cambridge') {
      if (session === 'january') return { kind: 'notice', headline: 'Cambridge has no January exam series',
        text: 'Cambridge exam series are February/March, May/June and October/November. October/November results are released in January, which is easy to mix up. Pick October/November if that is your series.',
        links: [L('Cambridge grade threshold tables', CAM_LAND[qual])] };
      const land = CAM_LAND[qual];
      const exact = qual === 'igcse' ? `${land}${NAMES[session] === 'May/June' ? 'june' : session}-${year}/` : land;
      return { kind: 'ok', headline: `Cambridge ${label}`,
        text: qual === 'igcse'
          ? 'Open the page, then choose your subject. Cambridge lists a threshold for each component and for each entry option; use the option that matches your papers.'
          : `Open the tables page and choose the ${label} series, then your subject. Use the threshold for your entry option.`,
        links: [L(`Open ${label} thresholds`, exact), ...(exact !== land ? [L('All Cambridge series', land)] : [])] };
    }

    // Edexcel / Pearson
    if (qual === 'igcse') {
      if (session === 'january' && year >= 2024) return { kind: 'notice', headline: 'There is no January IGCSE series any more',
        text: 'Pearson says January 2023 was the final January series for Edexcel International GCSE. It was replaced by a November series, first held in November 2023. Choose November or May/June instead.',
        links: [L('Pearson notice of changes (PDF)', JAN_NOTICE), L('November series page', NOV_PAGE)] };
      if (session === 'november' && year < 2023) return { kind: 'notice', headline: 'The November IGCSE series started in 2023',
        text: 'Before that, Pearson ran a January series (last held January 2023). Pick January for 2022 or earlier, or choose 2023 or later for November.',
        links: [L('Pearson notice of changes (PDF)', JAN_NOTICE), L('November series page', NOV_PAGE)] };
    }
    if (qual === 'ial' && session === 'october' && year < 2016) return { kind: 'notice', headline: 'The IAL October series started in 2016',
      text: 'Choose January or May/June for earlier years.', links: [L('Pearson announcement', IAL_OCT_NEWS)] };

    const key = `${qual}|${session}|${year}`;
    const links = [];
    if (PEARSON_PDF[key]) links.push(L(`Open ${label} boundaries (PDF)`, PDF + PEARSON_PDF[key]));
    if (qual === 'igcse' && PEARSON_MODULAR[`${session}|${year}`]) links.push(L('Modular IGCSE version (PDF)', PDF + PEARSON_MODULAR[`${session}|${year}`]));
    links.push(L('Pearson grade boundaries page', PEARSON_LAND));
    const title = qual === 'igcse' ? 'International GCSE (9-1)' : 'International A Level';
    return { kind: 'ok', headline: `Pearson Edexcel ${label}`,
      text: PEARSON_PDF[key]
        ? 'Open the PDF and find your subject and paper codes.'
        : `On Pearson's page, find “Grade Boundaries – ${NAMES[session] === 'May/June' ? 'June' : NAMES[session]} ${year} – ${title}” and open it.`,
      links };
  }

  root.SS_BOUNDARY_LINKS = { QUALS, YEARS, sessionsFor, resolve };
  if (typeof module !== 'undefined') module.exports = root.SS_BOUNDARY_LINKS;
})(typeof window !== 'undefined' ? window : globalThis);
