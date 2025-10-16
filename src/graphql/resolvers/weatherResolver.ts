import { stationService } from '../../services/stationService';
import { getWeather } from '../../services/weatherService';
import { rankActivities } from '../../services/activityService';
import { JSONScalar } from '../scalars/json';
import type { QuerySuggestCitiesArgs, Resolvers } from '../../types/resolvers';
import { logger } from '../../utils/logger';
import { metricsService } from '../../services/metricsService';
import { Weather, WeatherError, WeatherErrorCode, Activity, ActivityScore, Station as StationType,} from '../../types/graphql';
import { getActivityMessage } from '../../utils/activityMessages';
import { withMetrics } from '../../utils/withMetrics';
import type { RequireFields } from '../../types/resolvers'; 

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
    __resolveType(obj: Record<string, any>) {
      if ('temperature' in obj) return 'Weather';
      if ('code' in obj) return 'WeatherError';
      return null;
    },
  },

  CityInfoResult: {
    __resolveType(obj: Record<string, any>) {
      if (obj && typeof obj === 'object' && 'weather' in obj && 'activities' in obj) return 'CityInfo';
      if (obj && typeof obj === 'object' && 'code' in obj) return 'CityError';
      return null;
    },
  },

  Query: {
    suggestCities: withMetrics(
      metricsService.recordStationLatency.bind(metricsService),
      async (_: unknown, args: RequireFields<QuerySuggestCitiesArgs, 'limit' | 'query'>) => {
        const { query, limit = 8, after } = args;
        const validLimit = Math.min(Math.max(1, limit), 50);
        const offset = decodeCursor(after ?? undefined);

        const results = await stationService.suggest(query, validLimit + 1, offset);
        const hasNextPage = results.length > validLimit;
        const stations = results.slice(0, validLimit);

        const edges = stations.map((station, index) => ({
          node: {
            ...station,
            activities: [], 
          },
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
      async (_: unknown, { stationId }: { stationId: string }): Promise<Weather | WeatherError> => {
        try {
          const weather = await getWeather(stationId);

          if (!weather || ('code' in (weather as any) && (weather as any).code === WeatherErrorCode.StationNotFound)) {
            return {
              code: WeatherErrorCode.StationNotFound,
              message: `No weather data found for station ${stationId}`,
            } as WeatherError;
          }

          return { ...(weather as Weather), lastUpdated: new Date().toISOString() } as Weather;
        } catch (error) {
          logger.error({ error, stationId }, 'Error fetching weather data');
          return {
            code: WeatherErrorCode.InternalError,
            message: 'An internal error occurred while fetching weather data',
          } as WeatherError;
        }
      }
    ),

    rankActivities: withMetrics(
      metricsService.recordActivityLatency.bind(metricsService),
      async (_: unknown, { stationId }: { stationId: string }): Promise<ActivityScore[]> => {
        const result = await getWeather(stationId);

        if (!result || 'code' in (result as any)) {
          logger.warn({ stationId, error: result }, 'Could not get weather data for activity ranking');
          return [
            {
              activity: Activity.IndoorSightseeing,
              score: 40,
              message: 'Indoor activities recommended due to weather data unavailability',
            } as ActivityScore,
          ];
        }

        const rankings = rankActivities(result as Weather);

        return rankings.map(r => {
          const score = typeof r.score === 'number' ? r.score : Number(r.score || 0);
          return {
            activity: r.activity as Activity,
            score,
            message: r.message ?? getActivityMessage(r.activity as Activity, score),
          } as ActivityScore;
        });
      }
    ),
  },

  // Lazy field resolvers for Station to get weather/activities per-station
  Station: {
    async weather(parent: StationType): Promise<Weather | null> {
      try {
        const data = await getWeather(parent.stationId);
        if (!data || 'code' in (data as any)) return null;
        return { ...(data as Weather), lastUpdated: new Date().toISOString() } as Weather;
      } catch (err) {
        logger.warn({ err, stationId: parent.stationId }, 'Error fetching station weather');
        return null;
      }
    },

    async activities(parent: StationType): Promise<ActivityScore[]> {
      try {
        const data = await getWeather(parent.stationId);
        if (!data || 'code' in (data as any)) {
          return [
            {
              activity: Activity.IndoorSightseeing,
              score: 40,
              message: 'Indoor activities recommended due to weather data unavailability',
            } as ActivityScore,
          ];
        }

        const ranked = rankActivities(data as Weather);
        return ranked.map(r => {
          const score = typeof r.score === 'number' ? r.score : Number(r.score || 0);
          return {
            activity: r.activity as Activity,
            score,
            message: r.message ?? getActivityMessage(r.activity as Activity, score),
          } as ActivityScore;
        });
      } catch (err) {
        logger.warn({ err, stationId: parent.stationId }, 'Error fetching activities for station');
        return [
          {
            activity: Activity.IndoorSightseeing,
            score: 40,
            message: 'Indoor activities recommended due to weather data unavailability',
          } as ActivityScore,
        ];
      }
    },
  },

  Mutation: {},
};

export default resolvers;