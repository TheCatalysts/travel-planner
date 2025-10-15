export const GET_WEATHER_ERROR_QUERY = `
  query GetWeather($stationId: String!) {
    getWeather(stationId: $stationId) {
      ... on WeatherError {
        code
        message
      }
    }
  }
`;

// Query for full weather data
export const GET_WEATHER_FULL_QUERY = `
  query GetWeather($stationId: String!) {
    getWeather(stationId: $stationId) {
      ... on Weather {
        stationId
        name
        temperature
        humidity
        windSpeed
        windDirection
        rainRate
        lastUpdated
      }
    }
  }
`;