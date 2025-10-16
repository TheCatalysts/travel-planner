import 'dotenv/config';
import { logger } from "../utils/logger";
import type { StationDetails } from "../types/station";
import type { SensorReading, TimeSeriesPeriod } from "../types/sensors";
import { AxiosHttpClient } from "./httpClient";

const API_BASE = process.env.WEATHER_API_BASE_URL;
if (!API_BASE) throw new Error("Missing WEATHER_API_BASE_URL in environment");

const http = new AxiosHttpClient(API_BASE);

/* parsers */
function parseSensorArray(arr: unknown): SensorReading | null {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const [timestamp, ...values] = arr;
  return { timestamp, values };
}

function parseTimeSeriesArray(arr: unknown): SensorReading[] {
  if (!Array.isArray(arr)) return [];
  return (arr as any[])
    .filter(Array.isArray)
    .map(r => {
      const [timestamp, ...values] = r;
      return { timestamp, values };
    });
}

/* exports */

/**
 * Fetch station details. Throws if station is not found (null).
 */
export const getStation = async (stationId: string): Promise<StationDetails> => {
  const path = `/${stationId}`;

  const data = await http.get<StationDetails>(path);
  if (!data) {
    const msg = `Station ${stationId} not found (no data returned from weather API)`;
    logger.warn({ stationId }, msg);
    throw new Error(msg);
  }

  return data;
};

/**
 * Latest reading from a sensor: returns null when sensor doesn't exist/no data.
 */
export const getSensorData = async (stationId: string, sensor: string): Promise<SensorReading | null> => {
  const path = `/${stationId}/${sensor}`;

  const data = await http.get<any[]>(path);
  return parseSensorArray(data);
};

/**
 * Time series for sensor and period
 */
export const getTimeSeries = async (
  stationId: string,
  sensor: string,
  period: TimeSeriesPeriod
): Promise<SensorReading[]> => {
  const path = `/${stationId}/${sensor}/${period}`;

  const data = await http.get<any[]>(path);
  return parseTimeSeriesArray(data);
};
