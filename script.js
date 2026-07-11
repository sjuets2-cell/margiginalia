// ============================================================
// Marginalia v2 — tool logic (vanilla JS, no dependencies)
// ============================================================

/* ---------- helper: copy to clipboard ---------- */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-copy');
    const el = document.getElementById(targetId);
    const value = el.value;
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1200);
    });
  });
});

/* ---------- tool filter / search ---------- */
(() => {
  const input = document.getElementById('tool-filter');
  if (!input) return;
  const cards = Array.from(document.querySelectorAll('.tool-card'));
  const noResults = document.getElementById('no-results');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach(card => {
      const haystack = card.getAttribute('data-search') || '';
      const match = q === '' || haystack.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  });
})();

/* ---------- 01: word & character counter ---------- */
(() => {
  const input = document.getElementById('counter-input');
  if (!input) return;
  const words = document.getElementById('stat-words');
  const chars = document.getElementById('stat-chars');
  const nospace = document.getElementById('stat-nospace');
  const sentences = document.getElementById('stat-sentences');
  const time = document.getElementById('stat-time');

  function update() {
    const text = input.value;
    const wordList = text.trim().length ? text.trim().split(/\s+/) : [];
    const sentenceList = text.trim().length ? text.trim().split(/[.!?]+/).filter(s => s.trim().length) : [];
    const wordCount = wordList.length;
    words.textContent = wordCount;
    chars.textContent = text.length;
    nospace.textContent = text.replace(/\s/g, '').length;
    sentences.textContent = sentenceList.length;
    const seconds = Math.max(1, Math.round((wordCount / 200) * 60));
    time.textContent = seconds < 60 ? `${seconds}s` : `${Math.round(seconds/60)}m`;
  }
  input.addEventListener('input', update);
  update();
})();

/* ---------- 02: case converter ---------- */
(() => {
  const input = document.getElementById('case-input');
  const output = document.getElementById('case-output');
  if (!input) return;

  function toTitle(s) { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
  function toSentence(s) {
    const lower = s.toLowerCase();
    return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  }
  function toCamel(s) {
    return s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
  }
  function toSnake(s) {
    return s.trim()
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s\-]+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  }
  function toKebab(s) { return toSnake(s).replace(/_/g, '-'); }

  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-case');
      const text = input.value;
      let result = '';
      switch (mode) {
        case 'upper': result = text.toUpperCase(); break;
        case 'lower': result = text.toLowerCase(); break;
        case 'title': result = toTitle(text); break;
        case 'sentence': result = toSentence(text); break;
        case 'camel': result = toCamel(text); break;
        case 'snake': result = toSnake(text); break;
        case 'kebab': result = toKebab(text); break;
      }
      output.value = result;
    });
  });
})();

/* ---------- 03: JSON formatter ---------- */
(() => {
  const input = document.getElementById('json-input');
  if (!input) return;
  const output = document.getElementById('json-output');
  const status = document.getElementById('json-status');

  function parseOrError() {
    try {
      const parsed = JSON.parse(input.value);
      status.textContent = 'Valid JSON';
      status.className = 'status ok';
      return parsed;
    } catch (e) {
      status.textContent = 'Invalid JSON — ' + e.message;
      status.className = 'status error';
      return undefined;
    }
  }

  document.getElementById('json-format').addEventListener('click', () => {
    const parsed = parseOrError();
    if (parsed !== undefined) output.value = JSON.stringify(parsed, null, 2);
  });
  document.getElementById('json-minify').addEventListener('click', () => {
    const parsed = parseOrError();
    if (parsed !== undefined) output.value = JSON.stringify(parsed);
  });
})();

/* ---------- 04: Base64 ---------- */
(() => {
  const input = document.getElementById('b64-input');
  if (!input) return;
  const output = document.getElementById('b64-output');
  const status = document.getElementById('b64-status');

  document.getElementById('b64-encode').addEventListener('click', () => {
    try {
      output.value = btoa(unescape(encodeURIComponent(input.value)));
      status.textContent = '';
    } catch (e) {
      status.textContent = 'Could not encode this input.';
      status.className = 'status error';
    }
  });
  document.getElementById('b64-decode').addEventListener('click', () => {
    try {
      output.value = decodeURIComponent(escape(atob(input.value)));
      status.textContent = '';
    } catch (e) {
      status.textContent = 'Not valid Base64.';
      status.className = 'status error';
    }
  });
})();

/* ---------- 05: URL encode/decode ---------- */
(() => {
  const input = document.getElementById('url-input');
  if (!input) return;
  const output = document.getElementById('url-output');

  document.getElementById('url-encode').addEventListener('click', () => {
    output.value = encodeURIComponent(input.value);
  });
  document.getElementById('url-decode').addEventListener('click', () => {
    try { output.value = decodeURIComponent(input.value); }
    catch (e) { output.value = 'Could not decode this input.'; }
  });
})();

/* ---------- 06: password generator ---------- */
(() => {
  const lengthInput = document.getElementById('pw-length');
  if (!lengthInput) return;
  const lengthVal = document.getElementById('pw-length-val');
  const output = document.getElementById('pw-output');
  const upper = document.getElementById('pw-upper');
  const lower = document.getElementById('pw-lower');
  const numbers = document.getElementById('pw-numbers');
  const symbols = document.getElementById('pw-symbols');

  lengthInput.addEventListener('input', () => { lengthVal.textContent = lengthInput.value; });

  const SETS = {
    upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    lower: 'abcdefghijkmnopqrstuvwxyz',
    numbers: '23456789',
    symbols: '!@#$%^&*()-_=+[]{}?'
  };

  function generate() {
    let pool = '';
    if (upper.checked) pool += SETS.upper;
    if (lower.checked) pool += SETS.lower;
    if (numbers.checked) pool += SETS.numbers;
    if (symbols.checked) pool += SETS.symbols;
    if (!pool) { output.value = 'Select at least one character set.'; return; }

    const len = parseInt(lengthInput.value, 10);
    const bytes = new Uint32Array(len);
    crypto.getRandomValues(bytes);
    let result = '';
    for (let i = 0; i < len; i++) result += pool[bytes[i] % pool.length];
    output.value = result;
  }

  document.getElementById('pw-generate').addEventListener('click', generate);
})();

/* ---------- 07: slug generator ---------- */
(() => {
  const input = document.getElementById('slug-input');
  if (!input) return;
  const output = document.getElementById('slug-output');

  function slugify(s) {
    return s.toString().trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  input.addEventListener('input', () => { output.value = slugify(input.value); });
})();

/* ---------- 08: lorem ipsum generator ---------- */
(() => {
  const countInput = document.getElementById('lorem-count');
  if (!countInput) return;
  const countVal = document.getElementById('lorem-count-val');
  const output = document.getElementById('lorem-output');

  countInput.addEventListener('input', () => { countVal.textContent = countInput.value; });

  const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod ' +
    'tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud ' +
    'exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure ' +
    'reprehenderit in voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint ' +
    'occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');

  function randomSentence() {
    const len = 6 + Math.floor(Math.random() * 10);
    let words = [];
    for (let i = 0; i < len; i++) words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    let sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  }
  function randomParagraph() {
    const len = 3 + Math.floor(Math.random() * 4);
    let sentences = [];
    for (let i = 0; i < len; i++) sentences.push(randomSentence());
    return sentences.join(' ');
  }

  document.getElementById('lorem-generate').addEventListener('click', () => {
    const n = parseInt(countInput.value, 10);
    let paragraphs = [];
    for (let i = 0; i < n; i++) paragraphs.push(randomParagraph());
    output.value = paragraphs.join('\n\n');
  });
})();

/* ---------- 09: regex tester ---------- */
(() => {
  const runBtn = document.getElementById('regex-run');
  if (!runBtn) return;
  const patternInput = document.getElementById('regex-pattern');
  const flagsInput = document.getElementById('regex-flags');
  const testInput = document.getElementById('regex-test');
  const status = document.getElementById('regex-status');
  const highlight = document.getElementById('regex-highlight');

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  runBtn.addEventListener('click', () => {
    const pattern = patternInput.value;
    const flags = flagsInput.value;
    const text = testInput.value;
    if (!pattern) { status.textContent = 'Enter a pattern.'; status.className = 'status error'; return; }

    let re;
    try {
      re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    } catch (e) {
      status.textContent = 'Invalid regex — ' + e.message;
      status.className = 'status error';
      highlight.innerHTML = '';
      return;
    }

    let matchCount = 0;
    let lastIndex = 0;
    let out = '';
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      out += escapeHtml(text.slice(lastIndex, m.index));
      out += '<mark>' + escapeHtml(m[0] || '') + '</mark>';
      lastIndex = m.index + (m[0].length || 1);
      matchCount++;
      if (m[0].length === 0) re.lastIndex++;
      if (matchCount > 5000) break;
    }
    out += escapeHtml(text.slice(lastIndex));
    highlight.innerHTML = out || '<span style="color:var(--ink-soft)">No text to search.</span>';
    status.textContent = matchCount + (matchCount === 1 ? ' match' : ' matches');
    status.className = 'status ok';
  });
})();

/* ---------- 10: color converter ---------- */
(() => {
  const input = document.getElementById('color-input');
  if (!input) return;
  const status = document.getElementById('color-status');
  const swatch = document.getElementById('color-swatch');
  const hexOut = document.getElementById('color-hex');
  const rgbOut = document.getElementById('color-rgb');
  const hslOut = document.getElementById('color-hsl');

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return null;
    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function parseColor(val) {
    val = val.trim();
    if (/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(val)) {
      const rgb = hexToRgb(val);
      if (rgb) return rgb;
    }
    let m = val.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    m = val.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i);
    if (m) return hslToRgb(+m[1], +m[2], +m[3]);
    return null;
  }

  function updateFrom(val) {
    const rgb = parseColor(val);
    if (!rgb) {
      status.textContent = val ? 'Could not recognize that color format.' : '';
      status.className = 'status error';
      return;
    }
    status.textContent = '';
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    swatch.style.background = hex;
    hexOut.value = hex;
    rgbOut.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslOut.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  input.addEventListener('input', () => updateFrom(input.value));
  updateFrom('#E8722C');
  input.value = '#E8722C';
})();

/* ---------- 11: unix timestamp converter ---------- */
(() => {
  const tsInput = document.getElementById('ts-input');
  if (!tsInput) return;
  const tsDateOutput = document.getElementById('ts-date-output');
  const dateInput = document.getElementById('date-input');
  const tsOutput = document.getElementById('ts-output');

  dateInput.type = 'datetime-local';

  document.getElementById('ts-to-date').addEventListener('click', () => {
    const raw = tsInput.value.trim();
    const num = Number(raw);
    if (!raw || isNaN(num)) { tsDateOutput.value = 'Enter a valid Unix timestamp.'; return; }
    const ms = raw.length > 10 ? num : num * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { tsDateOutput.value = 'Could not parse that timestamp.'; return; }
    tsDateOutput.value = `Local: ${d.toLocaleString()}  |  UTC: ${d.toUTCString()}`;
  });

  document.getElementById('date-to-ts').addEventListener('click', () => {
    const val = dateInput.value;
    if (!val) { tsOutput.value = 'Pick a date and time first.'; return; }
    const d = new Date(val);
    if (isNaN(d.getTime())) { tsOutput.value = 'Could not parse that date.'; return; }
    tsOutput.value = Math.floor(d.getTime() / 1000).toString();
  });
})();

/* ---------- 12: text diff (line-based) ---------- */
(() => {
  const runBtn = document.getElementById('diff-run');
  if (!runBtn) return;
  const a = document.getElementById('diff-a');
  const b = document.getElementById('diff-b');
  const out = document.getElementById('diff-output');

  function diffLines(aLines, bLines) {
    const m = aLines.length, n = bLines.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        dp[i][j] = aLines[i] === bLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const result = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (aLines[i] === bLines[j]) { result.push({ type: 'same', text: aLines[i] }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: 'del', text: aLines[i] }); i++; }
      else { result.push({ type: 'add', text: bLines[j] }); j++; }
    }
    while (i < m) { result.push({ type: 'del', text: aLines[i] }); i++; }
    while (j < n) { result.push({ type: 'add', text: bLines[j] }); j++; }
    return result;
  }

  runBtn.addEventListener('click', () => {
    const aLines = a.value.split('\n');
    const bLines = b.value.split('\n');
    const diff = diffLines(aLines, bLines);
    out.innerHTML = diff.map(line => {
      const escaped = line.text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      if (line.type === 'same') return `<div>&nbsp; ${escaped}</div>`;
      if (line.type === 'add') return `<div class="diff-add">+ ${escaped}</div>`;
      return `<div class="diff-del">- ${escaped}</div>`;
    }).join('');
  });
})();
