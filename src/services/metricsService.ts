import { logger } from '../utils/logger';

export interface TimingMetric {
  start: number;
  end: number;
  duration: number;
  success: boolean;
}

export interface ServiceMetrics {
  weather: {
    latency: TimingMetric[];
    errorCount: number;
    cacheHits: number;
    cacheMisses: number;
  };
  stations: {
    latency: TimingMetric[];
    errorCount: number;
    searchCount: number;
  };
  activities: {
    latency: TimingMetric[];
    rankings: number;
  };
}

class MetricsService {
  private metrics: ServiceMetrics = {
    weather: {
      latency: [],
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    },
    stations: {
      latency: [],
      errorCount: 0,
      searchCount: 0
    },
    activities: {
      latency: [],
      rankings: 0
    }
  };

  private maxMetrics = 1000; // Keep last 1000 measurements

  recordWeatherLatency(timing: TimingMetric) {
    this.metrics.weather.latency.push(timing);
    this.trimMetrics(this.metrics.weather.latency);
    if (!timing.success) {
      this.metrics.weather.errorCount++;
    }
  }

  recordWeatherCache(hit: boolean) {
    if (hit) {
      this.metrics.weather.cacheHits++;
    } else {
      this.metrics.weather.cacheMisses++;
    }
  }

  recordStationLatency(timing: TimingMetric) {
    this.metrics.stations.latency.push(timing);
    this.trimMetrics(this.metrics.stations.latency);
    if (!timing.success) {
      this.metrics.stations.errorCount++;
    }
  }

  recordStationSearch() {
    this.metrics.stations.searchCount++;
  }

  recordActivityLatency(timing: TimingMetric) {
    this.metrics.activities.latency.push(timing);
    this.trimMetrics(this.metrics.activities.latency);
    this.metrics.activities.rankings++;
  }

  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  getHealthMetrics() {
    const weather = this.calculateHealthMetrics(this.metrics.weather.latency);
    const stations = this.calculateHealthMetrics(this.metrics.stations.latency);
    const activities = this.calculateHealthMetrics(this.metrics.activities.latency);

    return {
      weather: {
        ...weather,
        errorRate: this.metrics.weather.errorCount / this.metrics.weather.latency.length,
        cacheHitRate: this.metrics.weather.cacheHits / (this.metrics.weather.cacheHits + this.metrics.weather.cacheMisses)
      },
      stations: {
        ...stations,
        errorRate: this.metrics.stations.errorCount / this.metrics.stations.latency.length,
        searchesPerMinute: this.calculateRate(this.metrics.stations.searchCount)
      },
      activities: {
        ...activities,
        rankingsPerMinute: this.calculateRate(this.metrics.activities.rankings)
      }
    };
  }

  private calculateHealthMetrics(latencyData: TimingMetric[]) {
    if (latencyData.length === 0) {
      return { p50: 0,p95: 0,p99: 0,successRate: 1 };
    }

    const sortedDurations = latencyData
      .map(m => m.duration)
      .sort((a, b) => a - b);

    return {
      p50: this.percentile(sortedDurations, 0.5),
      p95: this.percentile(sortedDurations, 0.95),
      p99: this.percentile(sortedDurations, 0.99),
      successRate: latencyData.filter(m => m.success).length / latencyData.length
    };
  }

  private percentile(sortedData: number[], p: number): number {
    if (sortedData.length === 0) return 0;
    const index = Math.ceil(p * sortedData.length) - 1;
    return sortedData[index];
  }

  private calculateRate(count: number): number {
    const minuteInMs = 60 * 1000;
    const now = Date.now();
    const windowStart = now - minuteInMs;
    // Simplified rate calculation - in a real system, we'd track timestamps
    return count / 60; // events per minute
  }

  private trimMetrics<T>(array: T[]) {
    if (array.length > this.maxMetrics) {
      array.splice(0, array.length - this.maxMetrics);
    }
  }

  logHealthMetrics() {
    const metrics = this.getHealthMetrics();
    logger.info({
      weather: {
        p95LatencyMs: metrics.weather.p95.toFixed(2),
        errorRate: (metrics.weather.errorRate * 100).toFixed(2) + '%',
        cacheHitRate: (metrics.weather.cacheHitRate * 100).toFixed(2) + '%'
      },
      stations: {
        p95LatencyMs: metrics.stations.p95.toFixed(2),
        errorRate: (metrics.stations.errorRate * 100).toFixed(2) + '%',
        searchRate: metrics.stations.searchesPerMinute.toFixed(2) + '/min'
      },
      activities: {
        p95LatencyMs: metrics.activities.p95.toFixed(2),
        successRate: (metrics.activities.successRate * 100).toFixed(2) + '%',
        rankRate: metrics.activities.rankingsPerMinute.toFixed(2) + '/min'
      }
    }, 'Service health metrics');
  }
}

export const metricsService = new MetricsService();