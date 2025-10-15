export enum SensorType {
  TEMPERATURE = 't',
  TEMP_HUMIDITY = 'th',
  TEMP_HUMIDITY_PRESSURE = 'thb',
  PRESSURE = 'baro',
  WIND = 'wind',
  RAIN = 'rain'
}

export type SensorReading = {
  timestamp: number;  
  values: number[];  
};

export interface TemperatureReading extends SensorReading {
  values: [number];  
}

export interface TempHumidityReading extends SensorReading {
  values: [number, number]; 
}

export interface PressureReading extends SensorReading {
  values: [number];  
}

export interface WindReading extends SensorReading {
  values: [number, number, number];  
}

export interface RainReading extends SensorReading {
  values: [number, number, number];  
}

export type TimeSeriesPeriod = `last${number}${'s' | 'm' | 'h' | 'd' | 'w'}`;