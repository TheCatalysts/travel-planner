import { StationScorer } from '../utils/StationScorer';
import stationsData from '../data/stations.json';
import type { Station } from '../types/station';
import { normalizeString } from '../utils/normalize';
import { Cache } from '../utils/cache';
import { findMatchingStations } from '../utils/stationUtils';

const TTL_MS = 1000 * 60 * 5; 

export default class StationService {
  private stations: Station[];
  private cache: Cache<Station[]>;
  private scorer: StationScorer;

  constructor(scorer?: StationScorer) {
    this.stations = (stationsData as any) as Station[];
    this.cache = new Cache();
    this.scorer = scorer ?? new StationScorer();
  }

  /**
   * Suggest stations based on a search query, with optional limit
   * @param query Search text to match against station names/data
   * @param limit Maximum number of results to return (default: 8)
   * @returns Array of matching stations, scored and sorted by relevance
   */
    suggest(query: string, limit: number = 8, offset: number = 0): Station[] {
    const raw = (query || '').trim();
    if (!raw) return [];

    // Check cache first
    const cacheKey = `${raw}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Process query
    const rawNorm = normalizeString(raw);
    const tokens = rawNorm.split(/\s+/).filter(Boolean);

    // Score and sort stations
    const results = findMatchingStations(this.stations, tokens, rawNorm, limit,this.scorer);
    
    // Cache results
    this.cache.set(cacheKey, results, TTL_MS);
    return results;
  }
}

// Create a singleton instance for the application
export const stationService = new StationService();

// Also export the class for testing and DI
export { StationService };
