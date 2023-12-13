/**
 * A span stack is a stack of spans from the root to the current span.
 */
export type SpanStack = {
  /**
   * The id of the span.
   */
  id: string;

  /**
   * The name of the span.
   */
  name: string;
}[];

/**
 * A span report is a report of a span that has been stopped.
 */
export type SpanReport = {
  /**
   * The id of the span that was reported.
   */
  id: string;

  /**
   * The name of the span that was reported.
   */
  name: string;

  /**
   * The stack of spans from the root to the current span.
   */
  stack: SpanStack;

  /**
   * The attributes of the span, if any.
   */
  attributes?: Record<string, string>;

  /**
   * The time when this span was started, in milliseconds.
   */
  startedAt: number;

  /**
   * The time when this span was stopped, in milliseconds.
   */
  stoppedAt: number;
};

/**
 * A reporter is responsible for reporting span reports.
 */
export type Reporter = {
  /**
   * Reports a span report.
   *
   * @param report The span report to report.
   */
  report(report: SpanReport): Promise<void>;
};
