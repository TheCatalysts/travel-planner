import type { Request, Response } from 'express';

export interface AppContext {
  req: Request;
  res: Response;
}

export interface HttpGraphQLRequestBody {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface HttpGraphQLRequest {
  body: HttpGraphQLRequestBody;
  headers: Headers;
  method: string;
  search: string;
}

export interface GraphQLResponse {
  status?: number;
  headers?: Record<string, string>;
  body: string | object | AsyncIterable<unknown>;
}

export interface ApolloEnvelope {
  kind: string;
  string: string;
}