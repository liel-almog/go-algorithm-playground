package eightpuzzle

import (
	"context"
	"errors"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/solver"
)

var ErrUnsolvable = errors.New("this tile arrangement is not solvable")

func IsSolverTimeout(err error) bool {
	return errors.Is(err, context.DeadlineExceeded)
}

func IsSolverLimit(err error) bool {
	return errors.Is(err, solver.ErrSearchLimit)
}

type BoardRequest struct {
	Rows    int
	Columns int
	Tiles   []int
}

type RandomPuzzleRequest struct {
	Rows     int
	Columns  int
	Scramble int
}

func RandomPuzzle(request RandomPuzzleRequest) (map[string]any, error) {
	if request.Rows == 0 {
		request.Rows = 3
	}
	if request.Columns == 0 {
		request.Columns = 3
	}
	if request.Scramble == 0 {
		request.Scramble = 20
	}
	board, err := board.Random(request.Rows, request.Columns, request.Scramble)
	if err != nil {
		return nil, err
	}
	return map[string]any{"row": board.Rows, "column": board.Columns, "tiles": board.Tiles, "scramble": request.Scramble}, nil
}

// Solve validates the board and runs the given algorithm on it. Callers choose
// and configure the algorithm, so every solver shares this entry point.
func Solve(ctx context.Context, request BoardRequest, algorithm solver.Algorithm) (solver.Result, error) {
	board, err := board.New(request.Rows, request.Columns, request.Tiles)
	if err != nil {
		return solver.Result{}, err
	}
	if !board.IsSolvable() {
		return solver.Result{}, ErrUnsolvable
	}
	return runWithTimeout(ctx, algorithm, board)
}

func runWithTimeout(parent context.Context, algorithm solver.Algorithm, board board.Board) (solver.Result, error) {
	ctx, cancel := context.WithTimeout(parent, 5*time.Second)
	defer cancel()
	return algorithm.Solve(ctx, board)
}
