# Algorithm Playground

An interactive playground for exploring search, graph, and randomized verification algorithms. A Go HTTP API runs the algorithms, while a React and TypeScript frontend lets you configure inputs and inspect results.

## Explore the labs

| Lab | Algorithm | What you can do |
| --- | --- | --- |
| Eight puzzle | A*, breadth-first search, iterative-deepening depth-first search | Generate solvable boards and play through solutions. |
| Minimum cut | Karger's algorithm | Generate graphs and inspect the cut found across randomized trials. |
| Matrix multiplication verification | Freivalds' algorithm | Check a claimed matrix product over one or more rounds. |
| Polynomial identity testing | Schwartz–Zippel algorithm | Compare polynomials using random evaluations. |

## Project layout

- [`backend/`](backend/README.md) — Go API, algorithm implementations, and API documentation.
- [`frontend/`](frontend/README.md) — React, TypeScript, Vite, and the interactive labs.

## Run locally

You need Go 1.27 or later, Node.js and npm. The backend's development command also requires [Air](https://github.com/air-verse/air).

1. Install Air and start the API from `backend/`:

   ```sh
   go install github.com/air-verse/air@latest
   cd backend
   CORS_ALLOWED_ORIGINS=http://localhost:3000 make run
   ```

2. In another terminal, install dependencies and start the frontend from `frontend/`:

   ```sh
   cd frontend
   npm ci
   VITE_API_BASE_URL=http://localhost:8080/api npm run dev
   ```

Open <http://localhost:3000>. The API listens on <http://localhost:8080> by default; its catalog is available at <http://localhost:8080/api/problems>. If either port changes, update `CORS_ALLOWED_ORIGINS` and `VITE_API_BASE_URL` to match. The API base URL must include `/api`.

For endpoint details, request examples, build commands, and development conventions, see the [backend](backend/README.md) and [frontend](frontend/README.md) guides.
