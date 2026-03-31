
    document.getElementById('year').textContent = new Date().getFullYear();

    /* ── GRADING SCALE (National University) ── */
    function getGradeInfo(marks) {
      const m = parseFloat(marks);
      if (isNaN(m)) return { letter: '', point: null, fail: false };
      if (m >= 80)  return { letter: 'A+',  point: 4.00, fail: false };
      if (m >= 75)  return { letter: 'A',   point: 3.75, fail: false };
      if (m >= 70)  return { letter: 'A−',  point: 3.50, fail: false };
      if (m >= 65)  return { letter: 'B+',  point: 3.25, fail: false };
      if (m >= 60)  return { letter: 'B',   point: 3.00, fail: false };
      if (m >= 55)  return { letter: 'B−',  point: 2.75, fail: false };
      if (m >= 50)  return { letter: 'C+',  point: 2.50, fail: false };
      if (m >= 45)  return { letter: 'C',   point: 2.25, fail: false };
      if (m >= 40)  return { letter: 'D',   point: 2.00, fail: false };
      return        { letter: 'F',   point: 0.00, fail: true  };
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

      // Clear template
      ['tpl-name','tpl-credit','tpl-marks','tpl-retake'].forEach(id => document.getElementById(id).value = '');
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
      const row    = document.querySelector(`.course-row[data-id="${id}"]`);
      if (!row) return;
      const marks  = row.querySelector('.course-marks').value;
      const retake = row.querySelector('.course-retake').value;
      const eff    = retake !== '' ? retake : marks;
      const { fail } = getGradeInfo(eff);
      row.classList.toggle('is-fail', fail && eff !== '');
    }

    function removeCourse(id) {
      const row = document.querySelector(`.course-row[data-id="${id}"]`);
      if (row) { row.style.opacity = '0'; row.style.transform = 'translateY(-6px)'; row.style.transition = '0.25s'; setTimeout(() => row.remove(), 250); }
    }

    /* ── CALCULATE ── */
    function calculateCGPA() {
      // Auto-add the template row if it has at least marks filled in
      const tplMarks  = document.getElementById('tpl-marks').value;
      const tplCredit = document.getElementById('tpl-credit').value;
      if (tplMarks !== '' || tplCredit !== '') {
        addCourse();
      }

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
        if (!fail && point !== null) {
          totalPoints  += point * credit;
          earnedCredits += credit;
        } else if (fail) {
          failList.push(name);
        }
      });

      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
      const { letter } = getGradeInfo(parseFloat(cgpa) * 25); // approx for badge label

      // Show result
      document.getElementById('resultEmpty').style.display = 'none';
      document.getElementById('resultContent').style.display = 'block';
      document.getElementById('cgpaValue').textContent = cgpa;
      document.getElementById('creditsEarned').textContent = earnedCredits.toFixed(1);
      document.getElementById('totalCredits').textContent = totalCredits.toFixed(1);

      // Grade badge label
      let gradeLabel = '';
      const c = parseFloat(cgpa);
      if (c >= 3.75) gradeLabel = '🏆 Outstanding';
      else if (c >= 3.50) gradeLabel = '🌟 Excellent';
      else if (c >= 3.00) gradeLabel = '✅ Very Good';
      else if (c >= 2.50) gradeLabel = '📘 Good';
      else if (c >= 2.00) gradeLabel = '📗 Satisfactory';
      else gradeLabel = '⚠️ Needs Improvement';
      document.getElementById('gradeBadge').textContent = `CGPA ${cgpa} — ${gradeLabel}`;

      // Fail warning
      const fw = document.getElementById('failWarning');
      if (failList.length) {
        fw.innerHTML = `<div class="fail-warning"><span class="fail-warning-icon">⚠️</span><span>Failed course(s): <strong>${failList.join(', ')}</strong>. These credits are not counted toward your CGPA.</span></div>`;
      } else {
        fw.innerHTML = '';
      }
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
      localStorage.setItem('nu_courses', JSON.stringify(data));
      showToast('Semester saved successfully!');
    }

    function loadSemester() {
      const raw = localStorage.getItem('nu_courses');
      if (!raw) { showToast('No saved data found.', true); return; }
      document.getElementById('courses').innerHTML = '';
      courseCount = 0;
      const data = JSON.parse(raw);
      data.forEach(d => {
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
      document.getElementById('gradeTable').classList.toggle('open');
    }

    /* ── TOAST ── */
    function showToast(msg, warn = false) {
      const t = document.createElement('div');
      t.textContent = msg;
      Object.assign(t.style, {
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: '999',
        background: warn ? '#c0392b' : '#2A6B7C',
        color: 'white', padding: '0.75rem 1.3rem',
        borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        fontFamily: 'Nunito, sans-serif',
        transition: 'opacity 0.4s',
      });
      document.body.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2500);
    }
