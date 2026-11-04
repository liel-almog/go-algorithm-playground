package services

import (
	"context"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/solver"
)

func GeneratePuzzle(rows, columns, scramble int) (any, error) {
	return eightpuzzle.RandomPuzzle(eightpuzzle.RandomPuzzleRequest{Rows: rows, Columns: columns, Scramble: scramble})
}

func solvePuzzle(ctx context.Context, board eightpuzzle.BoardRequest, algorithm solver.Algorithm) (any, error) {
	return eightpuzzle.Solve(ctx, board, algorithm)
}

func SolvePuzzleAStar(ctx context.Context, board eightpuzzle.BoardRequest, heuristicName string) (any, error) {
	heuristic, err := solver.ParseHeuristic(heuristicName)
	if err != nil {
		return nil, err
	}
	return solvePuzzle(ctx, board, solver.AStar{Heuristic: heuristic})
}

func SolvePuzzleBFS(ctx context.Context, board eightpuzzle.BoardRequest) (any, error) {
	return solvePuzzle(ctx, board, solver.BFS{})
}

func SolvePuzzleIDDFS(ctx context.Context, board eightpuzzle.BoardRequest) (any, error) {
	return solvePuzzle(ctx, board, solver.IDDFS{})
}

const EightPuzzleID = "eight-puzzle"

type eightPuzzleProblem struct{}

func (eightPuzzleProblem) describe() problemDescription {
	return problemDescription{
		ID: EightPuzzleID, Title: "Sliding puzzle", Algorithm: "A*, breadth-first search, or iterative-deepening DFS",
		Description: "Rearrange numbered tiles into ascending order by sliding one tile at a time into the empty space.",

		SolutionApproach: "The backend validates that the board is solvable, explores neighboring board states with the selected search strategy, and reconstructs the move-by-move path when it reaches the goal.",
		SolveEndpoint:    algorithmSolveEndpoint(EightPuzzleID, solver.AStar{}.Metadata().ID),
		Limits:           []string{"rows and columns: 2 to 4", "runtime: 5 seconds"},
	}
}

func (eightPuzzleProblem) algorithms() algorithmCatalog {
	return algorithmCatalog{Algorithms: []algorithmOption{
		algorithmOption(solver.AStar{}.Metadata()),
		algorithmOption(solver.BFS{}.Metadata()),
		algorithmOption(solver.IDDFS{}.Metadata()),
	}}
}
