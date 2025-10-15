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
  const { 
    temperature = 0, 
    rainRate = 0, 
    windSpeed = 0 
  } = weather || {};

  const activities: ActivityRanking[] = [
    {
      activity: Activity.SKIING,
      score: temperature < THRESHOLDS.COLD_TEMP_CELSIUS 
        ? BASE_SCORES.SKIING.ideal 
        : BASE_SCORES.SKIING.default
    },
    {
      activity: Activity.SURFING,
      score: windSpeed > THRESHOLDS.WINDY_SPEED_MS 
        ? BASE_SCORES.SURFING.ideal 
        : BASE_SCORES.SURFING.default
    },
    {
      activity: Activity.INDOOR_SIGHTSEEING,
      score: rainRate > THRESHOLDS.RAIN_RATE_THRESHOLD 
        ? BASE_SCORES.INDOOR.ideal 
        : BASE_SCORES.INDOOR.default
    },
    {
      activity: Activity.OUTDOOR_SIGHTSEEING,
      score: rainRate === THRESHOLDS.RAIN_RATE_THRESHOLD && temperature > THRESHOLDS.PLEASANT_TEMP_CELSIUS 
        ? BASE_SCORES.OUTDOOR.ideal 
        : BASE_SCORES.OUTDOOR.default
    }
  ];

  return activities.sort((a, b) => b.score - a.score);
}