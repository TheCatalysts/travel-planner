import type { Station } from '../types/station';
import { StationScorer } from './StationScorer';

export interface ScoredStation {
  station: Station;
  score: number;
}

/**
 * Find and score matching stations based on search criteria
 */
export function findMatchingStations(
  stations: Station[],
  tokens: string[],
  normalizedQuery: string,
  limit: number,
  scorer: StationScorer
): Station[] {
  const scored = stations.map(station => ({
    station,
    score: scorer.score(station, tokens, normalizedQuery)
  }));

   const result = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => ({
      id: x.station.id,
      name: x.station.name,
      country: x.station.country,
      stationId: x.station.stationId,
      latitude: x.station.latitude,
      longitude: x.station.longitude
    }));

  return result;
}