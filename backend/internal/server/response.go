package server

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle"
)

type errorResponse struct {
	Error  string `json:"error"`
	Status int    `json:"status"`
}

func writeResult(c *echo.Context, value any, err error) error {
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return writeError(c, http.StatusRequestTimeout, err)
		}
		return writeError(c, http.StatusBadRequest, err)
	}
	return c.JSON(http.StatusOK, value)
}

func writeError(c *echo.Context, status int, err error) error {
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

func (s *Server) handleHTTPError(c *echo.Context, err error) {
	status := http.StatusInternalServerError
	message := errors.New("internal server error")
	var statusCoder echo.HTTPStatusCoder
	if errors.As(err, &statusCoder) {
		status = statusCoder.StatusCode()
		message = errors.New(strings.ToLower(http.StatusText(status)))
	}
	if status >= http.StatusInternalServerError {
		slog.ErrorContext(c.Request().Context(), "request failed",
			"requestId", c.Response().Header().Get(echo.HeaderXRequestID), "error", err)
	}
	// A write failure or late panic must not append JSON to an existing body.
	if response, unwrapErr := echo.UnwrapResponse(c.Response()); unwrapErr == nil && response.Committed {
		return
	}
	if responseErr := writeError(c, status, message); responseErr != nil {
		slog.Error("failed to write error response", "error", responseErr)
	}
}
