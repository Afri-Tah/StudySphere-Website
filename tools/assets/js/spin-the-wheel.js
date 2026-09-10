// ══ 6. SPIN THE WHEEL ══
const WHEEL_ITEMS = ['Do a past paper 📝','Teach it aloud 🗣','Draw a mind map 🧠','Make flashcards 📇','Read your notes 📖','Watch a video 📺','Practice definitions 📚','Timed recall ⏱'];
const WHEEL_COLORS = ['#4F46E5','#4338CA','#FF6B4A','#E8532F','#2ecc71','#3498db','#9b59b6','#e74c3c'];
let wheelSpinning = false;
function drawWheel(rotation) {
  rotation = rotation || 0;
  const canvas = document.getElementById('wheelCanvas'); const ctx = canvas.getContext('2d');
  const n = WHEEL_ITEMS.length; const arc = (2 * Math.PI) / n;
  ctx.clearRect(0, 0, 200, 200);
  WHEEL_ITEMS.forEach((item, i) => {
    const start = rotation + i * arc; const end = start + arc;
    ctx.beginPath(); ctx.moveTo(100, 100); ctx.arc(100, 100, 95, start, end); ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(100, 100); ctx.rotate(start + arc / 2);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Nunito,sans-serif'; ctx.textAlign = 'right'; ctx.fillText(item.split(' ')[0], 85, 4); ctx.restore();
  });
  ctx.beginPath(); ctx.arc(100,100,14,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle=WHEEL_COLORS[0]; ctx.lineWidth=3; ctx.stroke();
}
function spinWheel() {
  if (wheelSpinning) return; wheelSpinning = true;
  const totalSpins = 5 + Math.random() * 5; const totalAngle = totalSpins * 2 * Math.PI;
  const duration = 3000; const start = performance.now(); const n = WHEEL_ITEMS.length;
  let currentRot = 0;
  function animate(now) {
    const elapsed = now - start; const t = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4); currentRot = ease * totalAngle;
    drawWheel(currentRot);
    if (t < 1) { requestAnimationFrame(animate); }
    else {
      wheelSpinning = false;
      const arc = (2 * Math.PI) / n;
      const normalised = ((currentRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const idx = Math.floor(((2 * Math.PI - normalised) / arc)) % n;
      document.getElementById('wheelResult').textContent = `🎯 ${WHEEL_ITEMS[idx]}`;
      addPoints(2, 'Spun the wheel');
    }
  }
  requestAnimationFrame(animate);
}
drawWheel();

