// ══ 14. PROGRESS REPORT ══
let _reportText = '';
function generateReport() {
  const student = document.getElementById('rptStudent').value.trim(); const subject = document.getElementById('rptSubject').value.trim(); const period = document.getElementById('rptPeriod').value.trim(); const overall = document.getElementById('rptOverall').value;
  const att = document.getElementById('rptAtt').value; const hw = document.getElementById('rptHw').value; const part = document.getElementById('rptPart').value;
  const strengths = document.getElementById('rptStrengths').value.trim(); const improve = document.getElementById('rptImprove').value.trim();
  if (!student || !subject) { alert('Enter student name and subject!'); return; }
  const attEmoji = att >= 90 ? '🟢' : att >= 75 ? '🟡' : '🔴'; const hwEmoji = hw >= 90 ? '🟢' : hw >= 75 ? '🟡' : '🔴'; const partEmoji = part >= 80 ? '🟢' : part >= 60 ? '🟡' : '🔴';
  const gradeMsg = { 'A*':'Outstanding performance!', 'A':'Excellent work!', 'B':'Good progress.', 'C':'Satisfactory — keep pushing!', 'D':'Needs improvement.', 'U':'Urgent attention required.' };
  _reportText = `📚 *StudySphere — Progress Report*\n──────────────────────\n👤 *Student:* ${student}\n📖 *Subject:* ${subject}\n📅 *Period:* ${period||'N/A'}\n🎓 *Overall Grade:* ${overall||'N/A'}${overall?` — ${gradeMsg[overall]}`:''}\n\n📊 *Performance Metrics*\n${attEmoji} Attendance: ${att}%\n${hwEmoji} Homework: ${hw}%\n${partEmoji} Participation: ${part}%${strengths?`\n\n✅ *Strengths:*\n${strengths}`:''}${improve?`\n\n📌 *Areas to Improve:*\n${improve}`:''}\n\n─────────────────────\n📱 Contact StudySphere for queries.`;
  document.getElementById('reportPreview').style.display = 'block'; document.getElementById('reportPreview').textContent = _reportText;
}
function sendReportWA() { if (!_reportText) generateReport(); if (_reportText) window.open(`https://wa.me/?text=${encodeURIComponent(_reportText)}`, '_blank'); }

