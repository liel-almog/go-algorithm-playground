package solver

import (
	"context"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
)

type BFS struct{}

func (BFS) Metadata() Metadata {
	return Metadata{ID: "bfs", Name: "Breadth-first search", Description: "Explores every state one level at a time. Complete and shortest-path optimal.", Optimal: true, Category: "uninformed"}
}

func (algorithm BFS) Solve(ctx context.Context, initial board.Board) (Result, error) {
	start := time.Now()
	meta := algorithm.Metadata()
	initialKey := initial.Key()
	parents := map[string]parentStep{initialKey: {board: initial}}
	queue := []board.Board{initial}
	expanded, generated, frontierMax := 0, 1, 1
	for head := 0; head < len(queue); head++ {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		current := queue[head]
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
			queue = append(queue, neighbor.Board)
			generated++
		}
		if frontier := len(queue) - head - 1; frontier > frontierMax {
			frontierMax = frontier
		}
	}
	return Result{}, ErrNoSolution
}
