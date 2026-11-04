package server

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/solver"
)

// puzzleBoardRequest is the base body of every solver route. A solver with
// options of its own defines a request type that embeds it.
type puzzleBoardRequest struct {
	Rows    int   `json:"row" validate:"required,min=2,max=4"`
	Columns int   `json:"column" validate:"required,min=2,max=4"`
	Tiles   []int `json:"tiles" validate:"required,min=4,max=16,dive,gte=0,lte=15"`
}

func (r puzzleBoardRequest) boardRequest() eightpuzzle.BoardRequest {
	return eightpuzzle.BoardRequest{Rows: r.Rows, Columns: r.Columns, Tiles: r.Tiles}
}

// astarSolveRequest extends the base request with A*'s options.
type astarSolveRequest struct {
	puzzleBoardRequest
	// Heuristic is "manhattan" (default) or "misplaced".
	Heuristic string `json:"heuristic"`
}

// legacyPuzzleSolveRequest is the body of POST /api/problems/eight-puzzle/solve,
// which picks the algorithm by name and cannot carry algorithm options.
type legacyPuzzleSolveRequest struct {
	puzzleBoardRequest
	Algorithm string `json:"algorithm" validate:"required,oneof=astar bfs dfs"`
}

// solveAStar serves POST /api/problems/eight-puzzle/astar/solve.
func (eightPuzzleProblem) solveAStar(c *echo.Context) error {
	var request astarSolveRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	heuristic, err := solver.ParseHeuristic(request.Heuristic)
	if err != nil {
		return writeError(c, http.StatusBadRequest, err)
	}
	return solvePuzzle(c, request.boardRequest(), solver.AStar{Heuristic: heuristic})
}

// solveBFS serves POST /api/problems/eight-puzzle/bfs/solve.
func (eightPuzzleProblem) solveBFS(c *echo.Context) error {
	var request puzzleBoardRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	return solvePuzzle(c, request.boardRequest(), solver.BFS{})
}

// solveIDDFS serves POST /api/problems/eight-puzzle/dfs/solve.
func (eightPuzzleProblem) solveIDDFS(c *echo.Context) error {
	var request puzzleBoardRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	return solvePuzzle(c, request.boardRequest(), solver.IDDFS{})
}

// solveLegacy keeps the original single solve route working for existing
// clients by running the named solver with its default options. New clients
// should use the per-algorithm routes.
func (eightPuzzleProblem) solveLegacy(c *echo.Context) error {
	var request legacyPuzzleSolveRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	var algorithm solver.Algorithm
	switch request.Algorithm {
	case solver.AStar{}.Metadata().ID:
		algorithm = solver.AStar{}
	case solver.BFS{}.Metadata().ID:
		algorithm = solver.BFS{}
	case solver.IDDFS{}.Metadata().ID:
		algorithm = solver.IDDFS{}
	default:
		return writeError(c, http.StatusBadRequest, errors.New("unknown algorithm"))
	}
	return solvePuzzle(c, request.boardRequest(), algorithm)
}

// solvePuzzle runs the algorithm and maps its errors to HTTP statuses. It is
// shared by every solve route.
func solvePuzzle(c *echo.Context, board eightpuzzle.BoardRequest, algorithm solver.Algorithm) error {
	result, err := eightpuzzle.Solve(c.Request().Context(), board, algorithm)
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
