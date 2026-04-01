document.getElementById('year').textContent = new Date().getFullYear();

/* ── BRAC GRADING SCALE (4.0) ── */
function getGradeInfo(marks) {
  const m = parseFloat(marks);
  if (isNaN(m)) return { letter: '', point: null, fail: false };
  if (m >= 97) return { letter: 'A+',  point: 4.00, fail: false };
  if (m >= 90) return { letter: 'A', point: 4.00, fail: false };
  if (m >= 85) return { letter: 'A-', point: 3.70, fail: false };
  if (m >= 80) return { letter: 'B+',  point: 3.30, fail: false };
  if (m >= 75) return { letter: 'B', point: 3.00, fail: false };
  if (m >= 70) return { letter: 'B-', point: 2.70, fail: false };
  if (m >= 65) return { letter: 'C+',  point: 2.30, fail: false };
  if (m >= 60) return { letter: 'C', point: 2.00, fail: false };
  if (m >= 57) return { letter: 'C-', point: 1.70, fail: false };
  if (m >= 55) return { letter: 'D+',  point: 1.30, fail: false };
  if (m >= 52) return { letter: 'D',  point: 1.00, fail: false };
  if (m >= 50) return { letter: 'D-',  point: 0.70, fail: false };
  return             { letter: 'F',  point: 0.00, fail: true  };
}

/* ── TEMPLATE GRADE PREVIEW ── */
function updateTemplateGrade(input) {
  const { letter } = getGradeInfo(input.value);
  document.getElementById('tpl-grade').textContent = letter;
}

/* ── COURSE ROW BUILDER ── */
let courseCount = 0;

function addCourse() {
  const name   = document.getElementById('tpl-name').value.trim();
  const credit = document.getElementById('tpl-credit').value;
  const marks  = document.getElementById('tpl-marks').value;
  const retake = document.getElementById('tpl-retake').value;

  courseCount++;
  const id = courseCount;
  const row = document.createElement('div');
  row.className = 'course-row';
  row.dataset.id = id;

  const effectiveMarks = retake !== '' ? retake : marks;
  const { letter } = getGradeInfo(effectiveMarks);

  row.innerHTML = `
    <div class="field-group">
      <label class="field-label">Course ${id}</label>
      <input type="text" value="${name}" placeholder="Course name" class="field-input course-name" />
    </div>
    <div class="field-group">
      <label class="field-label">Credit</label>
      <input type="number" value="${credit}" placeholder="3" min="0" max="6" class="field-input course-credit" oninput="updateRowGrade(${id})" />
    </div>
    <div class="field-group">
      <label class="field-label">Marks</label>
      <div class="marks-wrap">
        <input type="number" value="${marks}" placeholder="0–100" min="0" max="100" class="field-input course-marks" oninput="updateRowGrade(${id})" />
        <span class="letter-badge row-grade-${id}">${letter}</span>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Retake</label>
      <input type="number" value="${retake}" placeholder="optional" min="0" max="100" class="field-input course-retake" oninput="updateRowGrade(${id})" />
    </div>
    <button class="remove-btn" onclick="removeCourse(${id})" title="Remove">✕</button>
  `;

  document.getElementById('courses').appendChild(row);
  updateRowFailStyle(id);
  ['tpl-name','tpl-credit','tpl-marks','tpl-retake'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('tpl-grade').textContent = '';
}

function updateRowGrade(id) {
  const row    = document.querySelector(`.course-row[data-id="${id}"]`);
  const marks  = row.querySelector('.course-marks').value;
  const retake = row.querySelector('.course-retake').value;
  const eff    = retake !== '' ? retake : marks;
  const { letter } = getGradeInfo(eff);
  row.querySelector(`.row-grade-${id}`).textContent = letter;
  updateRowFailStyle(id);
}

function updateRowFailStyle(id) {
  const row = document.querySelector(`.course-row[data-id="${id}"]`);
  if (!row) return;
  const marks  = row.querySelector('.course-marks').value;
  const retake = row.querySelector('.course-retake').value;
  const eff    = retake !== '' ? retake : marks;
  const { fail } = getGradeInfo(eff);
  row.classList.toggle('is-fail', fail && eff !== '');
}

function removeCourse(id) {
  const row = document.querySelector(`.course-row[data-id="${id}"]`);
  if (row) {
    row.style.opacity = '0'; row.style.transform = 'translateY(-6px)'; row.style.transition = '0.25s';
    setTimeout(() => row.remove(), 250);
  }
}

/* ── CALCULATE ── */
function calculateCGPA() {
  const tplMarks  = document.getElementById('tpl-marks').value;
  const tplCredit = document.getElementById('tpl-credit').value;
  if (tplMarks !== '' || tplCredit !== '') addCourse();

  const rows = document.querySelectorAll('.course-row');
  if (!rows.length) { alert('Please add at least one course first.'); return; }

  let totalPoints = 0, totalCredits = 0, earnedCredits = 0;
  const failList = [];

  rows.forEach(row => {
    const name   = row.querySelector('.course-name').value || 'Unnamed';
    const credit = parseFloat(row.querySelector('.course-credit').value) || 0;
    const marks  = row.querySelector('.course-marks').value;
    const retake = row.querySelector('.course-retake').value;
    const eff    = retake !== '' ? retake : marks;
    const { point, fail } = getGradeInfo(eff);
    totalCredits += credit;
    if (!fail && point !== null) { totalPoints += point * credit; earnedCredits += credit; }
    else if (fail) failList.push(name);
  });

  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  document.getElementById('resultEmpty').style.display = 'none';
  document.getElementById('resultContent').style.display = 'block';
  document.getElementById('cgpaValue').textContent = cgpa;
  document.getElementById('creditsEarned').textContent = earnedCredits.toFixed(1);
  document.getElementById('totalCredits').textContent = totalCredits.toFixed(1);

  const c = parseFloat(cgpa);
  const gradeLabel = c == 4.00 ? '🏆 Exeptional' : c > 3.70 ? '🌟 Excellent' : c > 3.30 ? '✅ Very Good' : c >= 3.00 ? '📘 Good' : c >= 2.00 ? '📗 Fair' : c>=1.00 ? '⚠️ Poor' : 'Fail';
  document.getElementById('gradeBadge').textContent = `CGPA ${cgpa} — ${gradeLabel}`;

  const fw = document.getElementById('failWarning');
  fw.innerHTML = failList.length
    ? `<div class="fail-warning"><span class="fail-warning-icon">⚠️</span><span>Failed course(s): <strong>${failList.join(', ')}</strong>. These credits are not counted toward your CGPA.</span></div>`
    : '';
  document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── SAVE / LOAD ── */
function saveSemester() {
  const rows = document.querySelectorAll('.course-row');
  const data = Array.from(rows).map(r => ({
    name:   r.querySelector('.course-name').value,
    credit: r.querySelector('.course-credit').value,
    marks:  r.querySelector('.course-marks').value,
    retake: r.querySelector('.course-retake').value,
  }));
  localStorage.setItem('BRAC_courses', JSON.stringify(data));
  showToast('Semester saved successfully!');
}

function loadSemester() {
  const raw = localStorage.getItem('BRAC_courses');
  if (!raw) { showToast('No saved data found.', true); return; }
  document.getElementById('courses').innerHTML = '';
  courseCount = 0;
  JSON.parse(raw).forEach(d => {
    document.getElementById('tpl-name').value   = d.name;
    document.getElementById('tpl-credit').value = d.credit;
    document.getElementById('tpl-marks').value  = d.marks;
    document.getElementById('tpl-retake').value = d.retake;
    addCourse();
  });
  showToast('Semester loaded!');
}

function clearAll() {
  if (!confirm('Clear all courses?')) return;
  document.getElementById('courses').innerHTML = '';
  courseCount = 0;
  document.getElementById('resultEmpty').style.display = 'block';
  document.getElementById('resultContent').style.display = 'none';
}

/* ── GRADE TABLE TOGGLE ── */
function toggleGradeTable() {
  const table = document.getElementById('gradeTable');
  const btn   = document.getElementById('gradeToggleBtn');
  const open  = table.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  table.setAttribute('aria-hidden', !open);
}

/* ── FAQ ACCORDION ── */
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const isOpen = item.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen);
}

/* ── TOAST ── */
function showToast(msg, warn = false) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: '999',
    background: warn ? '#c0392b' : '#2A6B7C', color: 'white',
    padding: '0.75rem 1.3rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)', fontFamily: 'Nunito, sans-serif', transition: 'opacity 0.4s',
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2500);
}
