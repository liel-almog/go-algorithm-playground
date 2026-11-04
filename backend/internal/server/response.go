package server

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
)

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
	if responseErr := httpapi.WriteError(c, status, message); responseErr != nil {
		slog.Error("failed to write error response", "error", responseErr)
	}
}
