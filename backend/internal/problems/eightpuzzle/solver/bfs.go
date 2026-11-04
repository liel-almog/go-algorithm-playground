package solver

import (
	"context"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
	"github.com/liel-almog/go-algorithm-playground/internal/queue"
)

type BFS struct{}

func (BFS) Metadata() Metadata {
	return Metadata{
		ID:          "bfs",
		Name:        "Breadth-first search",
		Description: "Explores every state one level at a time. Complete and shortest-path optimal.",
		Optimal:     true,
		Category:    "uninformed",
	}
}

func (algorithm BFS) Solve(ctx context.Context, initial board.Board) (Result, error) {
	start := time.Now()
	meta := algorithm.Metadata()
	initialKey := initial.Key()
	parents := map[string]parentStep{initialKey: {board: initial}}
	frontier := queue.NewSliceQueue[board.Board]()
	if err := frontier.Enqueue(initial); err != nil {
		return Result{}, err
	}
	expanded, generated, frontierMax := 0, 1, 1
	for !frontier.IsEmpty() {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		current, err := frontier.Dequeue()
		if err != nil {
			return Result{}, err
		}
		currentKey := current.Key()
		if current.IsGoal() {
			return finish(meta, start, currentKey, parents, expanded, generated, frontierMax), nil
		}
		expanded++
		for _, neighbor := range current.Neighbors() {
			key := neighbor.Board.Key()
			if _, seen := parents[key]; seen {
				continue
			}
			if generated >= maxStoredStates {
				return Result{}, ErrSearchLimit
			}
			parents[key] = parentStep{previous: currentKey, board: neighbor.Board, move: neighbor.Move}
			if err := frontier.Enqueue(neighbor.Board); err != nil {
				return Result{}, err
			}
			generated++
		}
		if frontier.Len() > frontierMax {
			frontierMax = frontier.Len()
		}
	}
	return Result{}, ErrNoSolution
}
