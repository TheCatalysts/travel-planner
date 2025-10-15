import { getStation, getSensorData } from "../client/OpenMeteoObservationsClient";
import { Cache } from "../utils/cache";
import { logger } from "../utils/logger";
import type { Weather, WeatherError } from "../types/graphql";
import { WeatherErrorCode } from "../types/graphql";
import type { StationDetails } from "../types/station";
import type { TempHumidityReading, WindReading, RainReading } from "../types/sensors";

// Cache configuration
const CACHE_TTL = 1000 * 60 * 5;  // 5 minutes
const weatherCache = new Cache<Weather>();

/**
 * Get current weather data for a station
 * @returns Weather data or WeatherError if there's a problem
 */
export const getWeather = async (stationId: string): Promise<Weather | WeatherError> => {
  try {
    // Check cache first
    const cached = weatherCache.get(stationId);
    if (cached) {
      logger.debug({ stationId }, 'Returning cached weather data');
      return cached;
    }

    // Get station details
    let station: StationDetails;
    try {
      station = await getStation(stationId);
    } catch (error) {
      logger.error({ error, stationId }, 'Failed to fetch station');
      return {
        code: WeatherErrorCode.STATION_NOT_FOUND,
        message: `Station ${stationId} not found or is unavailable`
      };
    }

    // Initialize weather data with station info
    const weather: Weather = {
      stationId: stationId,
      name: station.description,
      timezone: station.timezone?.tzfile,
      lastUpdated: new Date().toISOString()
    };

    let dataAvailable = false;

    // Get temperature and humidity data
    if (station.sensors.includes('th0')) {
      try {
        const data = await getSensorData(stationId, 'th0') as TempHumidityReading | null;
        if (data) {
          const [temp, humidity] = data.values;
          weather.temperature = temp;
          weather.humidity = humidity;
          dataAvailable = true;
        }
      } catch (error) {
        logger.warn({ error, stationId }, 'Failed to fetch temperature/humidity data');
      }
    }

    // Get wind data
    if (station.sensors.includes('wind0')) {
      try {
        const data = await getSensorData(stationId, 'wind0') as WindReading | null;
        if (data) {
          const [direction, speed] = data.values;
          weather.windDirection = direction;
          weather.windSpeed = speed;
          dataAvailable = true;
        }
      } catch (error) {
        logger.warn({ error, stationId }, 'Failed to fetch wind data');
      }
    }

    // Get rain data
    if (station.sensors.includes('rain0')) {
      try {
        const data = await getSensorData(stationId, 'rain0') as RainReading | null;
        if (data) {
          const [currentRate] = data.values;
          weather.rainRate = currentRate;
          dataAvailable = true;
        }
      } catch (error) {
        logger.warn({ error, stationId }, 'Failed to fetch rain data');
      }
    }

    // If no sensor data was available, return an error
    if (!dataAvailable) {
      return {
        code: WeatherErrorCode.DATA_UNAVAILABLE,
        message: `No weather data available for station ${stationId}`
      };
    }

    // Cache and return the weather data
    weatherCache.set(stationId, weather, CACHE_TTL);
    
    logger.info({ 
      stationId, 
      hasTemp: weather.temperature !== undefined,
      hasWind: weather.windSpeed !== undefined,
      hasRain: weather.rainRate !== undefined
    }, 'Weather data fetched successfully');
    
    return weather;
  } catch (error) {
    logger.error({ error, stationId }, 'Unexpected error while fetching weather data');
    return {
      code: WeatherErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred while fetching weather data'
    };
  }
};
