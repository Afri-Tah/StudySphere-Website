// ══ 7. POMODORO TIMER ══
let pomoState = { running: false, focusTime: 25 * 60, breakTime: 5 * 60, timeLeft: 25 * 60, mode: 'focus', sessionsDone: 0, interval: null };
const pomoCIRC = 389.6;
function updatePomoDisplay() {
  const m = Math.floor(pomoState.timeLeft / 60); const s = pomoState.timeLeft % 60;
  document.getElementById('pomoTimeInside').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  document.getElementById('pomoMode').textContent = pomoState.mode === 'focus' ? 'FOCUS TIME' : 'BREAK TIME';
  const total = pomoState.mode === 'focus' ? pomoState.focusTime : pomoState.breakTime;
  const offset = pomoCIRC * (1 - pomoState.timeLeft / total);
  document.getElementById('pomoRing').style.strokeDashoffset = offset;
  document.getElementById('pomoSessionCount').textContent = `Session ${Math.min(pomoState.sessionsDone + 1, 4)} of 4`;
  document.querySelectorAll('.pomo-dot').forEach((d, i) => d.classList.toggle('done', i < pomoState.sessionsDone));
}
function togglePomo() {
  if (pomoState.running) {
    clearInterval(pomoState.interval); pomoState.running = false;
    document.getElementById('pomoBtn').textContent = '▶ Resume';
  } else {
    pomoState.running = true;
    document.getElementById('pomoBtn').textContent = '⏸ Pause';
    pomoState.interval = setInterval(() => {
      pomoState.timeLeft--;
      if (pomoState.timeLeft <= 0) {
        if (pomoState.mode === 'focus') { pomoState.sessionsDone++; addPoints(15, 'Completed a Pomodoro!'); if (pomoState.sessionsDone >= 4) { clearInterval(pomoState.interval); pomoState.running = false; pomoState.sessionsDone = 0; alert('🎉 4 Pomodoros done! Take a long break!'); resetPomo(); return; } pomoState.mode = 'break'; pomoState.timeLeft = pomoState.breakTime; }
        else { pomoState.mode = 'focus'; pomoState.timeLeft = pomoState.focusTime; }
        document.getElementById('pomoBtn').textContent = '▶ Start'; clearInterval(pomoState.interval); pomoState.running = false;
      }
      updatePomoDisplay();
    }, 1000);
  }
  updatePomoDisplay();
}
function resetPomo() { clearInterval(pomoState.interval); pomoState = { ...pomoState, running: false, timeLeft: 25 * 60, mode: 'focus', sessionsDone: 0, interval: null }; document.getElementById('pomoBtn').textContent = '▶ Start'; updatePomoDisplay(); }
updatePomoDisplay();

