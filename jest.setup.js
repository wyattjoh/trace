// Ensure that the dispose symbols are available in the global scope for tests.
Symbol.asyncDispose = Symbol.asyncDispose || Symbol("asyncDispose");
Symbol.dispose = Symbol.dispose || Symbol("dispose");
