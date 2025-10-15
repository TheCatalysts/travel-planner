import { GraphQLScalarType, Kind } from 'graphql';

/**
 * Custom GraphQL scalar type for handling arbitrary JSON values
 */
export const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  
  // Convert outgoing values
  serialize: (value) => value,
  
  // Convert incoming JSON values
  parseValue: (value) => value,
  
  // Parse literal AST nodes
  parseLiteral: (ast) => {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return Number(ast.value);
      case Kind.LIST:
        return null; // Not supporting inline arrays
      case Kind.OBJECT:
        return null; // Not supporting inline objects
      default:
        return null;
    }
  }
});