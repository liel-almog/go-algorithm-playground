package controllers

import (
	"context"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

type puzzleGenerateRequest struct {
	Rows     int `json:"row" validate:"required,min=2,max=4"`
	Columns  int `json:"column" validate:"required,min=2,max=4"`
	Scramble int `json:"scramble" validate:"required,min=1,max=200"`
}
type puzzleBoardRequest struct {
	Rows    int   `json:"row" validate:"required,min=2,max=4"`
	Columns int   `json:"column" validate:"required,min=2,max=4"`
	Tiles   []int `json:"tiles" validate:"required,min=4,max=16,dive,gte=0,lte=15"`
}

func (r puzzleBoardRequest) board() eightpuzzle.BoardRequest {
	return eightpuzzle.BoardRequest{Rows: r.Rows, Columns: r.Columns, Tiles: r.Tiles}
}

type astarSolveRequest struct {
	puzzleBoardRequest
	Heuristic string `json:"heuristic"`
}

func (h *Controller) GeneratePuzzle(c *echo.Context) error {
	var request puzzleGenerateRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	result, err := services.GeneratePuzzle(request.Rows, request.Columns, request.Scramble)
	return httpapi.WriteResult(c, result, err)
}
func (h *Controller) SolvePuzzleAStar(c *echo.Context) error {
	var request astarSolveRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	return solvePuzzle(c, func(ctx context.Context) (any, error) {
		return services.SolvePuzzleAStar(ctx, request.board(), request.Heuristic)
	})
}
func (h *Controller) SolvePuzzleBFS(c *echo.Context) error {
	var request puzzleBoardRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	return solvePuzzle(c, func(ctx context.Context) (any, error) {
		return services.SolvePuzzleBFS(ctx, request.board())
	})
}
func (h *Controller) SolvePuzzleIDDFS(c *echo.Context) error {
	var request puzzleBoardRequest
	if err := httpapi.DecodeAndValidate(c, &request); err != nil {
		return httpapi.WriteRequestError(c, err)
	}
	return solvePuzzle(c, func(ctx context.Context) (any, error) {
		return services.SolvePuzzleIDDFS(ctx, request.board())
	})
}
func solvePuzzle(c *echo.Context, solve func(context.Context) (any, error)) error {
	result, err := solve(c.Request().Context())

	if err != nil {
		switch {
		case eightpuzzle.IsSolverTimeout(err):
			return httpapi.WriteError(c, http.StatusRequestTimeout, err)
		case eightpuzzle.IsSolverLimit(err), errors.Is(err, eightpuzzle.ErrUnsolvable):
			return httpapi.WriteError(c, http.StatusUnprocessableEntity, err)
		default:
			return httpapi.WriteError(c, http.StatusBadRequest, err)
		}
	}

	return c.JSON(http.StatusOK, result)
}
