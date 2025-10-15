// src/graphql/resolvers/index.ts
import weatherResolver from './weatherResolver';
import { Resolvers } from '../../types/resolvers';

export const resolvers: Resolvers = {
  ...weatherResolver
};