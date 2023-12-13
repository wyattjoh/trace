import type { Reporter, SpanStack } from "./reporter/reporter.js";

import { SharedReporter } from "./reporter/shared.js";

export type SpanOptions = {
  /**
   * The parent span, if any.
   */
  parent?: Span;

  /**
   * The reporter to use for this span (and any child spans).
   */
  reporter?: Reporter;

  /**
   * The attributes for this span.
   */
  attributes?: Record<string, string>;
};

/**
 * A span is a unit of work that can be timed and reported.
 */
export class Span implements AsyncDisposable {
  /**
   * The last ID used for a span, this is used to generate unique IDs during
   * runtime.
   */
  protected static lastID: bigint = 0n;

  /**
   * The ID of this span used to identify it during distributed tracing.
   */
  readonly #id: bigint = Span.lastID++;

  /**
   * The name of this span.
   */
  readonly #name: string;

  /**
   * The parent span, if any.
   */
  readonly #parent?: Span;

  /**
   * The reporter to use for this span.
   */
  readonly #reporter: Reporter;

  /**
   * The attributes for this span.
   */
  readonly #attributes?: Record<string, string>;

  /**
   * The time when this span was started.
   */
  readonly #startedAt: number = Date.now();

  /**
   * The time when this span was stopped.
   */
  #stoppedAt: number | null = null;

  constructor(
    name: string,
    { parent, reporter = SharedReporter.shared, attributes }: SpanOptions = {}
  ) {
    this.#name = name;
    this.#parent = parent;
    this.#reporter = reporter;
    this.#attributes = attributes;
  }

  /**
   * Stop the span and reports it.
   *
   * @returns A promise that resolves when the span is reported.
   */
  public stop(): Promise<void> {
    this.#stoppedAt = Date.now();
    return this.#report();
  }

  /**
   * The stack of spans.
   */
  protected get stack(): SpanStack {
    const stack: SpanStack = [{ name: this.#name, id: this.#id.toString() }];

    if (this.#parent) {
      stack.unshift(...this.#parent.stack);
    }

    return stack;
  }

  /**
   * Report the span to the reporter.
   *
   * @returns A promise that resolves when the span is reported.
   */
  #report(): Promise<void> {
    if (!this.#stoppedAt) {
      throw new Error("Span is not stopped yet.");
    }

    return this.#reporter.report({
      id: this.#id.toString(),
      name: this.#name,
      stack: this.stack,
      attributes: this.#attributes,
      startedAt: this.#startedAt,
      stoppedAt: this.#stoppedAt,
    });
  }

  /**
   * Create a new span that is a child of this span.
   *
   * @param name The name of the child span.
   * @param attributes The attributes for the child span.
   * @returns The child span.
   */
  public start(name: string, attributes?: Record<string, string>): Span {
    return new Span(name, {
      parent: this,
      reporter: this.#reporter,
      attributes,
    });
  }

  /**
   * Async dispose the span when used with the `using` keyword.
   */
  public async [Symbol.asyncDispose]() {
    await this.stop();
  }
}
