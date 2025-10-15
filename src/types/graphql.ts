// src/types/graphql.ts

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface Station {
  id: string;
  name: string;
  country: string;
  stationId: string;
  latitude: number;
  longitude: number;
}

export interface StationEdge {
  node: Station;
  cursor: string;
}

export interface StationConnection {
  edges: StationEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface Weather {
  stationId: string;
  name: string;
  timezone?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  rainRate?: number;
  lastUpdated: string;
}

export enum WeatherErrorCode {
  STATION_NOT_FOUND = 'STATION_NOT_FOUND',
  DATA_UNAVAILABLE = 'DATA_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface WeatherError {
  code: WeatherErrorCode;
  message: string;
}

export type WeatherResult = Weather | WeatherError;

export enum Activity {
  SKIING = 'SKIING',
  SURFING = 'SURFING',
  INDOOR_SIGHTSEEING = 'INDOOR_SIGHTSEEING',
  OUTDOOR_SIGHTSEEING = 'OUTDOOR_SIGHTSEEING',
}

export interface ActivityScore {
  activity: Activity;
  score: number;
  message?: string;
}

export interface TestResult {
  name: string;
  ok: boolean;
  message?: string;
  data?: any;
}