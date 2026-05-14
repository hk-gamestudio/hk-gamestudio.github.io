/**
 * Lightweight Markdown → HTML renderer.
 * Handles: headings, bold/italic, inline code, code blocks,
 * blockquotes, ordered/unordered lists, tables, hr, links.
 * No external dependencies.
 */

export function renderMarkdown(md) {
  // Normalize line endings
  let src = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // --- 1. Extract fenced code blocks (protect from inline processing) ---
  const codeBlocks = [];
  src = src.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(
      `<pre><code class="lang-${lang || 'text'}">${escHtml(code.trimEnd())}</code></pre>`
    );
    return `\x00CODE${idx}\x00`;
  });

  // --- 2. Process block elements ---
  const lines  = src.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text  = headingMatch[2].trim();
      const id    = slugify(text);
      blocks.push(`<h${level} id="${id}">${inlineHtml(text)}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      blocks.push('<hr>');
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ') || line === '>') {
      const bqLines = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        bqLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(`<blockquote>${renderMarkdown(bqLines.join('\n'))}</blockquote>`);
      continue;
    }

    // Fenced code placeholder
    if (line.startsWith('\x00CODE')) {
      const idx = parseInt(line.match(/\x00CODE(\d+)\x00/)?.[1] ?? '0', 10);
      blocks.push(codeBlocks[idx] ?? '');
      i++;
      continue;
    }

    // Table (detect pipe rows)
    if (line.includes('|') && i + 1 < lines.length && /^\|?\s*[-:]+\s*\|/.test(lines[i + 1])) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push(parseTable(tableLines));
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inlineHtml(lines[i].replace(/^\d+\.\s+/, ''))}</li>`);
        i++;
      }
      blocks.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(`<li>${inlineHtml(lines[i].replace(/^[-*+]\s+/, ''))}</li>`);
        i++;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph: accumulate until blank line or block-level element
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('> ') &&
      !/^[-*_]{3,}\s*$/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !lines[i].includes('|')
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push(`<p>${inlineHtml(paraLines.join(' '))}</p>`);
    }
  }

  return blocks.join('\n');
}

/** Extract headings for table of contents */
export function extractToc(md) {
  const headings = [];
  const re = /^(#{1,6})\s+(.*)/gm;
  let m;
  while ((m = re.exec(md)) !== null) {
    const level = m[1].length;
    const text  = m[2].trim();
    if (level <= 3) {
      headings.push({ level, text, id: slugify(text) });
    }
  }
  return headings;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function inlineHtml(text) {
  // Bold+italic
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return text;
}

function parseTable(lines) {
  const rows = lines.map(l =>
    l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
  );
  if (rows.length < 2) return '';

  const head = rows[0];
  const body = rows.slice(2); // skip separator row

  const th = head.map(c => `<th>${inlineHtml(c)}</th>`).join('');
  const tr = body.map(row =>
    `<tr>${row.map(c => `<td>${inlineHtml(c)}</td>`).join('')}</tr>`
  ).join('');

  return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
