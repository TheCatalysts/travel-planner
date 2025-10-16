import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/schema.graphql",
  generates: {
    "src/types/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations"
      ]
    },
    "src/types/resolvers.ts": {
      plugins: [
        "typescript",
        "typescript-resolvers"
      ],
      config: {
        useIndexSignature: true
      }
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    }
  }
};

export default config;
