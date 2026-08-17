/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Indonesian Profanity & Offensive Language Filter
 * Automatically censors the offensive portion using asterisks (*),
 * keeping the rest of the sentence natural and readable.
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DEFAULT_CENSOR_WORDS = [
  'anjing',
  'anjink',
  'anying',
  'bangsat',
  'kontol',
  'goblok',
  'tolol',
  'bego',
  'kampret',
  'pantek',
  'memek',
  'bajingan',
  'itil',
  'ngentot',
  'perek',
  'lonte',
  'asu',
  'tai',
  'babi'
];

export function maskWord(word: string): string {
  if (!word) return '';
  if (word.length <= 2) return word[0] + '*';
  // Keep first char, replace rest with asterisks
  return word[0] + '*'.repeat(word.length - 1);
}

function getCensorList(): string[] {
  try {
    const raw = localStorage.getItem('kepoin_moderation_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.autoCensorWords) && parsed.autoCensorWords.length > 0) {
        return parsed.autoCensorWords;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CENSOR_WORDS;
}

function getBlockedList(): string[] {
  try {
    const raw = localStorage.getItem('kepoin_moderation_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.blockedWords)) {
        return parsed.blockedWords;
      }
    }
  } catch {
    // fallback
  }
  return ['judionline', 'slotgacor', 'slot88', 'zeus88', 'pragmatic88', 'openbo'];
}

export function censorProfanity(text: string): string {
  if (!text) return text;
  let censored = text;
  const wordList = getCensorList();

  for (const word of wordList) {
    const cleanWord = word.trim();
    if (!cleanWord) continue;
    try {
      const escaped = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      censored = censored.replace(regex, (match) => maskWord(match));
    } catch {
      // ignore invalid regex
    }
  }
  return censored;
}

export function containsBlockedWords(text: string): { blocked: boolean; word?: string } {
  if (!text) return { blocked: false };
  const lower = text.toLowerCase();
  const blockedList = getBlockedList();

  for (const word of blockedList) {
    const clean = word.trim().toLowerCase();
    if (!clean) continue;
    if (lower.includes(clean)) {
      return { blocked: true, word: clean };
    }
  }
  return { blocked: false };
}

