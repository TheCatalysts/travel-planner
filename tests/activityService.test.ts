import { rankActivities, Activity } from '../src/services/activityService';

describe('rankActivities', () => {
  const baseWeather = {
    stationId: 'TEST_STATION',
    name: 'Test Station',
    lastUpdated: new Date().toISOString()
  };

  test('prefers outdoor sightseeing on sunny warm day', () => {
    const weather = {
      ...baseWeather,
      temperature: 20,
      humidity: 60,
      windSpeed: 2,
      rainRate: 0,
      snowRate: 0,
      cloudCover: 10
    };
    const ranked = rankActivities(weather);
    expect(ranked[0].activity).toBe(Activity.OutdoorSightseeing);
    expect(ranked[0].score).toBeGreaterThan(80); // Good conditions should score high
    expect(ranked[0].message).toBeTruthy(); // Should have a message
  });

  test('prefers skiing on cold day with snow', () => {
    const weather = {
      ...baseWeather,
      temperature: -5,
      humidity: 70,
      windSpeed: 1,
      rainRate: 0,
      snowRate: 2, 
      cloudCover: 60
    };
    const ranked = rankActivities(weather);
    expect(ranked[0].activity).toBe(Activity.Skiing);
    expect(ranked[0].score).toBeGreaterThan(70); 
    expect(ranked[0].message).toBeTruthy();
  });

  test('recommends indoor activities in severe weather', () => {
    const weather = {
      ...baseWeather,
      temperature: 15,
      humidity: 90,
      windSpeed: 20, 
      rainRate: 10, 
      snowRate: 0,
      cloudCover: 100
    };
    const ranked = rankActivities(weather);
    expect(ranked[0].activity).toBe(Activity.IndoorSightseeing);
    expect(ranked[0].score).toBeGreaterThan(60);
    expect(ranked[0].message).toBeTruthy();
  });
});
