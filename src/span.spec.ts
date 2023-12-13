import type { Reporter, SpanReport } from "./reporter/reporter.js";
import { Span } from "./span.js";

class MockReporter implements Reporter {
  public reports: SpanReport[] = [];

  public async report(report: SpanReport): Promise<void> {
    this.reports.push(report);
  }
}

describe("Span", () => {
  it("should stop the span after the dispose", async () => {
    const reporter = new MockReporter();

    expect(reporter.reports.length).toBe(0);

    // Run the span within the block.
    {
      await using span = new Span("root", { reporter });
    }

    expect(reporter.reports.length).toBe(1);
  });

  it("should stop the span when called", async () => {
    const reporter = new MockReporter();

    expect(reporter.reports.length).toBe(0);

    // Run the span within the block.
    {
      const span = new Span("root", { reporter });
      await span.stop();
    }

    expect(reporter.reports.length).toBe(1);
  });

  it("should handle multiple spans", async () => {
    const reporter = new MockReporter();

    expect(reporter.reports.length).toBe(0);

    // Run the span within the block.
    {
      await using root = new Span("root", { reporter });
      await using child = root.start("child");
    }

    // Validate that we have the right reports.

    expect(reporter.reports.length).toBe(2);
    expect(reporter.reports[0].name).toBe("child");
    expect(reporter.reports[1].name).toBe("root");

    // Validate that the stacks are correct

    expect(reporter.reports[0].stack).toHaveLength(2);
    expect(reporter.reports[0].stack[0].name).toBe("root");
    expect(reporter.reports[0].stack[1].name).toBe("child");

    expect(reporter.reports[1].stack).toHaveLength(1);
    expect(reporter.reports[1].stack[0].name).toBe("root");

    // Validate that the ID's are what we expect.

    const child = reporter.reports[0].id;
    const root = reporter.reports[1].id;

    expect(child).not.toBe(root);

    expect(reporter.reports[0].stack[0].id).toBe(root);
    expect(reporter.reports[0].stack[1].id).toBe(child);
    expect(reporter.reports[1].stack[0].id).toBe(root);
  });
});
