// ==========================
//  Enroll via WhatsApp
// ==========================
function enroll(courseName, price) {
  const phoneNumber = "8801558070225";
  const message = `Hello, I want to enroll in "${courseName}" priced at BDT ${price}.`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
}

// ==========================
//  Course Filter
// ==========================
const filters = { level: 'all', subject: 'all' };

function setFilter(type, value) {
  if (filters[type] === value && value !== 'all') {
    filters[type] = 'all';
  } else {
    filters[type] = value;
  }
  updatePills();
  applyFilters();
  updateSummary();
}

function resetFilters() {
  filters.level = 'all';
  filters.subject = 'all';
  updatePills();
  applyFilters();
  updateSummary();
}

function updatePills() {
  // Level pills
  document.querySelectorAll('[data-filter="all"],[data-filter="o-level"],[data-filter="a-level"]').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === filters.level);
  });

  // Subject pills
  document.querySelectorAll('.pill:not([data-filter="all"]):not([data-filter="o-level"]):not([data-filter="a-level"])').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === filters.subject);
  });

  // All Levels pill only active when both are 'all'
  const allPill = document.querySelector('[data-filter="all"]');
  if (allPill) allPill.classList.toggle('active', filters.level === 'all' && filters.subject === 'all');
}

function applyFilters() {
  const cards = document.querySelectorAll('.course-card');
  let visible = 0;

  cards.forEach(card => {
    const cardLevel    = card.dataset.level;
    const cardSubjects = card.dataset.subjects.split(' ');

    const levelMatch   = filters.level   === 'all' || cardLevel === filters.level;
    const subjectMatch = filters.subject === 'all' || cardSubjects.includes(filters.subject);

    if (levelMatch && subjectMatch) {
      card.classList.remove('hidden');
      card.classList.add('fade-in');
      card.addEventListener('animationend', () => card.classList.remove('fade-in'), { once: true });
      visible++;
    } else {
      card.classList.add('hidden');
      card.classList.remove('fade-in');
    }
  });

  document.getElementById('no-results').style.display = visible === 0 ? 'block' : 'none';
}

function updateSummary() {
  const summary = document.getElementById('filterSummary');
  const count   = document.querySelectorAll('.course-card:not(.hidden)').length;

  if (filters.level === 'all' && filters.subject === 'all') {
    summary.innerHTML = 'Showing all courses';
    return;
  }

  let parts = [];
  if (filters.level   !== 'all') parts.push(`<span>${filters.level.toUpperCase()}</span>`);
  if (filters.subject !== 'all') {
    const label = document.querySelector(`[data-filter="${filters.subject}"]`)?.textContent.trim() || filters.subject;
    parts.push(`<span>${label}</span>`);
  }

  summary.innerHTML = `Showing ${count} course${count !== 1 ? 's' : ''} for ${parts.join(' + ')}`;
}

// ==========================
//  Smooth Scroll Navbar
// ==========================
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
