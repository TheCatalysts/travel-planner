// src/utils/apolloHandler.ts
import { Response } from 'express';
import type { GraphQLResponse } from '../types/apollo';

/**
 * Apollo response handler for queries and mutations.
 * Converts ApolloServer response to Express response.
 */
export async function handleApolloResponse(res: Response, response: GraphQLResponse): Promise<void> {
  const status = response.status ?? 200;

  // Set headers if provided
  if (response.headers) {
    for (const [key, value] of Object.entries(response.headers)) {
      if (typeof value === 'string') res.setHeader(key, value);
    }
  }

  // Send body (string or object)
  if (response.body == null) {
    res.sendStatus(status);
  } else if (typeof response.body === 'string') {
    try {
      res.status(status).json(JSON.parse(response.body));
    } catch {
      res.status(status).send(response.body);
    }
  } else {
    res.status(status).json(response.body);
  }
}
