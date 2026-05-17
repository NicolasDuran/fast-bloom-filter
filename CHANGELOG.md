# Changelog

## 3.0.0 - 2026-05-17

### Breaking changes

- Raise the minimum supported Node.js version from 20 to 22.
- Reject operations after `dispose()` instead of continuing on freed WASM memory.
- Reject invalid constructor inputs and malformed serialized filters, and cap `hashCount` at 1,024.

### Improvements

- Cache the compiled WASM module and load its bytes asynchronously before instantiating filters.
- Keep runtime constants private to the module instead of exposing them on the public class export.
- Make clean checkouts self-contained with a checked-in WASM artifact and CI coverage.
- Refresh benchmark methodology, package metadata, and dependency hygiene.
- Expand deterministic test coverage across raw bytes, UTF-8 inputs, empty strings, and serialized edge cases.
