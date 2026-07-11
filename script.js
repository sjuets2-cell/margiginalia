// ============================================================
// Marginalia — tool logic (vanilla JS, no dependencies)
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

  function toTitle(s) {
    return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  function toSentence(s) {
    const lower = s.toLowerCase();
    return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  }
  function toCamel(s) {
    return s
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
  }
  function toSnake(s) {
    return s
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s\-]+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  }
  function toKebab(s) {
    return toSnake(s).replace(/_/g, '-');
  }

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
    try {
      output.value = decodeURIComponent(input.value);
    } catch (e) {
      output.value = 'Could not decode this input.';
    }
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

  lengthInput.addEventListener('input', () => {
    lengthVal.textContent = lengthInput.value;
  });

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
    for (let i = 0; i < len; i++) {
      result += pool[bytes[i] % pool.length];
    }
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
    return s
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  input.addEventListener('input', () => {
    output.value = slugify(input.value);
  });
})();

/* ---------- 08: lorem ipsum generator ---------- */
(() => {
  const countInput = document.getElementById('lorem-count');
  if (!countInput) return;
  const countVal = document.getElementById('lorem-count-val');
  const output = document.getElementById('lorem-output');

  countInput.addEventListener('input', () => {
    countVal.textContent = countInput.value;
  });

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

/* ---------- 09: text diff (line-based) ---------- */
(() => {
  const runBtn = document.getElementById('diff-run');
  if (!runBtn) return;
  const a = document.getElementById('diff-a');
  const b = document.getElementById('diff-b');
  const out = document.getElementById('diff-output');

  function diffLines(aLines, bLines) {
    // Simple LCS-based line diff
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
      if (aLines[i] === bLines[j]) {
        result.push({ type: 'same', text: aLines[i] });
        i++; j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: 'del', text: aLines[i] });
        i++;
      } else {
        result.push({ type: 'add', text: bLines[j] });
        j++;
      }
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
