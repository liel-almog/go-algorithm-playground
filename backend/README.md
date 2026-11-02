# Go Algorithm Playground

A self-contained algorithms hub built with Go 1.27. The Go server exposes every algorithm over HTTP and embeds the interactive frontend into the same binary.

The hub currently includes:

- an eight-puzzle lab with A*, breadth-first search, and iterative-deepening DFS
- guaranteed-solvable random boards and step-by-step solution playback
- lowest-cost comparisons on the same board and multi-run random benchmarks
- a graph lab for Karger’s randomized minimum-cut algorithm with repeated trials
- configurable CORS

## Run it

```bash
go run ./cmd/server
```

Open <http://localhost:8080>. To use another port or restrict CORS:

```bash
PORT=3000 CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000 go run ./cmd/server
```

## Test and build

```bash
go test ./...
go build -o bin/algorithm-playground ./cmd/server
```

## HTTP API

| Method | Endpoint                  | Purpose                                            |
| ------ | ------------------------- | -------------------------------------------------- |
| `GET`  | `/api/health`             | Server and registry status                         |
| `GET`  | `/api/algorithms`         | Discover every registered solver                   |
| `GET`  | `/api/problems`           | Problem descriptions, solution approaches, and limits |
| `POST` | `/api/puzzles/random`     | Generate a solvable puzzle                         |
| `POST` | `/api/solve`              | Run one solver and return its path and metrics     |
| `POST` | `/api/compare`            | Rank algorithms on one board                       |
| `POST` | `/api/experiments/random` | Compare average cost across random boards          |
| `POST` | `/api/graphs/min-cut`     | Find a graph’s minimum cut with Karger contraction |

Each problem also has a dedicated, independently extensible route group:

| Problem | Solve endpoint | Generate endpoint |
| --- | --- | --- |
| Eight puzzle | `POST /api/problems/eight-puzzle/solve` | `POST /api/problems/eight-puzzle/generate` |
| Minimum cut | `POST /api/problems/minimum-cut/solve` | `POST /api/problems/minimum-cut/generate` |
| Matrix verification | `POST /api/problems/matrix-verification/solve` | `POST /api/problems/matrix-verification/generate` |
| Polynomial identity | `POST /api/problems/polynomial-identity/solve` | `POST /api/problems/polynomial-identity/generate` |

All request bodies are decoded as strict JSON and validated with
`go-playground/validator`. Unknown fields, trailing JSON values, missing fields,
and out-of-range values return a JSON `400 Bad Request` response.

### Resource limits

- solve requests have a 5-second deadline
- at most 4 CPU-heavy requests run concurrently (or half the available CPUs on smaller machines)
- search boards are limited to 2x2 through 4x4; experiments remain capped at 3x3 and 5 runs
- minimum cut is limited to 50 vertices, 1,000 edges, 500 trials, and 250,000 edge-trial units
- matrix verification is limited to 10x10 matrices and 10 rounds
- polynomial verification is limited to degree 20 and 10 rounds
- JSON request bodies are limited to 256 KiB

Example:

```bash
curl -s http://localhost:8080/api/solve \
  -H 'Content-Type: application/json' \
  -d '{"algorithm":"astar","size":3,"tiles":[1,2,3,4,5,6,0,7,8]}'
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

Then register it in `DefaultRegistry`. The catalogue endpoint and frontend algorithm list pick it up automatically; no new HTTP route is needed.

The comparison rule is explicit: fewest moves first, then fewest expanded states, then shortest runtime. Random experiments rank by successful runs, average move cost, and average states expanded.

Problem implementations live below `internal/problems`. Each problem owns its domain and algorithm subpackages, while `internal/server` keeps one route file per problem. For example, `internal/problems/minimumcut/karger` validates a connected undirected graph, performs repeated random contractions, and returns both partitions plus every crossing edge.
