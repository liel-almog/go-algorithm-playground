package solver

import (
	"context"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
)

type IDDFS struct{}

func (IDDFS) Metadata() Metadata {
	return Metadata{
		ID:          "dfs",
		Name:        "Iterative deepening DFS",
		Description: "Uses depth-first memory while increasing the depth limit until it reaches a shortest solution.",
		Optimal:     true,
		Category:    "uninformed",
	}
}

func (algorithm IDDFS) Solve(ctx context.Context, initial board.Board) (Result, error) {
	start := time.Now()
	meta := algorithm.Metadata()
	search := depthFirstSearch{generated: 1, frontierMax: 1, maxExpanded: 2_000_000}
	const maxDepth = 80
	for limit := 0; limit <= maxDepth; limit++ {
		search.path = []board.Board{initial}
		search.moves = make([]string, 0, limit)
		search.onPath = map[string]bool{initial.Key(): true}
		found, err := search.visit(ctx, initial, limit)
		if err != nil {
			return Result{}, err
		}
		if found {
			boards := make([][]int, len(search.path))
			for i, board := range search.path {
				boards[i] = append([]int(nil), board.Tiles...)
			}
			return Result{
				Algorithm:   meta.ID,
				Path:        boards,
				Moves:       search.moves,
				MoveCount:   len(search.moves),
				Expanded:    search.expanded,
				Generated:   search.generated,
				FrontierMax: search.frontierMax,
				DurationUS:  time.Since(start).Microseconds(),
				Optimal:     true,
			}, nil
		}
	}
	return Result{}, ErrNoSolution
}

// depthFirstSearch owns the current path and counters for one solve operation.
// Counters accumulate across depth limits; the path is reset for each iteration.
type depthFirstSearch struct {
	path        []board.Board
	moves       []string
	onPath      map[string]bool
	expanded    int
	generated   int
	frontierMax int
	maxExpanded int
}

func (search *depthFirstSearch) visit(ctx context.Context, current board.Board, remaining int) (bool, error) {
	if err := ctx.Err(); err != nil {
		return false, err
	}
	if current.IsGoal() {
		return true, nil
	}
	if remaining == 0 {
		return false, nil
	}
	search.expanded++
	if search.expanded > search.maxExpanded {
		return false, ErrSearchLimit
	}
	for _, neighbor := range current.Neighbors() {
		key := neighbor.Board.Key()
		if search.onPath[key] {
			continue
		}
		search.generated++
		search.onPath[key] = true
		search.path = append(search.path, neighbor.Board)
		search.moves = append(search.moves, neighbor.Move)
		if len(search.path) > search.frontierMax {
			search.frontierMax = len(search.path)
		}
		found, err := search.visit(ctx, neighbor.Board, remaining-1)
		if err != nil || found {
			return found, err
		}
		delete(search.onPath, key)
		search.path = search.path[:len(search.path)-1]
		search.moves = search.moves[:len(search.moves)-1]
	}
	return false, nil
}
