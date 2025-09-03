// Utility to derive a concise, user‑friendly display title from raw transaction title.
// Rules are brand/chain driven. Locations, branch numbers, corporate suffixes removed.

const CHAIN_RULES: { pattern: RegExp; name: string }[] = [
  { pattern: /zabka/i, name: 'Zabka' },
  { pattern: /relay/i, name: 'Relay' },
  { pattern: /paul/i, name: 'Paul' },
  { pattern: /angelato/i, name: 'Angelato' },
  { pattern: /lidl/i, name: 'Lidl' },
  { pattern: /albert/i, name: 'Albert' },
  { pattern: /billa/i, name: 'Billa' },
  { pattern: /decathlon/i, name: 'Decathlon' },
  { pattern: /alza/i, name: 'Alza' },
  { pattern: /mastro\s*cesar[ao]/i, name: 'Mastro Cesaro' },
  { pattern: /zrno\s*zrnko/i, name: 'Zrno Zrnko' },
  { pattern: /ugo.*salaterie/i, name: 'Ugo Salaterie' },
  { pattern: /tisse/i, name: 'Tisse' },
  // Important: place 'Tescoma' before 'Tesco' and use word boundary for Tesco so 'Tescoma' is not reduced to 'Tesco'
  { pattern: /tescoma/i, name: 'Tescoma' },
  { pattern: /\btesco\b/i, name: 'Tesco' },
  { pattern: /foodora/i, name: 'Foodora' },
  { pattern: /teta/i, name: 'Teta' },
  { pattern: /\bdm\b/i, name: 'DM' },
  { pattern: /bolt/i, name: 'Bolt' },
  { pattern: /uber/i, name: 'Uber' },
  { pattern: /spotify/i, name: 'Spotify' },
  { pattern: /google.*yout/i, name: 'Google Youtube' },
  { pattern: /google\s*youtube/i, name: 'Google Youtube' },
];

const CORPORATE_SUFFIX = /\b(s\.?r\.?o\.?|a\.?s\.?)\b.*$/i; // cut suffix and anything after, word boundary safe (avoids trimming 'Nasi')

// Remove short garbage tokens like standalone country codes / branch tags
const GARBAGE_TOKENS = new Set(['cz', 'czt', 'cvt', 'vodi']);

export function prettifyTitle(rawInput: string): string {
  if (!rawInput) return '';

  // If combined with description via pipe, take first part
  const raw = rawInput.split('|')[0].trim();

  // Early chain canonicalization
  for (const rule of CHAIN_RULES) {
    if (rule.pattern.test(raw)) {
      return rule.name; // ignore everything else (location / numbers)
    }
  }

  // Remove corporate suffix and following
  let t = raw.replace(CORPORATE_SUFFIX, '').trim();

  // Strip trailing domain (e.g., Alza.cz -> Alza)
  t = t.replace(/\.(cz|com|net|io|sk)\b.*$/i, '').trim();

  // Remove trailing branch/location after a dash or comma if it looks like street / number pattern
  t = t.replace(/[-,]\s*[0-9]*[a-zá-ž\- ]{0,20}$/i, (m) => {
    // Keep if it would remove too much (heuristic: ensure at least 4 chars remain)
    const base = t.slice(0, t.length - m.length).trim();
    return base.length >= 4 ? '' : m;
  }).trim();

  // Token cleanup of garbage tokens at end
  const parts = t.split(/\s+/);
  while (parts.length > 1 && GARBAGE_TOKENS.has(parts[parts.length - 1].toLowerCase())) {
    parts.pop();
  }
  t = parts.join(' ');

  // Collapse multiple spaces
  t = t.replace(/\s{2,}/g, ' ').trim();

  // Capitalize first letter if all lowercase
  if (/^[a-z0-9\s]+$/.test(t)) {
    t = t.replace(/\b([a-z])/g, (_match, c) => c.toUpperCase());
  }

  return t;
}
