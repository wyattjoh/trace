import type { Reporter, SpanReport } from "./reporter.js";

import { ConsoleReporter } from "./console.js";

/**
 * The shared reporter is a reporter that used by default for all spans.
 */
export class SharedReporter {
  /**
   * The reporter instance to be used by all spans.
   */
  private static instance: Reporter | null = null;

  /**
   * Returns the reporter instance to be used by all spans.
   */
  public static get shared(): Reporter {
    if (!SharedReporter.instance) {
      SharedReporter.instance = new ConsoleReporter();
    }

    return SharedReporter.instance;
  }

  /**
   * Sets the reporter instance to be used by all spans.
   *
   * @param instance The reporter instance to use.
   */
  public static set(instance: Reporter): void {
    SharedReporter.instance = instance;
  }

  /**
   * Reports a span report using the shared reporter.
   *
   * @param report The span report to report.
   */
  public static report(report: SpanReport): Promise<void> {
    return this.shared.report(report);
  }
}
