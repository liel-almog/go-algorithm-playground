package solver

import (
	"context"
	"slices"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
	"github.com/liel-almog/go-algorithm-playground/internal/stack"
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
		search.path = stack.NewSliceStack[board.Board]()
		if err := search.path.Push(initial); err != nil {
			return Result{}, err
		}
		search.moves = stack.NewSliceStack[string]()
		search.onPath = map[string]bool{initial.Key(): true}
		found, err := search.visit(ctx, initial, limit)
		if err != nil {
			return Result{}, err
		}

		if found {
			path, err := drain(search.path)
			if err != nil {
				return Result{}, err
			}
			moves, err := drain(search.moves)
			if err != nil {
				return Result{}, err
			}
			boards := make([][]int, len(path))
			for i, step := range path {
				boards[i] = append([]int(nil), step.Tiles...)
			}
			return Result{
				Algorithm:   meta.ID,
				Path:        boards,
				Moves:       moves,
				MoveCount:   len(moves),
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

// drain empties the stack and returns its items from bottom to top.
func drain[T any](s stack.Stack[T]) ([]T, error) {
	items := make([]T, 0, s.Len())
	for !s.IsEmpty() {
		item, err := s.Pop()
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	slices.Reverse(items)
	return items, nil
}

// depthFirstSearch owns the current path and counters for one solve operation.
// Counters accumulate across depth limits; the path is reset for each iteration.
type depthFirstSearch struct {
	path        stack.Stack[board.Board]
	moves       stack.Stack[string]
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
		if err := search.path.Push(neighbor.Board); err != nil {
			return false, err
		}

		if err := search.moves.Push(neighbor.Move); err != nil {
			return false, err
		}

		if search.path.Len() > search.frontierMax {
			search.frontierMax = search.path.Len()
		}

		found, err := search.visit(ctx, neighbor.Board, remaining-1)
		if err != nil || found {
			return found, err
		}

		delete(search.onPath, key)
		if _, err := search.path.Pop(); err != nil {
			return false, err
		}

		if _, err := search.moves.Pop(); err != nil {
			return false, err
		}
	}

	return false, nil
}
