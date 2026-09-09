// ══ 1. ASK A QUESTION ══
let selectedInstr = null;
function selectInstr(btn, name, subjects, phone) {
  document.querySelectorAll('.instructor-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected'); selectedInstr = { name, subjects, phone };
}
function sendQuestion() {
  const q = document.getElementById('studentQ').value.trim();
  const name = document.getElementById('studentName').value.trim();
  if (!q) { alert('Please type your question!'); return; }
  if (!selectedInstr) { alert('Please select an instructor first!'); return; }
  const msg = `Hello ${selectedInstr.name}! ${name ? `I'm ${name}. ` : ''}I have a question about ${selectedInstr.subjects}:\n\n"${q}"`;
  window.open(`https://wa.me/${selectedInstr.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  addPoints(2, 'Asked a question');
}

