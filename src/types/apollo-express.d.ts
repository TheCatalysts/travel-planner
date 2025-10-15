declare module "@apollo/server/express4" {
  import { RequestHandler } from 'express';
  import { ApolloServer } from '@apollo/server';

  // minimal typing for expressMiddleware
  export function expressMiddleware(server: ApolloServer): RequestHandler;
}
