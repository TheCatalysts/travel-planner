import { Activity, Weather } from '../types/graphql';
import { scoreActivities } from '../utils/activityScorer';
import { getActivityMessage } from '../utils/activityMessages';
import { logger } from '../utils/logger';

/**
 * Interface for activity ranking response
 */
export interface ActivityRanking {
  activity: Activity;
  score: number;
  message?: string;
}

/**
 * Ranks activities based on current weather conditions
 * 
 * @param weather Current weather data for the location
 * @param stationId Optional stationId for logging purposes
 * @returns Array of activities sorted by suitability (highest score first)
 */
export const rankActivities = (weather: Weather, stationId?: string): ActivityRanking[] => {
  try {
    const scores = scoreActivities(weather);

    // Add descriptive messages based on scores
    return scores.map(score => ({
      ...score,
      message: getActivityMessage(score.activity, score.score),
    }));
  } catch (error) {
    logger.error({ error, stationId }, 'Error ranking activities');
    // Return indoor activities as a fallback with a low score
    return [
      {
        activity: Activity.IndoorSightseeing,
        score: 40,
        message: 'Indoor activities recommended due to incomplete weather data',
      },
    ];
  }
};

export { Activity };