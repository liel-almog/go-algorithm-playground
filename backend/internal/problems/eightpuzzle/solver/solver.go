package solver

import (
	"context"
	"errors"
	"slices"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
)

var (
	ErrNoSolution  = errors.New("no solution found")
	ErrSearchLimit = errors.New("search limit reached")
)

const maxStoredStates = 250_000

type Metadata struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Optimal     bool   `json:"optimal"`
	Category    string `json:"category"`
}

type Result struct {
	Algorithm   string   `json:"algorithm"`
	Path        [][]int  `json:"path"`
	Moves       []string `json:"moves"`
	MoveCount   int      `json:"moveCount"`
	Expanded    int      `json:"expanded"`
	Generated   int      `json:"generated"`
	FrontierMax int      `json:"frontierMax"`
	DurationUS  int64    `json:"durationUs"`
	Optimal     bool     `json:"optimal"`
}

type Algorithm interface {
	Metadata() Metadata
	Solve(context.Context, board.Board) (Result, error)
}

type parentStep struct {
	previous string
	board    board.Board
	move     string
}

func finish(meta Metadata, start time.Time, goalKey string, parents map[string]parentStep, expanded, generated, frontierMax int) Result {

	boards := make([][]int, 0)
	moves := make([]string, 0)

	for key := goalKey; key != ""; {
		step := parents[key]
		boards = append(boards, append([]int(nil), step.board.Tiles...))
		if step.move != "" {
			moves = append(moves, step.move)
		}
		key = step.previous
	}

	slices.Reverse(boards)
	slices.Reverse(moves)

	return Result{
		Algorithm: meta.ID, Path: boards, Moves: moves, MoveCount: len(moves),
		Expanded: expanded, Generated: generated, FrontierMax: frontierMax,
		DurationUS: time.Since(start).Microseconds(), Optimal: meta.Optimal,
	}
}
