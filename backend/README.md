# Go Algorithm Playground

A Go 1.27 API for the algorithm playground. The React frontend runs separately.

The hub currently includes:

- an eight-puzzle lab with A*, breadth-first search, and iterative-deepening DFS
- guaranteed-solvable random boards and step-by-step solution playback
- a graph lab for Karger’s randomized minimum-cut algorithm with repeated trials
- matrix multiplication verification with Freivalds' algorithm
- polynomial identity testing with the Schwartz-Zippel algorithm
- configurable CORS

## Run it

```bash
go run ./cmd/server
```

Open <http://localhost:8080/api/problems>. To use another port or restrict CORS:

```bash
PORT=3000 CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000 go run ./cmd/server
```

## Build

```bash
go build -o bin/algorithm-playground ./cmd/server
```

## HTTP API

| Method | Endpoint          | Purpose                                            |
| ------ | ----------------- | -------------------------------------------------- |
| `GET`  | `/api/health`     | Server and registry status                         |
| `GET`  | `/api/algorithms` | Discover puzzle solvers and other algorithm tools |
| `GET`  | `/api/problems`   | Problem descriptions, solution approaches, and limits |

Each problem has a dedicated route group:

| Problem | Solve endpoint | Generate endpoint |
| --- | --- | --- |
| Eight puzzle | `POST /api/problems/eight-puzzle/solve` | `POST /api/problems/eight-puzzle/generate` |
| Minimum cut | `POST /api/problems/minimum-cut/solve` | `POST /api/problems/minimum-cut/generate` |
| Matrix verification | `POST /api/problems/matrix-verification/solve` | `POST /api/problems/matrix-verification/generate` |
| Polynomial identity | `POST /api/problems/polynomial-identity/solve` | `POST /api/problems/polynomial-identity/generate` |

POST requests require `Content-Type: application/json`. Bodies are decoded as
strict JSON and validated with `go-playground/validator`. Unknown fields,
trailing JSON values, missing fields, and out-of-range values return a JSON
`400 Bad Request` response. Unsupported content types return `415` and bodies
over 256 KiB return `413`. API errors use `{"error":"...","status":400}`.

### Resource limits

- solve requests have a 5-second deadline
- at most 4 CPU-heavy requests run concurrently (or half the available CPUs on smaller machines)
- search boards are limited to 2x2 through 4x4
- minimum cut is limited to 50 vertices, 1,000 edges, 500 trials, and 250,000 edge-trial units
- matrix verification is limited to 10x10 matrices and 10 rounds
- polynomial verification is limited to degree 20 and 10 rounds
- JSON request bodies are limited to 256 KiB

Example:

```bash
curl -s http://localhost:8080/api/problems/eight-puzzle/solve \
  -H 'Content-Type: application/json' \
  -d '{"algorithm":"astar","row":3,"column":3,"tiles":[1,2,3,4,5,6,0,7,8]}'
```

Zero represents the blank tile. A solved 3×3 board is `[1,2,3,4,5,6,7,8,0]`.

## Add an algorithm

Implement the small interface in `internal/problems/eightpuzzle/solver`:

```go
type Algorithm interface {
    Metadata() Metadata
    Solve(context.Context, board.Board) (Result, error)
}
```

Then register it in `DefaultRegistry`. The algorithms endpoint and frontend algorithm list pick it up automatically; no new HTTP route is needed.

Problem implementations live below `internal/problems`. Each problem owns its domain and algorithm subpackages, while `internal/server` keeps one route file per problem. For example, `internal/problems/minimumcut/karger` validates a connected undirected graph, performs repeated random contractions, and returns both partitions plus every crossing edge.
