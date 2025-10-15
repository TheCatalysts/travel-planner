import type { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import type { AppContext } from './apollo';
import { StationConnection, WeatherResult, ActivityScore, Weather, WeatherError } from './graphql';

type ResolverFn<TResult, TArgs> = (
  parent: unknown,
  args: TArgs,
  context: AppContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

interface SuggestCitiesArgs {
  query: string;
  limit?: number;
  after?: string;
}

interface WeatherArgs {
  stationId: string;
}

interface RankActivitiesArgs {
  stationId: string;
}

export interface QueryResolvers {
  suggestCities: ResolverFn<StationConnection, SuggestCitiesArgs>;
  getWeather: ResolverFn<WeatherResult, WeatherArgs>;
  rankActivities: ResolverFn<ActivityScore[], RankActivitiesArgs>;
}

// export interface MutationResolvers {
//   runIntegrationChecks: ResolverFn<TestResult[], Record<string, never>>;
// }

export interface Resolvers {
  Query: { [key in keyof QueryResolvers]: QueryResolvers[key] };
  Mutation: { };//[key in keyof MutationResolvers]: MutationResolvers[key] 
  JSON: GraphQLScalarType;
  WeatherResult: {
    __resolveType: (obj: Weather | WeatherError) => 'Weather' | 'WeatherError' | null;
  };
  [key: string]: unknown;
}