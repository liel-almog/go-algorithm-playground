---
name: go-echo-api-structure
description: Build or review Go HTTP APIs using Echo with clear route, controller, service, and request-validation boundaries. Use when adapting this structure to another project; tailor it to the project's size and existing conventions.
---

# Go Echo API structure

Use the separation demonstrated by a small puzzle API as a starting point, not as boilerplate to copy verbatim.

- Keep `main` responsible for process lifecycle: construct dependencies, start the HTTP server, handle startup errors and signals, then shut down with a bounded context. Keep the server instance accessible through explicit ownership rather than package globals. Treat `http.ErrServerClosed` as a normal shutdown result.
- Register endpoints in route groups by API area. Keep route registration thin; wire handlers and middleware there, without putting business logic in routes.
- Keep controllers focused on HTTP work: bind request DTOs, validate them, call services with `request.Context()`, and write responses. Put puzzle or other domain work in services or domain packages. Avoid extra package layers for very small APIs unless they clarify ownership.
- Define request DTO constraints close to the DTO. Validate both field tags and domain invariants that tags cannot express, such as matrix shape, allowed values, uniqueness, and resource limits. Map malformed requests and domain validation failures to 4xx responses.
- A shared `validator.Validate` can be initialized once and reused for validation. Register custom rules and translations before serving requests. Inject it or use a small constructor when that improves tests or configuration. A package named `configs` containing only a validator is not an environment configuration system; load and validate runtime settings separately.
- Use Echo's error handler with its required `func(error, echo.Context)` signature. Return safe, consistent client errors and log internal failures. Never install an empty handler, and avoid turning every service failure into the same status without examining its type.
- Set listener address, allowed CORS origins, and HTTP timeouts from validated runtime settings when deployment environments differ. Keep local development defaults explicit.
- For long-running work, pass context into the operation and check it during computation. Returning on request cancellation while a worker goroutine blocks on an unbuffered send leaves work behind.

When reviewing an existing project, preserve sound boundaries but report concrete lifecycle, validation, and error-path defects before recommending the structure as a template.
