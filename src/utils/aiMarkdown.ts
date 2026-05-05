/**
 * Shared utilities for AI analysis text rendering.
 * Used by both AIMatchAnalysis and VideoAnalysisPage.
 */

// Build a map of entity name → link URL from context object
export function buildEntityMap(ctx: any): Map<string, string> {
  const map = new Map<string, string>();
  if (!ctx) return map;

  const addTeam = (name: string, id: number | string) => {
    if (name && id) {
      const trimmed = name.trim();
      map.set(trimmed, `/teams/${id}`);
      // Abbreviation: "Công An Hà Nội" → "CAHN"
      const abbr = trimmed.split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('');
      if (abbr.length >= 2 && abbr !== trimmed) map.set(abbr, `/teams/${id}`);
      // Short name: last 2 words
      const words = trimmed.split(/\s+/);
      if (words.length >= 3) map.set(words.slice(-2).join(' '), `/teams/${id}`);
    }
  };
  const addPlayer = (name: string, id: number | string) => {
    if (name && id) map.set(name.trim(), `/players/${id}`);
  };

  const apiFixtureId = ctx.match?.apiFixtureId ?? ctx.apiFixtureId;
  const matchId = ctx.match?.matchId ?? ctx.matchId;
  const matchUrlId = apiFixtureId ?? matchId;
  if (matchUrlId) map.set('__matchUrl__', `/matches/${matchUrlId}`);

  addTeam(ctx.homeTeam?.name, ctx.homeTeam?.teamId);
  addTeam(ctx.awayTeam?.name, ctx.awayTeam?.teamId);

  if (Array.isArray(ctx.players)) {
    const allNames = ctx.players.map((p: any) => p.fullName?.trim()).filter(Boolean);
    for (const p of ctx.players) {
      if (p.fullName && p.playerId) {
        const full = p.fullName.trim();
        const url = `/players/${p.playerId}`;
        map.set(full, url);
        const parts = full.split(' ');
        // Last 2 words
        if (parts.length >= 3) {
          const last2 = parts.slice(-2).join(' ');
          const conflicts = allNames.some((n: string) => n !== full && n.includes(last2));
          if (!conflicts) map.set(last2, url);
        }
        // Last 1 word (unique, length >= 3)
        const lastName = parts[parts.length - 1];
        if (lastName.length >= 3) {
          const conflicts = allNames.some((n: string) => n !== full && n.endsWith(lastName));
          if (!conflicts) map.set(lastName, url);
        }
        // First word (unique, length >= 3, different from lastName)
        const firstName = parts[0];
        if (firstName.length >= 3 && firstName !== lastName) {
          const conflicts = allNames.some((n: string) => n !== full && n.startsWith(firstName));
          if (!conflicts) map.set(firstName, url);
        }
      }
    }
  }

  addPlayer(ctx.player?.fullName, ctx.player?.playerId);
  if (ctx.player?.fullName && ctx.player?.playerId) {
    const parts = ctx.player.fullName.trim().split(' ');
    const url = `/players/${ctx.player.playerId}`;
    if (parts.length >= 3) {
      map.set(parts.slice(-2).join(' '), url);
    }
    const lastName = parts[parts.length - 1];
    if (lastName.length >= 3) map.set(lastName, url);
  }
  addTeam(ctx.player?.teamName, ctx.player?.teamId);

  return map;
}

/**
 * Build entity map from flat lists of players and teams.
 * Used by VideoAnalysisPage which doesn't have a structured context object.
 */
export function buildEntityMapFromLists(
  players: { playerId: number; fullName: string }[],
  teams: { teamId: number; teamName: string }[]
): Map<string, string> {
  const map = new Map<string, string>();

  const allFullNames = players.map(p => p.fullName?.trim()).filter(Boolean);

  for (const p of players) {
    if (!p.fullName || !p.playerId) continue;
    const full = p.fullName.trim();
    const url = `/players/${p.playerId}`;
    map.set(full, url);

    const parts = full.split(' ');

    // Last 2 words: "Quang Hải", "Văn Lâm", etc.
    if (parts.length >= 3) {
      const last2 = parts.slice(-2).join(' ');
      const conflicts = allFullNames.some(n => n !== full && n.includes(last2));
      if (!conflicts) map.set(last2, url);
    }

    // Last 1 word: "Grafite", "Lâm", etc. — only if unique across all players
    const lastName = parts[parts.length - 1];
    if (lastName.length >= 3) {
      const conflicts = allFullNames.some(n => n !== full && n.endsWith(lastName));
      if (!conflicts) map.set(lastName, url);
    }

    // First word: "Alan", "Stefan", etc. — only if unique and different from lastName
    const firstName = parts[0];
    if (firstName.length >= 3 && firstName !== lastName) {
      const conflicts = allFullNames.some(n => n !== full && n.startsWith(firstName));
      if (!conflicts) map.set(firstName, url);
    }
  }

  for (const t of teams) {
    if (!t.teamName || !t.teamId) continue;
    const url = `/teams/${t.teamId}`;
    map.set(t.teamName.trim(), url);

    // Generate abbreviation: first letter of each word, e.g. "Công An Hà Nội" → "CAHN"
    const abbr = t.teamName
      .trim()
      .split(/\s+/)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
    if (abbr.length >= 2 && abbr !== t.teamName) {
      map.set(abbr, url);
    }

    // Also add short name: last 2 words, e.g. "Thép Nam Định" → "Nam Định"
    const words = t.teamName.trim().split(/\s+/);
    if (words.length >= 3) {
      const short = words.slice(-2).join(' ');
      map.set(short, url);
    }
  }

  return map;
}

// Apply entity links to a piece of HTML text
export function applyEntityLinks(html: string, entityMap: Map<string, string>): string {
  if (entityMap.size === 0) return html;
  const entries = [...entityMap.entries()]
    .filter(([name]) => !name.startsWith('__'))
    .sort((a, b) => b[0].length - a[0].length);
  let result = html;
  for (const [name, url] of entries) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(`(?<!href="|>|[\\w\\u00C0-\\u024F\\u1EA0-\\u1EF9])(${escaped})(?![\\w\\u00C0-\\u024F\\u1EA0-\\u1EF9]|[^<]*>|[^<]*</a>)`, 'g'),
      (match, p1, offset, str) => {
        const before = str.slice(0, offset);
        const openA = (before.match(/<a /g) || []).length;
        const closeA = (before.match(/<\/a>/g) || []).length;
        if (openA > closeA) return match;
        return `<a href="${url}" class="text-blue-500 dark:text-blue-400 hover:underline font-medium" onclick="event.stopPropagation()">${p1}</a>`;
      }
    );
  }
  return result;
}

const SECTION_ICONS: Record<string, string> = {
  'tổng quan': '📋', 'phân tích chi tiết': '🔍', 'tấn công': '⚽',
  'chuyền bóng': '🎯', 'phòng thủ': '🛡️', 'tranh chấp': '💪',
  'tiêu cực': '⚠️', 'thẻ phạt': '🟨', 'thủ môn': '🧤',
  'bonus': '🏆', 'kết quả': '🏆', 'kết luận': '✅',
  'thống kê': '📊', 'diễn biến': '⏱️', 'nhận định': '💬',
  'chiến thuật': '♟️', 'kỹ thuật': '🦶', 'tình huống': '🎬',
};

function getIcon(title: string) {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '📌';
}

export function renderMarkdown(text: string, entityMap?: Map<string, string>): string {
  const parseTableRow = (line: string) => line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
  const isTableRow = (line: string) => /^\|.+\|$/.test(line.trim());
  const isSeparatorRow = (line: string) => /^\|[\s\-:|]+\|$/.test(line.trim());

  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  let tableLines: string[] = [];

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rows = tableLines.filter(l => !isSeparatorRow(l));
    if (rows.length === 0) { tableLines = []; return; }
    const [header, ...body] = rows;
    const headers = parseTableRow(header);
    result.push(`<div class="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-white/10">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-slate-100 dark:bg-white/5">
            ${headers.map(h => `<th class="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${body.map((row, i) => {
            const cells = parseTableRow(row);
            return `<tr class="${i % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50 dark:bg-white/[0.02]'}">
              ${cells.map((c, ci) => `<td class="px-3 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-white/5 ${ci === 0 ? 'font-medium' : ''}">${c}</td>`).join('')}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`);
    tableLines = [];
  };

  for (const line of lines) {
    if (isTableRow(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      tableLines.push(line);
      continue;
    } else {
      flushTable();
    }

    if (/^## (.+)$/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      const title = line.replace(/^## /, '');
      const icon = getIcon(title);
      result.push(`<div class="flex items-center gap-2 mt-6 mb-3 pb-2 border-b-2 border-slate-100 dark:border-white/10">
        <span class="text-lg">${icon}</span>
        <h2 class="text-base font-bold text-foreground">${title}</h2>
      </div>`);
    } else if (/^### (.+)$/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      const title = line.replace(/^### /, '');
      const icon = getIcon(title);
      result.push(`<div class="flex items-center gap-2 mt-4 mb-2 pl-3 border-l-2 border-[#FF4444]/60">
        <span class="text-sm">${icon}</span>
        <h3 class="text-sm font-semibold text-[#FF4444]">${title}</h3>
      </div>`);
    } else if (/^[-*] (.+)$/.test(line)) {
      if (!inList) { result.push('<ul class="space-y-1.5 my-2 ml-2">'); inList = true; }
      const content = line.replace(/^[-*] /, '').replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
      const highlighted = content.replace(/(→\s*)?([+\-]\d+\.?\d*đ)/g, (match, arrow, score) => {
        const isPositive = score.startsWith('+');
        const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
        return `${arrow ?? ''}<span class="font-bold ${colorClass}">${score}</span>`;
      });
      result.push(`<li class="flex gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] rounded-lg px-3 py-1.5"><span class="text-slate-300 dark:text-slate-600 flex-shrink-0">▸</span><span>${highlighted}</span></li>`);
    } else if (line.trim() === '') {
      if (inList) { result.push('</ul>'); inList = false; }
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      const content = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
      result.push(`<p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed my-1">${content}</p>`);
    }
  }

  flushTable();
  if (inList) result.push('</ul>');
  const html = result.join('\n');
  return entityMap && entityMap.size > 0 ? applyEntityLinks(html, entityMap) : html;
}
