# Travel Planner API

A GraphQL-based travel planning API that provides city suggestions, weather data, and activity recommendations based on current weather conditions. Built with TypeScript, Apollo Server, and Express.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

Visit `http://localhost:4000/graphql` to access the GraphQL playground.

## Architecture Overview

### Core Components

1. **GraphQL Layer**
   - Schema-first design with clear type definitions
   - Type-safe resolvers with proper error handling
   - Clean separation between types and resolvers

2. **Services Layer**
   - `StationService`: City/station suggestions with intelligent scoring
   - `WeatherService`: Weather data retrieval with caching
   - `ActivityService`: Activity recommendations based on current conditions
   - `metricsService`: Application perfomance reporter to monitor perfomance, triggers alerts if latency or error rates exceed threshold and can view presentable data in applications like prometheus,otel etc.

3. **External API Integration**
   - OpenMeteo API client with comprehensive error handling
   - Retry mechanisms for reliability
   - Type-safe response handling
   - Efficient caching strategy
   - Metrics  to monitor perfomance to track things like activity rankings , suggestedcities etc.

4. **Utilities**
   - Generic caching system with TTL support
   - Structured logging
   - Type-safe utilities and helper functions

### Key Features

1. **Dynamic City Search**
   - Partial text matching with scoring
   - Relevance-based results
   - Cached responses for performance
   - Error handling

2. **Weather Information**
   - Multiple sensor support (temperature, wind, rain)
   - Real-time data retrieval
   - Graceful degradation for unavailable sensors
   - Response caching

3. **Activity Recommendations**
   - Weather-based activity scoring
   - Support for multiple activities
   - Configurable scoring thresholds
   - Clear recommendation logic

## Technical Choices

### TypeScript & Express.js
- Strong typing for improved maintainability
- Modern JavaScript features
- Excellent tooling support
- Type safety throughout the codebase

### Apollo Server
- Industry-standard GraphQL implementation
- Built-in performance optimizations
- Excellent developer experience
- Strong TypeScript integration

### Caching Strategy
- In-memory caching with TTL
- Separate caches for different data types
- Automatic cache invalidation
- Type-safe cache implementations

### Testing Framework
- Jest for comprehensive testing
- Mocked external dependencies
- High test coverage
- Clear test organization

## API Documentation

### GraphQL Schema Overview

1. **Queries**
   ```graphql
   type Query {
     # Suggest stations/cities based on a query string
     suggestCities(query: String!, limit: Int = 8): [Station!]!

     # Get current weather for a station
     getWeather(stationId: String!): Weather

     # Rank activities based on current weather
     rankActivities(stationId: String!): [ActivityScore!]!
   }
   ```

2. **Core Types**
   ```graphql
   type Station {
     id: ID!
     name: String!
     country: String!
     stationId: String!
     latitude: Float!
     longitude: Float!
   }

   type Weather {
     stationId: String!
     name: String
     timezone: String
     temperature: Float
     humidity: Float
     windSpeed: Float
     windDirection: Float
     rainRate: Float
   }

   type ActivityScore {
     activity: Activity!
     score: Int!
   }

   enum Activity {
     SKIING
     SURFING
     INDOOR_SIGHTSEEING
     OUTDOOR_SIGHTSEEING
   }
   ```

### Example Queries

1. **Search for Cities**
   ```graphql
   query {
     suggestCities(query: "Leip", limit: 5) {
       name
       country
       stationId
       latitude
       longitude
     }
   }

   With Additional fields
    query {
      suggestCities(query: "Cape Town", limit: 5) {
         edges {
               node {
                     id
                     name
                     stationId
                  weather { 
                     temperature
                     humidity
                     windSpeed
                  }
                  activities {
                     activity
                     score
                     message
                  }
               }
               cursor
         }}
   ```
   
2. **Get Weather Data**
   ```graphql
   query {
     getWeather(stationId: "1001") {
       name
       temperature
       humidity
       windSpeed
       windDirection
       rainRate
     }
   }
   ```

3. **Get Activity Rankings**
   ```graphql
   query {
     rankActivities(stationId: "1001") {
       activity
       score
     }
   }
   ```

### Error Handling

The API follows these principles for error handling:

1. **Graceful Degradation**
   - Returns partial data when possible
   - Clear error messages
   - Proper status codes

2. **Validation**
   - Input validation for all queries
   - Type checking
   - Meaningful error messages

3. **Error Types**
   - Network errors
   - Validation errors
   - Data availability errors
   - Sensor errors

## Trade-offs and Decisions

1. **Caching Strategy**
   - Chose in-memory caching for simplicity and quick implementation
   - Trade-off: No distributed caching support
   - Consideration: For production, would implement Redis or similar
   - Persist Data to the database

2. **Data Models**
   - Simplified station model focusing on essential fields
   - Limited weather parameters to commonly used data
   - Room for extension in activity scoring
   - Trade-off: Some advanced weather data not included or missing from the dataset.

3. **API Design**
   - Focus on simplicity and usability
   - Clear, self-documenting types
   - Trade-off: Some advanced features omitted for clarity

4. **Error Handling**
   - Emphasis on graceful degradation
   - Return partial data when possible
   - Trade-off: Some complex error scenarios simplified

## Future Improvements

1. **Technical Enhancements**
   - Implement distributed caching with Redis
   - Add request rate limiting
   - Add proper metrics collection
   - Implement comprehensive logging
   - Add database for persistence
   - Add CI/CD pipelines
   - Containerize the application with Kubernetes + Helm Charts deployment
   - Add UI
   - Perform all CRUD operations

2. **Feature Additions**
   - Historical weather data support
   - More sophisticated activity recommendations
   - Additional weather parameters
   - Time-based recommendations

3. **API Enhancements**
   - More detailed error types
   - Subscriptions for real-time updates
   - Better input validation

4. **Testing Improvements**
   - Add performance testing
   - Implement load testing
   - Add more integration tests
   - Add API contract tests


## Running the application


2. Run in dev mode:

   npm run dev

3. Run the integration test (starts server, runs sample queries, stops server):

   npm run integration

Sample GraphQL queries

- suggestCities

```
query {
  suggestCities(query: "York") { id name country stationId latitude longitude }
}
```

- getWeather

```
query {
  getWeather(stationId: "1004") { stationId name temperature humidity windSpeed rainRate }
}
```

Notes

- The server disables the Apollo landing page by default to avoid HTML responses for automated clients. Set `APOLLO_LANDING_PAGE=true` to enable it.
- Sensor fetches may return null when external APIs fail; resolvers cache and continue to return available data.
- Use npm run codegen whenever the schema or queries change to keep TypeScript types up to date.

Architecture & Design
---------------------

- Clean separation of concerns:
   - `src/client` contains the OpenMeteo HTTP client (encapsulates retries and error handling).
   - `src/services` contains business logic: station suggestion, weather composition, and activity ranking.
   - `src/graphql` contains the GraphQL schema and resolvers layer which maps service outputs to the API.
   - `scripts` and `tests` contain integration and unit tests.

- GraphQL schema is designed to be extensible: activity is an enum, weather and station schemas are explicit.

Testing
-------

- Unit tests are implemented with Jest. Run them with `npm test`.
- An integration test is available that programmatically starts the server, executes sample queries, and stops the server: `npm run integration`.

Omissions & Trade-offs
----------------------

- Time constraints: focused on delivering a maintainable backend and clear abstractions rather than exhaustive feature coverage.
- The Apollo official Express integration caused package export issues; I implemented a small compatibility handler to delegate requests to Apollo Server directly. In production I'd prefer to use a supported adapter or upgrade/downgrade the package to a matching version.
- No DB persistence was added; station data is read from a JSON file for the exercise. For production, I'd use a geocoding index (Elasticsearch/Algolia or a proper RDBMS) with pagination.
- Monitoring, metrics, and authentication are omitted for brevity.

How AI was used
---------------

- AI (ChatGPT/Copilot) was used to accelerate psuedocode and suggest patterns for error handling, schema design. All outputs were reviewed and adjusted manually to fit the project conventions and constraints.

How I'd improve with more time
-----------------------------

- Add more unit tests and end-to-end tests covering error cases and timeouts.
- Replace the custom Apollo handler with an official integration or lock package versions to avoid package export issues.
- Add CI-backed linting and code coverage thresholds.
- Introduce a small persistence layer for stations, and caching with Redis for weather responses.

Running integration checks from Apollo UI
----------------------------------------

For a convenient, user-friendly way to run tests from a GraphQL UI (Apollo Sandbox / Playground):

1. Enable the Apollo landing page by setting the environment variable when starting the server:

```bash
APOLLO_LANDING_PAGE=true npm run dev
```

2. Open `http://localhost:4000/graphql` in your browser. The Apollo Sandbox will load.


