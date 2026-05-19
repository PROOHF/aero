function parseTime(str) {
  const s = str.trim();
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const min = parseInt(m[1], 10);
  const sec = parseInt(m[2], 10);
  if (sec >= 60) return null;
  return min * 60 + sec;
}

function fmtTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDist(m) {
  if (m >= 1000 && m % 1000 === 0) return (m / 1000) + ' km';
  if (m >= 1000) return (m / 1000).toFixed(1) + ' km';
  return m + ' m';
}

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const val = btn.dataset.val;
    const input = document.getElementById(target);
    input.value = val;
    document.querySelectorAll(`.quick-btn[data-target="${target}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

['antal', 'langd'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    const v = this.value;
    document.querySelectorAll(`.quick-btn[data-target="${id}"]`).forEach(b => {
      b.classList.toggle('active', b.dataset.val === v);
    });
  });
});

document.getElementById('tempo').addEventListener('input', function () {
  let v = this.value.replace(/[^0-9:]/g, '');
  if (v.length === 3 && !v.includes(':') && this._prev && this._prev.length < v.length) {
    v = v.slice(0, 1) + ':' + v.slice(1);
  }
  this._prev = v;
  this.value = v;
});

document.getElementById('vila').addEventListener('input', function () {
  let v = this.value.replace(/[^0-9:]/g, '');
  if (v.length === 3 && !v.includes(':') && this._prev && this._prev.length < v.length) {
    v = v.slice(0, 1) + ':' + v.slice(1);
  }
  this._prev = v;
  this.value = v;
});

document.getElementById('starttid').addEventListener('input', function () {
  let v = this.value.replace(/[^0-9:]/g, '');
  if (v.length === 3 && !v.includes(':') && this._prev && this._prev.length < v.length) {
    v = v.slice(0, 1) + ':' + v.slice(1);
  }
  this._prev = v;
  this.value = v;
});

document.getElementById('start-check').addEventListener('change', function () {
  const f = document.getElementById('start-field');
  f.classList.toggle('visible', this.checked);
  if (!this.checked) document.getElementById('starttid').value = '';
});

document.getElementById('vila-check').addEventListener('change', function () {
  const f = document.getElementById('vila-field');
  f.classList.toggle('visible', this.checked);
  if (!this.checked) document.getElementById('vila').value = '';
});

document.getElementById('berakna').addEventListener('click', berakna);

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.classList.add('visible');
  document.getElementById('results').classList.remove('visible');
}

function clearError() {
  document.getElementById('error-msg').classList.remove('visible');
}

function berakna() {
  clearError();

  const tempoStr = document.getElementById('tempo').value;
  const antalVal = parseInt(document.getElementById('antal').value, 10);
  const langdVal = parseInt(document.getElementById('langd').value, 10);
  const vilaCheck = document.getElementById('vila-check').checked;
  const vilaStr = document.getElementById('vila').value;

  const tempoSec = parseTime(tempoStr);
  if (!tempoSec) return showError('Enter pace in MM:SS format, e.g. 4:10');
  if (!antalVal || antalVal < 1 || antalVal > 50) return showError('Enter number of intervals (1–50)');
  if (!langdVal || langdVal < 1) return showError('Enter distance per interval in metres');

  let vilaSec = 0;
  if (vilaCheck) {
    vilaSec = parseTime(vilaStr);
    if (!vilaSec && vilaSec !== 0) return showError('Enter rest time in MM:SS format, e.g. 1:30');
  }

  const startCheck = document.getElementById('start-check').checked;
  let startOffset = 0;
  if (startCheck) {
    startOffset = parseTime(document.getElementById('starttid').value);
    if (startOffset === null) return showError('Enter start time in MM:SS format, e.g. 15:00');
  }

  const intervalSec = Math.round(tempoSec * (langdVal / 1000));

  const tbody = document.getElementById('result-body');
  tbody.innerHTML = '';

  let cursor = startOffset;
  let totalDist = 0;

  for (let i = 1; i <= antalVal; i++) {
    const start = cursor;
    const stop = cursor + intervalSec;
    totalDist += langdVal;
    cursor = stop + (i < antalVal ? vilaSec : 0);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td>${formatDist(totalDist)}</td>
      <td>${fmtTime(start)}</td>
      <td>${fmtTime(stop)}</td>
    `;
    tbody.appendChild(tr);
  }

  const totalTid = antalVal * intervalSec + Math.max(0, antalVal - 1) * vilaSec;

  document.getElementById('stat-dist').textContent = formatDist(totalDist);
  document.getElementById('stat-tid').textContent = fmtTime(totalTid);

  const results = document.getElementById('results');
  results.classList.add('visible');
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}