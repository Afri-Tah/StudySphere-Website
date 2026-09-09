// ══ 9. GRADE CALCULATOR ══
let gradeBoard = 'caie', gradeLevel = 'igcse', gradeMode = 'weighted', gradeRows = [];
function setGradeBoard(board, btn) { gradeBoard = board; document.querySelectorAll('.grade-board-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateBoundaries(); }
function setGradeMode(mode, btn) { gradeMode = mode; document.querySelectorAll('.grade-mode-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateBoundaries(); }
function updateBoundaries() { gradeLevel = document.getElementById('gradeLevelSel').value; }
function addGradeRow() {
  const id = Date.now(); gradeRows.push(id);
  const div = document.createElement('div'); div.className = 'grade-row'; div.id = `gr_${id}`;
  div.innerHTML = `<input type="text" placeholder="Component (e.g. Paper 1)" style="flex:2;margin:0"><input type="number" placeholder="Score %" min="0" max="100" style="flex:1;margin:0;min-width:60px">${gradeMode==='weighted'?'<input type="number" placeholder="Weight %" min="0" max="100" style="flex:1;margin:0;min-width:60px">':''}<button class="remove-btn" onclick="removeGradeRow(${id})">✕</button>`;
  document.getElementById('gradeRows').appendChild(div);
}
function removeGradeRow(id) { const el = document.getElementById(`gr_${id}`); if (el) el.remove(); gradeRows = gradeRows.filter(r => r !== id); }
function calculateGrade() {
  const rows = document.querySelectorAll('#gradeRows .grade-row');
  if (!rows.length) { alert('Add at least one component!'); return; }
  let totalWeight = 0, weightedSum = 0, values = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input[type=number]');
    const score = parseFloat(inputs[0]?.value) || 0;
    const weight = gradeMode === 'weighted' ? (parseFloat(inputs[1]?.value) || 0) : 100 / rows.length;
    weightedSum += score * weight / 100; totalWeight += weight; values.push(score);
  });
  if (totalWeight === 0) { alert('Enter weights!'); return; }
  const avg = gradeMode === 'weighted' ? (weightedSum / totalWeight) * 100 : values.reduce((a,b)=>a+b,0)/values.length;
  const boundaries = gradeLevel === 'igcse' ? {'A*':90,'A':80,'B':70,'C':60,'D':50,'E':40} : {'A*':90,'A':80,'B':70,'C':60,'D':50,'E':40,'U':0};
  let letter = avg >= 90 ? 'A*' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : avg >= 40 ? 'E' : 'U';
  const colors = { 'A*':'#1a7a40','A':'#2ecc71','B':'#3498db','C':'#f39c12','D':'#e67e22','E':'#e74c3c','U':'#7a1a1a' };
  document.getElementById('gradeLetter').textContent = letter;
  document.getElementById('gradeLetter').style.color = colors[letter] || '#4B1F1A';
  document.getElementById('gradePct').textContent = avg.toFixed(1) + '%';
  document.getElementById('gradeMsg').textContent = `${gradeBoard === 'edexcel' ? 'Edexcel' : 'Cambridge'} ${gradeLevel.toUpperCase()} · ${totalWeight.toFixed(0)}% weighted`;
  document.getElementById('gradeBarFill').style.width = Math.min(avg, 100) + '%';
  document.getElementById('gradeResult').style.display = 'block';
  window._currentAvg = avg; window._currentWeight = totalWeight; window._gradeBoundaries = boundaries;
  const gc = document.getElementById('gradeCompare'); const gt = document.getElementById('gradeBoundaryTable'); const grades = Object.keys(boundaries);
  gt.innerHTML = `<tr>${grades.map(g=>`<th>${g}</th>`).join('')}</tr><tr>${grades.map(g=>`<td style="${avg>=boundaries[g]&&g===letter?'background:#d4f5e2;font-weight:700':''}">${boundaries[g]}%</td>`).join('')}</tr>`;
  gc.style.display = 'block';
}
function calcTarget() {
  const targetGradeKey = document.getElementById('targetGradeSelect').value;
  const compWeight = parseFloat(document.getElementById('targetCompWeight').value) || (100 - (window._currentWeight || 0));
  const compName = document.getElementById('targetCompName').value.trim() || 'remaining component';
  if (!targetGradeKey || window._currentAvg === undefined) { document.getElementById('targetResult').textContent = 'Calculate your current grade first!'; return; }
  const b = window._gradeBoundaries; const gradeMap = { astar:'A*', a:'A', b:'B', c:'C', d:'D' };
  const gradeKey = gradeMap[targetGradeKey]; let targetPct;
  if (b && b[gradeKey] !== undefined) targetPct = b[gradeKey]; else { const def={astar:90,a:80,b:70,c:60,d:50}; targetPct=def[targetGradeKey]||70; }
  const currentWeight = window._currentWeight || 0;
  const needed = ((targetPct * (currentWeight + compWeight)) - (window._currentAvg * currentWeight)) / compWeight;
  const result = document.getElementById('targetResult');
  if (needed > 100) result.innerHTML = `⚠️ To reach <strong>${gradeKey}</strong>, you'd need ${needed.toFixed(1)}% — not achievable. Aim for the next grade down.`;
  else if (needed < 0) result.innerHTML = `🎉 You've already secured <strong>${gradeKey}</strong>! Your current average exceeds the boundary.`;
  else result.innerHTML = `🎯 You need <strong>${needed.toFixed(1)}%</strong> on ${compName} to achieve grade <strong>${gradeKey}</strong> (≥${targetPct}%).`;
}
// Add initial grade rows
addGradeRow(); addGradeRow();

