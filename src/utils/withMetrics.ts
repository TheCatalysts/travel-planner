import { TimingMetric } from '../services/metricsService';

type ResolverFn<TArgs, TResult> = (parent: unknown, args: TArgs) => Promise<TResult>;

export function withMetrics<TArgs, TResult>(
  recordFn: (timing: TimingMetric) => void,
  fn: ResolverFn<TArgs, TResult>
): ResolverFn<TArgs, TResult> {
  return async (parent: unknown, args: TArgs): Promise<TResult> => {
    const start = Date.now();
    let success = false;
    try {
      const result = await fn(parent, args);
      success = true;
      return result;
    } finally {
      const end = Date.now();
      recordFn({ start, end, duration: end - start, success });
    }
  };
}