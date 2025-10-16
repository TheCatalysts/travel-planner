import * as client from '../src/client/OpenMeteoObservationsClient';
import { getWeather } from '../src/services/weatherService';
import type { StationDetails } from '../src/types/station';
import type { SensorReading } from '../src/types/sensors';
import { WeatherErrorCode } from '../src/types/graphql';

// Mock the client module
jest.mock('../src/client/OpenMeteoObservationsClient', () => ({
  getStation: jest.fn(),
  getSensorData: jest.fn()
}));

// Mock the cache module
jest.mock('../src/utils/cache', () => {
  return {
    Cache: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      cleanup: jest.fn()
    }))
  };
});

const mockedClient = client as jest.Mocked<typeof client>;

// Mock station data
const mockStation: StationDetails = {
  description: 'Test Station',
  elevation: 100,
  station_type: 13,
  cc: 'de',
  sensors: ['th0', 'wind0', 'rain0'],
  sid: 1004,
  longitude: 12.34,
  latitude: 51.26,
  timezone: {
    utcoffset_int: 'UTC+0200',
    tzfile: 'Europe/Berlin',
    utcoffset: 7200,
    tzname: 'CEST',
    dst: 3600
  },
  date_inserted: '2023-10-14',
  maintainer: 'test',
  STATION_TYPE_CHOICES: [[13, 'Vantage Pro 2']]
};

// Mock sensor readings
const mockTempHumidity: SensorReading = {
  timestamp: 1697324400,
  values: [22.5, 65] // temp, humidity
};

const mockWind: SensorReading = {
  timestamp: 1697324400,
  values: [180, 5.5, 6.0] // direction, speed, avg
};

const mockRain: SensorReading = {
  timestamp: 1697324400,
  values: [0.5, 10, 100] // current, yesterday, total
};

describe('getWeather', () => {
  beforeEach(() => {
    // Reset all mocks and modules
    jest.resetModules();
    jest.clearAllMocks();
    
    // Reset specific mock implementations
    mockedClient.getStation.mockReset();
    mockedClient.getSensorData.mockReset();

    // Re-import the weatherService module to reset cache state
    jest.isolateModules(() => {
      require('../src/services/weatherService');
    });
  });

  test('returns STATION_NOT_FOUND error when station fetch fails', async () => {
    mockedClient.getStation.mockRejectedValue(new Error('Network error'));
    const result = await getWeather('1004');
    expect(result).toEqual({
      code: WeatherErrorCode.StationNotFound,
      message: expect.stringContaining('1004')
    });
    expect(mockedClient.getStation).toHaveBeenCalledWith('1004');
  });

  test('returns full weather data when all sensors available', async () => {
    // Setup mocks
    // Clear mocks and set up fresh responses
    jest.clearAllMocks();
    mockedClient.getStation.mockResolvedValueOnce(mockStation);
    mockedClient.getSensorData
      .mockResolvedValueOnce(mockTempHumidity)  // th0
      .mockResolvedValueOnce(mockWind)          // wind0
      .mockResolvedValueOnce(mockRain);         // rain0

    // Get weather
    const result = await getWeather('1004');

    // Verify result is Weather type
    expect('lastUpdated' in result).toBe(true);
    expect(result).toMatchObject({
      stationId: '1004',
      name: 'Test Station',
      timezone: 'Europe/Berlin',
      temperature: 22.5,
      humidity: 65,
      windSpeed: 5.5,
      windDirection: 180,
      rainRate: 0.5
    });

    // Verify API calls
    expect(mockedClient.getStation).toHaveBeenCalledWith('1004');
    expect(mockedClient.getSensorData).toHaveBeenCalledTimes(3);
  });

  test('returns weather data with limited sensors', async () => {
    // Station without some sensors
    const limitedStation = {
      ...mockStation,
      sensors: ['th0'] // only temperature/humidity sensor
    };

    mockedClient.getStation.mockResolvedValue(limitedStation);
    mockedClient.getSensorData.mockResolvedValueOnce(mockTempHumidity);

    const result = await getWeather('1004');

    expect('lastUpdated' in result).toBe(true);
    expect(result).toMatchObject({
      stationId: '1004',
      name: 'Test Station',
      timezone: 'Europe/Berlin',
      temperature: 22.5,
      humidity: 65
    });

    expect(mockedClient.getSensorData).toHaveBeenCalledTimes(1);
  });

  test('handles sensor failures and returns partial data', async () => {
    mockedClient.getStation.mockResolvedValueOnce(mockStation);
    mockedClient.getSensorData
      .mockResolvedValueOnce(mockTempHumidity)  // th0 succeeds
      .mockRejectedValueOnce(new Error('Sensor offline'))  // wind0 fails
      .mockResolvedValueOnce(mockRain);  // rain0 succeeds

    const result = await getWeather('1004');

    // Verify basic weather data is present
    expect('lastUpdated' in result).toBe(true);
    expect(result).toMatchObject({
      stationId: '1004',
      name: 'Test Station',
      timezone: 'Europe/Berlin',
      temperature: 22.5,
      humidity: 65,
      rainRate: 0.5
    });

    // Verify wind data is missing but didn't cause total failure
    expect(result).not.toHaveProperty('windSpeed');
    expect(result).not.toHaveProperty('windDirection');

    // Verify all sensors were attempted
    expect(mockedClient.getSensorData).toHaveBeenCalledTimes(3);
    expect(mockedClient.getSensorData).toHaveBeenCalledWith('1004', 'th0');
    expect(mockedClient.getSensorData).toHaveBeenCalledWith('1004', 'wind0');
    expect(mockedClient.getSensorData).toHaveBeenCalledWith('1004', 'rain0');
  });

  test('returns DATA_UNAVAILABLE when no sensor data available', async () => {
    // Mock the station call
    mockedClient.getStation.mockResolvedValueOnce(mockStation);
    
    // Mock all sensor calls to return null (no data)
    const nullResponse = Promise.resolve(null);
    mockedClient.getSensorData.mockImplementation(() => nullResponse);

    const result = await getWeather('1004');

    expect(result).toEqual({
      code: WeatherErrorCode.DataUnavailable,
      message: expect.stringContaining('1004')
    });
    
    expect(mockedClient.getSensorData).toHaveBeenCalled();
  });

  test('does not cache error responses', async () => {
    // First call - error
    mockedClient.getStation.mockRejectedValueOnce(new Error('Network error'));
    const result1 = await getWeather('1004');
    expect(result1).toEqual({
      code: WeatherErrorCode.StationNotFound,
      message: expect.stringContaining('1004')
    });

    // Second call - success
    mockedClient.getStation.mockResolvedValueOnce(mockStation);
    mockedClient.getSensorData
      .mockResolvedValueOnce(mockTempHumidity)
      .mockResolvedValueOnce(mockWind)
      .mockResolvedValueOnce(mockRain);

    const result2 = await getWeather('1004');
    expect('lastUpdated' in result2).toBe(true);
    expect(result2).not.toEqual(result1);
  });
});
