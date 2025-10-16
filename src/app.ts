import express, { Request, Response, NextFunction } from 'express';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import resolvers from './graphql/resolvers/weatherResolver';
import { readFileSync } from 'fs';
import path from 'path';
import { logger } from './utils/logger';
import type { AppContext } from './types/apollo';

const app = express();

// Load GraphQL schema
const schemaPath = path.join(__dirname, 'graphql/schema.graphql');
const typeDefs = readFileSync(schemaPath, 'utf8');

// Configure Apollo Server
const server = new ApolloServer<AppContext>({
  typeDefs,
  resolvers: resolvers as any, 
  introspection: process.env.NODE_ENV !== 'production',
  csrfPrevention: process.env.NODE_ENV === 'production',
  plugins: [
    // 👇 Enable the local embedded landing page only in dev
    ...(process.env.NODE_ENV !== 'production'
      ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
      : []),
  ],

});

// HTTP server reference for clean shutdown
let httpServer: ReturnType<typeof app.listen> | null = null;

/**
 * Creates an Express handler for GraphQL requests
 */
async function makeHandler() {
  return async (req: Request, res: Response) => {
    try {
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value.join(',') : value);
        }
      });

      const httpGraphQLRequest = {
        body: req.body,
        headers,
        method: req.method,
        search: req.url && req.url.includes('?') ? req.url.split('?')[1] : '',
      } as any;

      const response = (await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest,
        context: async () => ({ req, res }),
      })) as any;

      const status = response.status || 200;

      if (response.headers) {
        for (const [k, v] of Object.entries(response.headers)) {
          if (typeof v === 'string') res.setHeader(k, v);
        }
      }

      let body = response.body;

      // unwrap Apollo envelope { kind, string }
      if (body && typeof body === 'object' && 'kind' in body && 'string' in body) {
        try {
          const parsed = JSON.parse((body as any).string);
          return res.status(status).json(parsed);
        } catch {
          body = (body as any).string;
        }
      }

      if (body == null) {
        return res.status(status).send();
      }

      // handle AsyncIterable
      if (typeof body === 'object' && Symbol.asyncIterator in body) {
        let collected = '';
        for await (const chunk of body as AsyncIterable<any>) {
          if (typeof chunk === 'string') collected += chunk;
          else if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
            collected += Buffer.from(chunk).toString('utf8');
          } else {
            collected += String(chunk);
          }
        }
        try {
          const parsed = JSON.parse(collected);
          return res.status(status).json(parsed);
        } catch {
          return res.status(status).send(collected);
        }
      }

      if (typeof body === 'string') {
        try {
          const parsed = JSON.parse(body);
          return res.status(status).json(parsed);
        } catch {
          return res.status(status).send(body);
        }
      }

      return res.status(status).send(body);
    } catch (err: any) {
      logger.error({ err }, 'GraphQL handler error');
      res.status(500).send(err?.message || String(err));
    }
  };
}

export async function startServer(port = 4000) {
  await server.start();
  app.use('/graphql', express.json(), await makeHandler());

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({ err, path: req.path }, 'Unhandled error in request');
    res
      .status(500)
      .json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
  });

  await new Promise<void>((resolve) => {
    httpServer = app.listen(port, '0.0.0.0' ,() => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
      resolve();
    });
  });
}

export async function stopServer() {
  if (httpServer !== null) {
    await new Promise<void>((resolve, reject) => {
      httpServer!.close((err: any) => (err ? reject(err) : resolve()));
    });
    httpServer = null;
  }
  try {
    await server.stop();
  } catch {
    // ignore
  }
}

// if run directly, start the server
if (require.main === module) {
  startServer().catch((e) => {
    console.error(e);
    process.exit(1);
  });

  const shutdown = async () => {
    console.log('Shutting down...');
    try {
      await stopServer();
    } catch (e) {
      console.error('Error during shutdown', e);
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}