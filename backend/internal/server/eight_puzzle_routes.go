package server

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

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

func (s *Server) registerEightPuzzleRoutes(e *echo.Echo) {
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/eight-puzzle/generate", s.generatePuzzle)
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/eight-puzzle/solve", s.solvePuzzle, s.limitAlgorithm)
}

func (s *Server) generatePuzzle(c *echo.Context) error {
	var request puzzleGenerateRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeError(c, http.StatusBadRequest, err)
	}
	result, err := s.eightPuzzle.RandomPuzzle(eightpuzzle.RandomPuzzleRequest{Rows: request.Rows, Columns: request.Columns, Scramble: request.Scramble})
	return writeResult(c, result, err)
}

func (s *Server) solvePuzzle(c *echo.Context) error {
	var request puzzleSolveRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeError(c, http.StatusBadRequest, err)
	}
	result, err := s.eightPuzzle.Solve(c.Request().Context(), eightpuzzle.SolveRequest{
		BoardRequest: eightpuzzle.BoardRequest{Rows: request.Rows, Columns: request.Columns, Tiles: request.Tiles},
		Algorithm:    request.Algorithm,
	})
	if err != nil {
		switch {
		case eightpuzzle.IsSolverTimeout(err):
			return writeSolverError(c, err)
		case eightpuzzle.IsSolverLimit(err), errors.Is(err, eightpuzzle.ErrUnsolvable):
			return writeError(c, http.StatusUnprocessableEntity, err)
		default:
			return writeError(c, http.StatusBadRequest, err)
		}
	}
	return c.JSON(http.StatusOK, result)
}
