export function resetMetrics(metricsService: typeof import('../../../src/services/metricsService').metricsService) {
  const metrics = metricsService.getMetrics();

  Object.assign(metrics.weather, {
    latency: [],
    errorCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
  });

  Object.assign(metrics.stations, {
    latency: [],
    errorCount: 0,
    searchCount: 0,
  });
}