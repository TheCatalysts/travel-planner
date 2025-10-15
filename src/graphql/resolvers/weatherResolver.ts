import { stationService } from '../../services/stationService';
import { getWeather } from '../../services/weatherService';
import { rankActivities } from '../../services/activityService';
import { JSONScalar } from '../scalars/json';
import type { Resolvers } from '../../types/resolvers';
import { logger } from '../../utils/logger';
import { metricsService } from '../../services/metricsService';
import { Weather, WeatherError, WeatherErrorCode, Activity } from '../../types/graphql';
import { getActivityMessage } from '../../utils/activityMessages';
import { withMetrics } from '../../utils/withMetrics';

const BASE_64_PREFIX = 'cursor:';

const encodeCursor = (n: number) =>
  `${BASE_64_PREFIX}${Buffer.from(String(n)).toString('base64')}`;

const decodeCursor = (cursor?: string) => {
  if (!cursor) return 0;
  try {
    const raw = cursor.startsWith(BASE_64_PREFIX)
      ? cursor.slice(BASE_64_PREFIX.length)
      : cursor;
    const decoded = Buffer.from(raw, 'base64').toString();
    const parsed = parseInt(decoded, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (err) {
    logger.warn({ cursor, err }, 'Invalid cursor provided');
    return 0;
  }
};

const resolvers: Resolvers = {
  JSON: JSONScalar,

  WeatherResult: {
    __resolveType(obj: Weather | WeatherError) {
      if ('temperature' in obj) return 'Weather';
      if ('code' in obj) return 'WeatherError';
      return null;
    },
  },

  Query: {
    suggestCities: withMetrics(
      metricsService.recordStationLatency.bind(metricsService),
      async (_: unknown, { query, limit = 8, after }: { query: string; limit?: number; after?: string }) => {
        const validLimit = Math.min(Math.max(1, limit), 50);
        const offset = decodeCursor(after);

        const results = await stationService.suggest(query, validLimit + 1, offset);
        const hasNextPage = results.length > validLimit;
        const stations = results.slice(0, validLimit);

        const edges = stations.map((station, index) => ({
          node: station,
          cursor: encodeCursor(offset + index + 1),
        }));

        metricsService.recordStationSearch();

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: hasNextPage && edges.length ? edges[edges.length - 1].cursor : null,
          },
          totalCount: stations.length,
        };
      }
    ),

    getWeather: withMetrics(
      metricsService.recordWeatherLatency.bind(metricsService),
      async (_: unknown, { stationId }: { stationId: string }) => {
        try {
          const weather = await getWeather(stationId);

          if (
            !weather ||
            ('code' in (weather as any) &&
              (weather as any).code === WeatherErrorCode.STATION_NOT_FOUND)
          ) {
            return {
              code: WeatherErrorCode.STATION_NOT_FOUND,
              message: `No weather data found for station ${stationId}`,
            };
          }

          return { ...weather, lastUpdated: new Date().toISOString() } as Weather;
        } catch (error) {
          logger.error({ error, stationId }, 'Error fetching weather data');
          return {
            code: WeatherErrorCode.INTERNAL_ERROR,
            message: 'An internal error occurred while fetching weather data',
          };
        }
      }
    ),

    rankActivities: withMetrics(
      metricsService.recordActivityLatency.bind(metricsService),
      async (_: unknown, { stationId }: { stationId: string }) => {
        const result = await getWeather(stationId);

        if (!result || 'code' in (result as any)) {
          logger.warn(
            { stationId, error: result },
            'Could not get weather data for activity ranking'
          );
          return [
            {
              activity: Activity.INDOOR_SIGHTSEEING,
              score: 40,
              message: 'Indoor activities recommended due to weather data unavailability',
            },
          ];
        }

        const rankings = rankActivities(result as Weather);

        return rankings.map(r => {
          const score = typeof r.score === 'number' ? r.score : Number(r.score || 0);
          return {
            ...r,
            message: r.message ?? getActivityMessage(r.activity, score),
          };
        });
      }
    ),
  },

  Mutation: {},
};

export default resolvers;