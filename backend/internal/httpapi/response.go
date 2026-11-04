package httpapi

import (
	"context"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

type errorResponse struct {
	Error  string `json:"error"`
	Status int    `json:"status"`
}

func WriteResult(c *echo.Context, value any, err error) error {
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return WriteError(c, http.StatusRequestTimeout, err)
		}
		return WriteError(c, http.StatusBadRequest, err)
	}
	return c.JSON(http.StatusOK, value)
}

func WriteError(c *echo.Context, status int, err error) error {
	return c.JSON(status, errorResponse{Error: publicError(err), Status: status})
}

func publicError(err error) string {
	if errors.Is(err, context.DeadlineExceeded) {
		return "the algorithm exceeded its 5 second time limit"
	}
	if eightpuzzle.IsSolverLimit(err) {
		return "the algorithm reached its state exploration limit"
	}
	return err.Error()
}
