import { ApolloServer } from '@apollo/server';
import resolvers from '../../src/graphql/resolvers/weatherResolver';
import { WeatherErrorCode } from '../../src/types/graphql';
import { metricsService } from '../../src/services/metricsService';
import { SUGGEST_CITIES_QUERY ,SUGGEST_CITIES_CURSOR_QUERY, SUGGEST_CITIES_EMPTY_QUERY } from './queries/suggestCitiesQueries';
import { RANK_ACTIVITIES_QUERY } from './queries/rankActivitiesQuery';
import type { StationResponse, ActivityResponse, WeatherErrorResponse, WeatherDataResponse } 
  from './__types__/graphqlResponses';
import fs from 'fs';
import path from 'path';
import { IResolvers } from '@graphql-tools/utils';
import { resetMetrics } from '../integration/utils/resetMetrics';
import { GET_WEATHER_ERROR_QUERY, GET_WEATHER_FULL_QUERY } from './queries/weatherQueries';

const schemaPath = path.join(__dirname, '../../src/graphql/schema.graphql');
const typeDefs = fs.readFileSync(schemaPath, 'utf-8');

describe('GraphQL API Integration Tests', () => {
  let server: ApolloServer;
  let metricsTimer: NodeJS.Timeout;

  beforeAll(async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers: resolvers as IResolvers,
    });
    await server.start();

    metricsTimer = setInterval(() => metricsService.logHealthMetrics(), 60000);
  });

  beforeEach(() => {
    resetMetrics(metricsService);
  });

  afterAll(async () => {
    clearInterval(metricsTimer);
    await server.stop();
  });

describe('Weather Query', () => {
  it('handles station not found errors', async () => {
    const response = await server.executeOperation({
      query: GET_WEATHER_ERROR_QUERY,
      variables: { stationId: 'invalid-id' },
    });

    if (response.body.kind === 'single' && response.body.singleResult.data) {
      const data = response.body.singleResult.data as unknown as WeatherErrorResponse;
      expect(data.getWeather.code).toBe(WeatherErrorCode.STATION_NOT_FOUND);
      expect(data.getWeather.message).toContain('invalid-id');
    }
  });

  it('returns full weather data for valid stations', async () => {
    const response = await server.executeOperation({
      query: GET_WEATHER_FULL_QUERY,
      variables: { stationId: '1001' },
    });

    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single' && response.body.singleResult.data) {
      const data = response.body.singleResult.data as unknown as WeatherDataResponse;
      expect(data.getWeather).toBeTruthy();
      expect(data.getWeather.stationId).toBe('1001');
      expect(data.getWeather.lastUpdated).toBeTruthy();
    }
  });

  it('handles null sensor values gracefully', async () => {
    const response = await server.executeOperation({
      query: GET_WEATHER_FULL_QUERY,
      variables: { stationId: '1003' }, 
    });

    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single' && response.body.singleResult.data) {
      const data = response.body.singleResult.data as unknown as WeatherDataResponse;
      expect(data.getWeather).toBeTruthy();
      expect(data.getWeather.stationId).toBe('1003');
      expect(data.getWeather.lastUpdated).toBeTruthy();
    }
  });
});

describe('Activity Ranking', () => {
  it('provides indoor alternatives when weather data unavailable', async () => {
    const response = await server.executeOperation({
      query: RANK_ACTIVITIES_QUERY,
      variables: { stationId: 'invalid-id' },
    });

    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single' && response.body.singleResult.data) {
      const data = response.body.singleResult.data as unknown as ActivityResponse;
      expect(data.rankActivities).toEqual([
        {
          activity: 'INDOOR_SIGHTSEEING',
          score: 40,
          message: expect.stringContaining('Indoor'),
        },
      ]);
    }
  });

  it('ranks activities based on weather conditions', async () => {
    const response = await server.executeOperation({
      query: RANK_ACTIVITIES_QUERY,
      variables: { stationId: '2004' },
    });

    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single' && response.body.singleResult.data) {
      const data = response.body.singleResult.data as unknown as ActivityResponse;
      const activities = data.rankActivities;

      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0]).toHaveProperty('activity');
      expect(activities[0]).toHaveProperty('score');
      expect(activities[0]).toHaveProperty('message');

      expect(activities.every((item, i) => i === 0 || item.score <= activities[i - 1].score)).toBe(true);
    }
  });
});

  describe('Station/City Suggestions', () => {
    it('returns paginated results', async () => {
  const response = await server.executeOperation({
    query: SUGGEST_CITIES_QUERY,
    variables: { query: 'Leipzig', limit: 2 },
  });

  expect(response.body.kind).toBe('single');
  if (response.body.kind === 'single' && response.body.singleResult.data) {
    const data = response.body.singleResult.data as unknown as StationResponse;
    const stations = data.suggestCities;

    expect(stations.edges).toHaveLength(2);
    expect(stations.edges[0].cursor).toBeTruthy();
    expect(stations.pageInfo.hasNextPage).toBe(true);
    expect(stations.pageInfo.endCursor).toBeTruthy();
    expect(stations.totalCount).toBeGreaterThanOrEqual(2);
  }
});

it('handles cursor-based pagination', async () => {
  // First page
  const firstResponse = await server.executeOperation({
    query: SUGGEST_CITIES_CURSOR_QUERY,
    variables: { query: 'Berlin', limit: 2 },
  });

  expect(firstResponse.body.kind).toBe('single');
  if (firstResponse.body.kind === 'single' && firstResponse.body.singleResult.data) {
    const firstData = firstResponse.body.singleResult.data as unknown as StationResponse;
    const endCursor = firstData.suggestCities.pageInfo.endCursor;

    // Second page
    const secondResponse = await server.executeOperation({
      query: SUGGEST_CITIES_CURSOR_QUERY,
      variables: { query: 'Berlin', limit: 2, after: endCursor },
    });

    expect(secondResponse.body.kind).toBe('single');
    if (secondResponse.body.kind === 'single' && secondResponse.body.singleResult.data) {
      const secondData = secondResponse.body.singleResult.data as unknown as StationResponse;
      expect(secondData.suggestCities.edges[0].cursor)
        .not.toBe(firstData.suggestCities.edges[0].cursor);
      expect(secondData.suggestCities.edges[0].cursor).toMatch('cursor:Mw==');
    }
  }
});

it('handles empty search results gracefully', async () => {
  const response = await server.executeOperation({
    query: SUGGEST_CITIES_EMPTY_QUERY,
    variables: { query: '' }, 
  });

  expect(response.body.kind).toBe('single');
  if (response.body.kind === 'single' && response.body.singleResult.data) {
    const data = response.body.singleResult.data as unknown as StationResponse;
    expect(data.suggestCities.edges).toHaveLength(0);
    expect(data.suggestCities.pageInfo.hasNextPage).toBe(false);
    expect(data.suggestCities.totalCount).toBe(0);
  }});
  });
});