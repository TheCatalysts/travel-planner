import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;
export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  WeatherResult:
    | ( Weather )
    | ( WeatherError )
  ;
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Activity: Activity;
  ActivityScore: ResolverTypeWrapper<ActivityScore>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Station: ResolverTypeWrapper<Station>;
  StationConnection: ResolverTypeWrapper<StationConnection>;
  StationEdge: ResolverTypeWrapper<StationEdge>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Weather: ResolverTypeWrapper<Weather>;
  WeatherError: ResolverTypeWrapper<WeatherError>;
  WeatherErrorCode: WeatherErrorCode;
  WeatherResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['WeatherResult']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ActivityScore: ActivityScore;
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  PageInfo: PageInfo;
  Query: Record<PropertyKey, never>;
  Station: Station;
  StationConnection: StationConnection;
  StationEdge: StationEdge;
  String: Scalars['String']['output'];
  Weather: Weather;
  WeatherError: WeatherError;
  WeatherResult: ResolversUnionTypes<ResolversParentTypes>['WeatherResult'];
}>;

export type ActivityScoreResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActivityScore'] = ResolversParentTypes['ActivityScore']> = ResolversObject<{
  activity?: Resolver<ResolversTypes['Activity'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  score?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getWeather?: Resolver<ResolversTypes['WeatherResult'], ParentType, ContextType, RequireFields<QueryGetWeatherArgs, 'stationId'>>;
  rankActivities?: Resolver<Array<ResolversTypes['ActivityScore']>, ParentType, ContextType, RequireFields<QueryRankActivitiesArgs, 'stationId'>>;
  suggestCities?: Resolver<ResolversTypes['StationConnection'], ParentType, ContextType, RequireFields<QuerySuggestCitiesArgs, 'limit' | 'query'>>;
}>;

export type StationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Station'] = ResolversParentTypes['Station']> = ResolversObject<{
  activities?: Resolver<Array<ResolversTypes['ActivityScore']>, ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  weather?: Resolver<Maybe<ResolversTypes['Weather']>, ParentType, ContextType>;
}>;

export type StationConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['StationConnection'] = ResolversParentTypes['StationConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['StationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type StationEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['StationEdge'] = ResolversParentTypes['StationEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Station'], ParentType, ContextType>;
}>;

export type WeatherResolvers<ContextType = any, ParentType extends ResolversParentTypes['Weather'] = ResolversParentTypes['Weather']> = ResolversObject<{
  humidity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lastUpdated?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rainRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  temperature?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  windDirection?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  windSpeed?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeatherErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['WeatherError'] = ResolversParentTypes['WeatherError']> = ResolversObject<{
  code?: Resolver<ResolversTypes['WeatherErrorCode'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeatherResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['WeatherResult'] = ResolversParentTypes['WeatherResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Weather' | 'WeatherError', ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  ActivityScore?: ActivityScoreResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Station?: StationResolvers<ContextType>;
  StationConnection?: StationConnectionResolvers<ContextType>;
  StationEdge?: StationEdgeResolvers<ContextType>;
  Weather?: WeatherResolvers<ContextType>;
  WeatherError?: WeatherErrorResolvers<ContextType>;
  WeatherResult?: WeatherResultResolvers<ContextType>;
}>;