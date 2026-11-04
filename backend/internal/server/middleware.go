package server

import (
	"crypto/rand"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
)

func (s *Server) requestMetadata(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		// Generate the ID here so callers cannot inject arbitrary log identifiers.
		c.Response().Header().Set(echo.HeaderXRequestID, rand.Text())
		c.Response().Header().Set("X-Content-Type-Options", "nosniff")
		return next(c)
	}
}

func (s *Server) logRequests(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		started := time.Now()
		if err := next(c); err != nil {
			// Resolve the error before logging to record the status actually sent.
			s.handleHTTPError(c, err)
		}
		request := c.Request()
		if request.URL.Path != "/api" && !strings.HasPrefix(request.URL.Path, "/api/") {
			return nil
		}
		response, err := echo.UnwrapResponse(c.Response())
		if err != nil {
			slog.ErrorContext(request.Context(), "cannot inspect HTTP response", "error", err)
			return nil
		}
		slog.InfoContext(request.Context(), "request",
			"requestId", c.Response().Header().Get(echo.HeaderXRequestID),
			"method", request.Method,
			"path", request.URL.Path,
			"status", response.Status,
			"bytes", response.Size,
			"duration", time.Since(started),
		)
		return nil
	}
}

func (s *Server) recoverPanic(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) (err error) {
		defer func() {
			if recovered := recover(); recovered != nil {
				if recovered == http.ErrAbortHandler {
					panic(recovered)
				}
				slog.ErrorContext(c.Request().Context(), "request panic",
					"requestId", c.Response().Header().Get(echo.HeaderXRequestID),
					"panic", recovered, "stack", string(debug.Stack()))
				// Panics are always internal failures, even if the value is an HTTP error.
				err = fmt.Errorf("request panic: %v", recovered)
			}
		}()
		return next(c)
	}
}
