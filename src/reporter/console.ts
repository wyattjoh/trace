import type { Reporter, SpanReport } from "./reporter.js";

/**
 * A reporter is responsible for reporting span reports to the console.
 */
export class ConsoleReporter implements Reporter {
  public async report(report: SpanReport): Promise<void> {
    console.log(
      `${report.stack
        .map((e) => {
          return `${e.name}(${e.id})`;
        })
        .join("-")} - ${report.name} took ${
        report.stoppedAt - report.startedAt
      }ms to complete.`
    );
  }
}
