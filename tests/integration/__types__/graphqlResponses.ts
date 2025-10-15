import { WeatherErrorCode } from '../../../src/types/graphql';

export interface WeatherErrorResponse {
  getWeather: {
    code: WeatherErrorCode;
    message: string;
  };
}

export interface WeatherDataResponse {
  getWeather: {
    stationId: string;
    name: string;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    windDirection?: number;
    rainRate?: number;
    lastUpdated: string;
  };
}

export interface ActivityResponse {
  rankActivities: Array<{
    activity: string;
    score: number;
    message: string;
  }>;
}

export interface StationEdge {
  node: {
    id: string;
    name: string;
    country: string;
    stationId: string;
    latitude: number;
    longitude: number;
  };
  cursor: string;
}

export interface StationConnection {
  edges: StationEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface StationResponse {
  suggestCities: StationConnection;
}