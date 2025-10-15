export interface WeatherData {
  stationId: string;
  name: string;
  timezone?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  rainRate?: number;
}
