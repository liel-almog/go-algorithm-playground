package server

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

const eightPuzzleID = "eight-puzzle"

type puzzleSolveRequest struct {
	Rows      int    `json:"row" validate:"required,min=2,max=4"`
	Columns   int    `json:"column" validate:"required,min=2,max=4"`
	Tiles     []int  `json:"tiles" validate:"required,min=4,max=16,dive,gte=0,lte=15"`
	Algorithm string `json:"algorithm" validate:"required,oneof=astar bfs dfs"`
}

type puzzleGenerateRequest struct {
	Rows     int `json:"row" validate:"required,min=2,max=4"`
	Columns  int `json:"column" validate:"required,min=2,max=4"`
	Scramble int `json:"scramble" validate:"required,min=1,max=200"`
}

type eightPuzzleProblem struct{}

func (eightPuzzleProblem) describe() problemDescription {
	return problemDescription{
		ID: eightPuzzleID, Title: "Sliding puzzle", Algorithm: "A*, breadth-first search, or iterative-deepening DFS",
		Description:      "Rearrange numbered tiles into ascending order by sliding one tile at a time into the empty space.",
		SolutionApproach: "The backend validates that the board is solvable, explores neighboring board states with the selected search strategy, and reconstructs the move-by-move path when it reaches the goal.",
		Limits:           []string{"rows and columns: 2 to 4", "runtime: 5 seconds"},
	}
}

func (eightPuzzleProblem) algorithms() algorithmCatalog {
	available := eightpuzzle.Algorithms()
	options := make([]algorithmOption, 0, len(available))
	for _, algorithm := range available {
		options = append(options, algorithmOption(algorithm))
	}
	return algorithmCatalog{Algorithms: options}
}

func (p eightPuzzleProblem) register(routes problemRoutes) {
	routes.generate(p.generate)
	routes.solve(p.solve)
}

func (eightPuzzleProblem) generate(c *echo.Context) error {
	var request puzzleGenerateRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := eightpuzzle.RandomPuzzle(eightpuzzle.RandomPuzzleRequest{Rows: request.Rows, Columns: request.Columns, Scramble: request.Scramble})
	return writeResult(c, result, err)
}

func (eightPuzzleProblem) solve(c *echo.Context) error {
	var request puzzleSolveRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := eightpuzzle.Solve(c.Request().Context(), eightpuzzle.SolveRequest{
		BoardRequest: eightpuzzle.BoardRequest{Rows: request.Rows, Columns: request.Columns, Tiles: request.Tiles},
		Algorithm:    request.Algorithm,
	})
	if err != nil {
		switch {
		case eightpuzzle.IsSolverTimeout(err):
			return writeError(c, http.StatusRequestTimeout, err)
		case eightpuzzle.IsSolverLimit(err), errors.Is(err, eightpuzzle.ErrUnsolvable):
			return writeError(c, http.StatusUnprocessableEntity, err)
		default:
			return writeError(c, http.StatusBadRequest, err)
		}
	}
	return c.JSON(http.StatusOK, result)
}
