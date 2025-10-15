import type { Station } from '../types/station';
import { normalizeString } from './normalize';

export type ScorerOptions = {
  shortNameBonus?: number;
};

export class StationScorer {
  private opts: ScorerOptions;

  constructor(opts?: ScorerOptions) {
    this.opts = { shortNameBonus: 10, ...opts };
  }

  score(station: Station, tokens: string[], rawQuery: string): number {
    const nameNorm = normalizeString(station.name);
    let score = 0;

    // Strong matches
    if (nameNorm === rawQuery) score += 200;
    if (String(station.stationId) === rawQuery) score += 150;
    if (nameNorm.startsWith(rawQuery)) score += 120;

    // Partial token matches
    for (const t of tokens) {
      if (nameNorm === t) score += 80;
      if (nameNorm.startsWith(t)) score += 40;
      if (nameNorm.includes(t)) score += 20;
      if (normalizeString(station.country) === t) score += 30;
    }

    // small bonus for shorter names (prefer concise matches)
  const nameLen = nameNorm.length || 0;
  const shortBonus = this.opts.shortNameBonus ?? 10;
  score += Math.max(0, shortBonus - nameLen / 20);

    return Math.round(score);
  }
}
