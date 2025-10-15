export const SUGGEST_CITIES_CURSOR_QUERY = `
  query SuggestCities($query: String!, $limit: Int, $after: String) {
    suggestCities(query: $query, limit: $limit, after: $after) {
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Empty search results query
export const SUGGEST_CITIES_EMPTY_QUERY = `
  query SuggestCities($query: String!) {
    suggestCities(query: $query) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
      totalCount
    }
  }
`;

// Full data query
export const SUGGEST_CITIES_QUERY = `
  query SuggestCities($query: String!, $limit: Int) {
    suggestCities(query: $query, limit: $limit) {
      edges {
        node {
          id
          name
          country
          stationId
          latitude
          longitude
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;