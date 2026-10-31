package solver

import (
	"context"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/puzzle"
)

type IDDFS struct{}

func (IDDFS) Metadata() Metadata {
	return Metadata{ID: "dfs", Name: "Iterative deepening DFS", Description: "Uses depth-first memory while increasing the depth limit until it reaches a shortest solution.", Optimal: true, Category: "uninformed"}
}

func (algorithm IDDFS) Solve(ctx context.Context, initial puzzle.Board) (Result, error) {
	start := time.Now()
	meta := algorithm.Metadata()
	expanded, generated, frontierMax := 0, 1, 1
	const maxDepth = 80
	const maxExpanded = 2_000_000
	for limit := 0; limit <= maxDepth; limit++ {
		path := []puzzle.Board{initial}
		moves := make([]string, 0, limit)
		onPath := map[string]bool{initial.Key(): true}
		found, err := depthLimited(ctx, initial, limit, &path, &moves, onPath, &expanded, &generated, &frontierMax, maxExpanded)
		if err != nil {
			return Result{}, err
		}
		if found {
			boards := make([][]int, len(path))
			for i, board := range path {
				boards[i] = append([]int(nil), board.Tiles...)
			}
			return Result{Algorithm: meta.ID, Path: boards, Moves: moves, MoveCount: len(moves), Expanded: expanded, Generated: generated, FrontierMax: frontierMax, DurationUS: time.Since(start).Microseconds(), Optimal: true}, nil
		}
	}
	return Result{}, ErrNoSolution
}

func depthLimited(ctx context.Context, current puzzle.Board, remaining int, path *[]puzzle.Board, moves *[]string, onPath map[string]bool, expanded, generated, frontierMax *int, maxExpanded int) (bool, error) {
	if err := ctx.Err(); err != nil {
		return false, err
	}
	if current.IsGoal() {
		return true, nil
	}
	if remaining == 0 {
		return false, nil
	}
	(*expanded)++
	if *expanded > maxExpanded {
		return false, ErrSearchLimit
	}
	for _, neighbor := range current.Neighbors() {
		key := neighbor.Board.Key()
		if onPath[key] {
			continue
		}
		(*generated)++
		onPath[key] = true
		*path = append(*path, neighbor.Board)
		*moves = append(*moves, neighbor.Move)
		if len(*path) > *frontierMax {
			*frontierMax = len(*path)
		}
		found, err := depthLimited(ctx, neighbor.Board, remaining-1, path, moves, onPath, expanded, generated, frontierMax, maxExpanded)
		if err != nil || found {
			return found, err
		}
		delete(onPath, key)
		*path = (*path)[:len(*path)-1]
		*moves = (*moves)[:len(*moves)-1]
	}
	return false, nil
}
