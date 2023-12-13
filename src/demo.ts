import { Span } from "./span.js";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generate(parent: Span) {
  await using span = parent.start("generate");

  {
    await using child = span.start("get-static-params");

    await wait(100);
  }

  await Promise.all(
    new Array(4).fill(0).map(async () => {
      await using child = span.start("render");

      await wait(100);
    })
  );
}

async function detect(parent: Span) {
  await using span = parent.start("detect");

  await wait(100);
}

/**
 * Builds the project.
 */
async function build() {
  // Create the root span, this is used for all the other spans.
  await using root = new Span("build");

  // Run the detect phase.
  await detect(root);

  // Run the compile phase.
  await Promise.all(
    new Array(4).fill(0).map(async () => {
      await using span = root.start("compile");

      await wait(200);
    })
  );

  // Run the generate phase.
  await Promise.all(
    new Array(4).fill(0).map(() => {
      return generate(root);
    })
  );
}

// Start the build.
build();
