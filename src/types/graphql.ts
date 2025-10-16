export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export enum Activity {
  IndoorSightseeing = 'INDOOR_SIGHTSEEING',
  OutdoorSightseeing = 'OUTDOOR_SIGHTSEEING',
  Skiing = 'SKIING',
  Surfing = 'SURFING'
}

export type ActivityScore = {
  __typename?: 'ActivityScore';
  activity: Activity;
  message?: Maybe<Scalars['String']['output']>;
  score: Scalars['Int']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  getWeather: WeatherResult;
  rankActivities: Array<ActivityScore>;
  suggestCities: StationConnection;
};


export type QueryGetWeatherArgs = {
  stationId: Scalars['String']['input'];
};


export type QueryRankActivitiesArgs = {
  stationId: Scalars['String']['input'];
};


export type QuerySuggestCitiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};

export type Station = {
  __typename?: 'Station';
  activities: Array<ActivityScore>;
  country: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  stationId: Scalars['String']['output'];
  weather?: Maybe<Weather>;
};

export type StationConnection = {
  __typename?: 'StationConnection';
  edges: Array<StationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type StationEdge = {
  __typename?: 'StationEdge';
  cursor: Scalars['String']['output'];
  node: Station;
};

export type Weather = {
  __typename?: 'Weather';
  humidity?: Maybe<Scalars['Float']['output']>;
  lastUpdated?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rainRate?: Maybe<Scalars['Float']['output']>;
  stationId: Scalars['String']['output'];
  temperature?: Maybe<Scalars['Float']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  windDirection?: Maybe<Scalars['Float']['output']>;
  windSpeed?: Maybe<Scalars['Float']['output']>;
};

export type WeatherError = {
  __typename?: 'WeatherError';
  code: WeatherErrorCode;
  message: Scalars['String']['output'];
};

export enum WeatherErrorCode {
  DataUnavailable = 'DATA_UNAVAILABLE',
  InternalError = 'INTERNAL_ERROR',
  StationNotFound = 'STATION_NOT_FOUND'
}

export type WeatherResult = Weather | WeatherError;