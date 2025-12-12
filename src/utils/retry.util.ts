interface RetryOptions {
  retries: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { retries: 3, factor: 2, minTimeout: 1000, maxTimeout: 10000, randomize: true }
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > options.retries) {
        throw error;
      }

      const { factor = 2, minTimeout = 1000, maxTimeout = 10000, randomize = true } = options;
      let delay = minTimeout * Math.pow(factor, attempt - 1);
      if (randomize) {
        delay = delay * (1 + Math.random());
      }
      delay = Math.min(delay, maxTimeout);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
