import { Activity } from '../types/graphql';
import type { Weather } from '../types/graphql';
import type { ActivityRanking } from '../services/activityService';

// Weather thresholds for activity scoring
const THRESHOLDS = {
  COLD_TEMP_CELSIUS: 5,
  PLEASANT_TEMP_CELSIUS: 10,
  WINDY_SPEED_MS: 5,
  RAIN_RATE_THRESHOLD: 0
} as const;

// Base scores for activities in their ideal conditions
const BASE_SCORES = {
  SKIING: { ideal: 90, default: 10 },
  SURFING: { ideal: 80, default: 20 },
  INDOOR: { ideal: 85, default: 40 },
  OUTDOOR: { ideal: 95, default: 30 }
} as const;

/**
 * Calculate activity scores based on weather conditions
 */
export function scoreActivities(weather: Weather): ActivityRanking[] {
  // Provide safe defaults in case any value is null or undefined
  const safeTemperature = weather.temperature ?? 0;
  const safeRainRate = weather.rainRate ?? 0;
  const safeWindSpeed = weather.windSpeed ?? 0;

  const activities: ActivityRanking[] = [
    {
      activity: Activity.Skiing,
      score: safeTemperature < THRESHOLDS.COLD_TEMP_CELSIUS
        ? BASE_SCORES.SKIING.ideal
        : BASE_SCORES.SKIING.default
    },
    {
      activity: Activity.Surfing,
      score: safeWindSpeed > THRESHOLDS.WINDY_SPEED_MS
        ? BASE_SCORES.SURFING.ideal
        : BASE_SCORES.SURFING.default
    },
    {
      activity: Activity.IndoorSightseeing,
      score: safeRainRate > THRESHOLDS.RAIN_RATE_THRESHOLD
        ? BASE_SCORES.INDOOR.ideal
        : BASE_SCORES.INDOOR.default
    },
    {
      activity: Activity.OutdoorSightseeing,
      score: safeRainRate === THRESHOLDS.RAIN_RATE_THRESHOLD && safeTemperature > THRESHOLDS.PLEASANT_TEMP_CELSIUS
        ? BASE_SCORES.OUTDOOR.ideal
        : BASE_SCORES.OUTDOOR.default
    }
  ];

  return activities.sort((a, b) => b.score - a.score);
}
