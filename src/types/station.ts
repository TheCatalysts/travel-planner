export interface StationType {
  id: number;
  name: string;
}

export interface StationTimezone {
  utcoffset_int: string;
  tzfile: string;
  utcoffset: number;
  tzname: string;
  dst: number;
}

export interface StationDetails {
  description: string;
  elevation: number;
  station_type: number;
  cc: string;
  sensors: string[];
  sid: number;
  longitude: number;
  latitude: number;
  timezone: StationTimezone;
  date_inserted: string;
  maintainer: string;
  STATION_TYPE_CHOICES: [number, string][];
}

// Simplified station type for GraphQL responses
export type Station = {
  id: string;
  name: string;
  country: string;
  stationId: string;
  latitude: number;
  longitude: number;
};