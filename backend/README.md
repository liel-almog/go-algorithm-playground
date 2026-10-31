# Go Algorithm Playground

A self-contained algorithms hub built with Go 1.27. The Go server exposes every algorithm over HTTP and embeds the interactive frontend into the same binary.

The hub currently includes:

- an eight-puzzle lab with A*, breadth-first, greedy best-first, and iterative-deepening DFS
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
| `POST` | `/api/puzzles/random`     | Generate a solvable puzzle                         |
| `POST` | `/api/solve`              | Run one solver and return its path and metrics     |
| `POST` | `/api/compare`            | Rank algorithms on one board                       |
| `POST` | `/api/experiments/random` | Compare average cost across random boards          |
| `POST` | `/api/graphs/min-cut`     | Find a graph’s minimum cut with Karger contraction |

Example:

```bash
curl -s http://localhost:8080/api/solve \
  -H 'Content-Type: application/json' \
  -d '{"algorithm":"astar","size":3,"tiles":[1,2,3,4,5,6,0,7,8]}'
```

Zero represents the blank tile. A solved 3×3 board is `[1,2,3,4,5,6,7,8,0]`.

## Add an algorithm

Implement the small interface in `internal/solver`:

```go
type Algorithm interface {
    Metadata() Metadata
    Solve(context.Context, puzzle.Board) (Result, error)
}
```

Then register it in `DefaultRegistry`. The catalogue endpoint and frontend algorithm list pick it up automatically; no new HTTP route is needed. Tests in `internal/solver/solver_test.go` exercise every default algorithm against the same known board.

The comparison rule is explicit: fewest moves first, then fewest expanded states, then shortest runtime. Random experiments rank by successful runs, average move cost, and average states expanded.

Graph algorithm families live in their own focused package. `internal/mincut` validates a connected undirected graph, performs repeated random contractions, and returns both partitions plus every crossing edge. Add another family beside it and expose one thin handler from `internal/server`; shared discovery metadata is returned by `GET /api/algorithms`.
