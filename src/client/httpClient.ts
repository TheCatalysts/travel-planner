import axios, { AxiosInstance, AxiosError } from "axios";
import axiosRetry from "axios-retry";
import { logger } from "../utils/logger";

export interface IHttpClient {
  get<T>(url: string): Promise<T | null>;
}

export class AxiosHttpClient implements IHttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.WEATHER_API_BASE_URL || "", timeout = 5000, retries = 3) {
    if (!baseURL) throw new Error("Missing WEATHER_API_BASE_URL in environment variables");

    this.client = axios.create({ baseURL, timeout });

    axiosRetry(this.client, {
      retries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) && error.response?.status !== 404,
      onRetry: (retryCount, error) => {
        logger.warn({ retryCount, error: error?.message }, "Retrying HTTP request");
      },
    });
  }

  async get<T>(url: string): Promise<T | null> {
    try {
      const res = await this.client.get<T>(url);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        logger.info({ url }, "Resource not found (404)");
        return null;
      }
      logger.error({ error: err, url }, "HTTP GET failed");
      throw err;
    }
  }
}