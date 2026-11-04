package server

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/solver"
)

const eightPuzzleID = "eight-puzzle"

type puzzleGenerateRequest struct {
	Rows     int `json:"row" validate:"required,min=2,max=4"`
	Columns  int `json:"column" validate:"required,min=2,max=4"`
	Scramble int `json:"scramble" validate:"required,min=1,max=200"`
}

type eightPuzzleProblem struct{}

func (eightPuzzleProblem) describe() problemDescription {
	return problemDescription{
		ID: eightPuzzleID, Title: "Sliding puzzle", Algorithm: "A*, breadth-first search, or iterative-deepening DFS",
		Description: "Rearrange numbered tiles into ascending order by sliding one tile at a time into the empty space.",

		SolutionApproach: "The backend validates that the board is solvable, explores neighboring board states with the selected search strategy, and reconstructs the move-by-move path when it reaches the goal.",
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

func (p eightPuzzleProblem) register(routes problemRoutes) {
	routes.generate(p.generate)
	routes.solve(p.solveLegacy)
	routes.solveWith(solver.AStar{}.Metadata().ID, p.solveAStar) // /astar/solve
	routes.solveWith(solver.BFS{}.Metadata().ID, p.solveBFS)     // /bfs/solve
	routes.solveWith(solver.IDDFS{}.Metadata().ID, p.solveIDDFS) // /dfs/solve
}

func (eightPuzzleProblem) generate(c *echo.Context) error {
	var request puzzleGenerateRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := eightpuzzle.RandomPuzzle(eightpuzzle.RandomPuzzleRequest{Rows: request.Rows, Columns: request.Columns, Scramble: request.Scramble})
	return writeResult(c, result, err)
}
