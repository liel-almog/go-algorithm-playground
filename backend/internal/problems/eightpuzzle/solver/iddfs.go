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
	search := depthFirstSearch{generated: 1, frontierMax: 1, maxExpanded: 4_000_000}
	const maxDepth = 160
	for limit := 0; limit <= maxDepth; limit++ {
		search.path = stack.NewSliceStack[board.Board]()
		if err := search.path.Push(initial); err != nil {
			return Result{}, err
		}
		search.moves = stack.NewSliceStack[string]()
		search.onPath = map[string]bool{initial.Key(): true}
		found, err := search.searchToDepth(ctx, initial, limit)
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

type depthFirstFrame struct {
	board           board.Board
	move            string
	remaining       int
	neighbors       []board.Neighbor
	nextNeighbor    int
	startedVisiting bool
}

func (search *depthFirstSearch) searchToDepth(ctx context.Context, initial board.Board, limit int) (bool, error) {
	frames := stack.NewSliceStack[depthFirstFrame]()
	if err := frames.Push(depthFirstFrame{board: initial, remaining: limit}); err != nil {
		return false, err
	}

	for !frames.IsEmpty() {
		if err := ctx.Err(); err != nil {
			return false, err
		}

		frame, err := frames.Pop()
		if err != nil {
			return false, err
		}

		if !frame.startedVisiting {
			if frame.board.IsGoal() {
				return true, nil
			}
			if frame.remaining == 0 {
				if err := search.backtrack(frame); err != nil {
					return false, err
				}
				continue
			}

			search.expanded++
			if search.expanded > search.maxExpanded {
				return false, ErrSearchLimit
			}

			frame.neighbors = frame.board.Neighbors()
			frame.startedVisiting = true
		}

		if frame.nextNeighbor == len(frame.neighbors) {
			if err := search.backtrack(frame); err != nil {
				return false, err
			}
			continue
		}

		neighbor := frame.neighbors[frame.nextNeighbor]
		frame.nextNeighbor++
		if err := frames.Push(frame); err != nil {
			return false, err
		}

		key := neighbor.Board.Key()
		if search.onPath[key] {
			continue
		}

		if err := search.pushNeighbor(neighbor); err != nil {
			return false, err
		}
		if err := frames.Push(depthFirstFrame{
			board:     neighbor.Board,
			move:      neighbor.Move,
			remaining: frame.remaining - 1,
		}); err != nil {
			return false, err
		}
	}

	return false, nil
}

func (search *depthFirstSearch) pushNeighbor(neighbor board.Neighbor) error {
	search.generated++
	search.onPath[neighbor.Board.Key()] = true

	if err := search.path.Push(neighbor.Board); err != nil {
		return err
	}
	if err := search.moves.Push(neighbor.Move); err != nil {
		return err
	}
	if search.path.Len() > search.frontierMax {
		search.frontierMax = search.path.Len()
	}
	return nil
}

func (search *depthFirstSearch) backtrack(frame depthFirstFrame) error {
	if frame.move == "" {
		return nil
	}

	delete(search.onPath, frame.board.Key())
	if _, err := search.path.Pop(); err != nil {
		return err
	}
	if _, err := search.moves.Pop(); err != nil {
		return err
	}
	return nil
}
